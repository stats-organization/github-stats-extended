// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import api from "../../api-renamed/index.js";
import { renderError } from "../../src/common/render.js";
import { data_stats } from "../test-data/api-data.js";

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("Test /api/", () => {
  it("should render error card if username not in whitelist", async () => {
    const req = {
      query: {
        username: "renovate-bot",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").replyOnce(200, data_stats);

    await api(req, res);

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
