import { themes } from "@stats-organization/github-readme-stats-core";

// Cards sit on one of two backdrops, picked by how dark the card's theme is, so
// previews read as a consistent two-tone set rather than a rainbow.
const LIGHT_CARD_BG = "#ffffff";
const DARK_CARD_BG = "#0d1117";

/**
 * Whether a theme's `bg_color` (a hex string or an `angle,c1,c2,…` gradient)
 * is dark, based on its perceived luminance. Fully transparent backgrounds
 * count as light.
 */
function isDarkBg(bgColor: string): boolean {
  const parts = bgColor.split(",");
  // For gradients use the first color stop (index 0 is the angle).
  const hex = (parts.length > 1 ? parts[1] : parts[0]) ?? "";
  if (hex.length < 6 || (hex.length === 8 && hex.endsWith("00"))) {
    return false;
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/** The backdrop color a card rendered with the given theme should sit on. */
export function getCardThemeBackdrop(themeName: string): string {
  const theme = themes[themeName as keyof typeof themes];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!theme) {
    return LIGHT_CARD_BG;
  }
  return isDarkBg(theme.bg_color) ? DARK_CARD_BG : LIGHT_CARD_BG;
}
