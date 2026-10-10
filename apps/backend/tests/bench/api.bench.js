import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { beforeAll, bench, describe, vi } from "vitest";

import { createRequestResponse, data_stats } from "../utils.js";

const mock = new MockAdapter(axios);

let router;

beforeAll(async () => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  ({ default: router } = await import("../../router.js"));

  mock.onPost("https://api.github.com/graphql").reply(200, data_stats);
});

describe("bench /api", () => {
  bench(
    "base",
    async () => {
      const { req, res } = createRequestResponse("/api?username=anuraghazra");
      await router(req, res);
    },
    { warmupIterations: 50 },
  );
});
