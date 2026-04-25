export const USE_LOGGER = true as boolean;

export const CLIENT_ID = "Ov23lilAc5biyyRY0K1u";

export const HOST = window.location.host;

const REDIRECT_URI = `https://${HOST}/frontend`;

export const GITHUB_PRIVATE_AUTH_URL = `https://github.com/login/oauth/authorize?scope=user,repo&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}?mode=private`;
export const GITHUB_PUBLIC_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}?mode=public`;

export const DEMO_USER = "anuraghazra" as string;
export const DEMO_REPO = "anuraghazra/github-readme-stats" as string;
export const DEMO_GIST = "bbfce31e0217a3689c8d961a356cb10d" as string;
export const DEMO_WAKATIME_USER = "alan" as string;

// imported backend code expects process.env to be defined
window.process = {
  env: {},
} as (typeof window)["process"];
