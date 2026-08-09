import { themes } from "@stats-organization/github-readme-stats-core";

// We use the same background colors here which GitHub uses.
export const LIGHT_CARD_BG = "#ffffff";
const DARK_CARD_BG = "#0d1117";

// Themes that look good in either mode (their text/icon colors read on both a
// light and a dark backdrop), so their backdrop follows the app theme. Note we
// only list themes that are genuinely mode-agnostic here: other transparent
// themes (e.g. shadow_*) have dark text and must stay on a light backdrop.
const ADAPTIVE_THEMES = ["transparent", "ambient_gradient"];

/** Expand a shorthand `#abc` hex to `#aabbcc`. */
function expandHex(hex: string): string {
  if (hex.length === 3) {
    return hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return hex;
}

/** Whether a hex color (3-, 6- or 8-digit) is dark by perceived luminance. */
function isDarkHex(hex: string): boolean {
  const normalized = expandHex(hex);
  if (normalized.length < 6) {
    return false;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/** Whether a theme's `bg_color` (hex or `angle,c1,c2,…` gradient) is dark. */
function isDarkBg(bgColor: string): boolean {
  const parts = bgColor.split(",");
  // For gradients use the first color stop (index 0 is the angle).
  return isDarkHex((parts.length > 1 ? parts[1] : parts[0]) ?? "");
}

/** A theme whose backdrop should follow the app mode rather than its own bg. */
function isAdaptiveTheme(themeName: string): boolean {
  return ADAPTIVE_THEMES.includes(themeName);
}

/**
 * Whether the backdrop a card actually gets is dark, for the given app mode.
 * Adaptive themes follow the app mode; the rest follow their own background.
 */
function isCardBackdropDark(themeName: string, appIsDark: boolean): boolean {
  const theme = themes[themeName as keyof typeof themes];
  if (isAdaptiveTheme(themeName)) {
    return appIsDark;
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!theme) {
    return appIsDark;
  }
  return isDarkBg(theme.bg_color);
}

/**
 * Sort rank for the theme grid: light themes first (0), adaptive themes in the
 * middle (1), dark themes last (2). Adaptive cards sit between the groups so
 * they blend with whichever side matches their backdrop in the current mode.
 */
export function getThemeSortRank(themeName: string): number {
  if (isAdaptiveTheme(themeName)) {
    return 1;
  }
  const theme = themes[themeName as keyof typeof themes];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!theme) {
    return 0;
  }
  return isDarkBg(theme.bg_color) ? 2 : 0;
}

/** The backdrop color a card rendered with the given theme should sit on. */
export function getCardThemeBackdrop(
  themeName: string,
  appIsDark: boolean,
): string {
  return isCardBackdropDark(themeName, appIsDark)
    ? DARK_CARD_BG
    : LIGHT_CARD_BG;
}
