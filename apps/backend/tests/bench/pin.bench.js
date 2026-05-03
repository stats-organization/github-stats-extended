import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { beforeAll, bench, describe, vi } from "vitest";

import { data_user } from "../utils.js";

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

  mock.onPost("https://api.github.com/graphql").reply(200, data_user);
});

describe("bench /api/pin", () => {
  bench(
    "base",
    async () => {
      const req = {
        headers: {},
        url: "/api/pin?username=anuraghazra&repo=convoychat",
      };
      const res = createResponse();

      await router(req, res);
    },
    { warmupIterations: 50 },
  );
});
