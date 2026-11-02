import { getGitHubYearRange, toGitHubDateTime } from "../common/date.js";

import type { YearContributionsFragment } from "./generated/stats.js";
import { graphqlDocument } from "./graphqlDocument.js";

interface ContributionsQueryVariables {
  login: string;
}

interface ContributionsQuery {
  user: Record<`year_${number}`, YearContributionsFragment> | null;
}

/**
 * Build the all-time contributions query, one aliased `contributionsCollection` field per year.
 * The shape is only known at runtime.
 *
 * @param years Contribution years, one `year_<year>` alias each.
 * @returns Document for `createGraphQLFetcher`.
 */
const buildContributionsDocument = (years: Array<number>) => {
  const yearFields = years
    .map((year) => {
      const { from, to } = getGitHubYearRange(year);
      return `year_${year}: contributionsCollection(from: "${toGitHubDateTime(from)}", to: "${toGitHubDateTime(to)}") { ...YearContributions }`;
    })
    .join("\n");

  // fragment must match queries/stats.graphql, which generates its type
  return graphqlDocument<ContributionsQuery, ContributionsQueryVariables>(`
query userContributions($login: String!) {
  user(login: $login) {
    ${yearFields}
  }
}
fragment YearContributions on ContributionsCollection {
  contributionCalendar {
    totalContributions
  }
}`);
};

export { buildContributionsDocument };
export type { ContributionsQuery };
