type Env = Record<string, string | undefined>;

interface PersonalAccessToken {
  name: string;
  value: string;
}

interface Config {
  whitelist: Array<string> | undefined;
  gistWhitelist: Array<string> | undefined;
  excludeRepositories: Array<string>;
  fetchMultiPageStars: string | undefined;
  pats: Array<PersonalAccessToken>;
}

/**
 * @param value Comma-separated string.
 * @returns Parsed string values.
 */
const parseCsv = (value: string | undefined): Array<string> | undefined => {
  if (!value) {
    return undefined;
  }
  return value.split(",");
};

/**
 * @param env Environment variables to inspect.
 * @returns Personal access tokens found in the environment.
 */
const parsePATsFromEnv = (env: Env): Array<PersonalAccessToken> => {
  return Object.keys(env)
    .filter((key) => /PAT_\d*$/.exec(key))
    .map((name) => ({
      name,
      value: env[name] ?? "",
    }));
};

/**
 * @returns `process.env` if available, otherwise `{}`.
 */
const getDefaultEnv = (): Env => {
  const processEnv = (globalThis as { process?: { env?: Env } }).process?.env;
  return processEnv ?? {};
};

/**
 * @param config (Partial) config values to normalize.
 * @returns Normalized config object with defaults applied.
 */
const normalizeConfig = (config: Partial<Config> = {}): Config => {
  return {
    whitelist: config.whitelist,
    gistWhitelist: config.gistWhitelist,
    excludeRepositories: config.excludeRepositories ?? [],
    fetchMultiPageStars: config.fetchMultiPageStars,
    pats: config.pats ?? [],
  };
};

let currentConfig: Config;

/**
 * @param env Environment variables used to build the runtime config.
 */
export const loadConfigFromEnv = (env: Env = getDefaultEnv()): void => {
  const whitelist = parseCsv(env["WHITELIST"]);
  const gistWhitelist = parseCsv(env["GIST_WHITELIST"]);
  const excludeRepositories = parseCsv(env["EXCLUDE_REPO"]) ?? [];

  currentConfig = normalizeConfig({
    whitelist,
    gistWhitelist,
    excludeRepositories,
    fetchMultiPageStars: env["FETCH_MULTI_PAGE_STARS"],
    pats: parsePATsFromEnv(env),
  });
};

loadConfigFromEnv();

export const getConfig = (): Config => currentConfig;
