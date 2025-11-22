import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useSelector } from 'react-redux';
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

function createResolvedPromise(data, config) {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
}

// mock responses to unauthenticated "anuraghazra" requests
cachedAxios.interceptors.request.use(
  (config) => {
    const userId = useSelector((state) => state.user.userId);
    const isAuthenticated = userId && userId.length > 0;
    if (isAuthenticated) {
      return config;
    }

    const params = new URL(config.url).entries || {};

    if (
      config.url === 'https://api.github.com/graphql' &&
      config.data.query.includes(
        'query userInfo($login: String!, $after: String, $includeMergedPullRequests:',
      ) &&
      config.data.data.variables.login === 'anuraghazra'
    ) {
      return createResolvedPromise(userStats, config);
    }

    if (
      config.url === 'https://api.github.com/graphql' &&
      config.data.query.includes(
        'query userInfo($login: String!, $after: String, $ownerAffiliations:',
      ) &&
      config.data.data.variables.login === 'anuraghazra'
    ) {
      return createResolvedPromise(additionalUserStars, config);
    }

    if (
      config.url === 'https://api.github.com/graphql' &&
      config.data.query.includes(
        'query userInfo($login: String!, $ownerAffiliations:',
      ) &&
      config.data.data.variables.login === 'anuraghazra'
    ) {
      return createResolvedPromise(topLanguages, config);
    }

    if (
      config.url === 'https://api.github.com/graphql' &&
      config.data.query.includes('fragment RepoInfo on Repository {') &&
      config.data.data.variables.login === 'anuraghazra' &&
      config.data.data.variables.repo === 'github-readme-stats'
    ) {
      return createResolvedPromise(repository, config);
    }

    if (
      config.url === 'https://api.github.com/graphql' &&
      config.data.query.includes('query gistInfo(') &&
      config.data.data.variables.login === 'anuraghazra'
    ) {
      return createResolvedPromise(gist, config);
    }

    switch (config.url) {
      case 'https://api.github.com/search/commits?per_page=1&q=author:anuraghazra':
        return createResolvedPromise(commits, config);
      case 'https://api.github.com/search/issues?per_page=1&q=commenter:anuraghazra+-author:anuraghazra+type:pr':
        return createResolvedPromise(commentedPrs, config);
      case 'https://api.github.com/search/issues?per_page=1&q=reviewed-by:anuraghazra+-author:anuraghazra+type:pr':
        return createResolvedPromise(reviewedPrs, config);
      case 'https://api.github.com/search/issues?per_page=1&q=commenter:anuraghazra+-author:anuraghazra+type:issue':
        return createResolvedPromise(commentedIssues, config);
      case `https://${HOST}/api/wakatime-proxy?username=ffflabs`:
        return createResolvedPromise(wakatimeProxy, config);
      default:
        return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

axios.get = cachedAxios.get.bind(cachedAxios);
axios.post = cachedAxios.post.bind(cachedAxios);

export default cachedAxios;
export const { get, post } = cachedAxios;
