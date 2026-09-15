import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import statsApi from "../src/api/index.js";
import {
  CustomError,
  MissingParamError,
  describeError,
} from "../src/common/error.js";

vi.mock(import("../src/common/log.js"), async () => {
  const { createLoggerMock } = await import("./utils.js");
  return createLoggerMock();
});

describe("Test describeError", () => {
  it("should return message only for errors without a type", () => {
    expect(describeError(new Error("boom"))).toStrictEqual({
      message: "boom",
    });

    expect(describeError(new MissingParamError(["username"]))).toStrictEqual({
      message:
        'Missing params "username" make sure you pass the parameters in URL',
    });
  });

  it("should return type and messages for custom errors", () => {
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
      secondaryMessage:
        "You can deploy own instance or wait until public will be no longer limited",
    });
  });

  it("should return a secondary message when available", () => {
    expect(
      describeError(
        new MissingParamError(["username"], "Specify a GitHub username"),
      ),
    ).toStrictEqual({
      message:
        'Missing params "username" make sure you pass the parameters in URL',
      secondaryMessage: "Specify a GitHub username",
    });
  });
});

describe("Test API result error contract", () => {
  const mock = new MockAdapter(axios);

  afterEach(() => {
    mock.restore();
  });

  it("stats handler should attach typed details on rate limit exhaustion", async () => {
    mock.onPost("https://api.github.com/graphql").reply(200, {
      errors: [{ type: "RATE_LIMITED" }],
    });

    const result = await statsApi({ username: "octocat" } as Parameters<
      typeof statsApi
    >[0]);

    expect(result).toMatchObject({
      status: "error - temporary",
      error: {
        type: CustomError.MAX_RETRY,
        message: "Downtime due to GitHub API rate limiting",
        secondaryMessage:
          "You can deploy own instance or wait until public will be no longer limited",
      },
    });
  });
});
