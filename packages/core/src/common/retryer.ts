import type { AxiosResponse } from "axios";

import { getConfig } from "./config.js";
import { CustomError } from "./error.js";
import { logger } from "./log.js";

/**
 * Delays (in milliseconds) applied before a retry that was caused by a
 * temporary problem such as a network failure.
 */
const TRANSIENT_RETRY_DELAYS_MS: Array<number> = [100, 1000, 3000];

/**
 * Error-detection fields the retryer inspects to detect rate-limiting and credential failures.
 * Every fetcher's payload is intersected with this,
 * so the retryer can read `errors`/`message` regardless of the payload's own shape.
 */
interface ResponseErrors {
  errors?: Array<{ type?: string; message?: string }>;
  message?: string;
}

/**
 * Waits for the given amount of time.
 *
 * @param ms Duration in milliseconds.
 *
 * @returns A promise that resolves once the duration elapsed.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
 * Try to execute the fetcher function until it succeeds or retries are exhausted.
 *
 * Rate-limited or rejected credentials are retried immediately with the next
 * available PAT, temporary problems (e.g. network failures) are retried with
 * the same PAT after the delays defined in {@link TRANSIENT_RETRY_DELAYS_MS}.
 * Both budgets are independent, so retries of one kind never consume the other's.
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
): Promise<FetcherResponse<TData>> => {
  const PATs = pat
    ? [{ name: "user PAT from database", value: pat }]
    : getConfig().pats;

  if (!PATs.length) {
    throw new CustomError("No GitHub API tokens found", CustomError.NO_TOKENS);
  }
  const startPAT = getRandomInt(PATs.length);
  let temporaryFailures = 0;

  for (let attempt = 0; attempt - temporaryFailures < PATs.length; attempt++) {
    const currentPAT =
      PATs[(startPAT + attempt - temporaryFailures) % PATs.length];
    if (!currentPAT) {
      continue;
    }

    try {
      const response = await fetcher(
        variables,
        currentPAT.value,
        // used in tests for faking rate limit
        attempt,
      );

      // react on both type and message-based rate-limit signals.
      // https://github.com/anuraghazra/github-readme-stats/issues/4425
      const errors = response.data.errors;
      const errorType = errors?.[0]?.type;
      const errorMsg = errors?.[0]?.message ?? "";
      const isRateLimited =
        (!!errors && errorType === "RATE_LIMITED") ||
        /rate limit/i.test(errorMsg);

      if (!isRateLimited) {
        return response;
      }
      logger.log(`${currentPAT.name} Failed due to rate limiting`);
    } catch (err) {
      const e = err as { response?: FetcherResponse<TData> };

      // network/unexpected error → temporary problem, retry with a delay
      if (!e.response) {
        if (temporaryFailures < TRANSIENT_RETRY_DELAYS_MS.length) {
          await sleep(TRANSIENT_RETRY_DELAYS_MS[temporaryFailures] ?? 0);
          temporaryFailures++;
          continue;
        } else {
          // transient retries exhausted → let caller treat as failure
          throw err;
        }
      }

      // also checking for bad credentials if any tokens gets invalidated
      const message = e.response.data.message;
      const isBadCredential = message === "Bad credentials";
      const isAccountSuspended =
        message === "Sorry. Your account was suspended.";

      if (!isBadCredential && !isAccountSuspended) {
        // HTTP error with a response → return it for caller-side handling
        return e.response;
      }
      logger.log(`${currentPAT.name} Failed due to bad credentials`);
    }
  }

  throw new CustomError(
    "Downtime due to GitHub API rate limiting",
    CustomError.MAX_RETRY,
  );
};

export { retryer };
