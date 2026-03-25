// @ts-check

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  storeRequest: vi.fn(),
  getUserAccessByName: vi.fn(),
  config: {},
}));

vi.mock("github-readme-stats-core", () => ({
  api: mocks.api,
  gist: vi.fn(),
  pin: vi.fn(),
  topLangs: vi.fn(),
  wakatime: vi.fn(),
  getConfig: () => mocks.config,
  renderError: ({ message }) => `render-error:${message}`,
  clampValue: (value, min, max) => Math.min(Math.max(value, min), max),
}));

vi.mock("../src/common/database.js", () => ({
  storeRequest: mocks.storeRequest,
  getUserAccessByName: mocks.getUserAccessByName,
}));

import router from "../.vercel/output/functions/api.func/router.js";
import { CACHE_TTL, DURATIONS } from "../src/common/cache.js";

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
  mocks.api.mockReset();
  mocks.storeRequest.mockReset().mockResolvedValue(undefined);
  mocks.getUserAccessByName.mockReset().mockResolvedValue(null);
  mocks.config = {};
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api backend routing", () => {
  it("happy path should pass query params and user PAT, respond with stats content and persist request", async () => {
    mocks.getUserAccessByName.mockResolvedValue({ token: "user-pat" });
    mocks.api.mockResolvedValue({
      status: "success",
      content: "mock-stats-svg",
    });

    const req = createRequest(
      "username=anuraghazra&theme=dark&hide=issues,prs,contribs",
    );
    const res = createResponse();

    await router(req, res);

    expect(mocks.getUserAccessByName).toHaveBeenCalledWith("anuraghazra");
    expect(mocks.api).toHaveBeenCalledWith(
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
    expect(mocks.storeRequest).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should use the shorter error cache for temporary stats errors", async () => {
    mocks.api.mockResolvedValue({
      status: "error - temporary",
      content: "temporary-error-svg",
    });

    const req = createRequest("username=anuraghazra");
    const res = createResponse();

    await router(req, res);

    expect(mocks.getUserAccessByName).toHaveBeenCalledWith("anuraghazra");
    expect(mocks.api).toHaveBeenCalledWith(
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
    expect(mocks.storeRequest).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should not persist permanent stats errors returned by core", async () => {
    mocks.api.mockResolvedValue({
      status: "error - permanent",
      content: "permanent-error-svg",
    });

    const req = createRequest("username=anuraghazra");
    const res = createResponse();

    await router(req, res);

    expect(mocks.getUserAccessByName).toHaveBeenCalledWith("anuraghazra");
    expect(mocks.api).toHaveBeenCalledWith(
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
    expect(mocks.storeRequest).not.toHaveBeenCalled();
  });

  it("should reject blacklisted usernames before calling core logic", async () => {
    const req = createRequest("username=renovate-bot");
    const res = createResponse();

    await router(req, res);

    expect(mocks.api).not.toHaveBeenCalled();
    expect(mocks.getUserAccessByName).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith(
      "render-error:This username is blacklisted",
    );
    expect(mocks.storeRequest).not.toHaveBeenCalled();
  });

  it("should reject non-whitelisted usernames before calling core logic", async () => {
    mocks.config = {
      whitelist: ["allowed-user"],
    };

    const req = createRequest("username=blocked-user");
    const res = createResponse();

    await router(req, res);

    expect(mocks.api).not.toHaveBeenCalled();
    expect(mocks.getUserAccessByName).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith(
      "render-error:This username is not whitelisted",
    );
    expect(mocks.storeRequest).not.toHaveBeenCalled();
  });
});
