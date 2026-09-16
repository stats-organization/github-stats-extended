// Generated file — see .github/CONTRIBUTING.md

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
import type * as Types from "./common.js";

import { graphqlDocument } from "../graphqlDocument.js";
export type RepoNodeFragment = { name: string; stargazerCount: number };

export type RepoStarsFragment = {
  repositories: {
    totalCount: number;
    nodes: Array<{ name: string; stargazerCount: number } | null> | null;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export type UserReposQueryVariables = Exact<{
  login: string;
  after?: string | null | undefined;
  ownerAffiliations?:
    | Array<Types.RepositoryAffiliation | null | undefined>
    | Types.RepositoryAffiliation
    | null
    | undefined;
}>;

export type UserReposQuery = {
  user: {
    repositories: {
      totalCount: number;
      nodes: Array<{ name: string; stargazerCount: number } | null> | null;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};

export type UserInfoQueryVariables = Exact<{
  login: string;
  after?: string | null | undefined;
  includeMergedPullRequests: boolean;
  includeDiscussions: boolean;
  includeDiscussionsAnswers: boolean;
  startTime?: string | null | undefined;
  ownerAffiliations?:
    | Array<Types.RepositoryAffiliation | null | undefined>
    | Types.RepositoryAffiliation
    | null
    | undefined;
  includeUserRepositories: boolean;
}>;

export type UserInfoQuery = {
  user: {
    name: string | null;
    login: string;
    commits: { totalCommitContributions: number };
    reviews: { totalPullRequestReviewContributions: number };
    repositoriesContributedTo: { totalCount: number };
    pullRequests: { totalCount: number };
    mergedPullRequests?: { totalCount: number };
    openIssues: { totalCount: number };
    closedIssues: { totalCount: number };
    followers: { totalCount: number };
    repositoryDiscussions?: { totalCount: number };
    repositoryDiscussionComments?: { totalCount: number };
    contributionsCollection: { contributionYears: Array<number> };
    repositories: {
      totalCount: number;
      nodes: Array<{ name: string; stargazerCount: number } | null> | null;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};

export type YearContributionsFragment = {
  contributionCalendar: { totalContributions: number };
};

export type RangeContributionsByRepoFragment = {
  commitContributionsByRepository: Array<{
    repository: { nameWithOwner: string };
  }>;
  issueContributionsByRepository: Array<{
    repository: { nameWithOwner: string };
  }>;
  pullRequestContributionsByRepository: Array<{
    repository: { nameWithOwner: string };
  }>;
  repositoryContributions?: {
    nodes: Array<{ repository: { nameWithOwner: string } } | null> | null;
  };
};

export const UserReposDocument = graphqlDocument<
  UserReposQuery,
  UserReposQueryVariables
>(`
query userRepos($login: String!, $after: String, $ownerAffiliations: [RepositoryAffiliation]) {
  user(login: $login) {
    ...RepoStars
  }
}
fragment RepoStars on User {
  repositories(
    first: 100
    after: $after
    ownerAffiliations: $ownerAffiliations
    orderBy: {direction: DESC, field: STARGAZERS}
  ) {
    totalCount
    nodes {
      ...RepoNode
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
fragment RepoNode on Repository {
  name
  stargazerCount
}`);

export const UserInfoDocument = graphqlDocument<
  UserInfoQuery,
  UserInfoQueryVariables
>(`
query userInfo($login: String!, $after: String, $includeMergedPullRequests: Boolean!, $includeDiscussions: Boolean!, $includeDiscussionsAnswers: Boolean!, $startTime: DateTime = null, $ownerAffiliations: [RepositoryAffiliation], $includeUserRepositories: Boolean!) {
  user(login: $login) {
    name
    login
    commits: contributionsCollection(from: $startTime) {
      totalCommitContributions
    }
    reviews: contributionsCollection {
      totalPullRequestReviewContributions
    }
    repositoriesContributedTo(
      first: 1
      contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
      includeUserRepositories: $includeUserRepositories
    ) {
      totalCount
    }
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
    contributionsCollection {
      contributionYears
    }
    ...RepoStars
  }
}
fragment RepoStars on User {
  repositories(
    first: 100
    after: $after
    ownerAffiliations: $ownerAffiliations
    orderBy: {direction: DESC, field: STARGAZERS}
  ) {
    totalCount
    nodes {
      ...RepoNode
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
fragment RepoNode on Repository {
  name
  stargazerCount
}`);
