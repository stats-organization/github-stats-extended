import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { beforeAll, bench, describe, vi } from "vitest";

import { data_stats } from "../utils.js";

const mock = new MockAdapter(axios);

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

let router;

beforeAll(async () => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");
  vi.stubEnv("PAT_1", "dummyPAT1");

  ({ default: router } = await import("../../router.js"));

  mock.onPost("https://api.github.com/graphql").reply(200, data_stats);
  mock
    .onGet(
      "https://api.github.com/search/issues?per_page=1&q=author:anuraghazra+type:issue+is:public",
    )
    .reply(200, { total_count: 340 });
});

describe("bench /api", () => {
  bench(
    "base",
    async () => {
      const req = {
        headers: {},
        url: "/api?username=anuraghazra",
      };
      const res = createResponse();

      await router(req, res);
    },
    { warmupIterations: 50 },
  );
});
