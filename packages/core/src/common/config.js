// @ts-check

/**
 * @param {string | undefined} value Comma-separated string.
 * @returns {string[] | undefined} Parsed string values.
 */
const parseCsv = (value) => {
  if (!value) {
    return undefined;
  }
  return value.split(",");
};

/**
 * @param {Record<string, string | undefined>} env Environment variables to inspect.
 * @returns {{name: string, value: string}[]} Personal access tokens found in the environment.
 */
const parsePATsFromEnv = (env) => {
  return Object.keys(env)
    .filter((key) => /PAT_\d*$/.exec(key))
    .map((name) => ({
      name,
      value: env[name],
    }));
};

/**
 * @returns {Record<string, string | undefined>} `process.env` if available, otherwise `{}`.
 */
const getDefaultEnv = () => {
  console.log((typeof process !== "undefined") + " | " + process?.env);
  if (typeof process !== "undefined" && process?.env) {
    console.log("if branch");
    return process.env;
  }
  console.log("else branch");
  return {};
};

/**
 * @param {Partial<ReturnType<typeof loadConfigFromEnv>>} config (Partial) config values to normalize.
 * @returns {{
 *   whitelist: string[] | undefined,
 *   gistWhitelist: string[] | undefined,
 *   excludeRepositories: string[],
 *   fetchMultiPageStars: string | undefined,
 *   pats: {name: string, value: string}[],
 * }} Normalized config object with defaults applied.
 */
const normalizeConfig = (config = {}) => {
  return {
    whitelist: config.whitelist,
    gistWhitelist: config.gistWhitelist,
    excludeRepositories: config.excludeRepositories || [],
    fetchMultiPageStars: config.fetchMultiPageStars,
    pats: config.pats || [],
  };
};

let currentConfig;

/**
 * @param {Record<string, string | undefined>} env Environment variables used to build the runtime config.
 */
export const loadConfigFromEnv = (env = getDefaultEnv()) => {
  console.log("env: " + JSON.stringify(env));
  const whitelist = parseCsv(env.WHITELIST);
  const gistWhitelist = parseCsv(env.GIST_WHITELIST);
  const excludeRepositories = parseCsv(env.EXCLUDE_REPO) || [];

  currentConfig = normalizeConfig({
    whitelist,
    gistWhitelist,
    excludeRepositories,
    fetchMultiPageStars: env.FETCH_MULTI_PAGE_STARS,
    pats: parsePATsFromEnv(env),
  });
};

loadConfigFromEnv();

export const getConfig = () => currentConfig;
