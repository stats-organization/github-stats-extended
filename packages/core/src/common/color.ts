import { themes } from "../themes/index.js";

/** Matches a 3-, 4-, 6-, or 8-digit hex color with no leading `#`. */
const HEX_COLOR =
  /^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{3})$/;

/**
 * Checks if a value is a bare hex color, i.e. hex digits with no `#` prefix
 * (`"f00"`, `"ffffff"`). This is the form user-supplied color params and
 * gradient stops arrive in.
 *
 * @param value Value to check.
 * @returns True if the value is a bare hex color.
 */
const isBareHexColor = (value: unknown): boolean => {
  return typeof value === "string" && HEX_COLOR.test(value);
};

/**
 * Checks if a value is a `#`-prefixed hex color (`"#f00"`, `"#ffffff"`). This
 * is the form colors take once resolved by {@link getCardColors}, i.e. right
 * before they are written into the SVG.
 *
 * @param value Value to check.
 * @returns True if the value is a `#`-prefixed hex color.
 */
const isPrefixedHexColor = (value: unknown): boolean => {
  return (
    typeof value === "string" &&
    value.startsWith("#") &&
    HEX_COLOR.test(value.slice(1))
  );
};

/**
 * Checks if the given parts form a valid gradient: a finite numeric angle
 * followed by at least two bare-hex color stops, e.g. `["90", "f00", "0f0"]`.
 * The angle is written into the SVG `gradientTransform="rotate(...)"`.
 *
 * @param parts Gradient parts: `[angle, ...stops]`.
 * @returns True if the parts form a valid gradient.
 */
const isValidGradient = (parts: Array<string>): boolean => {
  const [angle, ...stops] = parts;
  return (
    stops.length >= 2 &&
    angle !== undefined &&
    angle.trim() !== "" &&
    Number.isFinite(Number(angle)) &&
    stops.every(isBareHexColor)
  );
};

/**
 * Checks if a string is a valid input for a color or gradient.
 *
 * @param color String to check, may be null or undefined.
 * @returns True if the given string is a valid input.
 */
const isValidColorInput = (color: string | null | undefined): boolean => {
  if (color === null || color === undefined) {
    return true;
  }
  return isValidGradient(color.split(",")) || isBareHexColor(color);
};

/**
 * Iterates over a collection of colors inputs and verifies that each is a valid color or gradient.
 *
 * @param colors Object whose values are checked as valid color inputs.
 * @return The first key where the associated input value is not valid. null if all inputs are valid.
 */
const findInvalidColor = (
  colors: Record<string, string | null | undefined>,
): string | null => {
  for (const [key, value] of Object.entries(colors)) {
    if (!isValidColorInput(value)) {
      return key;
    }
  }
  return null;
};

/**
 * Retrieves a gradient if color has more than one valid hex codes else a single color.
 *
 * @param color The color to parse.
 * @param fallbackColor The fallback color.
 * @returns The gradient or color.
 */
const fallbackColor = (
  color: string | undefined,
  fallbackColor: string | Array<string>,
): string | Array<string> => {
  const colors = color ? color.split(",") : [];
  if (colors.length > 1 && isValidGradient(colors)) {
    return colors;
  }

  if (color !== undefined && isBareHexColor(color)) {
    return `#${color}`;
  }

  return fallbackColor;
};

/**
 * Object containing card colors.
 */
interface CardColors {
  titleColor: string;
  iconColor: string;
  textColor: string;
  bgColor: string | Array<string>;
  borderColor: string;
  ringColor: string;
}

/**
 * Input color params shared by all card color functions.
 */
interface ColorInput {
  title_color?: string | undefined;
  text_color?: string | undefined;
  icon_color?: string | undefined;
  bg_color?: string | undefined;
  border_color?: string | undefined;
  ring_color?: string | undefined;
  theme?: string | undefined;
}

/**
 * Returns theme based colors with proper overrides and defaults.
 *
 * @param props Function arguments.
 * @param props.title_color Card title color.
 * @param props.text_color Card text color.
 * @param props.icon_color Card icon color.
 * @param props.bg_color Card background color.
 * @param props.border_color Card border color.
 * @param props.ring_color Card ring color.
 * @param props.theme Card theme.
 * @returns Card colors.
 */
const getCardColors = ({
  title_color,
  text_color,
  icon_color,
  bg_color,
  border_color,
  ring_color,
  theme,
}: ColorInput): CardColors => {
  const defaultTheme = themes.default;
  const isThemeProvided = theme !== undefined && theme in themes;

  const selectedTheme = isThemeProvided
    ? themes[theme as keyof typeof themes]
    : defaultTheme;

  const defaultBorderColor =
    "border_color" in selectedTheme
      ? selectedTheme.border_color
      : defaultTheme.border_color;

  // get the color provided by the user else the theme color
  // finally if both colors are invalid fallback to default theme
  const titleColor = fallbackColor(
    title_color || selectedTheme.title_color,
    "#" + defaultTheme.title_color,
  );

  // get the color provided by the user else the theme color
  // finally if both colors are invalid we use the titleColor
  // NOTE: no built-in theme defines `ring_color`, so it falls back to the title color.
  const ringColor = fallbackColor(ring_color, titleColor);
  const iconColor = fallbackColor(
    icon_color || selectedTheme.icon_color,
    "#" + defaultTheme.icon_color,
  );
  const textColor = fallbackColor(
    text_color || selectedTheme.text_color,
    "#" + defaultTheme.text_color,
  );
  const bgColor = fallbackColor(
    bg_color || selectedTheme.bg_color,
    "#" + defaultTheme.bg_color,
  );

  const borderColor = fallbackColor(
    border_color || defaultBorderColor,
    "#" + defaultBorderColor,
  );

  if (
    typeof titleColor !== "string" ||
    typeof textColor !== "string" ||
    typeof ringColor !== "string" ||
    typeof iconColor !== "string" ||
    typeof borderColor !== "string"
  ) {
    throw new Error(
      "Unexpected behavior, all colors except background should be string.",
    );
  }

  return { titleColor, iconColor, textColor, bgColor, borderColor, ringColor };
};

/**
 * Merges light/dark-specific color overrides on top of the base resolved
 * colors, applying the priority: light/dark-specific > general > theme > default.
 *
 * @param base Colors resolved from the general (non-mode-specific) params.
 * @param modeOverrides Mode-specific color params (e.g. `title_color_dark`).
 * @returns Merged colors for that mode.
 */
const applyModeOverrides = (
  base: CardColors,
  modeOverrides: ColorInput,
): CardColors => {
  const applyOverride = (
    overrideValue: string | undefined,
    baseValue: string,
  ): string => {
    if (overrideValue === undefined) return baseValue;
    const resolved = fallbackColor(overrideValue, baseValue);
    return typeof resolved === "string" ? resolved : baseValue;
  };

  const applyBgOverride = (
    overrideValue: string | undefined,
    baseValue: string | Array<string>,
  ): string | Array<string> => {
    if (overrideValue === undefined) return baseValue;
    return fallbackColor(overrideValue, baseValue);
  };

  const titleColor = applyOverride(modeOverrides.title_color, base.titleColor);

  return {
    titleColor,
    iconColor: applyOverride(modeOverrides.icon_color, base.iconColor),
    textColor: applyOverride(modeOverrides.text_color, base.textColor),
    bgColor: applyBgOverride(modeOverrides.bg_color, base.bgColor),
    borderColor: applyOverride(modeOverrides.border_color, base.borderColor),
    // ring_color_light/dark falls back to the (potentially overridden) title color
    ringColor: modeOverrides.ring_color !== undefined
      ? applyOverride(modeOverrides.ring_color, base.ringColor)
      : modeOverrides.title_color !== undefined
        ? titleColor
        : base.ringColor,
  };
};

/**
 * Returns the color inputs for the dark-mode-specific params, given a set of
 * raw query params that carry `_dark` or `_light` suffixes.
 *
 * @param params Raw query params with optional `_light` / `_dark` suffixes.
 * @param suffix `"_light"` or `"_dark"`.
 * @returns ColorInput with the suffix stripped, ready for `getCardColors`.
 */
const extractModeColors = (
  params: {
    title_color_light?: string;
    title_color_dark?: string;
    text_color_light?: string;
    text_color_dark?: string;
    icon_color_light?: string;
    icon_color_dark?: string;
    bg_color_light?: string;
    bg_color_dark?: string;
    border_color_light?: string;
    border_color_dark?: string;
    ring_color_light?: string;
    ring_color_dark?: string;
    theme_light?: string;
    theme_dark?: string;
    prog_bar_bg_color_light?: string;
    prog_bar_bg_color_dark?: string;
  },
  suffix: "_light" | "_dark",
): ColorInput => ({
  title_color: params[`title_color${suffix}`],
  text_color: params[`text_color${suffix}`],
  icon_color: params[`icon_color${suffix}`],
  bg_color: params[`bg_color${suffix}`],
  border_color: params[`border_color${suffix}`],
  ring_color: params[`ring_color${suffix}`],
  theme: params[`theme${suffix}`],
});

/**
 * Returns resolved colors for both light and dark mode given the full set of
 * general, light-specific, and dark-specific color params.
 *
 * Priority (lowest → highest):
 *   default theme → `theme` param → `theme_light`/`theme_dark` param
 *   → general color params → `*_light`/`*_dark` color params
 *
 * When no light/dark-specific params are provided at all, `darkColors` is
 * `null` (caller should skip the @media block entirely).
 *
 * @param general General color params (applied to both modes first).
 * @param modeParams Raw query params containing `_light` / `_dark` suffixed fields.
 * @returns `{ lightColors, darkColors }` — darkColors is null when no mode-specific params were given.
 */
const getDualModeColors = (
  general: ColorInput,
  modeParams: Parameters<typeof extractModeColors>[0],
): { lightColors: CardColors; darkColors: CardColors | null } => {
  const lightOverrides = extractModeColors(modeParams, "_light");
  const darkOverrides = extractModeColors(modeParams, "_dark");

  const hasModeOverrides = Object.values({ ...lightOverrides, ...darkOverrides }).some(
    (v) => v !== undefined,
  );

  // Resolve the base set from general params (theme + individual colors)
  const baseColors = getCardColors(general);

  if (!hasModeOverrides) {
    return { lightColors: baseColors, darkColors: null };
  }

  // For light mode: start from the base, then apply theme_light, then light-specific colors
  const lightBase = lightOverrides.theme !== undefined
    ? getCardColors({ ...lightOverrides })
    : baseColors;
  const lightColors = applyModeOverrides(lightBase, lightOverrides);

  // For dark mode: start from the base, then apply theme_dark, then dark-specific colors
  const darkBase = darkOverrides.theme !== undefined
    ? getCardColors({ ...darkOverrides })
    : baseColors;
  const darkColors = applyModeOverrides(darkBase, darkOverrides);

  // Re-apply general color overrides on top of mode-specific bases so that
  // explicit general params always win.
  const generalOnlyColors: ColorInput = {
    title_color: general.title_color,
    text_color: general.text_color,
    icon_color: general.icon_color,
    bg_color: general.bg_color,
    border_color: general.border_color,
    ring_color: general.ring_color,
  };

  return {
    lightColors: applyModeOverrides(lightColors, generalOnlyColors),
    darkColors: applyModeOverrides(darkColors, generalOnlyColors),
  };
};

export {
  fallbackColor,
  getCardColors,
  getDualModeColors,
  extractModeColors,
  findInvalidColor,
  isValidGradient,
  isBareHexColor,
  isPrefixedHexColor,
};
