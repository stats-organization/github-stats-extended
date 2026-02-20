// @ts-check

/**
 * @type {import("../../src/fetchers/stats").StatsData}
 */
export const stats = {
  name: "Anurag Hazra",
  totalStars: 100,
  totalCommits: 200,
  totalIssues: 300,
  totalPRs: 400,
  totalPRsMerged: 320,
  mergedPRsPercentage: 80,
  totalReviews: 50,
  totalDiscussionsStarted: 10,
  totalDiscussionsAnswered: 40,
  contributedTo: 50,
  rank: { level: "DEV", percentile: 0 },
};

export const data_stats = {
  data: {
    user: {
      name: stats.name,
      repositoriesContributedTo: { totalCount: stats.contributedTo },
      commits: {
        totalCommitContributions: stats.totalCommits,
      },
      reviews: {
        totalPullRequestReviewContributions: stats.totalReviews,
      },
      pullRequests: { totalCount: stats.totalPRs },
      mergedPullRequests: { totalCount: stats.totalPRsMerged },
      openIssues: { totalCount: stats.totalIssues },
      closedIssues: { totalCount: 0 },
      followers: { totalCount: 0 },
      repositoryDiscussions: { totalCount: stats.totalDiscussionsStarted },
      repositoryDiscussionComments: {
        totalCount: stats.totalDiscussionsAnswered,
      },
      repositories: {
        totalCount: 1,
        nodes: [{ stargazers: { totalCount: 100 } }],
        pageInfo: {
          hasNextPage: false,
          endCursor: "cursor",
        },
      },
    },
  },
};
