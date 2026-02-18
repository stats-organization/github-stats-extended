// @ts-check

import { afterEach, describe, expect, it, jest } from "@jest/globals";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import gist from "../../api-renamed/gist.js";
import { renderError } from "../../src/common/render.js";
import { gist_data } from "../test-data/gist-data.js";

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("Test /api/gist with gist whitelist", () => {
  it("should render error card if id not in whitelist", async () => {
    const req = {
      query: {
        id: "9bae0392ee3a26bac5cc388a6c8b1469",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, gist_data);

    await gist(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderError({
        message: "This gist ID is not whitelisted",
        secondaryMessage: "Please deploy your own instance",
        renderOptions: { show_repo_link: false },
      }),
    );
  });
});
