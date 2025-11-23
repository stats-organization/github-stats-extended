import axios, { getAdapter } from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { HOST } from './constants';

import additionalUserStars from './mockData/additional_user_stars.json' with { type: 'json' };
import commentedIssues from './mockData/commented_issues.json' with { type: 'json' };
import commentedPrs from './mockData/commented_prs.json' with { type: 'json' };
import commits from './mockData/commits.json' with { type: 'json' };
import gist from './mockData/gist.json' with { type: 'json' };
import repository from './mockData/repository.json' with { type: 'json' };
import reviewedPrs from './mockData/reviewed_prs.json' with { type: 'json' };
import topLanguages from './mockData/top_languages.json' with { type: 'json' };
import userStats from './mockData/user_stats.json' with { type: 'json' };
import wakatimeProxy from './mockData/wakatime_proxy.json' with { type: 'json' };

const cachedAxios = setupCache(axios, {
  // Cache for 30 minutes
  ttl: 30 * 60 * 1000,
  interpretHeader: false,
  cacheTakeover: false,
  methods: ['get', 'post'],
});

axios.get = cachedAxios.get.bind(cachedAxios);
axios.post = cachedAxios.post.bind(cachedAxios);

function createMockResponse(data, config) {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    request: {},
    config,
  });
}

// store userId outside React context so the interceptor can access it
let userId = null;

export function setUserId(newUserId) {
  userId = newUserId;
}

const defaultAdapter = getAdapter(axios.defaults.adapter);

// mock responses to unauthenticated "anuraghazra" requests
axios.defaults.adapter = async (config) => {
  const isAuthenticated = userId && userId.length > 0;
  if (isAuthenticated) {
    return defaultAdapter(config);
  }

  const params = config.data ? JSON.parse(config.data) : {};

  if (
    config.url === 'https://api.github.com/graphql' &&
    params.query?.includes(
      'query userInfo($login: String!, $after: String, $includeMergedPullRequests:',
    ) &&
    params.variables?.login === 'anuraghazra'
  ) {
    return createMockResponse(userStats, config);
  }

  if (
    config.url === 'https://api.github.com/graphql' &&
    params.query?.includes(
      'query userInfo($login: String!, $after: String, $ownerAffiliations:',
    ) &&
    params.variables?.login === 'anuraghazra'
  ) {
    return createMockResponse(additionalUserStars, config);
  }

  if (
    config.url === 'https://api.github.com/graphql' &&
    params.query?.includes(
      'query userInfo($login: String!, $ownerAffiliations:',
    ) &&
    params.variables?.login === 'anuraghazra'
  ) {
    return createMockResponse(topLanguages, config);
  }

  if (
    config.url === 'https://api.github.com/graphql' &&
    params.query?.includes('fragment RepoInfo on Repository {') &&
    params.variables?.login === 'anuraghazra' &&
    params.variables?.repo === 'github-readme-stats'
  ) {
    return createMockResponse(repository, config);
  }

  if (
    config.url === 'https://api.github.com/graphql' &&
    params.query?.includes('query gistInfo(') &&
    params.variables?.gistName === 'bbfce31e0217a3689c8d961a356cb10d'
  ) {
    return createMockResponse(gist, config);
  }

  switch (config.url) {
    case 'https://api.github.com/search/commits?per_page=1&q=author:anuraghazra':
      return createMockResponse(commits, config);
    case 'https://api.github.com/search/issues?per_page=1&q=commenter:anuraghazra+-author:anuraghazra+type:pr':
      return createMockResponse(commentedPrs, config);
    case 'https://api.github.com/search/issues?per_page=1&q=reviewed-by:anuraghazra+-author:anuraghazra+type:pr':
      return createMockResponse(reviewedPrs, config);
    case 'https://api.github.com/search/issues?per_page=1&q=commenter:anuraghazra+-author:anuraghazra+type:issue':
      return createMockResponse(commentedIssues, config);
    case `https://${HOST}/api/wakatime-proxy?username=ffflabs`:
      return createMockResponse(wakatimeProxy, config);
    default:
      return defaultAdapter(config);
  }
};

export const { get, post } = cachedAxios;
