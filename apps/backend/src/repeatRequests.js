import axios from "axios";

import {
  deleteOldRequests,
  getRecentRequests,
  pool,
} from "./common/database.js";

/**
 * Processes URLs with a thread pool of given size using axios.get.
 *
 * @param {string[]} urls An array of URLs to process.
 * @param {number} poolSize The number of concurrent requests to process.
 * @returns {Promise<void>} A promise that resolves when all requests are processed.
 */
async function makeRequests(urls, poolSize) {
  let current = 0;

  /**
   * Worker function to process `urls`.
   */
  async function worker() {
    while (true) {
      let idx = current++;
      if (idx >= urls.length) {
        break;
      }
      const url =
        "https://" +
        (process.env.REPEAT_BASE_URL || process.env.VERCEL_BRANCH_URL) +
        urls[idx];
      try {
        if (idx % 10 === 0) {
          console.log(`Processing request ${idx + 1} out of ${urls.length}`);
        }
        await axios.get(url, {
          timeout: 10000,
          headers: { "x-bypass-store": "true" },
        });
      } catch (err) {
        console.error(`Error fetching ${url}:`, err.message);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < poolSize; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

const DEFAULT_REPEAT_INTERVAL_MINUTES = 15;

/**
 * Repeats requests made in the last 8 days (or configured interval), excluding those made in the last 11 hours (or configured interval).
 */
export async function repeatRecentRequests() {
  if (!pool) {
    console.error("Postgres pool is not initialized.");
    return;
  }
  let maxInterval = process.env.DELETE_AFTER_HOURS
    ? `${process.env.DELETE_AFTER_HOURS} hours`
    : "8 days";
  let minInterval = process.env.UPDATE_AFTER_HOURS
    ? `${process.env.UPDATE_AFTER_HOURS} hours`
    : "11 hours";
  await deleteOldRequests(maxInterval);
  const urls = await getRecentRequests(minInterval, maxInterval);
  if (urls.length === 0) {
    console.log("No recent requests found.");
  } else {
    await makeRequests(urls, 1);
  }
}

/**
 * Parses `REPEAT_INTERVAL_MINUTES` from the environment.
 * Returns `null` when scheduling is explicitly disabled (`<= 0`).
 *
 * @returns {number | null} Interval in milliseconds, or `null` if disabled.
 */
function resolveRepeatIntervalMs() {
  const raw = process.env.REPEAT_INTERVAL_MINUTES;
  if (raw === undefined || raw === "") {
    return DEFAULT_REPEAT_INTERVAL_MINUTES * 60_000;
  }
  const minutes = Number(raw);
  if (!Number.isFinite(minutes)) {
    console.warn(
      `Invalid REPEAT_INTERVAL_MINUTES="${raw}", falling back to ${DEFAULT_REPEAT_INTERVAL_MINUTES} minutes.`,
    );
    return DEFAULT_REPEAT_INTERVAL_MINUTES * 60_000;
  }
  if (minutes <= 0) {
    return null;
  }
  return minutes * 60_000;
}

/**
 * Starts a periodic scheduler that invokes `repeatRecentRequests` in-process.
 * Schedules the next run after the previous run settles so runs cannot overlap.
 *
 * @returns {() => void} Stop function to cancel pending scheduled runs.
 */
export function startRepeatRequestsScheduler() {
  if (!pool) {
    console.log(
      "Not scheduling repeatRecentRequests: POSTGRES_URL is not set.",
    );
    return () => {};
  }
  if (!process.env.REPEAT_BASE_URL && !process.env.VERCEL_BRANCH_URL) {
    console.log(
      "Not scheduling repeatRecentRequests: neither REPEAT_BASE_URL nor VERCEL_BRANCH_URL is set.",
    );
    return () => {};
  }
  const intervalMs = resolveRepeatIntervalMs();
  if (intervalMs === null) {
    console.log(
      "Not scheduling repeatRecentRequests: disabled via REPEAT_INTERVAL_MINUTES.",
    );
    return () => {};
  }

  let stopped = false;
  let timer = null;

  const scheduleNext = () => {
    if (stopped) {
      return;
    }
    timer = setTimeout(async () => {
      timer = null;
      try {
        await repeatRecentRequests();
      } catch (err) {
        console.error("Scheduled repeatRecentRequests failed:", err);
      } finally {
        scheduleNext();
      }
    }, intervalMs);
    timer.unref();
  };

  console.log(
    `Scheduled repeatRecentRequests every ${intervalMs / 60_000} minutes.`,
  );
  scheduleNext();

  return () => {
    stopped = true;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
}
