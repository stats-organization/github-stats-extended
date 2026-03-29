// @ts-check

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeSvg } from "../utils.js";

const mock = new MockAdapter(axios);

const data_stats = {
  data: {
    user: {
      name: "Anurag Hazra",
      login: "anuraghazra",
      repositoriesContributedTo: { totalCount: 51 },
      commits: {
        totalCommitContributions: 200,
      },
      reviews: {
        totalPullRequestReviewContributions: 1234,
      },
      pullRequests: { totalCount: 4000 },
      mergedPullRequests: { totalCount: 3200 },
      openIssues: { totalCount: 300 },
      closedIssues: { totalCount: 40 },
      followers: { totalCount: 150 },
      repositoryDiscussions: { totalCount: 222 },
      repositoryDiscussionComments: {
        totalCount: 111,
      },
      repositories: {
        totalCount: 3,
        nodes: [
          { name: "repo-keep-1", stargazers: { totalCount: 1500 } },
          { name: "repo-exclude-me", stargazers: { totalCount: 9999 } },
          { name: "repo-keep-2", stargazers: { totalCount: 2600 } },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: "cursor",
        },
      },
    },
  },
};

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

beforeEach(() => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  mock.onPost("https://api.github.com/graphql").reply(200, data_stats);
});

afterEach(() => {
  mock.reset();
  vi.unstubAllEnvs();
  // modules may cache environment variables, so we need to reset them
  vi.resetModules();
});

describe("Test /api contract", () => {
  it("should match the public happy-path response snapshot", async () => {
    const { default: router } =
      await import("../../router.js");

    const req = {
      headers: {},
      url: "/api?username=anuraghazra",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public many-params response snapshot", async () => {
    mock.onPost("https://api.github.com/graphql").reply(200, data_stats);

    const { default: router } =
      await import("../../router.js");

    const params = new URLSearchParams({
      username: "anuraghazra",
      show_icons: "true",
      card_width: "540",
      line_height: "32",
      title_color: "123456",
      ring_color: "654321",
      icon_color: "ff00aa",
      text_color: "abcdef",
      text_bold: "false",
      bg_color: "0f172a",
      exclude_repo: "repo-exclude-me",
      custom_title: "a custom title",
      locale: "hi",
      disable_animations: "true",
      border_radius: "12",
      number_format: "long",
      number_precision: "1",
      border_color: "fedcba",
      rank_icon: "github",
      commits_year: "2024",
      hide: "issues",
      role: "OWNER,COLLABORATOR",
      show: "reviews,prs_merged,prs_merged_percentage,discussions_started,discussions_answered",
    });

    const req = {
      headers: {},
      url: `/api?${params.toString()}`,
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      graphqlRequest: mock.history.post[0].data,
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public missing-username response snapshot", async () => {
    const { default: router } =
      await import("../../router.js");

    const req = {
      headers: {},
      url: "/api",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should render error card in same theme as requested card", async () => {
    const { default: router } =
      await import("../../router.js");

    const req = {
      headers: {},
      url: "/api?theme=merko",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the public blacklisted-username response snapshot", async () => {
    const { default: router } =
      await import("../../router.js");

    const req = {
      headers: {},
      url: "/api?username=renovate-bot",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });

  it("should match the private missing-username response snapshot", async () => {
    vi.stubEnv("WHITELIST", "anuraghazra");

    const { default: router } =
      await import("../../router.js");

    const req = {
      headers: {},
      url: "/api",
    };
    const res = createResponse();

    await router(req, res);

    expect(res.end).toHaveBeenCalledOnce();

    expect({
      headers: res.setHeader.mock.calls,
      content: normalizeSvg(res.end.mock.calls[0][0]),
    }).toMatchSnapshot();
  });
});
