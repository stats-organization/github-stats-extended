// @ts-check

import { api, getConfig } from "@stats-organization/github-readme-stats-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import router from "../router.js";
import { CACHE_TTL, DURATIONS } from "../src/common/cache.js";
import { getUserAccessByName, storeRequest } from "../src/common/database.js";

vi.mock(import("@stats-organization/github-readme-stats-core"), async () => {
  const { mockCore } = await import("./utils.js");
  return mockCore();
});

vi.mock(import("../src/common/database.js"), async (importOriginal) => ({
  ...(await importOriginal()),
  storeRequest: vi.fn(),
  getUserAccessByName: vi.fn(),
}));

const apiMock = vi.mocked(api);
const getConfigMock = vi.mocked(getConfig);
const storeRequestMock = vi.mocked(storeRequest);
const getUserAccessByNameMock = vi.mocked(getUserAccessByName);

const createRequest = (search = "") => ({
  headers: {},
  url: `/api?${search}`,
});

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

const defaultCacheHeader =
  `max-age=${CACHE_TTL.STATS_CARD.DEFAULT}, ` +
  `s-maxage=${CACHE_TTL.STATS_CARD.DEFAULT}, ` +
  `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

const errorCacheHeader =
  `max-age=${CACHE_TTL.ERROR}, ` +
  `s-maxage=${CACHE_TTL.ERROR}, ` +
  `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

beforeEach(() => {
  apiMock.mockReset();
  getConfigMock.mockReset().mockReturnValue({});
  storeRequestMock.mockReset().mockResolvedValue(undefined);
  getUserAccessByNameMock.mockReset().mockResolvedValue(null);
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api backend routing", () => {
  it("happy path should pass query params and user PAT, respond with stats content and persist request", async () => {
    getUserAccessByNameMock.mockResolvedValue({ token: "user-pat" });
    apiMock.mockResolvedValue({
      status: "success",
      content: "mock-stats-svg",
    });

    const req = createRequest(
      "username=anuraghazra&theme=dark&hide=issues,prs,contribs",
    );
    const res = createResponse();

    await router(req, res);

    expect(getUserAccessByNameMock).toHaveBeenCalledWith("anuraghazra");
    expect(apiMock).toHaveBeenCalledWith(
      {
        username: "anuraghazra",
        theme: "dark",
        hide: "issues,prs,contribs",
      },
      "user-pat",
    );
    expect(req.query).toEqual({
      username: "anuraghazra",
      theme: "dark",
      hide: "issues,prs,contribs",
    });
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("mock-stats-svg");
    expect(storeRequestMock).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should use the shorter error cache for temporary stats errors", async () => {
    apiMock.mockResolvedValue({
      status: "error - temporary",
      content: "temporary-error-svg",
    });

    const req = createRequest("username=anuraghazra");
    const res = createResponse();

    await router(req, res);

    expect(getUserAccessByNameMock).toHaveBeenCalledWith("anuraghazra");
    expect(apiMock).toHaveBeenCalledWith(
      {
        username: "anuraghazra",
      },
      null,
    );
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", errorCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("temporary-error-svg");
    expect(storeRequestMock).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should not persist permanent stats errors returned by core", async () => {
    apiMock.mockResolvedValue({
      status: "error - permanent",
      content: "permanent-error-svg",
    });

    const req = createRequest("username=anuraghazra");
    const res = createResponse();

    await router(req, res);

    expect(getUserAccessByNameMock).toHaveBeenCalledWith("anuraghazra");
    expect(apiMock).toHaveBeenCalledWith(
      {
        username: "anuraghazra",
      },
      null,
    );
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("permanent-error-svg");
    expect(storeRequestMock).not.toHaveBeenCalled();
  });

  it("should reject blacklisted usernames before calling core logic", async () => {
    const req = createRequest("username=renovate-bot");
    const res = createResponse();

    await router(req, res);

    expect(apiMock).not.toHaveBeenCalled();
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith(
      "render-error:This username is blacklisted",
    );
    expect(storeRequestMock).not.toHaveBeenCalled();
  });

  it("should reject non-whitelisted usernames before calling core logic", async () => {
    getConfigMock.mockReturnValue({ whitelist: ["allowed-user"] });

    const req = createRequest("username=blocked-user");
    const res = createResponse();

    await router(req, res);

    expect(apiMock).not.toHaveBeenCalled();
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith(
      "render-error:This username is not whitelisted",
    );
    expect(storeRequestMock).not.toHaveBeenCalled();
  });
});
