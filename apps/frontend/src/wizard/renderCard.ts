import {
  api,
  gist,
  pin,
  topLangs,
  wakatime,
} from "@stats-organization/github-readme-stats-core";

/**
 * What a core api handler returns:
 * a rendered card, or a rendered error card.
 */
interface CardResult {
  status: string;
  content: string;
}

/** Core's api handlers are still JavaScript, so every param they destructure is inferred as required. */
type CardHandler = (query: Record<string, string>) => Promise<CardResult>;

const CARD_HANDLERS: Record<string, CardHandler | undefined> = {
  "/api": api as CardHandler,
  "/api/gist": gist as CardHandler,
  "/api/pin": pin as CardHandler,
  "/api/top-langs": topLangs as CardHandler,
  "/api/wakatime": wakatime as CardHandler,
};

/**
 * Renders a card in the browser from the URL the wizard built for it.
 * The wizard's PAT arrives through `loadConfigFromEnv` instead.
 *
 * @param url - Absolute card URL, e.g. `https://host/api/top-langs?username=x`.
 * @returns The rendered card, or the rendered error card when a param is rejected.
 * @throws When `url` is not one of the card endpoints.
 */
export async function renderCard(url: string): Promise<CardResult> {
  const { pathname, searchParams } = new URL(url);

  const handler = CARD_HANDLERS[pathname];
  if (!handler) {
    throw new Error(`No card renderer for "${pathname}"`);
  }

  return handler(Object.fromEntries(searchParams));
}
