import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { beforeAll, bench, describe, vi } from "vitest";

import { happy_path_gist_data } from "../utils.js";

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

  ({ default: router } = await import("../../router.js"));

  mock
    .onPost("https://api.github.com/graphql")
    .reply(200, happy_path_gist_data);
});

describe("bench /api/gist", () => {
  bench(
    "base",
    async () => {
      const req = {
        headers: {},
        url: "/api/gist?id=happy-gist-id",
      };
      const res = createResponse();

      await router(req, res);
    },
    { warmupIterations: 50 },
  );
});
