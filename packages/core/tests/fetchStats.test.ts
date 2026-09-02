import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calculateRank } from "../src/calculateRank.js";
import { loadConfigFromEnv } from "../src/common/config.js";
import type { GraphQLResponse } from "../src/common/http.js";
import { fetchStats } from "../src/fetchers/stats.js";
import type { StatsData } from "../src/fetchers/types.js";
import type { ContributionsQuery } from "../src/graphql/contributionsDocument.js";
import type {
  RangeContributionsByRepoFragment,
  RepoStarsFragment,
  UserInfoQuery,
  UserReposQuery,
} from "../src/graphql/generated/stats.js";
import type { ReposContributedToQuery } from "../src/graphql/reposContributedToDocument.js";

vi.mock(import("../src/common/log.js"), async () => {
  const { createLoggerMock } = await import("./utils.js");
  return createLoggerMock();
});

/** Body of a GraphQL response, as the mocked endpoint returns it. */
type GraphQLBody<TResult> = GraphQLResponse<TResult>["data"];
/** A query's `user`, when the lookup succeeded. */
type QueryUser<TResult extends { user: unknown }> = NonNullable<
  TResult["user"]
>;

// Test parameters.
const user_stats: QueryUser<UserInfoQuery> = {
  name: "Anurag Hazra",
  login: "anuraghazra",
  repositoriesContributedTo: { totalCount: 61 },
  contributionsCollection: {
    contributionYears: [2022, 2024],
  },
  commits: {
    totalCommitContributions: 100,
  },
  reviews: {
    totalPullRequestReviewContributions: 50,
  },
  pullRequests: { totalCount: 300 },
  mergedPullRequests: { totalCount: 240 },
  openIssues: { totalCount: 100 },
  closedIssues: { totalCount: 100 },
  followers: { totalCount: 100 },
  repositoryDiscussions: { totalCount: 10 },
  repositoryDiscussionComments: { totalCount: 40 },
  repositories: {
    totalCount: 3,
    nodes: [
      { name: "test-repo-1", stargazerCount: 100 },
      { name: "test-repo-2", stargazerCount: 100 },
      { name: "test-repo-3", stargazerCount: 100 },
    ],
    pageInfo: {
      hasNextPage: true,
      endCursor: "cursor",
    },
  },
};

const data_stats: GraphQLBody<UserInfoQuery> = { data: { user: user_stats } };

const data_year2003: GraphQLBody<UserInfoQuery> = {
  data: {
    user: { ...user_stats, commits: { totalCommitContributions: 428 } },
  },
};

const data_stats_with_own_repos: GraphQLBody<UserInfoQuery> = {
  data: {
    user: { ...user_stats, repositoriesContributedTo: { totalCount: 75 } },
  },
};

const data_without_pull_requests: GraphQLBody<UserInfoQuery> = {
  data: {
    user: {
      ...user_stats,
      pullRequests: { totalCount: 0 },
      mergedPullRequests: { totalCount: 0 },
    },
  },
};

const repo_page: RepoStarsFragment["repositories"] = {
  totalCount: 2,
  nodes: [
    { name: "test-repo-4", stargazerCount: 50 },
    { name: "test-repo-5", stargazerCount: 50 },
  ],
  pageInfo: {
    hasNextPage: false,
    endCursor: "cursor",
  },
};

const data_repo: GraphQLBody<UserReposQuery> = {
  data: { user: { repositories: repo_page } },
};

// cursors distinct from data_stats' so the chaining assertion can see advancement
const data_repo_page2: GraphQLBody<UserReposQuery> = {
  data: {
    user: {
      repositories: {
        ...repo_page,
        pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
      },
    },
  },
};
const data_repo_page3: GraphQLBody<UserReposQuery> = {
  data: {
    user: {
      repositories: {
        ...repo_page,
        pageInfo: { hasNextPage: true, endCursor: "cursor-3" },
      },
    },
  },
};

const data_repo_zero_stars: GraphQLBody<UserReposQuery> = {
  data: {
    user: {
      repositories: {
        totalCount: 5,
        nodes: [
          { name: "test-repo-1", stargazerCount: 100 },
          { name: "test-repo-2", stargazerCount: 100 },
          { name: "test-repo-3", stargazerCount: 100 },
          { name: "test-repo-4", stargazerCount: 0 },
          { name: "test-repo-5", stargazerCount: 0 },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: "cursor",
        },
      },
    },
  },
};

const data_contributions: GraphQLBody<ContributionsQuery> = {
  data: {
    user: {
      year_2022: { contributionCalendar: { totalContributions: 150 } },
      year_2024: { contributionCalendar: { totalContributions: 200 } },
    },
  },
};

const contributed_to_range_0 = {
  commitContributionsByRepository: [
    { repository: { nameWithOwner: "org/repo1" } },
  ],
  issueContributionsByRepository: [
    { repository: { nameWithOwner: "org/repo2" } },
  ],
  pullRequestContributionsByRepository: [],
  repositoryContributions: {
    nodes: [{ repository: { nameWithOwner: "anuraghazra/created-repo" } }],
  },
};

// `repositoryContributions` only ever returns repos the user owns,
// so every entry under it is `anuraghazra/*`.
// It repeats across ranges to exercise de-duplication.
const data_repos_contributed_to: GraphQLBody<ReposContributedToQuery> = {
  data: {
    user: {
      range_0: contributed_to_range_0,
      range_1: {
        commitContributionsByRepository: [
          { repository: { nameWithOwner: "anuraghazra/own-repo" } },
        ],
        issueContributionsByRepository: [],
        pullRequestContributionsByRepository: [
          { repository: { nameWithOwner: "org/repo4" } },
        ],
        repositoryContributions: {
          nodes: [
            { repository: { nameWithOwner: "anuraghazra/created-repo" } },
          ],
        },
      },
    },
  },
};

const data_stats_many_years: GraphQLBody<UserInfoQuery> = {
  data: {
    user: {
      ...user_stats,
      contributionsCollection: {
        contributionYears: [
          2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026,
        ],
      },
    },
  },
};

/** GitHub's answer when a query asks for more than it is willing to resolve. */
const data_resource_limits_exceeded: GraphQLBody<ReposContributedToQuery> = {
  data: { user: null },
  errors: [
    {
      type: "RESOURCE_LIMITS_EXCEEDED",
      message: "Resource limits for this query exceeded.",
    },
  ],
};

const error: GraphQLBody<UserInfoQuery> = {
  data: { user: null },
  errors: [
    {
      type: "NOT_FOUND",
      message: "Could not resolve to a User with the login of 'noname'.",
    },
  ],
};

const mock = new MockAdapter(axios);

/** `fetchStats` for the mocked user, with only the options a test changes spelled out. */
const fetchStatsWith = ({
  include_all_commits = false,
  exclude_repo = [],
  include_merged_pull_requests = false,
  include_discussions = false,
  include_discussions_answers = false,
  commits_year,
  include_contributions = false,
  include_all_time_contribs = false,
  contribs_include_own_repos = false,
}: {
  include_all_commits?: boolean;
  exclude_repo?: Array<string>;
  include_merged_pull_requests?: boolean;
  include_discussions?: boolean;
  include_discussions_answers?: boolean;
  commits_year?: number;
  include_contributions?: boolean;
  include_all_time_contribs?: boolean;
  contribs_include_own_repos?: boolean;
}) =>
  fetchStats(
    "anuraghazra",
    include_all_commits,
    exclude_repo,
    include_merged_pull_requests,
    include_discussions,
    include_discussions_answers,
    commits_year,
    [],
    [],
    false,
    false,
    false,
    false,
    false,
    [],
    include_contributions,
    include_all_time_contribs,
    contribs_include_own_repos,
  );

type RankInput = Parameters<typeof calculateRank>[0];

/** The stats `data_stats` yields, with overrides for the fields and rank inputs a test changes. */
const expectedStats = (
  overrides: Partial<StatsData> = {},
  rankOverrides: Partial<RankInput> = {},
): StatsData => ({
  contributedTo: 61,
  allTimeContributedTo: 0,
  name: "Anurag Hazra",
  totalCommits: 100,
  totalIssues: 200,
  totalPRs: 300,
  totalPRsMerged: 0,
  mergedPRsPercentage: 0,
  totalReviews: 50,
  totalStars: 300,
  totalDiscussionsStarted: 0,
  totalDiscussionsAnswered: 0,
  totalPRsAuthored: 0,
  totalPRsCommented: 0,
  totalPRsReviewed: 0,
  totalIssuesAuthored: 0,
  totalIssuesCommented: 0,
  totalContributions: 0,
  rank: calculateRank({
    all_commits: false,
    commits: 100,
    prs: 300,
    reviews: 50,
    issues: 200,
    repos: 5,
    stars: 300,
    followers: 100,
    ...rankOverrides,
  }),
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("FETCH_MULTI_PAGE_STARS", "false"); // Set to `false` to fetch only one page of stars.
  loadConfigFromEnv();
  mock.onPost("https://api.github.com/graphql").reply((cfg) => {
    const req = JSON.parse(cfg.data as string) as {
      variables?: { startTime?: string; includeUserRepositories?: boolean };
      query: string;
    };

    if (req.variables?.startTime?.startsWith("2003")) {
      return [200, data_year2003];
    }
    if (req.query.includes("userReposContributedTo")) {
      return [200, data_repos_contributed_to];
    }
    if (req.query.includes("contributionCalendar")) {
      return [200, data_contributions];
    }
    if (req.query.includes("totalCommitContributions")) {
      return [
        200,
        req.variables?.includeUserRepositories
          ? data_stats_with_own_repos
          : data_stats,
      ];
    }
    return [200, data_repo];
  });
});

afterEach(() => {
  mock.reset();
  vi.unstubAllEnvs();
});

describe("Test fetchStats", () => {
  it("should fetch correct stats", async () => {
    const stats = await fetchStats("anuraghazra");
    expect(stats).toStrictEqual(expectedStats());
  });

  it("should stop fetching when there are repos with zero stars", async () => {
    mock.reset();
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_repo_zero_stars);

    const stats = await fetchStats("anuraghazra");
    expect(stats).toStrictEqual(expectedStats());
  });

  it("should throw error", async () => {
    mock.reset();
    mock.onPost("https://api.github.com/graphql").reply(200, error);

    await expect(fetchStats("anuraghazra")).rejects.toThrow(
      "Could not resolve to a User with the login of 'noname'.",
    );
  });

  it("should fetch total commits", async () => {
    mock
      .onGet(
        "https://api.github.com/search/commits?per_page=1&q=author:anuraghazra",
      )
      .reply(200, { total_count: 1000 });

    const stats = await fetchStatsWith({ include_all_commits: true });
    expect(stats).toStrictEqual(
      expectedStats(
        { totalCommits: 1000 },
        { all_commits: true, commits: 1000 },
      ),
    );
  });

  it("should throw specific error when include_all_commits true and invalid username", async () => {
    await expect(fetchStats("asdf///---", true)).rejects.toThrow(
      "Invalid username provided.",
    );
  });

  it("should throw specific error when include_all_commits true and API returns error", async () => {
    mock
      .onGet(
        "https://api.github.com/search/commits?per_page=1&q=author:anuraghazra",
      )
      .reply(200, { error: "Some test error message" });

    await expect(fetchStatsWith({ include_all_commits: true })).rejects.toThrow(
      "Could not fetch data from GitHub REST API.",
    );
  });

  it("should exclude stars of the `test-repo-1` repository", async () => {
    mock
      .onGet(
        "https://api.github.com/search/commits?per_page=1&q=author:anuraghazra",
      )
      .reply(200, { total_count: 1000 });

    const stats = await fetchStatsWith({
      include_all_commits: true,
      exclude_repo: ["test-repo-1"],
    });
    expect(stats).toStrictEqual(
      expectedStats(
        { totalCommits: 1000, totalStars: 200 },
        { all_commits: true, commits: 1000, stars: 200 },
      ),
    );
  });

  it("should fetch two pages of stars if 'FETCH_MULTI_PAGE_STARS' env variable is set to `true`", async () => {
    vi.stubEnv("FETCH_MULTI_PAGE_STARS", "true");
    loadConfigFromEnv();

    const stats = await fetchStats("anuraghazra");
    expect(stats).toStrictEqual(
      expectedStats({ totalStars: 400 }, { stars: 400 }),
    );
  });

  it("should fetch one page of stars if 'FETCH_MULTI_PAGE_STARS' env variable is set to `false`", async () => {
    vi.stubEnv("FETCH_MULTI_PAGE_STARS", "false");
    loadConfigFromEnv();

    const stats = await fetchStats("anuraghazra");
    expect(stats).toStrictEqual(expectedStats());
  });

  it("should fetch one page of stars if 'FETCH_MULTI_PAGE_STARS' env variable is not set", async () => {
    vi.stubEnv("FETCH_MULTI_PAGE_STARS", undefined);
    loadConfigFromEnv();

    const stats = await fetchStats("anuraghazra");
    expect(stats).toStrictEqual(expectedStats());
  });

  it("should fetch at most 'FETCH_MULTI_PAGE_STARS' pages when it is a number", async () => {
    vi.stubEnv("FETCH_MULTI_PAGE_STARS", "3");
    loadConfigFromEnv();
    mock.reset();
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_repo_page2)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_repo_page3)
      // a fourth page is available but must not be requested
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_repo);

    const stats = await fetchStats("anuraghazra");

    // the stats page plus two repo pages, even though every page has a next one
    expect(mock.history.post).toHaveLength(3);
    expect(stats.totalStars).toBe(500);
    // each page is requested with the cursor the previous one returned
    const cursors = mock.history.post.map(
      (req) =>
        (JSON.parse(req.data as string) as { variables: { after: unknown } })
          .variables.after,
    );
    expect(cursors).toStrictEqual([null, "cursor", "cursor-2"]);
  });

  it("should throw when a page after the first returns an error", async () => {
    vi.stubEnv("FETCH_MULTI_PAGE_STARS", "true");
    loadConfigFromEnv();
    mock.reset();
    mock
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, data_stats)
      .onPost("https://api.github.com/graphql")
      .replyOnce(200, error);

    await expect(fetchStats("anuraghazra")).rejects.toThrow(
      "Could not resolve to a User with the login of 'noname'.",
    );
    expect(mock.history.post).toHaveLength(2);
  });

  it("should not fetch additional stats data when it not requested", async () => {
    const stats = await fetchStats("anuraghazra");
    expect(stats).toStrictEqual(expectedStats());
  });

  it("should fetch additional stats when it requested", async () => {
    const stats = await fetchStatsWith({
      include_merged_pull_requests: true,
      include_discussions: true,
      include_discussions_answers: true,
    });
    expect(stats).toStrictEqual(
      expectedStats({
        totalPRsMerged: 240,
        mergedPRsPercentage: 80,
        totalDiscussionsStarted: 10,
        totalDiscussionsAnswered: 40,
      }),
    );
  });

  it("should get commits of provided year", async () => {
    const stats = await fetchStatsWith({ commits_year: 2003 });

    expect(stats).toStrictEqual(
      expectedStats({ totalCommits: 428 }, { commits: 428 }),
    );
  });

  it("should fetch total contributions when include_contributions is true", async () => {
    const stats = await fetchStatsWith({ include_contributions: true });

    expect(stats.totalContributions).toBe(350);
  });

  it("should throw when the contributions query returns an error", async () => {
    mock.onPost("https://api.github.com/graphql").reply((cfg) => {
      const req = JSON.parse(cfg.data as string) as { query: string };
      if (req.query.includes("contributionCalendar")) {
        return [
          200,
          {
            data: null,
            errors: [{ message: "Some test GraphQL error" }],
          },
        ];
      }
      return [
        200,
        req.query.includes("totalCommitContributions") ? data_stats : data_repo,
      ];
    });

    await expect(
      fetchStatsWith({ include_contributions: true }),
    ).rejects.toThrow("Some test GraphQL error");
  });

  it("should throw a generic error when the contributions query returns an error without a message", async () => {
    mock.onPost("https://api.github.com/graphql").reply((cfg) => {
      const req = JSON.parse(cfg.data as string) as { query: string };
      if (req.query.includes("contributionCalendar")) {
        return [200, { data: null, errors: [{ type: "SOME_ERROR" }] }];
      }
      return [
        200,
        req.query.includes("totalCommitContributions") ? data_stats : data_repo,
      ];
    });

    await expect(
      fetchStatsWith({ include_contributions: true }),
    ).rejects.toThrow(
      "Something went wrong while trying to retrieve the contributions data using the GraphQL API.",
    );
  });

  it("should return correct data when user don't have any pull requests", async () => {
    mock
      .onPost("https://api.github.com/graphql")
      .reply(200, data_without_pull_requests);
    const stats = await fetchStatsWith({ include_merged_pull_requests: true });
    expect(stats).toStrictEqual(expectedStats({ totalPRs: 0 }, { prs: 0 }));
  });

  it("should include own repos in contributed-to count when contribs_include_own_repos is true", async () => {
    const statsWithout = await fetchStats("anuraghazra");
    expect(statsWithout.contributedTo).toBe(61);

    const statsWith = await fetchStatsWith({
      contribs_include_own_repos: true,
    });
    expect(statsWith.contributedTo).toBe(75);
  });

  it("should fetch all-time repos contributed to when include_all_time_contribs is true", async () => {
    const stats = await fetchStatsWith({ include_all_time_contribs: true });

    // org/repo1, org/repo2 and org/repo4; both anuraghazra/* repos are filtered out
    expect(stats.allTimeContributedTo).toBe(3);
  });

  it("should include own repos in all-time contributed-to count when contribs_include_own_repos is true", async () => {
    const stats = await fetchStatsWith({
      include_all_time_contribs: true,
      contribs_include_own_repos: true,
    });

    expect(stats.allTimeContributedTo).toBe(5);
  });

  it.each([
    { contribsIncludeOwnRepos: false, shouldSelect: false },
    { contribsIncludeOwnRepos: true, shouldSelect: true },
  ])(
    "should select repositoryContributions only when own repos are wanted (own repos: $contribsIncludeOwnRepos)",
    async ({ contribsIncludeOwnRepos, shouldSelect }) => {
      let contributedToQuery = "";

      mock.reset();
      mock.onPost("https://api.github.com/graphql").reply((cfg) => {
        const req = JSON.parse(cfg.data as string) as { query: string };
        if (req.query.includes("userReposContributedTo")) {
          contributedToQuery = req.query;
          return [200, data_repos_contributed_to];
        }
        return [200, data_stats];
      });

      await fetchStatsWith({
        include_all_time_contribs: true,
        contribs_include_own_repos: contribsIncludeOwnRepos,
      });

      // an @include(if: false) field would still count toward the node cost
      expect(contributedToQuery.includes("repositoryContributions")).toBe(
        shouldSelect,
      );
    },
  );

  it("should split saturated ranges until 1-day", async () => {
    const saturatedRange: RangeContributionsByRepoFragment = {
      commitContributionsByRepository: Array.from({ length: 100 }, (_, i) => ({
        repository: { nameWithOwner: `org/repo${i}` },
      })),
      issueContributionsByRepository: [],
      pullRequestContributionsByRepository: [],
      repositoryContributions: { nodes: [] },
    };

    let requestCount = 0;

    mock.reset();
    mock.onPost("https://api.github.com/graphql").reply((cfg) => {
      requestCount++;
      const req = JSON.parse(cfg.data as string) as { query: string };

      if (req.query.includes("userReposContributedTo")) {
        const rangeCount = (req.query.match(/range_\d+:/g) ?? []).length;
        const ranges: QueryUser<ReposContributedToQuery> = {};
        for (let i = 0; i < rangeCount; i++) {
          ranges[`range_${i}`] = saturatedRange;
        }
        return [200, { data: { user: ranges } }];
      }
      return [200, data_stats];
    });

    const stats = await fetchStatsWith({ include_all_time_contribs: true });

    expect(stats.allTimeContributedTo).toBe(100);
    expect(requestCount).toEqual(12);
  });

  /**
   * Mock the contributed-to query to reject requests with more than `maxRanges` ranges,
   * like GitHub does when a query is too big.
   *
   * @param maxRanges maximum number of accepted ranges.
   * @returns Range counts of all contributed-to requests, in order; filled as they arrive.
   */
  const mockRangeLimit = (maxRanges: number): Array<number> => {
    const allRangeCounts: Array<number> = [];

    mock.reset();
    mock.onPost("https://api.github.com/graphql").reply((cfg) => {
      const req = JSON.parse(cfg.data as string) as { query: string };
      if (!req.query.includes("userReposContributedTo")) {
        return [200, data_stats_many_years];
      }
      const rangeCount = (req.query.match(/range_\d+:/g) ?? []).length;
      allRangeCounts.push(rangeCount);
      if (rangeCount > maxRanges) {
        return [200, data_resource_limits_exceeded];
      }

      const ranges: QueryUser<ReposContributedToQuery> = {};
      for (let i = 0; i < rangeCount; i++) {
        ranges[`range_${i}`] = contributed_to_range_0;
      }
      return [200, { data: { user: ranges } }];
    });

    return allRangeCounts;
  };

  it("should halve ranges when resource limits exceeded, should raise again on success", async () => {
    const rangeCounts = mockRangeLimit(2);

    const stats = await fetchStatsWith({ include_all_time_contribs: true });

    expect(stats.allTimeContributedTo).toBe(2);
    expect(rangeCounts).toEqual([9, 4, 2, 3, 1, 2, 3, 1, 2, 1]);
  });

  it("should throw when a single range already exceeds the resource limits", async () => {
    const rangeCounts = mockRangeLimit(0);

    await expect(
      fetchStatsWith({ include_all_time_contribs: true }),
    ).rejects.toThrow("Resource limits for this query exceeded.");

    expect(rangeCounts.at(-1)).toBe(1);
  });
});
