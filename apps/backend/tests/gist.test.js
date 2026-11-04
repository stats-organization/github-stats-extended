// @ts-check

import { getConfig, gist } from "@stats-organization/github-readme-stats-core";
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

const gistMock = vi.mocked(gist);
const getConfigMock = vi.mocked(getConfig);
const storeRequestMock = vi.mocked(storeRequest);
const getUserAccessByNameMock = vi.mocked(getUserAccessByName);

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

    const res = await supertest(app)
      .get("/api/gist?id=bbfce31e0217a3689c8d961a356cb10d&theme=dark")
      .expect("Cache-Control", defaultCacheHeader)
      .expect("Content-Type", "image/svg+xml")
      .expect(200);

    expect(gistMock).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
      theme: "dark",
    });
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.body.toString()).toBe("mock-gist-svg");
    expect(storeRequestMock).toHaveBeenCalledOnce();
  });

  it("should use the shorter error cache for temporary gist errors", async () => {
    gistMock.mockResolvedValue({
      status: "error - temporary",
      content: "temporary-error-svg",
    });

    const res = await supertest(app)
      .get("/api/gist?id=bbfce31e0217a3689c8d961a356cb10d")
      .expect("Cache-Control", errorCacheHeader)
      .expect("Content-Type", "image/svg+xml")
      .expect(200);

    expect(gistMock).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
    });
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.body.toString()).toBe("temporary-error-svg");
    expect(storeRequestMock).toHaveBeenCalledOnce();
  });

  it("should not persist permanent gist errors returned by core", async () => {
    gistMock.mockResolvedValue({
      status: "error - permanent",
      content: "permanent-error-svg",
    });

    const res = await supertest(app)
      .get("/api/gist?id=bbfce31e0217a3689c8d961a356cb10d")
      .expect("Cache-Control", defaultCacheHeader)
      .expect("Content-Type", "image/svg+xml")
      .expect(200);

    expect(gistMock).toHaveBeenCalledWith({
      id: "bbfce31e0217a3689c8d961a356cb10d",
    });
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.body.toString()).toBe("permanent-error-svg");
    expect(storeRequestMock).not.toHaveBeenCalled();
  });

  it("should reject non-whitelisted gist ids before calling core logic", async () => {
    getConfigMock.mockReturnValue({ gistWhitelist: ["allowed-gist-id"] });

    const res = await supertest(app)
      .get("/api/gist?id=blocked-gist-id")
      .expect("Cache-Control", defaultCacheHeader)
      .expect("Content-Type", "image/svg+xml")
      .expect(200);

    expect(gistMock).not.toHaveBeenCalled();
    expect(getUserAccessByNameMock).not.toHaveBeenCalled();
    expect(res.body.toString()).toBe(
      "render-error:This gist ID is not whitelisted",
    );
    expect(storeRequestMock).not.toHaveBeenCalled();
  });
});
