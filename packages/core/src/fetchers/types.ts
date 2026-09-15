import type { RepoInfoFragment } from "../graphql/generated/repo.js";

export interface GistData {
  name: string;
  nameWithOwner: string;
  description: string | null;
  language: string | null;
  starsCount: number;
  forksCount: number;
}

/**
 * What the repo query returns, with `primaryLanguage` loosened:
 * the schema says `name` is non-null, but the card falls back to defaults for callers passing untyped data.
 */
type RepoInfo = Omit<RepoInfoFragment, "primaryLanguage"> & {
  primaryLanguage: {
    color: string | null;
    id?: string;
    name: string | null;
  } | null;
};

export interface RepoUserStats {
  // only present when the matching include_* flag is set (see fetchRepoUserStats)
  totalPRsAuthored?: number;
  totalPRsCommented?: number;
  totalPRsReviewed?: number;
  totalIssuesAuthored?: number;
  totalIssuesCommented?: number;
}

export type RepositoryData = RepoInfo & RepoUserStats;

export interface StatsData {
  name: string;
  totalPRs: number;
  totalPRsMerged: number;
  mergedPRsPercentage: number;
  totalReviews: number;
  totalCommits: number;
  totalIssues: number;
  totalStars: number;
  totalDiscussionsStarted: number;
  totalDiscussionsAnswered: number;
  contributedTo: number;
  allTimeContributedTo: number;
  totalPRsAuthored: number;
  totalPRsCommented: number;
  totalPRsReviewed: number;
  totalIssuesAuthored: number;
  totalIssuesCommented: number;
  totalContributions: number;
  rank: { level: string; percentile: number };
}

export interface Lang {
  name: string;
  // GitHub's GraphQL `Language.color` is nullable — the card falls back to a default.
  color: string | null;
  size: number;
  /** Number of repositories the language appears in. */
  count: number;
}

export type TopLangData = Record<string, Lang>;

export interface WakaTimeData {
  categories: Array<{
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }>;
  daily_average: number;
  daily_average_including_other_language: number;
  days_including_holidays: number;
  days_minus_holidays: number;
  editors: Array<{
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }>;
  holidays: number;
  human_readable_daily_average: string;
  human_readable_daily_average_including_other_language: string;
  human_readable_total: string;
  human_readable_total_including_other_language: string;
  id: string;
  is_already_updating: boolean;
  is_coding_activity_visible: boolean;
  is_including_today: boolean;
  is_other_usage_visible: boolean;
  is_stuck: boolean;
  is_up_to_date: boolean;
  languages: Array<{
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }>;
  operating_systems: Array<{
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
  }>;
  percent_calculated: number;
  range: string;
  status: string;
  timeout: number;
  total_seconds: number;
  total_seconds_including_other_language: number;
  user_id: string;
  username: string;
  writes_only: boolean;
}

export interface WakaTimeLang {
  name: string;
  text: string;
  percent: number;
}
