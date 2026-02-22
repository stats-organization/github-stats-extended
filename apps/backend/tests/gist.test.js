// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import gist from "../api-renamed/gist.js";
import { renderGistCard } from "../src/cards/gist.js";
import { CACHE_TTL, DURATIONS } from "../src/common/cache.js";
import { renderError } from "../src/common/render.js";

import { gist_data } from "./test-data/gist-data.js";

import "@testing-library/jest-dom/vitest";

const gist_not_found_data = {
  data: {
    viewer: {
      gist: null,
    },
  },
};

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("Test /api/gist", () => {
  it("should test the request", async () => {
    const req = {
      query: {
        id: "bbfce31e0217a3689c8d961a356cb10d",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, gist_data);

    await gist(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderGistCard({
        name: gist_data.data.viewer.gist.files[0].name,
        nameWithOwner: `${gist_data.data.viewer.gist.owner.login}/${gist_data.data.viewer.gist.files[0].name}`,
        description: gist_data.data.viewer.gist.description,
        language: gist_data.data.viewer.gist.files[0].language.name,
        starsCount: gist_data.data.viewer.gist.stargazerCount,
        forksCount: gist_data.data.viewer.gist.forks.totalCount,
      }),
    );
  });

  it("should get the query options", async () => {
    const req = {
      query: {
        id: "bbfce31e0217a3689c8d961a356cb10d",
        title_color: "fff",
        icon_color: "fff",
        text_color: "fff",
        bg_color: "fff",
        show_owner: true,
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, gist_data);

    await gist(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderGistCard(
        {
          name: gist_data.data.viewer.gist.files[0].name,
          nameWithOwner: `${gist_data.data.viewer.gist.owner.login}/${gist_data.data.viewer.gist.files[0].name}`,
          description: gist_data.data.viewer.gist.description,
          language: gist_data.data.viewer.gist.files[0].language.name,
          starsCount: gist_data.data.viewer.gist.stargazerCount,
          forksCount: gist_data.data.viewer.gist.forks.totalCount,
        },
        { ...req.query },
      ),
    );
  });

  it("should render error if gist is not found", async () => {
    const req = {
      query: {
        id: "bbfce31e0217a3689c8d961a356cb10d",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock
      .onPost("https://api.github.com/graphql")
      .reply(200, gist_not_found_data);

    await gist(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderError({ message: "Gist not found" }),
    );
  });

  it("should render error if wrong locale is provided", async () => {
    const req = {
      query: {
        id: "bbfce31e0217a3689c8d961a356cb10d",
        locale: "asdf",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, gist_data);

    await gist(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderError({
        message: "Something went wrong",
        secondaryMessage: "Language not found",
      }),
    );
  });

  it("should have proper cache", async () => {
    const req = {
      query: {
        id: "bbfce31e0217a3689c8d961a356cb10d",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, gist_data);

    await gist(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      `max-age=${CACHE_TTL.GIST_CARD.DEFAULT}, ` +
        `s-maxage=${CACHE_TTL.GIST_CARD.DEFAULT}, ` +
        `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
    );
  });
});
