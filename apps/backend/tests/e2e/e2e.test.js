/**
 * @file Contains end-to-end tests for the Vercel preview instance.
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

const REPO = "curly-fiesta";
const USER = "catelinemnemosyne";
const STATS_CARD_USER = "e2eninja";
const GIST_ID = "372cef55fd897b31909fdeb3a7262758";

const STATS_MOCK_RESPONSE = {
  data: {
    user: {
      name: "CodeNinja",
      login: STATS_CARD_USER,
      repositoriesContributedTo: { totalCount: 0 },
      commits: {
        totalCommitContributions: 3,
      },
      reviews: {
        totalPullRequestReviewContributions: 0,
      },
      pullRequests: { totalCount: 1 },
      openIssues: { totalCount: 1 },
      closedIssues: { totalCount: 0 },
      followers: { totalCount: 0 },
      repositories: {
        totalCount: 1,
        nodes: [{ name: REPO, stargazers: { totalCount: 1 } }],
        pageInfo: {
          hasNextPage: false,
          endCursor: "cursor",
        },
      },
    },
  },
};

const COMMITS_SEARCH_MOCK_RESPONSE = {
  total_count: 3,
};

const TOP_LANGS_MOCK_RESPONSE = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: REPO,
            languages: {
              edges: [
                {
                  size: 1721,
                  node: {
                    color: "#e34c26",
                    name: "HTML",
                  },
                },
                {
                  size: 930,
                  node: {
                    color: "#663399",
                    name: "CSS",
                  },
                },
                {
                  size: 1912,
                  node: {
                    color: "#f1e05a",
                    name: "JavaScript",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  },
};

const WAKATIME_MOCK_RESPONSE = {
  data: {
    human_readable_range: "last week",
    is_already_updating: false,
    is_coding_activity_visible: true,
    is_including_today: false,
    is_other_usage_visible: false,
    is_stuck: false,
    is_up_to_date: false,
    is_up_to_date_pending_future: false,
    percent_calculated: 0,
    range: "all_time",
    status: "pending_update",
    timeout: 15,
    username: USER,
    writes_only: false,
  },
};

const REPO_MOCK_RESPONSE = {
  data: {
    user: {
      repository: {
        name: REPO,
        nameWithOwner: `${USER}/cra-test`,
        isPrivate: false,
        isArchived: false,
        isTemplate: false,
        stargazers: {
          totalCount: 1,
        },
        description: "Simple cra test repo.",
        primaryLanguage: {
          color: "#f1e05a",
          id: "MDg6TGFuZ3VhZ2UxNDA=",
          name: "JavaScript",
        },
        forkCount: 0,
      },
    },
    organization: null,
  },
};

const GIST_MOCK_RESPONSE = {
  data: {
    viewer: {
      gist: {
        description:
          "Trying to access this path on Windows 10 ver. 1803+ will breaks NTFS",
        owner: {
          login: "qwerty541",
        },
        stargazerCount: 1,
        forks: {
          totalCount: 0,
        },
        files: [
          {
            name: "link.txt",
            language: {
              name: "Text",
            },
            size: 1,
          },
        ],
      },
    },
  },
};

const CACHE_BURST_STRING = `v=${new Date().getTime()}`;

const mock = new MockAdapter(axios, { onNoMatch: "passthrough" });

const createResponse = () => ({
  end: vi.fn(),
  setHeader: vi.fn(),
});

let router;

/**
 * Renders a card locally through the backend router.
 * @param {string} url Card URL to render through the router.
 * @returns {Promise<string>} Rendered SVG markup.
 */
async function getLocalSvg(url) {
  const req = {
    headers: {},
    url,
  };
  const res = createResponse();

  await router(req, res);

  expect(res.end).toHaveBeenCalledOnce();
  return res.end.mock.calls[0][0];
}

beforeAll(async () => {
  vi.stubEnv("CACHE_SECONDS", "");
  vi.stubEnv("GIST_WHITELIST", "");
  vi.stubEnv("POSTGRES_URL", "");
  vi.stubEnv("WHITELIST", "");

  vi.stubEnv("PAT_1", "dummyPAT1");
  vi.stubEnv("PAT_2", "dummyPAT2");

  ({ default: router } = await import("../../router.js"));

  mock.onPost("https://api.github.com/graphql").reply((config) => {
    const { query, variables } = JSON.parse(config.data);

    if (
      query.includes("query userInfo") &&
      variables?.login === STATS_CARD_USER
    ) {
      return [200, STATS_MOCK_RESPONSE];
    }

    if (query.includes("query userInfo") && variables?.login === USER) {
      return [200, TOP_LANGS_MOCK_RESPONSE];
    }

    if (query.includes("query getRepo")) {
      return [200, REPO_MOCK_RESPONSE];
    }

    if (query.includes("query gistInfo")) {
      return [200, GIST_MOCK_RESPONSE];
    }

    return [500, { error: "Unhandled GraphQL request in e2e test" }];
  });

  mock
    .onGet(
      `https://api.github.com/search/commits?per_page=1&q=author:${STATS_CARD_USER}`,
    )
    .reply(200, COMMITS_SEARCH_MOCK_RESPONSE);

  mock
    .onGet(
      `https://wakatime.com/api/v1/users/${USER}/stats?is_including_today=true`,
    )
    .reply(200, WAKATIME_MOCK_RESPONSE);
});

afterAll(() => {
  mock.restore();
  vi.unstubAllEnvs();
});

describe("Fetch Cards", () => {
  const VERCEL_PREVIEW_URL = "https://github-stats-extended-preview.vercel.app";

  test("retrieve stats card", async () => {
    expect(VERCEL_PREVIEW_URL).toBeDefined();

    const cardPath = `/api?username=${STATS_CARD_USER}&include_all_commits=true&${CACHE_BURST_STRING}`;

    // Check if the Vercel preview instance stats card function is up and running.
    await expect(
      axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`),
    ).resolves.not.toThrow();

    // Get local stats card.
    const localStatsCardSVG = await getLocalSvg(cardPath);

    // Get the Vercel preview stats card response.
    const serverStatsSvg = await axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`);

    // Check if stats card from deployment matches the stats card from local.
    expect(serverStatsSvg.data).toEqual(localStatsCardSVG);
  }, 20000);

  test("retrieve language card", async () => {
    expect(VERCEL_PREVIEW_URL).toBeDefined();

    const cardPath = `/api/top-langs?username=${USER}&${CACHE_BURST_STRING}`;

    // Check if the Vercel preview instance language card function is up and running.
    await expect(
      axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`),
    ).resolves.not.toThrow();

    // Get local language card.
    const localLanguageCardSVG = await getLocalSvg(cardPath);

    // Get the Vercel preview language card response.
    const serverLanguageSVG = await axios.get(
      `${VERCEL_PREVIEW_URL}${cardPath}`,
    );

    // Check if language card from deployment matches the local language card.
    expect(serverLanguageSVG.data).toEqual(localLanguageCardSVG);
  }, 20000);

  test("retrieve WakaTime card", async () => {
    expect(VERCEL_PREVIEW_URL).toBeDefined();

    const cardPath = `/api/wakatime?username=${USER}&${CACHE_BURST_STRING}`;

    // Check if the Vercel preview instance WakaTime function is up and running.
    await expect(
      axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`),
    ).resolves.not.toThrow();

    // Get local WakaTime card.
    const localWakaCardSVG = await getLocalSvg(cardPath);

    // Get the Vercel preview WakaTime card response.
    const serverWakaTimeSvg = await axios.get(
      `${VERCEL_PREVIEW_URL}${cardPath}`,
    );

    // Check if WakaTime card from deployment matches the local WakaTime card.
    expect(serverWakaTimeSvg.data).toEqual(localWakaCardSVG);
  }, 20000);

  test("retrieve repo card", async () => {
    expect(VERCEL_PREVIEW_URL).toBeDefined();

    const cardPath = `/api/pin?username=${USER}&repo=${REPO}&${CACHE_BURST_STRING}`;

    // Check if the Vercel preview instance Repo function is up and running.
    await expect(
      axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`),
    ).resolves.not.toThrow();

    // Get local repo card.
    const localRepoCardSVG = await getLocalSvg(cardPath);

    // Get the Vercel preview repo card response.
    const serverRepoSvg = await axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`);

    // Check if Repo card from deployment matches the local Repo card.
    expect(serverRepoSvg.data).toEqual(localRepoCardSVG);
  }, 20000);

  test("retrieve gist card", async () => {
    expect(VERCEL_PREVIEW_URL).toBeDefined();

    const cardPath = `/api/gist?id=${GIST_ID}&${CACHE_BURST_STRING}`;

    // Check if the Vercel preview instance Gist function is up and running.
    await expect(
      axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`),
    ).resolves.not.toThrow();

    // Get local gist card.
    const localGistCardSVG = await getLocalSvg(cardPath);

    // Get the Vercel preview gist card response.
    const serverGistSvg = await axios.get(`${VERCEL_PREVIEW_URL}${cardPath}`);

    // Check if Gist card from deployment matches the local Gist card.
    expect(serverGistSvg.data).toEqual(localGistCardSVG);
  }, 20000);
});
