// @ts-check

import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "../src/common/log.js";
import { retryer } from "../src/common/retryer.js";

vi.mock(import("../src/common/log.js"), async () => {
  const { createLoggerMock } = await import("./utils.js");
  return createLoggerMock();
});

const logSpy = vi.mocked(logger.log);

const fetcher = vi.fn().mockResolvedValue({ data: "ok" });

const fetcherFail = vi.fn().mockResolvedValue({
  data: { errors: [{ type: "RATE_LIMITED" }] },
});

const fetcherFailOnSecondTry = vi.fn((_vars, _token, retries) => {
  if (retries < 1) {
    return Promise.resolve({ data: { errors: [{ type: "RATE_LIMITED" }] } });
  }
  return Promise.resolve({ data: "ok" });
});

const fetcherFailWithMessageBasedRateLimitErr = vi.fn(
  (_vars, _token, retries) => {
    if (retries < 1) {
      return Promise.resolve({
        data: {
          errors: [
            {
              type: "ASDF",
              message: "API rate limit already exceeded for user ID 11111111",
            },
          ],
        },
      });
    }
    return Promise.resolve({ data: "ok" });
  },
);

const customFetcher = vi.fn((variables, token) => {
  return Promise.resolve({ data: { token } });
});

afterEach(() => {
  logSpy.mockClear();
});

describe("Test Retryer", () => {
  it("retryer should return value and have zero retries on first try", async () => {
    let res = await retryer(fetcher, {});

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should return value and have 2 retries", async () => {
    let res = await retryer(fetcherFailOnSecondTry, {});

    expect(fetcherFailOnSecondTry).toHaveBeenCalledTimes(2);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should return value and have 2 retries with message based rate limit error", async () => {
    let res = await retryer(fetcherFailWithMessageBasedRateLimitErr, {});

    expect(fetcherFailWithMessageBasedRateLimitErr).toHaveBeenCalledTimes(2);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should throw specific error if maximum retries reached", async () => {
    await expect(retryer(fetcherFail, {})).rejects.toThrow(
      "Downtime due to GitHub API rate limiting",
    );

    expect(fetcherFail).toHaveBeenCalledTimes(2);
  });

  it("retryer should use injected PATs when provided", async () => {
    const res = await retryer(customFetcher, {}, "user-pat-token");

    expect(customFetcher).toHaveBeenCalledExactlyOnceWith(
      {},
      "user-pat-token",
      0,
    );
    expect(res).toStrictEqual({ data: { token: "user-pat-token" } });
  });
});
