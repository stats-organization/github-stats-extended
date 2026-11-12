// @ts-check

/**
 * The same hosts are hard-coded in the external rewrites in `../../config.json`.
 * Keep both places in sync.
 */
export const CONTAINER_HOSTS = {
  production: "github-stats-extended-internal.vercel.app",
  preview: "github-stats-extended-internal-preview.vercel.app",
};

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
 * @returns {string | null} The container URL, or `null` if `__card` or `__env` is missing or unknown.
 */
export const getUpstreamUrl = (requestUrl) => {
  const queryStart = requestUrl.indexOf("?");
  const rawQuery = queryStart === -1 ? "" : requestUrl.slice(queryStart + 1);
  const params = new URLSearchParams(rawQuery);
  const card = params.get("__card");
  const env = params.get("__env");
  if (card === null || env === null || !CARDS.has(card) || !isEnv(env)) {
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
    `https://${CONTAINER_HOSTS[env]}/api${card === "" ? "" : `/${card}`}` +
    (forwardedQuery === "" ? "" : `?${forwardedQuery}`)
  );
};

/**
 * Prerender function handler: fetches the card from the container and returns it.
 *
 * @param {import("node:http").IncomingMessage} req The request.
 * @param {import("node:http").ServerResponse} res The response.
 * @returns {Promise<void>} Nothing.
 */
export default async (req, res) => {
  const upstreamUrl = getUpstreamUrl(req.url ?? "");
  if (upstreamUrl === null) {
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

  let upstream;
  let body;
  try {
    upstream = await fetch(upstreamUrl, { headers, redirect: "error" });
    body = Buffer.from(await upstream.arrayBuffer());
  } catch (err) {
    // A failed revalidation makes Vercel keep serving the previously cached card.
    console.error(`Error fetching ${upstreamUrl}:`, err);
    res.statusCode = 502;
    res.end("Bad Gateway");
    return;
  }

  res.statusCode = upstream.status;
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value !== null) {
      res.setHeader(name, value);
    }
  }
  res.end(body);
};
