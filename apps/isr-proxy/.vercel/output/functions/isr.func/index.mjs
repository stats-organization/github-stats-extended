// @ts-check

/**
 * The same hosts are hard-coded in the external rewrites in `../../config.json`.
 * Keep both places in sync.
 */
export const CONTAINER_HOSTS = {
  production: "github-stats-extended-internal.vercel.app",
  preview: "github-stats-extended-internal-preview.vercel.app",
};

/**
 * fly.io deployments that receive a share of the card requests. Environments
 * without an entry are always served by their Vercel container.
 *
 * @type {Partial<Record<keyof typeof CONTAINER_HOSTS, string>>}
 */
export const FLY_HOSTS = {
  production: "gh-stats-extended.fly.dev",
};

/** Share of card requests (0 to 1) that are randomly routed to `FLY_HOSTS`. */
export const FLY_SHARE = 0.3;

/** Allowed `__card` values. Set in `../../config.json`. */
const CARDS = new Set(["", "pin", "top-langs", "gist", "wakatime"]);

/** Query parameters added by `../../config.json`. Not forwarded to the container. */
const INTERNAL_PARAMS = ["__card", "__env"];

/** Request headers the container reads for card routes. */
const FORWARDED_REQUEST_HEADERS = ["x-bypass-store"];

/** Response headers needed by clients. */
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "cache-control",
  "pragma",
  "expires",
];

/**
 * Checks whether `env` is a key of `CONTAINER_HOSTS`.
 *
 * @param {string} env The `__env` value.
 * @returns {env is keyof typeof CONTAINER_HOSTS} Whether `env` is a known environment.
 */
const isEnv = (env) => Object.hasOwn(CONTAINER_HOSTS, env);

/**
 * Builds the container URL for an incoming request.
 *
 * The client's query string is forwarded verbatim rather than re-serialized, so the
 * container stores exactly the URL the client requested for `/api/repeat-recent`.
 *
 * @param {string} requestUrl Path and query of the incoming request, e.g. `/isr?username=x&__card=pin&__env=production`.
 * @param {boolean} [useFly] Whether to target the fly.io deployment of `__env` (see `FLY_HOSTS`) instead of its Vercel container.
 * @returns {string | null} The container URL, or `null` if `__card` or `__env` is missing or unknown, or if `useFly` is set and `__env` has no fly.io deployment.
 */
export const getUpstreamUrl = (requestUrl, useFly = false) => {
  const queryStart = requestUrl.indexOf("?");
  const rawQuery = queryStart === -1 ? "" : requestUrl.slice(queryStart + 1);
  const params = new URLSearchParams(rawQuery);
  const card = params.get("__card");
  const env = params.get("__env");
  if (card === null || env === null || !CARDS.has(card) || !isEnv(env)) {
    return null;
  }
  const host = useFly ? FLY_HOSTS[env] : CONTAINER_HOSTS[env];
  if (host === undefined) {
    return null;
  }

  const forwardedQuery = rawQuery
    .split("&")
    .filter(
      (pair) =>
        pair !== "" && !INTERNAL_PARAMS.includes(pair.split("=", 1)[0] ?? ""),
    )
    .join("&");

  return (
    `https://${host}/api${card === "" ? "" : `/${card}`}` +
    (forwardedQuery === "" ? "" : `?${forwardedQuery}`)
  );
};

/**
 * Fetches a URL and reads the whole response body.
 *
 * @param {string} url The URL to fetch.
 * @param {Record<string, string>} headers Request headers.
 * @returns {Promise<{ upstream: Response, body: Buffer }>} The response and its body.
 */
const fetchUpstream = async (url, headers) => {
  const upstream = await fetch(url, { headers, redirect: "error" });
  return { upstream, body: Buffer.from(await upstream.arrayBuffer()) };
};

/**
 * Prerender function handler: fetches the card from the container and returns it.
 *
 * For environments listed in `FLY_HOSTS`, `FLY_SHARE` of the requests are sent to
 * fly.io; if that fails or returns HTTP 5xx, the Vercel container is used instead.
 *
 * @param {import("node:http").IncomingMessage} req The request.
 * @param {import("node:http").ServerResponse} res The response.
 * @returns {Promise<void>} Nothing.
 */
export default async (req, res) => {
  const vercelUrl = getUpstreamUrl(req.url ?? "");
  if (vercelUrl === null) {
    res.statusCode = 404;
    res.end("Not Found");
    return;
  }

  /** @type {Record<string, string>} */
  const headers = {};
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers[name];
    if (typeof value === "string") {
      headers[name] = value;
    }
  }

  /** @type {{ upstream: Response, body: Buffer } | undefined} */
  let result;
  const flyUrl =
    Math.random() < FLY_SHARE ? getUpstreamUrl(req.url ?? "", true) : null;
  if (flyUrl !== null) {
    try {
      const flyResult = await fetchUpstream(flyUrl, headers);
      if (flyResult.upstream.status >= 500) {
        throw new Error(`fly.io returned HTTP ${flyResult.upstream.status}`);
      }
      result = flyResult;
    } catch (err) {
      console.error(
        `Error fetching ${flyUrl}, falling back to ${vercelUrl}:`,
        err,
      );
    }
  }

  if (result === undefined) {
    try {
      result = await fetchUpstream(vercelUrl, headers);
    } catch (err) {
      // A failed revalidation makes Vercel keep serving the previously cached card.
      console.error(`Error fetching ${vercelUrl}:`, err);
      res.statusCode = 502;
      res.end("Bad Gateway");
      return;
    }
  }

  const { upstream, body } = result;

  res.statusCode = upstream.status;
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value !== null) {
      res.setHeader(name, value);
    }
  }
  res.end(body);
};
