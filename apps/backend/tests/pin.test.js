// @ts-check

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pin: vi.fn(),
  storeRequest: vi.fn(),
  getUserAccessByName: vi.fn(),
  config: {},
}));

vi.mock("@stats-organization/github-readme-stats-core", () => ({
  api: vi.fn(),
  gist: vi.fn(),
  pin: mocks.pin,
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

import router from "../router.js";
import { CACHE_TTL, DURATIONS } from "../src/common/cache.js";

const createRequest = (search = "") => ({
  headers: {},
  url: `/api/pin?${search}`,
});

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

const defaultCacheHeader =
  `max-age=${CACHE_TTL.PIN_CARD.DEFAULT}, ` +
  `s-maxage=${CACHE_TTL.PIN_CARD.DEFAULT}, ` +
  `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

beforeEach(() => {
  mocks.pin.mockReset();
  mocks.storeRequest.mockReset().mockResolvedValue(undefined);
  mocks.getUserAccessByName.mockReset().mockResolvedValue(null);
  mocks.config = {};
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api/pin backend routing", () => {
  it("happy path should pass query params and user PAT, respond with pin content and persist request", async () => {
    mocks.getUserAccessByName.mockResolvedValue({ token: "user-pat" });
    mocks.pin.mockResolvedValue({
      status: "success",
      content: "mock-pin-svg",
    });

    const req = createRequest(
      "username=anuraghazra&repo=convoychat&theme=dark",
    );
    const res = createResponse();

    await router(req, res);

    expect(mocks.getUserAccessByName).toHaveBeenCalledWith("anuraghazra");
    expect(mocks.pin).toHaveBeenCalledWith(
      {
        username: "anuraghazra",
        repo: "convoychat",
        theme: "dark",
      },
      "user-pat",
    );
    expect(req.query).toEqual({
      username: "anuraghazra",
      repo: "convoychat",
      theme: "dark",
    });
    expect(res.setHeader.mock.calls).toEqual([
      ["Cache-Control", defaultCacheHeader],
      ["Content-Type", "image/svg+xml"],
    ]);
    expect(res.end).toHaveBeenCalledExactlyOnceWith("mock-pin-svg");
    expect(mocks.storeRequest).toHaveBeenCalledExactlyOnceWith(req);
  });
});
