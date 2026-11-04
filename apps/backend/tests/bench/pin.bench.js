import { beforeAll, test, vi } from "vitest";

import { createRequestResponse, data_user, mockGraphQL } from "../utils.js";

let router;

beforeAll(async () => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  ({ default: router } = await import("../../router.js"));

  mockGraphQL(data_user);
});

test("bench /api/pin", async ({ bench }) => {
  await bench("base", async () => {
    const { req, res } = createRequestResponse(
      "/api/pin?username=anuraghazra&repo=convoychat",
    );
    await router(req, res);
  }).run({ warmupIterations: 50 });
});
