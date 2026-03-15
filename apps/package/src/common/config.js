// @ts-check

/**
 * @param {string | undefined} value
 * @returns {string[] | undefined}
 */
const parseCsv = (value) => {
  if (!value) {
    return undefined;
  }
  return value.split(",");
};

/**
 * @param {Record<string, string | undefined>} env
 * @returns {{name: string, value: string}[]}
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
 * @returns {Record<string, string | undefined>}
 */
const getDefaultEnv = () => {
  if (typeof process !== "undefined" && process?.env) {
    return process.env;
  }
  return {};
};

/**
 * @param {Record<string, string | undefined>} env
 */
const loadConfigFromEnv = (env = getDefaultEnv()) => {
  const whitelist = parseCsv(env.WHITELIST);
  const gistWhitelist = parseCsv(env.GIST_WHITELIST);
  const excludeRepositories = parseCsv(env.EXCLUDE_REPO) || [];

  return {
    whitelist,
    gistWhitelist,
    excludeRepositories,
    fetchMultiPageStars: env.FETCH_MULTI_PAGE_STARS,
    pats: parsePATsFromEnv(env),
  };
};

/**
 * @param {Partial<ReturnType<typeof loadConfigFromEnv>>} config
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

let currentConfig = normalizeConfig(loadConfigFromEnv());

/**
 * @returns {ReturnType<typeof normalizeConfig>}
 */
export const getConfig = () => currentConfig;
