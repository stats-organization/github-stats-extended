// @ts-check

import { getUserAccessByName } from "./database.js";
import { CustomError } from "./error.js";
import { logger } from "./log.js";

/**
 * Returns a random integer from 0 (inclusive) to `max` (exclusive).
 *
 * The value is generated using `Math.random()` and uniformly distributed
 * across the range.
 *
 * @param {number} max The upper bound (exclusive). Must be a positive number.
 *
 * @returns {number} A random integer `n` such that `0 <= n < max`.
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * @typedef {import("axios").AxiosResponse} AxiosResponse Axios response.
 * @typedef {(variables: any, token: string, retriesForTests?: number) => Promise<AxiosResponse>} FetcherFunction Fetcher function.
 */

/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 *
 * @param {FetcherFunction} fetcher The fetcher function.
 * @param {string?} username GitHub username of the user whose PAT to use, if available
 * @param {any} variables Object with arguments to pass to the fetcher function.
 * @returns {Promise<any>} The response from the fetcher function.
 */
const retryer = async (fetcher, username, variables) => {
  let userPAT;
  if (username) {
    userPAT = await getUserAccessByName(username);
  }

  let PATs;
  if (userPAT?.token) {
    PATs = [{ name: `USER_${username}`, value: userPAT.token }];
  } else {
    const patNames = Object.keys(process.env).filter((key) =>
      /PAT_\d*$/.exec(key),
    );
    PATs = patNames.map((name) => ({ name, value: process.env[name] }));
  }

  if (!PATs.length) {
    throw new CustomError("No GitHub API tokens found", CustomError.NO_TOKENS);
  }
  const startPAT = getRandomInt(PATs.length);

  for (let retries = 0; retries < PATs.length; retries++) {
    const currentPAT = PATs[(startPAT + retries) % PATs.length];

    try {
      let response = await fetcher(
        variables,
        // @ts-ignore
        currentPAT.value,
        // used in tests for faking rate limit
        retries,
      );

      // react on both type and message-based rate-limit signals.
      // https://github.com/anuraghazra/github-readme-stats/issues/4425
      const errors = response?.data?.errors;
      const errorType = errors?.[0]?.type;
      const errorMsg = errors?.[0]?.message || "";
      const isRateLimited =
        (errors && errorType === "RATE_LIMITED") ||
        /rate limit/i.test(errorMsg);

      if (isRateLimited) {
        logger.log(`${currentPAT.name} Failed due to rate limiting`);
      } else {
        return response;
      }
    } catch (err) {
      /** @type {any} */
      const e = err;

      // network/unexpected error → let caller treat as failure
      if (!e?.response) {
        throw e;
      }

      // prettier-ignore
      // also checking for bad credentials if any tokens gets invalidated
      const isBadCredential =
        e?.response?.data?.message === "Bad credentials";
      const isAccountSuspended =
        e?.response?.data?.message === "Sorry. Your account was suspended.";

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
export default retryer;
