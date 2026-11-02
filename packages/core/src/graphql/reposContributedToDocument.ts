import type { GitHubDateRange } from "../common/date.js";
import { toGitHubDateTime } from "../common/date.js";

import type { RangeContributionsByRepoFragment } from "./generated/stats.js";
import { graphqlDocument } from "./graphqlDocument.js";

/** max value GitHub allows for `first/maxRepositories` */
const MAX_REPOSITORIES_LIMIT = 100;

interface ReposContributedToQueryVariables {
  login: string;
  maxRepositories: number;
}

interface ReposContributedToQuery {
  user: Record<`range_${number}`, RangeContributionsByRepoFragment> | null;
}

/**
 * Build a query for the repositories a user contributed to within multiple time
 * ranges. One aliased `contributionsCollection` field per range, so all ranges
 * are fetched in a single request. The shape is only known at runtime.
 *
 * Mirrors the `contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]`
 * filter used by `repositoriesContributedTo` in `stats.graphql`.
 *
 * @param ranges Ranges to fetch, one `range_<index>` alias each.
 * @param includeOwnRepos Whether to select `repositoryContributions`.
 * @returns Document for `createGraphQLFetcher`.
 */
const buildReposContributedToDocument = (
  ranges: Array<GitHubDateRange>,
  includeOwnRepos: boolean,
) => {
  const rangeFields = ranges
    .map(
      ({ from, to }, index) =>
        `range_${index}: contributionsCollection(from: "${toGitHubDateTime(from)}", to: "${toGitHubDateTime(to)}") { ...RangeContributionsByRepo }`,
    )
    .join("\n");

  // `repositoryContributions` only ever returns repos the user owns,
  // so it is left out rather than gated with @include: an excluded field still counts toward the query's node cost.
  // stats.graphql carries the directive so the generated type marks the field optional.
  const ownRepoField = includeOwnRepos
    ? `repositoryContributions(first: $maxRepositories) {
    nodes {
      repository {
        nameWithOwner
      }
    }
  }`
    : "";

  // fragment must match queries/stats.graphql, which generates its type
  return graphqlDocument<
    ReposContributedToQuery,
    ReposContributedToQueryVariables
  >(`
query userReposContributedTo($login: String!, $maxRepositories: Int!) {
  user(login: $login) {
    ${rangeFields}
  }
}
fragment RangeContributionsByRepo on ContributionsCollection {
  commitContributionsByRepository(maxRepositories: $maxRepositories) {
    repository {
      nameWithOwner
    }
  }
  issueContributionsByRepository(maxRepositories: $maxRepositories) {
    repository {
      nameWithOwner
    }
  }
  pullRequestContributionsByRepository(maxRepositories: $maxRepositories) {
    repository {
      nameWithOwner
    }
  }
  ${ownRepoField}
}`);
};

export { buildReposContributedToDocument, MAX_REPOSITORIES_LIMIT };
export type { ReposContributedToQuery };
