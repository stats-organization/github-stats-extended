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
      // without "to", 2024-01-01 would count toward year=2023
      const from = `${year}-01-01T00:00:00Z`;
      const to = `${year}-12-31T23:59:59Z`;
      return `year_${year}: contributionsCollection(from: "${from}", to: "${to}") { ...YearContributions }`;
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
