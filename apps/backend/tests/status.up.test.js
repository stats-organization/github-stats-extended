/**
 * @file Tests for the status/up cloud function.
 */

import { logger } from "@stats-organization/github-readme-stats-core";
import nock from "nock";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import up, { RATE_LIMIT_SECONDS } from "../api/status/up.js";

const successData = {
  rateLimit: {
    remaining: 4986,
  },
};

const faker = (query) => {
  const req = {
    query: { ...query },
  };
  const res = {
    setHeader: vi.fn(),
    send: vi.fn(),
  };

  return { req, res };
};

const rate_limit_error = {
  errors: [
    {
      type: "RATE_LIMITED",
    },
  ],
};

const bad_credentials_error = {
  message: "Bad credentials",
};

const shields_up = {
  schemaVersion: 1,
  label: "Public Instance",
  isError: true,
  message: "up",
  color: "brightgreen",
};
const shields_down = {
  schemaVersion: 1,
  label: "Public Instance",
  isError: true,
  message: "down",
  color: "red",
};

const realSetImmediate = setImmediate;

/**
 * Runs fake timers until the given promise settles.
 * nock answers on real macrotasks, so a single `vi.runAllTimersAsync()` can return
 * before the retryer has scheduled its next delay.
 *
 * @param {Promise<unknown>} promise Promise to settle.
 * @returns {Promise<unknown>} The given promise.
 */
const runTimersUntilSettled = async (promise) => {
  let settled = false;
  promise.then(
    () => (settled = true),
    () => (settled = true),
  );
  while (!settled) {
    await vi.runAllTimersAsync();
    await new Promise((resolve) => realSetImmediate(resolve));
  }
  return promise;
};

beforeAll(() => {
  vi.spyOn(logger, "log").mockImplementation(() => {});
  vi.spyOn(logger, "error").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("Test /api/status/up", () => {
  it("should return `true` if request was successful", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, successData);

    const { req, res } = faker({}, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith(true);
  });

  it("should return `false` if all PATs are rate limited", async () => {
    nock("https://api.github.com")
      .persist()
      .post("/graphql")
      .reply(200, rate_limit_error);

    const { req, res } = faker({}, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith(false);
  });

  it("should return JSON `true` if request was successful and type='json'", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, successData);

    const { req, res } = faker({ type: "json" }, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith({ up: true });
  });

  it("should return JSON `false` if all PATs are rate limited and type='json'", async () => {
    nock("https://api.github.com")
      .persist()
      .post("/graphql")
      .reply(200, rate_limit_error);

    const { req, res } = faker({ type: "json" }, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith({ up: false });
  });

  it("should return UP shields.io config if request was successful and type='shields'", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, successData);

    const { req, res } = faker({ type: "shields" }, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith(shields_up);
  });

  it("should return DOWN shields.io config if all PATs are rate limited and type='shields'", async () => {
    nock("https://api.github.com")
      .persist()
      .post("/graphql")
      .reply(200, rate_limit_error);

    const { req, res } = faker({ type: "shields" }, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith(shields_down);
  });

  it("should return `true` if the first PAT is rate limited but the second PATs works", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(200, rate_limit_error)
      .post("/graphql")
      .reply(200, successData);

    const { req, res } = faker({}, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith(true);
  });

  it("should return `true` if the first PAT has 'Bad credentials' but the second PAT works", async () => {
    nock("https://api.github.com")
      .post("/graphql")
      .reply(404, bad_credentials_error)
      .post("/graphql")
      .reply(200, successData);

    const { req, res } = faker({}, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith(true);
  });

  it("should return `false` if all pats have 'Bad credentials'", async () => {
    nock("https://api.github.com")
      .persist()
      .post("/graphql")
      .reply(404, bad_credentials_error);

    const { req, res } = faker({}, {});
    await up(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json",
    );
    expect(res.send).toHaveBeenCalledWith(false);
  });

  it("should throw an error if the request fails", async () => {
    vi.useFakeTimers();
    try {
      nock("https://api.github.com")
        .persist()
        .post("/graphql")
        .replyWithError("Network Error");

      const { req, res } = faker({}, {});
      await runTimersUntilSettled(up(req, res));

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json",
      );
      expect(res.send).toHaveBeenCalledWith(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should have proper cache when no error is thrown", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, successData);

    const { req, res } = faker({}, {});
    await up(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "application/json"],
      ["Cache-Control", `max-age=0, s-maxage=${RATE_LIMIT_SECONDS}`],
    ]);
  });

  it("should have proper cache when error is thrown", async () => {
    vi.useFakeTimers();
    try {
      nock("https://api.github.com")
        .persist()
        .post("/graphql")
        .replyWithError("Network Error");

      const { req, res } = faker({}, {});
      await runTimersUntilSettled(up(req, res));

      expect(res.setHeader.mock.calls).toEqual([
        ["Content-Type", "application/json"],
        ["Cache-Control", "no-store"],
      ]);
    } finally {
      vi.useRealTimers();
    }
  });
});
