import axios from "axios";
import githubUsernameRegex from "github-username-regex";

import { calculateRank } from "../calculateRank.js";
import { getConfig } from "../common/config.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { request } from "../common/http.js";
import { logger } from "../common/log.js";
import { buildSearchFilter, parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";

// GraphQL queries.
const GRAPHQL_REPOS_FIELD = `
  repositories(first: 100, after: $after, ownerAffiliations: $ownerAffiliations, orderBy: {direction: DESC, field: STARGAZERS}) {
    totalCount
    nodes {
      name
      stargazers {
        totalCount
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
`;

const GRAPHQL_REPOS_QUERY = `
  query userInfo($login: String!, $after: String, $ownerAffiliations: [RepositoryAffiliation]) {
    user(login: $login) {
      ${GRAPHQL_REPOS_FIELD}
    }
  }
`;

const GRAPHQL_COUNTS_QUERY = `
  query userInfo($login: String!, $includeMergedPullRequests: Boolean!, $includeDiscussions: Boolean!, $includeDiscussionsAnswers: Boolean!) {
    user(login: $login) {
      name
      login
      pullRequests(first: 1) {
        totalCount
      }
      mergedPullRequests: pullRequests(states: MERGED) @include(if: $includeMergedPullRequests) {
        totalCount
      }
      openIssues: issues(states: OPEN) {
        totalCount
      }
      closedIssues: issues(states: CLOSED) {
        totalCount
      }
      followers {
        totalCount
      }
      repositoryDiscussions @include(if: $includeDiscussions) {
        totalCount
      }
      repositoryDiscussionComments(onlyAnswers: true) @include(if: $includeDiscussionsAnswers) {
        totalCount
      }
    }
  }
`;

const GRAPHQL_COMMITS_QUERY = `
  query userInfo($login: String!, $startTime: DateTime = null) {
    user(login: $login) {
      commits: contributionsCollection (from: $startTime) {
        totalCommitContributions
      }
    }
  }
`;

const GRAPHQL_REVIEWS_QUERY = `
  query userInfo($login: String!) {
    user(login: $login) {
      reviews: contributionsCollection {
        totalPullRequestReviewContributions
      }
    }
  }
`;

const GRAPHQL_CONTRIBUTED_QUERY = `
  query userInfo($login: String!) {
    user(login: $login) {
      repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
        totalCount
      }
    }
  }
`;

/**
 * Build a fetcher for the given GraphQL query.
 *
 * @param {string} query GraphQL query.
 * @returns {(variables: object, token: string) => Promise<import('axios').AxiosResponse>} Fetcher.
 */
const queryFetcher =
  (query) =>
  (variables, token) => {
    return request(
      {
        query,
        variables,
      },
      {
        Authorization: `bearer ${token}`,
      },
    );
  };

const countsFetcher = queryFetcher(GRAPHQL_COUNTS_QUERY);
const commitsFetcher = queryFetcher(GRAPHQL_COMMITS_QUERY);
const reviewsFetcher = queryFetcher(GRAPHQL_REVIEWS_QUERY);
const contributedFetcher = queryFetcher(GRAPHQL_CONTRIBUTED_QUERY);
const reposFetcher = queryFetcher(GRAPHQL_REPOS_QUERY);

/**
 * Fetch the user's repositories, paginating while stars remain to be counted.
 *
 * @param {string} username GitHub username.
 * @param {string[]} ownerAffiliations Owner affiliations to filter by.
 * @param {string | null} pat PAT override or null.
 * @returns {Promise<import('axios').AxiosResponse | { totalCount: number, nodes: object[] }>} Aggregated repositories, or the errored response.
 *
 * @description Supports multi-page fetching if the 'FETCH_MULTI_PAGE_STARS' environment variable is set to true or a limit of fetches.
 */
const fetchRepositories = async (username, ownerAffiliations, pat) => {
  const repositories = { totalCount: 0, nodes: [] };
  let hasNextPage = true;
  let endCursor = null;
  let fetchedPages = 0;
  while (hasNextPage) {
    const res = await retryer(
      reposFetcher,
      {
        login: username,
        after: endCursor,
        ownerAffiliations,
      },
      pat,
    );
    if (res.data.errors) {
      return res;
    }

    const page = res.data.data.user.repositories;
    repositories.totalCount = page.totalCount;
    repositories.nodes.push(...page.nodes);

    // Disable multi page fetching on public Vercel instance due to rate limits.
    fetchedPages++;
    const repoNodesWithStars = page.nodes.filter(
      (node) => node.stargazers.totalCount !== 0,
    );

    hasNextPage =
      (getConfig().fetchMultiPageStars === "true" ||
        getConfig().fetchMultiPageStars > fetchedPages) &&
      page.nodes.length === repoNodesWithStars.length &&
      page.pageInfo.hasNextPage;

    endCursor = page.pageInfo.endCursor;
  }

  return repositories;
};

/**
 * Fetch stats information for a given username.
 *
 * @param {object} variables Fetcher variables.
 * @param {string} variables.username GitHub username.
 * @param {boolean} variables.includeMergedPullRequests Include merged pull requests.
 * @param {boolean} variables.includeDiscussions Include discussions.
 * @param {boolean} variables.includeDiscussionsAnswers Include discussions answers.
 * @param {string|undefined} variables.startTime Time to start the count of total commits.
 * @param {string[]} variables.ownerAffiliations The owner affiliations to filter by. Default: OWNER.
 * @param {string | null} variables.pat PAT override or null.
 * @returns {Promise<import('axios').AxiosResponse>} Axios response.
 */
const statsFetcher = async ({
  username,
  includeMergedPullRequests,
  includeDiscussions,
  includeDiscussionsAnswers,
  startTime,
  ownerAffiliations,
  pat,
}) => {
  const stats = await retryer(
    countsFetcher,
    {
      login: username,
      includeMergedPullRequests,
      includeDiscussions,
      includeDiscussionsAnswers,
    },
    pat,
  );
  if (stats.data.errors) {
    return stats;
  }
  const user = stats.data.data.user;

  const commits = await retryer(
    commitsFetcher,
    { login: username, startTime },
    pat,
  );
  if (commits.data.errors) {
    return commits;
  }
  user.commits = commits.data.data.user.commits;

  const reviews = await retryer(reviewsFetcher, { login: username }, pat);
  if (reviews.data.errors) {
    return reviews;
  }
  user.reviews = reviews.data.data.user.reviews;

  const contributed = await retryer(
    contributedFetcher,
    { login: username },
    pat,
  );
  user.repositoriesContributedTo = contributed.data.errors
    ? null
    : contributed.data.data.user.repositoriesContributedTo;

  const repositories = await fetchRepositories(
    username,
    ownerAffiliations,
    pat,
  );
  if (repositories.data?.errors) {
    return repositories;
  }
  user.repositories = repositories;

  return stats;
};

/**
 * Fetch total commits using the REST API.
 *
 * @param {object} variables Fetcher variables.
 * @param {string} token GitHub token.
 * @returns {Promise<import('axios').AxiosResponse>} Axios response.
 *
 * @see https://developer.github.com/v3/search/#search-commits
 */
const fetchTotalItems = (variables, token) => {
  return axios({
    method: "get",
    url:
      `https://api.github.com/search/` +
      variables.type +
      `?per_page=1&q=` +
      buildSearchFilter(variables.repo, variables.owner).replaceAll(" ", "+") +
      variables.filter,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github.cloak-preview",
      Authorization: `token ${token}`,
    },
  });
};

/**
 * Fetch all the commits for all the repositories of a given username.
 *
 * @param {string} username GitHub username.
 * @returns {Promise<number>} Total commits.
 *
 * @description Done like this because the GitHub API does not provide a way to fetch all the commits. See
 * #92#issuecomment-661026467 and #211 for more information.
 */
const totalItemsFetcher = async (username, repo, owner, type, filter, pat) => {
  if (!githubUsernameRegex.test(username)) {
    logger.log("Invalid username provided.");
    throw new Error("Invalid username provided.");
  }

  let res;
  try {
    res = await retryer(
      fetchTotalItems,
      {
        login: username,
        repo,
        owner,
        type,
        filter,
      },
      pat,
    );
  } catch (err) {
    logger.log(err);
    throw err;
  }

  const totalCount = res.data.total_count;
  if (isNaN(totalCount)) {
    logger.error("GitHub error: " + JSON.stringify(res.data));
    throw new CustomError(
      "Could not fetch data from GitHub REST API.",
      CustomError.GITHUB_REST_API_ERROR,
    );
  }
  return totalCount;
};

const fetchRepoUserStats = async (
  username,
  repo,
  owner,
  include_prs_authored,
  include_prs_commented,
  include_prs_reviewed,
  include_issues_authored,
  include_issues_commented,
  pat,
) => {
  let stats = {};
  if (include_prs_authored) {
    stats.totalPRsAuthored = await totalItemsFetcher(
      username,
      repo,
      owner,
      "issues",
      `author:${username}+type:pr`,
      pat,
    );
  }
  if (include_prs_commented) {
    stats.totalPRsCommented = await totalItemsFetcher(
      username,
      repo,
      owner,
      "issues",
      `commenter:${username}+-author:${username}+type:pr`,
      pat,
    );
  }
  if (include_prs_reviewed) {
    stats.totalPRsReviewed = await totalItemsFetcher(
      username,
      repo,
      owner,
      "issues",
      `reviewed-by:${username}+-author:${username}+type:pr`,
      pat,
    );
  }
  if (include_issues_authored) {
    stats.totalIssuesAuthored = await totalItemsFetcher(
      username,
      repo,
      owner,
      "issues",
      `author:${username}+type:issue`,
      pat,
    );
  }
  if (include_issues_commented) {
    stats.totalIssuesCommented = await totalItemsFetcher(
      username,
      repo,
      owner,
      "issues",
      `commenter:${username}+-author:${username}+type:issue`,
      pat,
    );
  }
  return stats;
};

/**
 * Fetch stats for a given username.
 *
 * @param {string} username GitHub username.
 * @param {boolean} include_all_commits Include all commits.
 * @param {string[]} exclude_repo Repositories to exclude.
 * @param {boolean} include_merged_pull_requests Include merged pull requests.
 * @param {boolean} include_discussions Include discussions.
 * @param {boolean} include_discussions_answers Include discussions answers.
 * @param {number|undefined} commits_year Year to count total commits
 * @param {string[]} ownerAffiliations Owner affiliations. Default: OWNER.
 * @returns {Promise<import("./types").StatsData>} Stats data.
 */
const fetchStats = async (
  username,
  include_all_commits = false,
  exclude_repo = [],
  include_merged_pull_requests = false,
  include_discussions = false,
  include_discussions_answers = false,
  commits_year,
  repo = [],
  owner = [],
  include_prs_authored = false,
  include_prs_commented = false,
  include_prs_reviewed = false,
  include_issues_authored = false,
  include_issues_commented = false,
  ownerAffiliations = [],
  pat = null,
) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  const stats = {
    name: "",
    totalPRs: 0,
    totalPRsMerged: 0,
    mergedPRsPercentage: 0,
    totalReviews: 0,
    totalCommits: 0,
    totalIssues: 0,
    totalStars: 0,
    totalDiscussionsStarted: 0,
    totalDiscussionsAnswered: 0,
    contributedTo: 0,
    totalPRsAuthored: 0,
    totalPRsCommented: 0,
    totalPRsReviewed: 0,
    totalIssuesAuthored: 0,
    totalIssuesCommented: 0,
    rank: { level: "C", percentile: 100 },
  };
  ownerAffiliations = parseOwnerAffiliations(ownerAffiliations);

  let res = await statsFetcher(
    {
      username,
      includeMergedPullRequests: include_merged_pull_requests,
      includeDiscussions: include_discussions,
      includeDiscussionsAnswers: include_discussions_answers,
      startTime: commits_year ? `${commits_year}-01-01T00:00:00Z` : undefined,
      ownerAffiliations,
    },
    pat,
  );

  // Catch GraphQL errors.
  if (res.data.errors) {
    logger.error(res.data.errors);
    if (res.data.errors[0].type === "NOT_FOUND") {
      throw new CustomError(
        res.data.errors[0].message || "Could not fetch user.",
        CustomError.USER_NOT_FOUND,
      );
    }
    if (res.data.errors[0].message) {
      throw new CustomError(
        wrapTextMultiline(res.data.errors[0].message, 525, 12)[0],
        res.statusText,
      );
    }
    throw new CustomError(
      "Something went wrong while trying to retrieve the stats data using the GraphQL API.",
      CustomError.GRAPHQL_ERROR,
    );
  }

  const user = res.data.data.user;

  stats.name = user.name || user.login;

  // if include_all_commits, fetch all commits using the REST API.
  if (include_all_commits) {
    stats.totalCommits = await totalItemsFetcher(
      username,
      repo,
      owner,
      "commits",
      `author:${username}`,
      pat,
    );
  } else {
    stats.totalCommits = user.commits.totalCommitContributions;
  }
  let repoUserStats = await fetchRepoUserStats(
    username,
    repo,
    owner,
    include_prs_authored,
    include_prs_commented,
    include_prs_reviewed,
    include_issues_authored,
    include_issues_commented,
    pat,
  );
  Object.assign(stats, repoUserStats);

  stats.totalPRs = user.pullRequests.totalCount;
  if (include_merged_pull_requests) {
    stats.totalPRsMerged = user.mergedPullRequests.totalCount;
    stats.mergedPRsPercentage =
      (user.mergedPullRequests.totalCount / user.pullRequests.totalCount) *
        100 || 0;
  }
  stats.totalReviews = user.reviews.totalPullRequestReviewContributions;
  stats.totalIssues = user.openIssues.totalCount + user.closedIssues.totalCount;
  if (include_discussions) {
    stats.totalDiscussionsStarted = user.repositoryDiscussions.totalCount;
  }
  if (include_discussions_answers) {
    stats.totalDiscussionsAnswered =
      user.repositoryDiscussionComments.totalCount;
  }
  stats.contributedTo = user.repositoriesContributedTo
    ? user.repositoriesContributedTo.totalCount
    : null;

  // Retrieve stars while filtering out repositories to be hidden.
  const allExcludedRepos = [
    ...exclude_repo,
    ...getConfig().excludeRepositories,
  ];
  let repoToHide = new Set(allExcludedRepos);

  stats.totalStars = user.repositories.nodes
    .filter((data) => {
      return !repoToHide.has(data.name);
    })
    .reduce((prev, curr) => {
      return prev + curr.stargazers.totalCount;
    }, 0);

  stats.rank = calculateRank({
    all_commits: include_all_commits,
    commits: stats.totalCommits,
    prs: stats.totalPRs,
    reviews: stats.totalReviews,
    issues: stats.totalIssues,
    repos: user.repositories.totalCount,
    stars: stats.totalStars,
    followers: user.followers.totalCount,
  });

  return stats;
};

export { fetchStats, fetchRepoUserStats };
