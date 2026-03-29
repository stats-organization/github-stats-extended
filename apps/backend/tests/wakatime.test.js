// @ts-check

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  wakatime: vi.fn(),
  storeRequest: vi.fn(),
  getUserAccessByName: vi.fn(),
  config: {},
}));

vi.mock("github-readme-stats-core", () => ({
  api: vi.fn(),
  gist: vi.fn(),
  pin: vi.fn(),
  topLangs: vi.fn(),
  wakatime: mocks.wakatime,
  getConfig: () => mocks.config,
  renderError: ({ message }) => `render-error:${message}`,
  clampValue: (value, min, max) => Math.min(Math.max(value, min), max),
}));

vi.mock("../src/common/database.js", () => ({
  storeRequest: mocks.storeRequest,
  getUserAccessByName: mocks.getUserAccessByName,
}));

import router from "../router.js";
import { CACHE_TTL, DURATIONS } from "../src/common/cache.js";

const createRequest = (search = "") => ({
  headers: {},
  url: `/api/wakatime?${search}`,
});

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

const defaultCacheHeader =
  `max-age=${CACHE_TTL.WAKATIME_CARD.DEFAULT}, ` +
  `s-maxage=${CACHE_TTL.WAKATIME_CARD.DEFAULT}, ` +
  `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

beforeEach(() => {
  mocks.wakatime.mockReset();
  mocks.storeRequest.mockReset().mockResolvedValue(undefined);
  mocks.getUserAccessByName.mockReset().mockResolvedValue(null);
  mocks.config = {};
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api/wakatime backend routing", () => {
  it("happy path should pass query params, respond with wakatime content and persist request", async () => {
    mocks.wakatime.mockResolvedValue({
      status: "success",
      content: "mock-wakatime-svg",
    });

    const req = createRequest("username=anuraghazra&theme=dark&layout=compact");
    const res = createResponse();

    await router(req, res);

    expect(mocks.wakatime).toHaveBeenCalledWith({
      username: "anuraghazra",
      theme: "dark",
      layout: "compact",
    });
    expect(mocks.getUserAccessByName).not.toHaveBeenCalled();
    expect(req.query).toEqual({
      username: "anuraghazra",
      theme: "dark",
      layout: "compact",
    });
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("mock-wakatime-svg");
    expect(mocks.storeRequest).toHaveBeenCalledExactlyOnceWith(req);
  });
});
