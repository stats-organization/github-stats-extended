// @ts-check

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  gist: vi.fn(),
  storeRequest: vi.fn(),
  getUserAccessByName: vi.fn(),
  config: {},
}));

vi.mock("github-readme-stats-core", () => ({
  api: vi.fn(),
  gist: mocks.gist,
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
  mocks.gist.mockReset();
  mocks.storeRequest.mockReset().mockResolvedValue(undefined);
  mocks.getUserAccessByName.mockReset().mockResolvedValue(null);
  mocks.config = {};
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api/gist backend routing", () => {
  it("happy path should pass query params, respond with gist content and persist request", async () => {
    mocks.gist.mockResolvedValue({
      status: "success",
      content: "mock-gist-svg",
    });

    const req = createRequest("id=bbfce31e0217a3689c8d961a356cb10d&theme=dark");
    const res = createResponse();

    await router(req, res);

    expect(mocks.gist).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
      theme: "dark",
    });
    expect(mocks.getUserAccessByName).not.toHaveBeenCalled();
    expect(req.query).toEqual({
      id: "bbfce31e0217a3689c8d961a356cb10d",
      theme: "dark",
    });
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("mock-gist-svg");
    expect(mocks.storeRequest).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should use the shorter error cache for temporary gist errors", async () => {
    mocks.gist.mockResolvedValue({
      status: "error - temporary",
      content: "temporary-error-svg",
    });

    const req = createRequest("id=bbfce31e0217a3689c8d961a356cb10d");
    const res = createResponse();

    await router(req, res);

    expect(mocks.gist).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
    });
    expect(mocks.getUserAccessByName).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", errorCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("temporary-error-svg");
    expect(mocks.storeRequest).toHaveBeenCalledExactlyOnceWith(req);
  });

  it("should not persist permanent gist errors returned by core", async () => {
    mocks.gist.mockResolvedValue({
      status: "error - permanent",
      content: "permanent-error-svg",
    });

    const req = createRequest("id=bbfce31e0217a3689c8d961a356cb10d");
    const res = createResponse();

    await router(req, res);

    expect(mocks.gist).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
    });
    expect(mocks.getUserAccessByName).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("permanent-error-svg");
    expect(mocks.storeRequest).not.toHaveBeenCalled();
  });

  it("should reject non-whitelisted gist ids before calling core logic", async () => {
    mocks.config = {
      gistWhitelist: ["allowed-gist-id"],
    };

    const req = createRequest("id=blocked-gist-id");
    const res = createResponse();

    await router(req, res);

    expect(mocks.gist).not.toHaveBeenCalled();
    expect(mocks.getUserAccessByName).not.toHaveBeenCalled();
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith(
      "render-error:This gist ID is not whitelisted",
    );
    expect(mocks.storeRequest).not.toHaveBeenCalled();
  });
});
