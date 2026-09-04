import axios, { getAdapter } from "axios";
import { setupCache } from "axios-cache-interceptor";

import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
  HOST,
} from "./constants";
import additionalUserStars from "./wizard/mockData/additional_user_stars.json" with { type: "json" };
import commentedIssues from "./wizard/mockData/commented_issues.json" with { type: "json" };
import commentedPrs from "./wizard/mockData/commented_prs.json" with { type: "json" };
import commits from "./wizard/mockData/commits.json" with { type: "json" };
import contributions from "./wizard/mockData/contributions.json" with { type: "json" };
import gist_graphql from "./wizard/mockData/gist-graphql.json" with { type: "json" };
import gist_rest from "./wizard/mockData/gist-rest.json" with { type: "json" };
import reposContributedTo from "./wizard/mockData/repos_contributed_to.json" with { type: "json" };
import repository from "./wizard/mockData/repository.json" with { type: "json" };
import reviewedPrs from "./wizard/mockData/reviewed_prs.json" with { type: "json" };
import topLanguages from "./wizard/mockData/top_languages.json" with { type: "json" };
import userStats from "./wizard/mockData/user_stats.json" with { type: "json" };
import wakatimeProxy from "./wizard/mockData/wakatime_proxy.json" with { type: "json" };

const cachedAxios = setupCache(axios, {
  // Cache for 30 minutes
  ttl: 30 * 60 * 1000,
  interpretHeader: false,
  cacheTakeover: false,
  methods: ["get", "post"],
  cachePredicate: {
    allowUrls: ["api.github.com", HOST],
  },
});

axios.get = cachedAxios.get.bind(cachedAxios);
axios.post = cachedAxios.post.bind(cachedAxios);

export function clearAxiosCache(): void {
  void cachedAxios.storage.clear?.();
}

function createMockResponse<TData, TConfig>(
  data: TData,
  config: TConfig,
): Promise<{
  data: TData;
  status: 200;
  statusText: string;
  headers: Record<string, never>;
  request: Record<string, never>;
  config: TConfig;
}> {
  return Promise.resolve({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    request: {},
    config,
  });
}

// store shouldMock outside React context so the interceptor can access it
let shouldMock = false;

export function setShouldMock(newShouldMock: boolean): void {
  shouldMock = newShouldMock;
}

const defaultAdapter = getAdapter(axios.defaults.adapter);

// mock responses to "anuraghazra" requests
axios.defaults.adapter = async (config) => {
  if (!shouldMock) {
    return defaultAdapter(config);
  }

  interface Params {
    query?: string;
    variables?: {
      login?: string;
      repo?: string;
      gistName?: string;
    };
  }
  const params = (
    config.data ? JSON.parse(config.data as string) : {}
  ) as Params;

  if (
    config.url === "https://api.github.com/graphql" &&
    params.query?.includes("query userInfo(") &&
    params.variables?.login === DEMO_USER
  ) {
    return createMockResponse(userStats, config);
  }

  if (
    config.url === "https://api.github.com/graphql" &&
    params.query?.includes("query userRepos(") &&
    params.variables?.login === DEMO_USER
  ) {
    return createMockResponse(additionalUserStars, config);
  }

  if (
    config.url === "https://api.github.com/graphql" &&
    params.query?.includes("query userContributions(") &&
    params.variables?.login === DEMO_USER
  ) {
    return createMockResponse(contributions, config);
  }

  if (
    config.url === "https://api.github.com/graphql" &&
    params.query?.includes("query userReposContributedTo(") &&
    params.variables?.login === DEMO_USER
  ) {
    return createMockResponse(reposContributedTo, config);
  }

  if (
    config.url === "https://api.github.com/graphql" &&
    params.query?.includes("query topLanguages(") &&
    params.variables?.login === DEMO_USER
  ) {
    return createMockResponse(topLanguages, config);
  }

  if (
    config.url === "https://api.github.com/graphql" &&
    params.query?.includes("query getRepo(") &&
    params.variables &&
    params.variables.login === DEMO_REPO.split("/")[0] &&
    params.variables.repo === DEMO_REPO.split("/")[1]
  ) {
    return createMockResponse(repository, config);
  }

  if (
    config.url === "https://api.github.com/graphql" &&
    params.query?.includes("query gistInfo(") &&
    params.variables?.gistName === DEMO_GIST
  ) {
    return createMockResponse(gist_graphql, config);
  }

  switch (config.url) {
    case `https://api.github.com/gists/${DEMO_GIST}`:
      return createMockResponse(gist_rest, config);
    case `https://api.github.com/search/commits?per_page=1&q=author:${DEMO_USER}`:
      return createMockResponse(commits, config);
    case `https://api.github.com/search/issues?per_page=1&q=commenter:${DEMO_USER}+-author:${DEMO_USER}+type:pr`:
      return createMockResponse(commentedPrs, config);
    case `https://api.github.com/search/issues?per_page=1&q=reviewed-by:${DEMO_USER}+-author:${DEMO_USER}+type:pr`:
      return createMockResponse(reviewedPrs, config);
    case `https://api.github.com/search/issues?per_page=1&q=commenter:${DEMO_USER}+-author:${DEMO_USER}+type:issue`:
      return createMockResponse(commentedIssues, config);
    case `https://${HOST}/api/wakatime-proxy?username=${DEMO_WAKATIME_USER}`:
      return createMockResponse(wakatimeProxy, config);
    default:
      return defaultAdapter(config);
  }
};
