// @ts-check

import supertest from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "../app.js";
import router from "../router.js";

vi.mock(import("../router.js"), () => ({
  default: vi.fn(async (_req, res) => {
    res.status(200).send("ok");
  }),
}));

const routerMock = vi.mocked(router);

beforeEach(() => {
  routerMock.mockClear();
});

describe("Test Express app query parser", () => {
  it("should use the last value when a query parameter is duplicated", async () => {
    await supertest(app)
      .get("/api/wakatime?username=alan&title_color=111111&title_color=222222")
      .expect(200);

    expect(routerMock).toHaveBeenCalledOnce();
    const [req] = routerMock.mock.calls[0];
    expect(req.query).toEqual({
      username: "alan",
      title_color: "222222",
    });
    // should use a null-prototype query object without inherited Object.prototype keys
    expect(req.query.toString).toBeUndefined();
  });

  it("should pass an empty query object when no query string is provided", async () => {
    await supertest(app).get("/api/wakatime").expect(200);

    expect(routerMock).toHaveBeenCalledOnce();
    const [req] = routerMock.mock.calls[0];
    expect(req.query).toEqual({});
  });
});

describe("Test Express app root redirect", () => {
  it("should redirect / to /frontend/docs/", async () => {
    await supertest(app)
      .get("/")
      .expect("Location", "/frontend/docs/")
      .expect(302);

    expect(routerMock).not.toHaveBeenCalled();
  });
});

describe("Test Express app trailing-slash stripping", () => {
  it("should strip trailing slash from pathname without query string", async () => {
    await supertest(app).get("/api/wakatime/").expect(200);

    expect(routerMock).toHaveBeenCalledOnce();
    const [req] = routerMock.mock.calls[0];
    expect(req.url).toBe("/api/wakatime");
  });

  it("should strip trailing slash while preserving query string", async () => {
    await supertest(app)
      .get("/api/wakatime/?username=alan&theme=dark")
      .expect(200);

    expect(routerMock).toHaveBeenCalledOnce();
    const [req] = routerMock.mock.calls[0];
    expect(req.url).toBe("/api/wakatime?username=alan&theme=dark");
    expect(req.query).toEqual({
      username: "alan",
      theme: "dark",
    });
  });

  it("should leave paths without trailing slash unchanged", async () => {
    await supertest(app).get("/api/wakatime?username=alan").expect(200);

    expect(routerMock).toHaveBeenCalledOnce();
    const [req] = routerMock.mock.calls[0];
    expect(req.url).toBe("/api/wakatime?username=alan");
  });
});
