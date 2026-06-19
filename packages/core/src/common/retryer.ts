import type { AxiosResponse } from "axios";

import { getConfig } from "./config.js";
import { CustomError } from "./error.js";
import { logger } from "./log.js";

/**
 * Subset of the response payload the retryer inspects to detect
 * rate-limiting and credential failures.
 */
interface ResponseData {
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

type FetcherResponse = AxiosResponse<ResponseData>;

type FetcherFunction = (
  variables: Record<string, unknown>,
  token: string,
  retriesForTests?: number,
) => Promise<FetcherResponse>;

/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 *
 * @param fetcher The fetcher function.
 * @param variables Object with arguments to pass to the fetcher function.
 * @param pat Optional PAT override.
 * @returns The response from the fetcher function.
 */
const retryer = async (
  fetcher: FetcherFunction,
  variables: Record<string, unknown>,
  pat: string | null = null,
): Promise<FetcherResponse> => {
  const PATs = pat
    ? [{ name: "user PAT from database", value: pat }]
    : getConfig().pats;

  if (!PATs.length) {
    throw new CustomError("No GitHub API tokens found", CustomError.NO_TOKENS);
  }
  const startPAT = getRandomInt(PATs.length);

  for (let retries = 0; retries < PATs.length; retries++) {
    const currentPAT = PATs[(startPAT + retries) % PATs.length];
    if (!currentPAT) {
      continue;
    }

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
      } else {
        return response;
      }
    } catch (err) {
      const e = err as { response?: FetcherResponse };

      // network/unexpected error → let caller treat as failure
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
      } else {
        // HTTP error with a response → return it for caller-side handling
        return e.response;
      }
    }
  }

  throw new CustomError(
    "Downtime due to GitHub API rate limiting",
    CustomError.MAX_RETRY,
  );
};

export { retryer };
