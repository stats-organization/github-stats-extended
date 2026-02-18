// @ts-check

import { afterEach, describe, expect, it, jest } from "@jest/globals";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import pin from "../../api-renamed/pin.js";
import { renderError } from "../../src/common/render.js";
import { data_user } from "../pin.test.js";

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("Test /api/pin", () => {
  it("should render error card if username not in whitelist", async () => {
    const req = {
      query: {
        username: "renovate-bot",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_user);

    await pin(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderError({
        message: "This username is not whitelisted",
        secondaryMessage: "Please deploy your own instance",
        renderOptions: { show_repo_link: false },
      }),
    );
  });

  it("should render error card if missing required parameters", async () => {
    const req = {
      query: {},
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_user);

    await pin(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderError({
        message: "This username is not whitelisted",
        secondaryMessage: "Please deploy your own instance",
        renderOptions: { show_repo_link: false },
      }),
    );
  });
});
