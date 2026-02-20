// @ts-check

import { afterEach, describe, expect, it, jest } from "@jest/globals";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import gist from "../../api-renamed/gist.js";
import { renderError } from "../../src/common/render.js";
import { gist_data } from "../test-data/gist-data.js";

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("Test /api/gist", () => {
  it("should render error if id is not provided", async () => {
    const req = {
      query: {},
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
        message: 'Missing params "id" make sure you pass the parameters in URL',
        secondaryMessage: "/api/gist?id=GIST_ID",
        renderOptions: { show_repo_link: false },
      }),
    );
  });
});
