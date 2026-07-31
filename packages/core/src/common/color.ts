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
  progBarBgColor: string;
}

/**
 * Input color params shared by all card color functions. Not every field is
 * consumed by every card (e.g. `prog_bar_bg_color` is only used by the
 * top-languages card's `normal` layout).
 */
interface ColorInput {
  title_color?: string | undefined;
  text_color?: string | undefined;
  icon_color?: string | undefined;
  bg_color?: string | undefined;
  border_color?: string | undefined;
  ring_color?: string | undefined;
  prog_bar_bg_color?: string | undefined;
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
 * @param props.prog_bar_bg_color Progress bar background color.
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
  prog_bar_bg_color,
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
  // no theme defines `ring_color`, so it falls back to the title color.
  const ringColor = fallbackColor(ring_color, titleColor);
  // no theme defines `prog_bar_bg_color`, so it falls back to "#ddd".
  const progBarBgColor = fallbackColor(prog_bar_bg_color, "#ddd");

  if (
    typeof titleColor !== "string" ||
    typeof textColor !== "string" ||
    typeof ringColor !== "string" ||
    typeof progBarBgColor !== "string" ||
    typeof iconColor !== "string" ||
    typeof borderColor !== "string"
  ) {
    throw new Error(
      "Unexpected behavior, all colors except background should be string.",
    );
  }

  return {
    titleColor,
    iconColor,
    textColor,
    bgColor,
    borderColor,
    ringColor,
    progBarBgColor,
  };
};

interface ModeColorParams {
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
}

/**
 * Returns the light- or dark-mode-specific color params, given a set of
 * raw query params. Also removes the "_light" or "_dark" suffixes.
 *
 * @param params Raw query params with optional `_light` / `_dark` suffixes.
 * @param suffix `"_light"` or `"_dark"`.
 * @returns ColorInput with the suffix stripped, ready for `getCardColors`.
 */
const extractModeColors = (
  params: ModeColorParams,
  suffix: "_light" | "_dark",
): ColorInput => ({
  title_color: params[`title_color${suffix}`],
  text_color: params[`text_color${suffix}`],
  icon_color: params[`icon_color${suffix}`],
  bg_color: params[`bg_color${suffix}`],
  border_color: params[`border_color${suffix}`],
  ring_color: params[`ring_color${suffix}`],
  prog_bar_bg_color: params[`prog_bar_bg_color${suffix}`],
  theme: params[`theme${suffix}`],
});

/**
 * Returns resolved colors for both light and dark mode given all input params.
 *
 * Priority (lowest -> highest):
 *   default theme -> `theme` param -> `theme_light`/`theme_dark` param
 *   -> general color params -> `*_light`/`*_dark` color params
 *
 * When no light/dark-specific params are provided at all, `darkColors` is
 * `null`.
 *
 * @param params Raw query params, containing both general and `_light`/`_dark` suffixed colors and themes.
 * @returns `{ lightColors, darkColors }`, resolved colors for both light and dark mode
 */
const getLightDarkColors = (
  params: ColorInput & Parameters<typeof extractModeColors>[0],
): { lightColors: CardColors; darkColors: CardColors | null } => {
  const lightOverrides = extractModeColors(params, "_light");
  const darkOverrides = extractModeColors(params, "_dark");

  const hasModeOverrides = Object.values({
    ...lightOverrides,
    ...darkOverrides,
  }).some((v) => v !== undefined);

  if (!hasModeOverrides) {
    return { lightColors: getCardColors(params), darkColors: null };
  }

  const defined = (obj: ColorInput): ColorInput =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

  return {
    lightColors: getCardColors({ ...params, ...defined(lightOverrides) }),
    darkColors: getCardColors({ ...params, ...defined(darkOverrides) }),
  };
};

export {
  getCardColors,
  getLightDarkColors,
  findInvalidColor,
  isValidGradient,
  isBareHexColor,
  isPrefixedHexColor,
};
