// @ts-check

import { pin } from "@stats-organization/github-readme-stats-core";
import supertest from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "../app.js";
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

    const res = await supertest(app)
      .get("/api/pin?username=anuraghazra&repo=convoychat&theme=dark")
      .expect("Cache-Control", defaultCacheHeader)
      .expect("Content-Type", "image/svg+xml")
      .expect(200);

    expect(getUserAccessByNameMock).toHaveBeenCalledWith("anuraghazra");
    expect(pinMock).toHaveBeenCalledWith(
      {
        username: "anuraghazra",
        repo: "convoychat",
        theme: "dark",
      },
      "user-pat",
    );
    expect(res.body.toString()).toBe("mock-pin-svg");
    expect(storeRequestMock).toHaveBeenCalledOnce();
  });
});
