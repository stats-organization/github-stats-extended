export const CardType = {
  STATS: "stats",
  TOP_LANGS: "top-langs",
  PIN: "pin",
  GIST: "gist",
  WAKATIME: "wakatime",
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

export const CardCategory = {
  /**
   * Cards describing a single repo or gist.
   * They accept `show_owner` and use the `_repocard` theme variants.
   */
  REPO: "repo",
  /**
   * Cards describing a user: stats, top languages and WakaTime.
   */
  USER: "user",
} as const;
export type CardCategory = (typeof CardCategory)[keyof typeof CardCategory];

/**
 * Category each card belongs to.
 *
 * Exhaustive by construction: a new {@link CardType} will not compile until it
 * is categorised here, rather than silently falling into one of the branches.
 */
export const CATEGORY_BY_CARD_TYPE: Record<CardType, CardCategory> = {
  [CardType.STATS]: CardCategory.USER,
  [CardType.TOP_LANGS]: CardCategory.USER,
  [CardType.WAKATIME]: CardCategory.USER,
  [CardType.PIN]: CardCategory.REPO,
  [CardType.GIST]: CardCategory.REPO,
};
