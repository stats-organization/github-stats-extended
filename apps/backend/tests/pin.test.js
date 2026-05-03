// @ts-check

import { pin } from "@stats-organization/github-readme-stats-core";
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

const pinMock = vi.mocked(pin);
const storeRequestMock = vi.mocked(storeRequest);
const getUserAccessByNameMock = vi.mocked(getUserAccessByName);

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
  pinMock.mockReset();
  storeRequestMock.mockReset().mockResolvedValue(undefined);
  getUserAccessByNameMock.mockReset().mockResolvedValue(null);
  // CACHE_SECONDS is not set here, this is just to safeguard against CACHE_SECONDS being set externally
  delete process.env.CACHE_SECONDS;
});

describe("Test /api/pin backend routing", () => {
  it("happy path should pass query params and user PAT, respond with pin content and persist request", async () => {
    getUserAccessByNameMock.mockResolvedValue({ token: "user-pat" });
    pinMock.mockResolvedValue({
      status: "success",
      content: "mock-pin-svg",
    });

    const req = createRequest(
      "username=anuraghazra&repo=convoychat&theme=dark",
    );
    const res = createResponse();

    await router(req, res);

    expect(getUserAccessByNameMock).toHaveBeenCalledWith("anuraghazra");
    expect(pinMock).toHaveBeenCalledWith(
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
    expect(storeRequestMock).toHaveBeenCalledExactlyOnceWith(req);
  });
});
