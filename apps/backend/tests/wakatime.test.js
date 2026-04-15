// @ts-check

import { wakatime } from "@stats-organization/github-readme-stats-core";
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

const wakatimeMock = vi.mocked(wakatime);
const storeRequestMock = vi.mocked(storeRequest);
const getUserAccessByNameMock = vi.mocked(getUserAccessByName);

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
  wakatimeMock.mockReset();
  storeRequestMock.mockReset().mockResolvedValue(undefined);
  getUserAccessByNameMock.mockReset().mockResolvedValue(null);
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api/wakatime backend routing", () => {
  it("happy path should pass query params, respond with wakatime content and persist request", async () => {
    wakatimeMock.mockResolvedValue({
      status: "success",
      content: "mock-wakatime-svg",
    });

    const req = createRequest("username=anuraghazra&theme=dark&layout=compact");
    const res = createResponse();

    await router(req, res);

    expect(wakatimeMock).toHaveBeenCalledWith({
      username: "anuraghazra",
      theme: "dark",
      layout: "compact",
    });
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
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
    expect(storeRequestMock).toHaveBeenCalledExactlyOnceWith(req);
  });
});
