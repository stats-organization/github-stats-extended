/* eslint-disable no-nested-ternary */
export const PROD = true;

export const USE_LOGGER = true;

export const CLIENT_ID = 'Ov23liZSweT9LJrck9i8';

export const MODE = 'trends';

export const HOST = PROD
  ? 'monorepo-test-backend-seven.vercel.app'
  : 'localhost:3000';

export const REDIRECT_URI = PROD
  ? `https://${HOST}/frontend/user`
  : `http://${HOST}/frontend/user`;

export const GITHUB_PRIVATE_AUTH_URL = `https://github.com/login/oauth/authorize?scope=user,repo&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}/private`;
export const GITHUB_PUBLIC_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}/public`;

export const BACKEND_URL = PROD
  ? 'https://api.githubtrends.io'
  : 'http://localhost:8000';

export const CURR_YEAR = 2024;

export const DEMO_USER = 'anuraghazra';
export const DEMO_REPO = 'anuraghazra/github-readme-stats';
export const DEMO_GIST = 'bbfce31e0217a3689c8d961a356cb10d';
export const DEMO_WAKATIME_USER = 'ffflabs';

window.process = {
  env: {
    FETCH_MULTI_PAGE_STARS: 10,
    PAT_1: 'placeholderPAT', // so the backend's retryer.js sees there is 1 PAT and sets `RETRIES` accordingly
  },
};
