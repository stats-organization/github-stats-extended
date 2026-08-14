type Env = Record<string, string | undefined>;

interface PersonalAccessToken {
  name: string;
  value: string;
}

interface Config {
  whitelist: Array<string> | undefined;
  gistWhitelist: Array<string> | undefined;
  excludeRepositories: Array<string>;
  /** Max pages of starred repos to fetch; `Infinity` means every page, `1` only the first. */
  fetchMultiPageStars: number;
  pats: Array<PersonalAccessToken>;
}

/**
 * @param value Comma-separated string.
 * @returns Parsed string values.
 */
const parseCsv = (value: string | undefined): Array<string> | undefined =>
  value ? value.split(",") : undefined;

/**
 * @param value Raw `FETCH_MULTI_PAGE_STARS` value.
 * @returns Page limit: `"true"` means every page, a positive number caps the pages, anything else means one.
 */
const parseFetchMultiPageStars = (value: string | undefined): number => {
  if (value === "true") {
    return Infinity;
  }
  const limit = Number(value);
  return limit > 0 ? limit : 1;
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

let currentConfig: Config;

/**
 * @param env Environment variables used to build the runtime config.
 */
export const loadConfigFromEnv = (env: Env = getDefaultEnv()): void => {
  currentConfig = {
    whitelist: parseCsv(env["WHITELIST"]),
    gistWhitelist: parseCsv(env["GIST_WHITELIST"]),
    excludeRepositories: parseCsv(env["EXCLUDE_REPO"]) ?? [],
    fetchMultiPageStars: parseFetchMultiPageStars(
      env["FETCH_MULTI_PAGE_STARS"],
    ),
    pats: parsePATsFromEnv(env),
  };
};

loadConfigFromEnv();

export const getConfig = (): Config => currentConfig;
