// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import pin from "../api-renamed/pin.js";
import { renderRepoCard } from "../src/cards/repo.js";
import { CACHE_TTL, DURATIONS } from "../src/common/cache.js";
import { renderError } from "../src/common/render.js";

import { data_repo, data_user } from "./test-data/pin-data.js";

import "@testing-library/jest-dom/vitest";

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("Test /api/pin", () => {
  it("should test the request", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_user);

    await pin(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      // @ts-ignore
      renderRepoCard({
        ...data_repo.repository,
        starCount: data_repo.repository.stargazers.totalCount,
      }),
    );
  });

  it("should get the query options", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
        title_color: "fff",
        icon_color: "fff",
        text_color: "fff",
        bg_color: "fff",
        full_name: "1",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_user);

    await pin(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderRepoCard(
        // @ts-ignore
        {
          ...data_repo.repository,
          starCount: data_repo.repository.stargazers.totalCount,
        },
        { ...req.query },
      ),
    );
  });

  it("should render error card if user repo not found", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock
      .onPost("https://api.github.com/graphql")
      .reply(200, { data: { user: { repository: null }, organization: null } });

    await pin(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderError({ message: "User Repository Not found" }),
    );
  });

  it("should render error card if org repo not found", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock
      .onPost("https://api.github.com/graphql")
      .reply(200, { data: { user: null, organization: { repository: null } } });

    await pin(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toHaveBeenCalledWith(
      renderError({ message: "Organization Repository Not found" }),
    );
  });

  it("should render error card if wrong locale provided", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
        locale: "asdf",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_user);

    await pin(req, res);

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
        username: "anuraghazra",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_user);

    await pin(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/svg+xml");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      `max-age=${CACHE_TTL.PIN_CARD.DEFAULT}, ` +
        `s-maxage=${CACHE_TTL.PIN_CARD.DEFAULT}, ` +
        `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
    );
  });
});
