// @ts-check

import { vi } from "vitest";

export const data_stats = {
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

export const happy_path_gist_data = {
  data: {
    viewer: {
      gist: {
        description:
          "List of countries and territories in English and Spanish: name, continent, capital, dial code, country codes, TLD, and area in sq km. Lista de países y territorios en Inglés y Español: nombre, continente, capital, código de teléfono, códigos de país, dominio y área en km cuadrados. Updated 2023",
        owner: {
          login: "Yizack",
        },
        stargazerCount: 33,
        forks: {
          totalCount: 11,
        },
        files: [
          {
            name: "countries.json",
            language: {
              name: "JSON",
            },
            size: 85858,
          },
        ],
      },
    },
  },
};

export const data_user = {
  data: {
    user: {
      repository: {
        username: "anuraghazra",
        name: "convoychat",
        nameWithOwner: "anuraghazra/convoychat",
        stargazers: {
          totalCount: 38000,
        },
        description:
          "Help us take over the world with a deeply customizable React, TypeScript and GraphQL chat app that has enough text to wrap across multiple lines in the repository card.",
        primaryLanguage: {
          color: "#2b7489",
          id: "MDg6TGFuZ3VhZ2UyODc=",
          name: "TypeScript",
        },
        forkCount: 100,
        isTemplate: false,
        isArchived: false,
      },
    },
    organization: null,
  },
};

export const data_langs = {
  data: {
    user: {
      repositories: {
        nodes: [
          {
            name: "repo-html",
            languages: {
              edges: [{ size: 180, node: { color: "#0f0", name: "HTML" } }],
            },
          },
          {
            name: "repo-javascript",
            languages: {
              edges: [
                { size: 120, node: { color: "#0ff", name: "JavaScript" } },
              ],
            },
          },
          {
            name: "repo-ts-1",
            languages: {
              edges: [
                { size: 45, node: { color: "#3178c6", name: "TypeScript" } },
              ],
            },
          },
          {
            name: "repo-ts-2",
            languages: {
              edges: [
                { size: 45, node: { color: "#3178c6", name: "TypeScript" } },
              ],
            },
          },
          {
            name: "repo-other-langs",
            languages: {
              edges: [
                { size: 20, node: { color: "#f00", name: "Java" } },
                { size: 10, node: { color: "#0f0", name: "Cobol" } },
                { size: 15, node: { color: "#00f", name: "Python" } },
              ],
            },
          },
          {
            name: "repo-hidden",
            languages: {
              edges: [{ size: 1000, node: { color: "#dea584", name: "Rust" } }],
            },
          },
        ],
      },
    },
  },
};

export const wakaTimeData = {
  data: {
    categories: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "Coding",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    daily_average: 16095,
    daily_average_including_other_language: 16329,
    days_including_holidays: 7,
    days_minus_holidays: 5,
    editors: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "VS Code",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    holidays: 2,
    human_readable_daily_average: "4 hrs 28 mins",
    human_readable_daily_average_including_other_language: "4 hrs 32 mins",
    human_readable_total: "22 hrs 21 mins",
    human_readable_total_including_other_language: "22 hrs 40 mins",
    id: "random hash",
    is_already_updating: false,
    is_coding_activity_visible: true,
    is_including_today: false,
    is_other_usage_visible: true,
    is_stuck: false,
    is_up_to_date: true,
    languages: [
      {
        digital: "12:00",
        hours: 12,
        minutes: 0,
        name: "TypeScript",
        percent: 52,
        text: "12 hrs",
        total_seconds: 43200,
      },
      {
        digital: "6:30",
        hours: 6,
        minutes: 30,
        name: "JavaScript",
        percent: 28,
        text: "6 hrs 30 mins",
        total_seconds: 23400,
      },
      {
        digital: "3:00",
        hours: 3,
        minutes: 0,
        name: "Other",
        percent: 13,
        text: "3 hrs",
        total_seconds: 10800,
      },
      {
        digital: "1:00",
        hours: 1,
        minutes: 0,
        name: "YAML",
        percent: 4,
        text: "1 hr",
        total_seconds: 3600,
      },
      {
        digital: "0:30",
        hours: 0,
        minutes: 30,
        name: "JSON",
        percent: 3,
        text: "30 mins",
        total_seconds: 1800,
      },
    ],
    operating_systems: [
      {
        digital: "22:40",
        hours: 22,
        minutes: 40,
        name: "Mac",
        percent: 100,
        text: "22 hrs 40 mins",
        total_seconds: 81643.570077,
      },
    ],
    percent_calculated: 100,
    range: "last_7_days",
    status: "ok",
    timeout: 15,
    total_seconds: 80473.135716,
    total_seconds_including_other_language: 81643.570077,
    user_id: "random hash",
    username: "anuraghazra",
    writes_only: false,
  },
};

/** @typedef {import('@stats-organization/github-readme-stats-core')} CoreModule */

/**
 * Creates a mock module for @stats-organization/github-readme-stats-core.
 * @returns {CoreModule} Mocked core module.
 */
export function mockCore() {
  return {
    // @ts-expect-error no need to mock themes at the moment
    themes: {},
    request: vi.fn(),
    fetchWakatimeStats: vi.fn(),
    retryer: vi.fn(),
    dateDiff: vi.fn(),
    api: vi.fn(),
    gist: vi.fn(),
    pin: vi.fn(),
    topLangs: vi.fn(),
    wakatime: vi.fn(),
    getConfig: vi.fn().mockReturnValue({}),
    renderError: ({ message }) => `render-error:${message}`,
    clampValue: (value, min, max) => Math.min(Math.max(value, min), max),
    logger: {
      log: vi.fn(),
      error: vi.fn(),
    },
  };
}

/**
 * Normalizes SVG code for stable test comparisons.
 * @param {string} svg SVG code to normalize.
 * @returns {string} Normalized SVG code.
 */
export function normalizeSvg(svg) {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  return new XMLSerializer().serializeToString(document);
}
