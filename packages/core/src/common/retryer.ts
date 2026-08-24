import type { AxiosResponse } from "axios";

import { getConfig } from "./config.js";
import { CustomError } from "./error.js";
import { logger } from "./log.js";

/**
 * Error-detection fields the retryer inspects to detect rate-limiting and credential failures.
 * Every fetcher's payload is intersected with
 * this, so the retryer can read `errors`/`message` regardless of the payload's own shape.
 */
interface ResponseErrors {
  errors?: Array<{ type?: string; message?: string }>;
  message?: string;
}

/**
 * Returns a random integer from 0 (inclusive) to `max` (exclusive).
 *
 * The value is generated using `Math.random()` and uniformly distributed
 * across the range.
 *
 * @param max The upper bound (exclusive). Must be a positive number.
 *
 * @returns A random integer `n` such that `0 <= n < max`.
 */
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Delay before each transient retry of the same PAT.
 *
 * Transient failures are network-level errors (ECONNRESET, ETIMEDOUT,
 * socket hang up) and retryable HTTP statuses. Token rotation stays
 * separate from this backoff.
 */
const TRANSIENT_RETRY_DELAYS_MS = [1000, 2000, 4000];

/** Random extra wait added to each transient retry delay. */
const TRANSIENT_RETRY_JITTER_MS = 250;

/**
 * HTTP statuses worth a same-token retry. Server-side blips only.
 * 429 and rate-limit 403 answers skip quick retries entirely: hammering a
 * limited token violates GitHub's Retry-After / reset guidance and can get
 * the token blocked. Permanent statuses such as 401/404/422 stay outside
 * this set.
 */
const RETRYABLE_HTTP_STATUS_CODES = new Set([502, 503, 504]);

/**
 * Wait for `ms` milliseconds.
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Optional overrides for {@link retryer}, mainly for tests.
 */
interface RetryerOptions {
  /**
   * Delays between transient retries of one PAT.
   * An empty array disables transient retries.
   */
  transientRetryDelaysMs?: Array<number>;
}

/**
 * A fetcher's Axios response. `TData` is the shape of `response.data`,
 * which is intersected with {@link ResponseErrors} so the retryer can inspect
 * `errors`/`message`.
 * Defaults to `unknown` (error fields only) for callers that don't care about the payload.
 */
type FetcherResponse<TData = unknown> = AxiosResponse<TData & ResponseErrors>;

type FetcherFunction<TData = unknown, TVariables = Record<string, unknown>> = (
  variables: TVariables,
  token: string,
  retriesForTests?: number,
) => Promise<FetcherResponse<TData>>;

/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 *
 * @template TData Shape of `response.data` returned by the fetcher.
 * @template TVariables Variables the fetcher accepts.
 * @param fetcher The fetcher function.
 * @param variables Object with arguments to pass to the fetcher function.
 * @param pat Optional PAT override.
 * @returns The response from the fetcher function.
 */
const retryer = async <TData = unknown, TVariables = Record<string, unknown>>(
  fetcher: FetcherFunction<TData, TVariables>,
  variables: TVariables,
  pat: string | null = null,
  { transientRetryDelaysMs = TRANSIENT_RETRY_DELAYS_MS }: RetryerOptions = {},
): Promise<FetcherResponse<TData>> => {
  const PATs = pat
    ? [{ name: "user PAT from database", value: pat }]
    : getConfig().pats;

  if (!PATs.length) {
    throw new CustomError("No GitHub API tokens found", CustomError.NO_TOKENS);
  }
  const startPAT = getRandomInt(PATs.length);

  let lastTransientError: unknown = null;

  for (let retries = 0; retries < PATs.length; retries++) {
    const currentPAT = PATs[(startPAT + retries) % PATs.length];
    if (!currentPAT) {
      continue;
    }

    // One transient retry per delay entry. The last pass has no delay left
    // and rotates to the next PAT instead.
    for (let attempt = 0; attempt <= transientRetryDelaysMs.length; attempt++) {
      try {
        const response = await fetcher(
          variables,
          currentPAT.value,
          // used in tests for faking rate limit
          retries,
        );

        // react on both type and message-based rate-limit signals.
        // https://github.com/anuraghazra/github-readme-stats/issues/4425
        const errors = response.data.errors;
        const errorType = errors?.[0]?.type;
        const errorMsg = errors?.[0]?.message ?? "";
        const isRateLimited =
          (!!errors && errorType === "RATE_LIMITED") ||
          /rate limit/i.test(errorMsg);

        if (isRateLimited) {
          logger.log(`${currentPAT.name} Failed due to rate limiting`);
          break; // rotate to next PAT
        }
        return response;
      } catch (err) {
        const e = err as {
          response?: FetcherResponse<TData>;
          isAxiosError?: boolean;
          message?: unknown;
        };

        // Rate-limit responses never get quick retries. Quick retries would
        // violate GitHub's Retry-After / reset guidance and can get the
        // token blocked, so rotate to the next PAT instead. HTTP 429 and
        // rate-limit 403 answers both carry this meaning.
        const status = e.response?.status;
        const carriesRateLimitMessage = /rate limit/i.test(
          e.response?.data.message ?? "",
        );
        const isRateLimitResponse =
          status === 429 || (status === 403 && carriesRateLimitMessage);

        if (isRateLimitResponse && e.response) {
          logger.log(
            `${currentPAT.name} hit a rate limit (HTTP ${status}), rotating`,
          );
          break; // rotate to next PAT
        }

        // Transient failure: network-level error without a response, or a
        // retryable HTTP status. Retry the same PAT with backoff before
        // rotating to the next token.
        const isTransient =
          (!e.response && e.isAxiosError === true) ||
          (!!e.response && RETRYABLE_HTTP_STATUS_CODES.has(e.response.status));

        if (isTransient) {
          lastTransientError = err;
          const delayMs = transientRetryDelaysMs[attempt];
          if (delayMs !== undefined) {
            logger.log(
              `${currentPAT.name} transient failure (${String(e.message)}), retrying`,
            );
            await sleep(delayMs + getRandomInt(TRANSIENT_RETRY_JITTER_MS));
            continue;
          }
          break; // retries exhausted → rotate to next PAT
        }

        // non-axios errors are bugs, not transient failures
        if (!e.response) {
          throw err;
        }

        // also checking for bad credentials if any tokens gets invalidated
        const message = e.response.data.message;
        const isBadCredential = message === "Bad credentials";
        const isAccountSuspended =
          message === "Sorry. Your account was suspended.";

        if (isBadCredential || isAccountSuspended) {
          logger.log(`${currentPAT.name} Failed due to bad credentials`);
          break; // rotate to next PAT
        }

        // HTTP error with a response → return it for caller-side handling
        return e.response;
      }
    }
  }

  // Rate-limit rotation exhaustion keeps the historical message. Transient
  // exhaustion reports the real cause, since claiming "rate limiting" would
  // mislead when no rate limit was observed.
  throw new CustomError(
    lastTransientError instanceof Error
      ? `GitHub API request failed after transient retries: ${lastTransientError.message}`
      : "Downtime due to GitHub API rate limiting",
    CustomError.MAX_RETRY,
  );
};

export { retryer };
