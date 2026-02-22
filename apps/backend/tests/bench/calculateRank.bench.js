import { bench, describe } from "vitest";

import { calculateRank } from "../../src/calculateRank.js";

describe("calculateRank", () => {
  bench(
    "base",
    async () => {
      calculateRank({
        all_commits: false,
        commits: 1300,
        prs: 1500,
        issues: 4500,
        reviews: 1000,
        repos: 0,
        stars: 600000,
        followers: 50000,
      });
    },
    { warmupIterations: 50 },
  );
});
