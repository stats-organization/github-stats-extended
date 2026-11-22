import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../api/repeat-recent.js";

vi.mock(import("../src/repeatRequests.js"), () => ({
  repeatRecentRequests: vi.fn().mockResolvedValue(undefined),
}));

describe("Test repeat-recent endpoint authorization", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      method: "POST",
      headers: {},
    };
    res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value;
      },
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should reject non-POST methods with 405", async () => {
    req.method = "GET";
    await handler(req, res);
    expect(res.statusCode).toBe(405);
    expect(res.send).toHaveBeenCalledWith({ error: "Method Not Allowed" });
  });

  it("should reject unauthorized requests with 401 when CRON_SECRET is configured", async () => {
    vi.stubEnv("CRON_SECRET", "super-secret-token");
    req.headers.authorization = "Bearer wrong-token";
    await handler(req, res);
    expect(res.statusCode).toBe(401);
    expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("should succeed with 200 when valid bearer token is provided", async () => {
    vi.stubEnv("CRON_SECRET", "super-secret-token");
    req.headers.authorization = "Bearer super-secret-token";
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.send).toHaveBeenCalledWith({
      message: "Recent requests repeated successfully.",
    });
  });
});
