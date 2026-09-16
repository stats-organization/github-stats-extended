import type { ThemeName } from "@stats-organization/github-readme-stats-core";

import { CardCategory } from "./CardType";

/**
 * Theme a card falls back to on a light or dark background.
 * Shared with the docs previews, so both halves of the site render a card the same way.
 */
export function getCardThemeDefault(
  isDark: boolean,
  category: CardCategory,
): ThemeName {
  if (category === CardCategory.REPO) {
    return isDark ? "dark_github_repocard" : "light_github_repocard";
  }
  return isDark ? "dark_github" : "light_github";
}
