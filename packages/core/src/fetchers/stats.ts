import axios from "axios";
import type { AxiosResponse } from "axios";
import githubUsernameRegex from "github-username-regex";

import { calculateRank } from "../calculateRank.js";
import { getConfig } from "../common/config.js";
import { getGitHubYearRange, toGitHubDateTime } from "../common/date.js";
import { CustomError, MissingParamError } from "../common/error.js";
import { wrapTextMultiline } from "../common/fmt.js";
import { createGraphQLFetcher } from "../common/http.js";
import type { GraphQLResponse } from "../common/http.js";
import { logger } from "../common/log.js";
import { buildSearchFilter, parseOwnerAffiliations } from "../common/ops.js";
import { retryer } from "../common/retryer.js";
import { buildContributionsDocument } from "../graphql/contributionsDocument.js";
import {
  UserInfoDocument,
  UserReposDocument,
} from "../graphql/generated/stats.js";
import type {
  RepoNodeFragment,
  UserInfoQuery,
  UserInfoQueryVariables,
} from "../graphql/generated/stats.js";
import {
  MAX_REPOSITORIES_LIMIT,
  buildReposContributedToDocument,
} from "../graphql/reposContributedToDocument.js";

import type { RepoUserStats, StatsData } from "./types.js";

/** The subset of the stats response `statsFetcher` returns and threads on. */
type StatsFetcherResponse = Pick<
  GraphQLResponse<UserInfoQuery>,
  "data" | "statusText"
>;

const fetcher = createGraphQLFetcher(UserInfoDocument, "bearer");
/** Fetcher for the pages after the first, which only need `repositories`. */
const reposFetcher = createGraphQLFetcher(UserReposDocument, "bearer");

/**
 * Fetch stats information for a given username.
 *
 * @param variables Fetcher variables.
 * @param variables.username GitHub username.
 * @param variables.includeMergedPullRequests Include merged pull requests.
 * @param variables.includeDiscussions Include discussions.
 * @param variables.includeDiscussionsAnswers Include discussions answers.
 * @param variables.startTime Time to start the count of total commits.
 * @param variables.ownerAffiliations The owner affiliations to filter by. Default: OWNER.
 * @param variables.includeUserRepositories Whether to include the user's own repositories in the repos contributed to.
 * @param variables.pat PAT override or null.
 * @returns The stats response, with every fetched page's repos merged in.
 *
 * @description Supports multi-page fetching when the `FETCH_MULTI_PAGE_STARS`
 * env variable is `true` or a fetch limit.
 */
const statsFetcher = async ({
  username,
  includeMergedPullRequests,
  includeDiscussions,
  includeDiscussionsAnswers,
  startTime,
  ownerAffiliations,
  includeUserRepositories,
  pat,
}: {
  username: string;
  includeMergedPullRequests: boolean;
  includeDiscussions: boolean;
  includeDiscussionsAnswers: boolean;
  startTime: string | undefined;
  ownerAffiliations: UserInfoQueryVariables["ownerAffiliations"];
  includeUserRepositories: boolean;
  pat: string | null;
}): Promise<StatsFetcherResponse> => {
  // only the first request carries the stats themselves
  let stats: StatsFetcherResponse = await retryer(
    fetcher,
    {
      login: username,
      after: null,
      includeMergedPullRequests,
      includeDiscussions,
      includeDiscussionsAnswers,
      startTime,
      ownerAffiliations,
      includeUserRepositories,
    },
    pat,
  );
  if (stats.data.errors) {
    return stats;
  }

  const pageLimit = getConfig().fetchMultiPageStars;

  const extraRepoNodes: Array<RepoNodeFragment | null> = [];
  let pageRepositories = stats.data.data.user?.repositories;
  let previousCursor: string | null = null;
  let fetchedPages = 1;
  while (
    fetchedPages < pageLimit &&
    // an unstarred repo on the page means the starred ones are exhausted
    !pageRepositories?.nodes?.some((node) => node?.stargazerCount === 0) &&
    pageRepositories?.pageInfo.hasNextPage
  ) {
    const after = pageRepositories.pageInfo.endCursor;
    // a null or non-advancing cursor would refetch the same page forever
    if (after === null || after === previousCursor) {
      break;
    }
    previousCursor = after;

    const page = await retryer(
      reposFetcher,
      { login: username, after, ownerAffiliations },
      pat,
    );
    if (page.data.errors) {
      return {
        data: { ...stats.data, errors: page.data.errors },
        statusText: page.statusText,
      };
    }

    pageRepositories = page.data.data.user?.repositories;
    extraRepoNodes.push(...(pageRepositories?.nodes ?? []));
    fetchedPages++;
  }

  if (extraRepoNodes.length > 0) {
    // deep copy to avoid mutating the response cached by the frontend
    stats = structuredClone({
      data: stats.data,
      statusText: stats.statusText,
    });
    stats.data.data.user?.repositories.nodes?.push(...extraRepoNodes);
  }

  return stats;
};

/**
 * Fetch total items count using the REST search API.
 *
 * @param variables Fetcher variables.
 * @param token GitHub token.
 * @returns Axios response.
 *
 * @see https://developer.github.com/v3/search/#search-commits
 */
const fetchTotalItems = (
  variables: Record<string, unknown>,
  token: string,
): Promise<AxiosResponse> => {
  const type = String(variables["type"]);
  const filter = String(variables["filter"]);
  const repo = variables["repo"] as Array<string> | string;
  const owner = variables["owner"] as Array<string> | string;
  return axios({
    method: "get",
    url:
      `https://api.github.com/search/${type}?per_page=1&q=` +
      buildSearchFilter(repo, owner).replaceAll(" ", "+") +
      filter,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github.cloak-preview",
      Authorization: `token ${token}`,
    },
  });
};

/**
 * Fetch a total count for a given username via the REST search API.
 *
 * @param username GitHub username.
 * @returns Total count.
 *
 * The GraphQL API can't return this.
 * @see https://github.com/anuraghazra/github-readme-stats/issues/92#issuecomment-661026467
 * @see https://github.com/anuraghazra/github-readme-stats/pull/211
 */
const totalItemsFetcher = async (
  username: string,
  repo: Array<string>,
  owner: Array<string>,
  type: string,
  filter: string,
  pat: string | null,
): Promise<number> => {
  if (!githubUsernameRegex.test(username)) {
    logger.log("Invalid username provided.");
    throw new Error("Invalid username provided.");
  }

  let res: AxiosResponse<{ total_count?: number }>;
  try {
    res = await retryer<{ total_count?: number }>(
      fetchTotalItems,
      { login: username, repo, owner, type, filter },
      pat,
    );
  } catch (err) {
    logger.log(err);
    throw err;
  }

  const totalCount = res.data.total_count;
  if (totalCount === undefined || isNaN(totalCount)) {
    logger.error("GitHub error: " + JSON.stringify(res.data));
    throw new CustomError(
      "Could not fetch data from GitHub REST API.",
      CustomError.GITHUB_REST_API_ERROR,
    );
  }
  return totalCount;
};

const fetchRepoUserStats = async (
  username: string,
  repo: Array<string>,
  owner: Array<string>,
  include_prs_authored: boolean,
  include_prs_commented: boolean,
  include_prs_reviewed: boolean,
  include_issues_authored: boolean,
  include_issues_commented: boolean,
  pat: string | null,
): Promise<RepoUserStats> => {
  const stats: RepoUserStats = {};
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
 * Turn a GraphQL `errors` payload into the error to throw.
 *
 * @param errors Errors from the response envelope.
 * @param statusText HTTP status text, used as the error type when GitHub gave a message.
 * @param fallback Message when GitHub gave none.
 */
const graphqlError = (
  errors: NonNullable<GraphQLResponse<unknown>["data"]["errors"]>,
  statusText: string,
  fallback: string,
): CustomError => {
  logger.error(errors);
  const message = errors[0]?.message;
  return message
    ? new CustomError(wrapTextMultiline(message, 525, 12)[0] ?? "", statusText)
    : new CustomError(fallback, CustomError.GRAPHQL_ERROR);
};

/**
 * Fetch all-time contributions by building a single GraphQL query
 * for all the given years.
 *
 * Whether private contributions are included depends on the user's profile settings:
 * https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/manage-visibility-settings-for-private-contributions-and-achievements#changing-the-visibility-of-your-private-contributions
 */
const fetchTotalContributions = async (
  username: string,
  years: Array<number>,
  pat: string | null = null,
): Promise<number> => {
  if (years.length === 0) {
    return 0;
  }

  const contributionsFetcher = createGraphQLFetcher(
    buildContributionsDocument(years),
    "bearer",
  );

  const contribRes = await retryer(
    contributionsFetcher,
    { login: username },
    pat,
  );

  if (contribRes.data.errors) {
    throw graphqlError(
      contribRes.data.errors,
      contribRes.statusText,
      "Something went wrong while trying to retrieve the contributions data using the GraphQL API.",
    );
  }

  const user = contribRes.data.data.user;
  if (!user) {
    return 0;
  }

  let total = 0;
  for (const year of years) {
    const yearBlock = user[`year_${year}`];
    if (yearBlock?.contributionCalendar.totalContributions) {
      total += yearBlock.contributionCalendar.totalContributions;
    }
  }
  return total;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Ranges per request.
 * Each costs roughly `4 * MAX_REPOSITORIES_LIMIT` nodes,
 * so an unchunked request for a heavily split account would breach GitHub's 500k node ceiling.
 * GitHub can still reject a request of this size, in which case the chunk size is halved
 * and the request retried; it is doubled back up to this maximum after every success.
 */
const MAX_RANGES_PER_REQUEST = 400;

const REPOS_CONTRIBUTED_TO_ERROR =
  "Something went wrong while trying to retrieve the repository contributions data using the GraphQL API.";

/** GraphQL error type GitHub returns when a query exceeds its node/complexity budget. */
const RESOURCE_LIMITS_EXCEEDED = "RESOURCE_LIMITS_EXCEEDED";

/**
 * Whether GitHub rejected the query for returning too many results.
 *
 * @see https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api#other-resource-limits
 *
 * @param errors Errors from the response envelope.
 * @returns True if the query has to be retried with fewer ranges.
 */
const isResourceLimitsExceeded = (
  errors: NonNullable<GraphQLResponse<unknown>["data"]["errors"]>,
): boolean => errors.some((error) => error.type === RESOURCE_LIMITS_EXCEEDED);

/**
 * Count the repositories a user contributed to across every contribution year.
 *
 * `repositoriesContributedTo` spans at most one year,
 * so every year is fetched as an aliased `contributionsCollection(from, to)` in one request and the repos de-duplicated.
 * Ranges are worked off a queue, `MAX_RANGES_PER_REQUEST` at a time.
 * A range returning `MAX_REPOSITORIES_LIMIT` results may have more,
 * so it is halved and both halves are queued again.
 * When GitHub rejects a request with `RESOURCE_LIMITS_EXCEEDED`,
 * the number of ranges per request is halved and the request retried.
 *
 * Whether private contributions are included depends on the used PAT.
 *
 * @param canonicalUsername Username as GitHub reports it; `nameWithOwner` uses its
 *        casing, which the raw query-string username need not match.
 * @param years Contribution years to walk.
 * @param includeOwnRepos Whether to count the user's own repositories.
 * @param pat Optional PAT override.
 * @returns Count of repositories.
 */
const fetchAllTimeReposContributedTo = async (
  canonicalUsername: string,
  years: Array<number>,
  includeOwnRepos: boolean,
  pat: string | null,
): Promise<number> => {
  const repos = new Set<string>();
  const pending = years.map(getGitHubYearRange);
  // halved when GitHub rejects a request for exceeding its resource limits, increases on success
  let rangesPerRequest = MAX_RANGES_PER_REQUEST;

  while (pending.length > 0) {
    const chunk = pending.slice(0, rangesPerRequest);
    const fetcher = createGraphQLFetcher(
      buildReposContributedToDocument(chunk, includeOwnRepos),
      "bearer",
    );
    const res = await retryer(
      fetcher,
      { login: canonicalUsername, maxRepositories: MAX_REPOSITORIES_LIMIT },
      pat,
    );
    if (res.data.errors) {
      if (isResourceLimitsExceeded(res.data.errors) && chunk.length > 1) {
        rangesPerRequest = Math.floor(chunk.length / 2);
        logger.log(
          `Resource limits exceeded, retrying with ${rangesPerRequest} ranges per request...`,
        );
        continue;
      }
      throw graphqlError(
        res.data.errors,
        res.statusText,
        REPOS_CONTRIBUTED_TO_ERROR,
      );
    }
    const user = res.data.data.user;
    if (!user) {
      throw new CustomError(
        REPOS_CONTRIBUTED_TO_ERROR,
        CustomError.GRAPHQL_ERROR,
      );
    }

    pending.splice(0, chunk.length);
    rangesPerRequest = Math.min(
      MAX_RANGES_PER_REQUEST,
      Math.ceil(rangesPerRequest * 1.25),
    );

    for (const [index, range] of chunk.entries()) {
      const rangeResponse = user[`range_${index}`];
      if (!rangeResponse) {
        throw new CustomError(
          REPOS_CONTRIBUTED_TO_ERROR,
          CustomError.GRAPHQL_ERROR,
        );
      }

      const lists = [
        rangeResponse.commitContributionsByRepository,
        rangeResponse.issueContributionsByRepository,
        rangeResponse.pullRequestContributionsByRepository,
        (rangeResponse.repositoryContributions?.nodes ?? []).filter(
          (node) => node !== null,
        ),
      ];
      const isSaturated = lists.some(
        (list) => list.length >= MAX_REPOSITORIES_LIMIT,
      );

      const rangeDays = Math.round(
        (range.to.getTime() - range.from.getTime()) / MS_PER_DAY,
      );
      if (isSaturated && rangeDays >= 2) {
        const mid = new Date(
          range.from.getTime() + Math.floor(rangeDays / 2) * MS_PER_DAY,
        );
        logger.log(
          `Range ${range.from.toISOString()} - ${range.to.toISOString()} is saturated, splitting and retrying...`,
        );
        // GitHub only reads the date portion,
        // so the first half ends 1 second before `mid` to keep the halves from sharing a day
        pending.push(
          { from: range.from, to: new Date(mid.getTime() - 1000) },
          { from: mid, to: range.to },
        );
        continue;
      }
      if (isSaturated) {
        logger.log(
          `Range ${range.from.toISOString()} - ${range.to.toISOString()} is saturated but cannot be split further.`,
        );
      }

      for (const { repository } of lists.flat()) {
        const name = repository.nameWithOwner;
        if (includeOwnRepos || !name.startsWith(`${canonicalUsername}/`)) {
          repos.add(name);
        }
      }
    }
  }

  return repos.size;
};

/**
 * Fetch stats for a given username.
 *
 * @param username GitHub username.
 * @param include_all_commits Include all commits.
 * @param exclude_repo Repositories to exclude.
 * @param include_merged_pull_requests Include merged pull requests.
 * @param include_discussions Include discussions.
 * @param include_discussions_answers Include discussions answers.
 * @param commits_year Year to count total commits.
 * @param repo Repositories to scope the REST search to.
 * @param owner Owners to scope the REST search to.
 * @param include_prs_authored Include count of PRs authored.
 * @param include_prs_commented Include count of PRs commented.
 * @param include_prs_reviewed Include count of PRs reviewed.
 * @param include_issues_authored Include count of issues authored.
 * @param include_issues_commented Include count of issues commented.
 * @param ownerAffiliations Owner affiliations. Default: OWNER.
 * @param include_contributions Include all-time contributions.
 * @param include_all_time_contribs Include all-time count of repos contributed to.
 * @param contribs_include_own_repos Include user-owned repos in contributed-to counts.
 * @param pat Optional PAT override.
 * @returns Stats data.
 */
const fetchStats = async (
  username: string,
  include_all_commits = false,
  exclude_repo: Array<string> = [],
  include_merged_pull_requests = false,
  include_discussions = false,
  include_discussions_answers = false,
  commits_year?: number,
  repo: Array<string> = [],
  owner: Array<string> = [],
  include_prs_authored = false,
  include_prs_commented = false,
  include_prs_reviewed = false,
  include_issues_authored = false,
  include_issues_commented = false,
  ownerAffiliations: Array<string> = [],
  include_contributions = false,
  include_all_time_contribs = false,
  contribs_include_own_repos = false,
  pat: string | null = null,
): Promise<StatsData> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  const stats: StatsData = {
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
    allTimeContributedTo: 0,
    totalPRsAuthored: 0,
    totalPRsCommented: 0,
    totalPRsReviewed: 0,
    totalIssuesAuthored: 0,
    totalIssuesCommented: 0,
    totalContributions: 0,
    rank: { level: "C", percentile: 100 },
  };
  const affiliations = parseOwnerAffiliations(ownerAffiliations);

  const res = await statsFetcher({
    username,
    includeMergedPullRequests: include_merged_pull_requests,
    includeDiscussions: include_discussions,
    includeDiscussionsAnswers: include_discussions_answers,
    startTime:
      commits_year === undefined
        ? undefined
        : toGitHubDateTime(getGitHubYearRange(commits_year).from),
    ownerAffiliations: affiliations,
    includeUserRepositories: contribs_include_own_repos,
    pat,
  });

  // Catch GraphQL errors.
  if (res.data.errors) {
    logger.error(res.data.errors);
    const firstError = res.data.errors[0];
    if (firstError?.type === "NOT_FOUND") {
      throw new CustomError(
        firstError.message || "Could not fetch user.",
        CustomError.USER_NOT_FOUND,
      );
    }
    if (firstError?.message) {
      throw new CustomError(
        wrapTextMultiline(firstError.message, 525, 12)[0] ?? "",
        res.statusText,
      );
    }
    throw new CustomError(
      "Something went wrong while trying to retrieve the stats data using the GraphQL API.",
      CustomError.GRAPHQL_ERROR,
    );
  }

  const user = res.data.data.user;
  if (!user) {
    throw new CustomError("Could not fetch user.", CustomError.USER_NOT_FOUND);
  }

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
  const repoUserStats = await fetchRepoUserStats(
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
    const mergedCount = user.mergedPullRequests?.totalCount ?? 0;
    stats.totalPRsMerged = mergedCount;
    stats.mergedPRsPercentage =
      (mergedCount / user.pullRequests.totalCount) * 100 || 0;
  }
  stats.totalReviews = user.reviews.totalPullRequestReviewContributions;
  stats.totalIssues = user.openIssues.totalCount + user.closedIssues.totalCount;
  if (include_discussions) {
    stats.totalDiscussionsStarted = user.repositoryDiscussions?.totalCount ?? 0;
  }
  if (include_discussions_answers) {
    stats.totalDiscussionsAnswered =
      user.repositoryDiscussionComments?.totalCount ?? 0;
  }
  stats.contributedTo = user.repositoriesContributedTo.totalCount;

  if (include_contributions) {
    stats.totalContributions = await fetchTotalContributions(
      username,
      user.contributionsCollection.contributionYears,
      pat,
    );
  }

  if (include_all_time_contribs) {
    stats.allTimeContributedTo = await fetchAllTimeReposContributedTo(
      user.login,
      user.contributionsCollection.contributionYears,
      contribs_include_own_repos,
      pat,
    );
  }

  // Retrieve stars while filtering out repositories to be hidden.
  const allExcludedRepos = [
    ...exclude_repo,
    ...getConfig().excludeRepositories,
  ];
  const repoToHide = new Set(allExcludedRepos);

  stats.totalStars = (user.repositories.nodes ?? [])
    .filter((data) => !!data && !repoToHide.has(data.name))
    .reduce((prev, curr) => prev + (curr?.stargazerCount ?? 0), 0);

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
