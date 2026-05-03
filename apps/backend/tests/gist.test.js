// @ts-check

import { getConfig, gist } from "@stats-organization/github-readme-stats-core";
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

const gistMock = vi.mocked(gist);
const getConfigMock = vi.mocked(getConfig);
const storeRequestMock = vi.mocked(storeRequest);
const getUserAccessByNameMock = vi.mocked(getUserAccessByName);

const createRequest = (search) => ({
  headers: {},
  url: `/api/gist?${search}`,
});

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

const defaultCacheHeader =
  `max-age=${CACHE_TTL.GIST_CARD.DEFAULT}, ` +
  `s-maxage=${CACHE_TTL.GIST_CARD.DEFAULT}, ` +
  `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

const errorCacheHeader =
  `max-age=${CACHE_TTL.ERROR}, ` +
  `s-maxage=${CACHE_TTL.ERROR}, ` +
  `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

beforeEach(() => {
  gistMock.mockReset();
  getConfigMock.mockReset().mockReturnValue({});
  storeRequestMock.mockReset().mockResolvedValue(undefined);
  getUserAccessByNameMock.mockReset().mockResolvedValue(null);
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api/gist backend routing", () => {
  it("happy path should pass query params, respond with gist content and persist request", async () => {
    gistMock.mockResolvedValue({
      status: "success",
      content: "mock-gist-svg",
    });

    const req = createRequest("id=bbfce31e0217a3689c8d961a356cb10d&theme=dark");
    const res = createResponse();

    await router(req, res);

    expect(gistMock).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
      theme: "dark",
    });
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(req.query).toEqual({
      id: "bbfce31e0217a3689c8d961a356cb10d",
      theme: "dark",
    });
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("mock-gist-svg");
    expect(storeRequestMock).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should use the shorter error cache for temporary gist errors", async () => {
    gistMock.mockResolvedValue({
      status: "error - temporary",
      content: "temporary-error-svg",
    });

    const req = createRequest("id=bbfce31e0217a3689c8d961a356cb10d");
    const res = createResponse();

    await router(req, res);

    expect(gistMock).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
    });
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", errorCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("temporary-error-svg");
    expect(storeRequestMock).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should not persist permanent gist errors returned by core", async () => {
    gistMock.mockResolvedValue({
      status: "error - permanent",
      content: "permanent-error-svg",
    });

    const req = createRequest("id=bbfce31e0217a3689c8d961a356cb10d");
    const res = createResponse();

    await router(req, res);

    expect(gistMock).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
    });
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("permanent-error-svg");
    expect(storeRequestMock).not.toHaveBeenCalled();
  });

  it("should reject non-whitelisted gist ids before calling core logic", async () => {
    getConfigMock.mockReturnValue({ gistWhitelist: ["allowed-gist-id"] });

    const req = createRequest("id=blocked-gist-id");
    const res = createResponse();

    await router(req, res);

    expect(gistMock).not.toHaveBeenCalled();
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith(
      "render-error:This gist ID is not whitelisted",
    );
    expect(storeRequestMock).not.toHaveBeenCalled();
  });
});
