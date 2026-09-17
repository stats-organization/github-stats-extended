import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadConfigFromEnv } from "../src/common/config.js";
import { retryer } from "../src/common/retryer.js";

type Fetcher = Parameters<typeof retryer>[0];

vi.mock(import("../src/common/log.js"), async () => {
  const { createLoggerMock } = await import("./utils.js");
  return createLoggerMock();
});

const fetcher = vi.fn().mockResolvedValue({ data: "ok" });

const fetcherFail = vi.fn().mockResolvedValue({
  data: { errors: [{ type: "RATE_LIMITED" }] },
}) as unknown as Fetcher;

const fetcherFailOnSecondTry = vi.fn((_vars, _token, retries) => {
  if (retries < 1) {
    return Promise.resolve({ data: { errors: [{ type: "RATE_LIMITED" }] } });
  }
  return Promise.resolve({ data: "ok" });
}) as unknown as Fetcher;

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
) as unknown as Fetcher;

const customFetcher = vi.fn((_variables: unknown, token: string) => {
  return Promise.resolve({ data: { token } });
}) as unknown as Fetcher;

describe("Test Retryer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retryer should return value and have zero retries on first try", async () => {
    const res = await retryer(fetcher, {});

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should return value and have 2 retries", async () => {
    const res = await retryer(fetcherFailOnSecondTry, {});

    expect(fetcherFailOnSecondTry).toHaveBeenCalledTimes(2);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should return value and have 2 retries with message based rate limit error", async () => {
    const res = await retryer(fetcherFailWithMessageBasedRateLimitErr, {});

    expect(fetcherFailWithMessageBasedRateLimitErr).toHaveBeenCalledTimes(2);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should stop once every PAT was rate limited", async () => {
    await expect(retryer(fetcherFail, {})).rejects.toThrow(
      "Downtime due to GitHub API rate limiting",
    );

    expect(fetcherFail).toHaveBeenCalledTimes(2);
  });

  it("retryer should not exceed the retry limit when many PATs are available", async () => {
    try {
      loadConfigFromEnv({
        PAT_1: "pat1",
        PAT_2: "pat2",
        PAT_3: "pat3",
        PAT_4: "pat4",
        PAT_5: "pat5",
      });

      await expect(retryer(fetcherFail, {})).rejects.toThrow(
        "Downtime due to GitHub API rate limiting",
      );

      expect(fetcherFail).toHaveBeenCalledTimes(4);
    } finally {
      loadConfigFromEnv();
    }
  });

  it("retryer should switch to a different PAT without any delay when rate limited", async () => {
    vi.useFakeTimers();
    try {
      const tokens: Array<string> = [];
      const fetcherRecordingTokens = vi.fn((_vars, token: string) => {
        tokens.push(token);
        return Promise.resolve({
          data: { errors: [{ type: "RATE_LIMITED" }] },
        });
      }) as unknown as Fetcher;

      // timers are never advanced, so this only resolves if no delay is awaited
      await expect(retryer(fetcherRecordingTokens, {})).rejects.toThrow(
        "Downtime due to GitHub API rate limiting",
      );

      expect(tokens).toStrictEqual([...new Set(tokens)]);
      expect(tokens).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("retryer should retry a temporary error after a delay", async () => {
    vi.useFakeTimers();
    try {
      const fetcherFailingOnce = vi.fn((_vars, _token, retries: number) => {
        if (retries < 1) {
          return Promise.reject(new Error("Network Error"));
        }
        return Promise.resolve({ data: "ok" });
      }) as unknown as Fetcher;

      const result = retryer(fetcherFailingOnce, {});

      await vi.advanceTimersByTimeAsync(100);

      await expect(result).resolves.toStrictEqual({ data: "ok" });
      expect(fetcherFailingOnce).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("retryer should retry temporary errors 3 times and rethrow the last one", async () => {
    vi.useFakeTimers();
    try {
      const networkError = new Error("Network Error");
      const fetcherNetworkError = vi
        .fn()
        .mockRejectedValue(networkError) as unknown as Fetcher;

      const result = retryer(fetcherNetworkError, {});
      const assertion = expect(result).rejects.toThrow(networkError);

      await vi.advanceTimersByTimeAsync(100);
      expect(fetcherNetworkError).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1000);
      expect(fetcherNetworkError).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(3000);
      expect(fetcherNetworkError).toHaveBeenCalledTimes(4);

      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it("retryer should handle a rate limit error followed by a network error", async () => {
    vi.useFakeTimers();
    try {
      const tokens: Array<string> = [];
      const fetcherRateLimitThenNetwork = vi.fn(
        (_vars, token: string, retries: number) => {
          tokens.push(token);
          if (retries === 0) {
            return Promise.resolve({
              data: { errors: [{ type: "RATE_LIMITED" }] },
            });
          }
          if (retries === 1) {
            return Promise.reject(new Error("Network Error"));
          }
          return Promise.resolve({ data: "ok" });
        },
      ) as unknown as Fetcher;

      const result = retryer(fetcherRateLimitThenNetwork, {});

      // the rate limited attempt is retried immediately, the network error is not
      await vi.advanceTimersByTimeAsync(99);
      expect(fetcherRateLimitThenNetwork).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1);

      await expect(result).resolves.toStrictEqual({ data: "ok" });
      expect(fetcherRateLimitThenNetwork).toHaveBeenCalledTimes(3);
      expect(tokens[1]).not.toBe(tokens[0]);
      expect(tokens[2]).toBe(tokens[1]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("retryer should rethrow the last network error following a rate limit error", async () => {
    vi.useFakeTimers();
    try {
      const tokens: Array<string> = [];
      const fetcherRateLimitThenNetworkErrors = vi.fn(
        (_vars, token: string, retries: number) => {
          tokens.push(token);
          if (retries === 0) {
            return Promise.resolve({
              data: { errors: [{ type: "RATE_LIMITED" }] },
            });
          }
          return Promise.reject(new Error(`Network Error ${retries}`));
        },
      ) as unknown as Fetcher;

      const result = retryer(fetcherRateLimitThenNetworkErrors, {});
      const assertion = expect(result).rejects.toThrow("Network Error 3");

      // the rate limited attempt is retried immediately
      await vi.advanceTimersByTimeAsync(99);
      expect(fetcherRateLimitThenNetworkErrors).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1);
      expect(fetcherRateLimitThenNetworkErrors).toHaveBeenCalledTimes(3);
      await vi.advanceTimersByTimeAsync(1000);
      expect(fetcherRateLimitThenNetworkErrors).toHaveBeenCalledTimes(4);

      await assertion;
      expect(tokens[1]).not.toBe(tokens[0]);
      expect(tokens.slice(1)).toStrictEqual([tokens[1], tokens[1], tokens[1]]);
    } finally {
      vi.useRealTimers();
    }
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
