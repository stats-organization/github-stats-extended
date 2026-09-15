/** A span between two dates, as GitHub's range arguments take it. */
interface GitHubDateRange {
  /** Start of the range, inclusive. */
  from: Date;
  /** End of the range, inclusive. */
  to: Date;
}

/**
 * Format a date as a GitHub `DateTime` scalar.
 * Seconds precision, no milliseconds.
 *
 * @param date Date to format.
 * @returns e.g. `2024-01-01T00:00:00Z`.
 */
const toGitHubDateTime = (date: Date): string =>
  `${date.toISOString().slice(0, 19)}Z`;

/**
 * The full UTC span of a calendar year, both ends inclusive.
 *
 * The end matters to callers that would otherwise leave a range open:
 * GitHub's `contributionsCollection` defaults `to` to one year after `from`,
 * which pulls the next 1st of January into the year.
 *
 * @param year Four-digit year.
 * @returns The range covering it.
 */
const getGitHubYearRange = (year: number): GitHubDateRange => ({
  from: new Date(Date.UTC(year, 0, 1)),
  to: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
});

/**
 * Get diff in minutes between two dates.
 *
 * @param d1 First date.
 * @param d2 Second date.
 * @returns Number of minutes between the two dates.
 */
const dateDiff = (d1: Date, d2: Date): number =>
  Math.round((d1.getTime() - d2.getTime()) / (1000 * 60));

export { dateDiff, getGitHubYearRange, toGitHubDateTime };
export type { GitHubDateRange };
