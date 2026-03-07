export const CardType = {
  STATS: "stats",
  TOP_LANGS: "top-langs",
  PIN: "pin",
  GIST: "gist",
  WAKATIME: "wakatime",
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];
