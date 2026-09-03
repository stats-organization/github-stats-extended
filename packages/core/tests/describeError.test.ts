import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../src/api/index.js";
import {
  CustomError,
  MissingParamError,
  describeError,
} from "../src/common/error.js";

vi.mock(import("../src/common/log.js"), async () => {
  const { createLoggerMock } = await import("./utils.js");
  return createLoggerMock();
});

// The handler is a JS function whose inferred options type spells out every
// query parameter. Tests pass partial query maps on purpose and only assert
// the parts of the result they care about, so they call through this
// deliberately narrowed view instead of the raw inferred signature.
interface TestApiResult {
  status: string;
  error?: {
    type?: string;
    message?: string;
  };
  content: string;
}
const callApi = (options: Record<string, unknown>): Promise<TestApiResult> => {
  return api(options as Parameters<typeof api>[0]);
};

describe("Test describeError", () => {
  it("should return message only for errors without a type", () => {
    expect(describeError(new Error("boom"))).toStrictEqual({
      message: "boom",
    });
  });

  it("should return type and message for custom errors", () => {
    expect(
      describeError(
        new CustomError(
          "Downtime due to GitHub API rate limiting",
          CustomError.MAX_RETRY,
        ),
      ),
    ).toStrictEqual({
      type: CustomError.MAX_RETRY,
      message: "Downtime due to GitHub API rate limiting",
    });
  });

  it("should omit the type for missing param errors", () => {
    expect(describeError(new MissingParamError(["username"]))).toStrictEqual({
      message:
        'Missing params "username" make sure you pass the parameters in URL',
    });
  });
});

describe("Test API result error contract", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it("stats handler should keep status stable and attach typed details on rate limit exhaustion", async () => {
    mock.onPost("https://api.github.com/graphql").reply(200, {
      errors: [{ type: "RATE_LIMITED" }],
    });

    const result = await callApi({ username: "octocat" });

    // status keeps its exact value for comparisons in apps/backend/router.js
    expect(result.status).toBe("error - temporary");
    expect(result).toMatchObject({
      status: "error - temporary",
      error: {
        type: CustomError.MAX_RETRY,
        message: "Downtime due to GitHub API rate limiting",
      },
    });
  });
});
