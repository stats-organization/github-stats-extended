// @ts-check

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  topLangs: vi.fn(),
  storeRequest: vi.fn(),
  getUserAccessByName: vi.fn(),
  config: {},
}));

vi.mock("github-readme-stats-core", () => ({
  api: vi.fn(),
  gist: vi.fn(),
  pin: vi.fn(),
  topLangs: mocks.topLangs,
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
  url: `/api/top-langs?${search}`,
});

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

const defaultCacheHeader =
  `max-age=${CACHE_TTL.TOP_LANGS_CARD.DEFAULT}, ` +
  `s-maxage=${CACHE_TTL.TOP_LANGS_CARD.DEFAULT}, ` +
  `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

beforeEach(() => {
  mocks.topLangs.mockReset();
  mocks.storeRequest.mockReset().mockResolvedValue(undefined);
  mocks.getUserAccessByName.mockReset().mockResolvedValue(null);
  mocks.config = {};
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api/top-langs backend routing", () => {
  it("happy path should pass query params and user PAT, respond with top languages content and persist request", async () => {
    mocks.getUserAccessByName.mockResolvedValue({ token: "user-pat" });
    mocks.topLangs.mockResolvedValue({
      status: "success",
      content: "mock-top-langs-svg",
    });

    const req = createRequest(
      "username=anuraghazra&layout=compact&langs_count=5",
    );
    const res = createResponse();

    await router(req, res);

    expect(mocks.getUserAccessByName).toHaveBeenCalledWith("anuraghazra");
    expect(mocks.topLangs).toHaveBeenCalledWith(
      {
        username: "anuraghazra",
        layout: "compact",
        langs_count: "5",
      },
      "user-pat",
    );
    expect(req.query).toEqual({
      username: "anuraghazra",
      layout: "compact",
      langs_count: "5",
    });
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("mock-top-langs-svg");
    expect(mocks.storeRequest).toHaveBeenCalledExactlyOnceWith(req);
  });
});
