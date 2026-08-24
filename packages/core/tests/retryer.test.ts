import { describe, expect, it, vi } from "vitest";

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

const networkError = (): Error => {
  return Object.assign(new Error("network error"), {
    isAxiosError: true,
    code: "ECONNRESET",
  });
};

const httpError = (status: number, message = ""): Error => {
  return Object.assign(new Error("http error"), {
    isAxiosError: true,
    response: { status, data: { message } },
  });
};

describe("Test Retryer", () => {
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

  it("retryer should retry transient network errors on the same PAT", async () => {
    const fetcherTransient = vi
      .fn()
      .mockRejectedValueOnce(networkError())
      .mockResolvedValue({ data: "ok" }) as unknown as Fetcher;

    const res = await retryer(fetcherTransient, {}, "user-pat-token", {
      transientRetryDelaysMs: [0],
    });

    expect(fetcherTransient).toHaveBeenCalledTimes(2);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it.each([
    [502, true],
    [503, true],
    [504, true],
    // a rate limit: rotate instead of quick-retrying
    [429, false],
  ])("HTTP %i: quick retry = %s", async (status, shouldRetry) => {
    const fetcherByStatus = vi
      .fn()
      .mockRejectedValueOnce(httpError(status))
      .mockResolvedValue({ data: "ok" });

    if (shouldRetry) {
      const res = await retryer(
        fetcherByStatus as unknown as Fetcher,
        {},
        "user-pat-token",
        { transientRetryDelaysMs: [0] },
      );

      expect(fetcherByStatus).toHaveBeenCalledTimes(2);
      expect(res).toStrictEqual({ data: "ok" });
    } else {
      await expect(
        retryer(fetcherByStatus as unknown as Fetcher, {}, "user-pat-token", {
          transientRetryDelaysMs: [0],
        }),
      ).rejects.toThrow("Downtime due to GitHub API rate limiting");

      expect(fetcherByStatus).toHaveBeenCalledTimes(1);
    }
  });

  it("retryer should treat a rate-limit 403 like a rate limit", async () => {
    const fetcher403 = vi
      .fn()
      .mockRejectedValue(httpError(403, "API rate limit exceeded for ..."));

    await expect(
      retryer(fetcher403 as unknown as Fetcher, {}, "user-pat-token", {
        transientRetryDelaysMs: [0],
      }),
    ).rejects.toThrow("Downtime due to GitHub API rate limiting");

    expect(fetcher403).toHaveBeenCalledTimes(1);
  });

  it("retryer should not retry non-retryable HTTP statuses", async () => {
    const fetcher404 = vi.fn().mockRejectedValue(httpError(404, "Not Found"));

    const res = await retryer(
      fetcher404 as unknown as Fetcher,
      {},
      "user-pat-token",
      { transientRetryDelaysMs: [0] },
    );

    expect(fetcher404).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual({ status: 404, data: { message: "Not Found" } });
  });

  it("retryer should throw non-axios errors immediately without retrying", async () => {
    const fetcherBug = vi
      .fn()
      .mockRejectedValue(new TypeError("boom")) as unknown as Fetcher;

    await expect(
      retryer(fetcherBug, {}, "user-pat-token", {
        transientRetryDelaysMs: [0],
      }),
    ).rejects.toThrow("boom");

    expect(fetcherBug).toHaveBeenCalledTimes(1);
  });

  it("retryer should report the transient cause without claiming rate limiting", async () => {
    const fetcherAlwaysFails = vi.fn().mockRejectedValue(networkError());

    const promise = retryer(
      fetcherAlwaysFails as unknown as Fetcher,
      {},
      "user-pat-token",
      { transientRetryDelaysMs: [] },
    );

    await expect(promise).rejects.toThrow(
      "GitHub API request failed after transient retries: network error",
    );
    await expect(promise).rejects.not.toThrow(/rate limiting/i);
    expect(fetcherAlwaysFails).toHaveBeenCalledTimes(1);
  });
});
