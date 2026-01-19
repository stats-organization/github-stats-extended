import axios from "axios";
import {
  pool,
  deleteOldRequests,
  getRecentRequests,
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
      const url = "https://" + process.env.VERCEL_BRANCH_URL + urls[idx];
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

/**
 * Repeats requests made in the last 8 days, excluding those made in the last 11 hours.
 */
export async function repeatRecentRequests() {
  if (!pool) {
    console.error("Postgres pool is not initialized.");
    return;
  }

  await deleteOldRequests();
  const urls = await getRecentRequests();
  if (urls.length === 0) {
    console.log("No recent requests found.");
  } else {
    await makeRequests(urls, 5);
  }
}
