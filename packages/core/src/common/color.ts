import { themes } from "../themes/index.js";
import type { ThemeName } from "../themes/index.js";

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
 * Every color param a card accepts, before any `_light` / `_dark` suffix.
 *
 * Single source of truth: the param types and {@link COLOR_PARAM_KEYS} are all
 * derived from this, so adding a param here is enough.
 */
const BASE_COLOR_KEYS = [
  "title_color",
  "icon_color",
  "text_color",
  "bg_color",
  "border_color",
  "ring_color",
  "prog_bar_bg_color",
  "theme",
] as const;

const THEME_VARIANTS = ["light", "dark"] as const;

type BaseColorKey = (typeof BASE_COLOR_KEYS)[number];
type ThemeVariant = (typeof THEME_VARIANTS)[number];

/**
 * Object with all input color params. Not every field is consumed by every card
 * (e.g. `prog_bar_bg_color` is only used by the top-languages card's `normal`
 * layout).
 */
type ColorInput = Partial<Record<BaseColorKey, string | undefined>>;

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
    ? themes[theme as ThemeName]
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
  // No theme defines `ring_color`, so it falls back to the title color.
  const ringColor = fallbackColor(ring_color, titleColor);
  // No theme defines `prog_bar_bg_color`, so it falls back to "#ddd".
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

type LightDarkColorParams = Partial<
  Record<`${BaseColorKey}_${ThemeVariant}`, string | undefined>
>;

/**
 * Returns the light- or dark-mode-specific color params, given a set of
 * raw query params. Also removes the "_light" or "_dark" suffixes.
 *
 * @param params Raw query params with optional `_light` / `_dark` suffixes.
 * @param suffix `"_light"` or `"_dark"`.
 * @returns ColorInput with the suffix stripped, ready for `getCardColors`.
 */
const extractLightDarkColors = (
  params: LightDarkColorParams,
  suffix: `_${ThemeVariant}`,
): ColorInput =>
  Object.fromEntries(
    BASE_COLOR_KEYS.map((key) => [key, params[`${key}${suffix}`]]),
  );

/**
 * Returns resolved colors for both light and dark mode given all input params.
 *
 * Each mode resolves independently, then runs the normal `getCardColors` precedence
 * (explicit color -> theme color -> default theme):
 *   light: `theme_light ?? theme`, with `*_light` params overriding general ones
 *   dark:  `theme_dark  ?? theme`, with `*_dark`  params overriding general ones
 *
 * Anything a mode does not override falls back to the general params,
 * so a partial override such as `bg_color_dark` alone keeps every other color from the base theme.
 *
 * When no `_light` / `_dark` param is provided at all, `darkColors` is `null` and the caller emits no dark-mode block.
 *
 * @param params Raw query params, containing both general and `_light`/`_dark` suffixed colors and themes.
 * @returns `{ lightColors, darkColors }`, resolved colors for both light and dark mode
 */
const getLightDarkColors = (
  params: ColorInput & LightDarkColorParams,
): { lightColors: CardColors; darkColors: CardColors | null } => {
  const lightOverrides = extractLightDarkColors(params, "_light");
  const darkOverrides = extractLightDarkColors(params, "_dark");

  const hasModeOverrides =
    Object.values(lightOverrides).some((v) => v !== undefined) ||
    Object.values(darkOverrides).some((v) => v !== undefined);

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

type ColorParams = ColorInput & LightDarkColorParams;

const COLOR_PARAM_KEYS: ReadonlyArray<keyof ColorParams> = [
  ...BASE_COLOR_KEYS,
  ...THEME_VARIANTS.flatMap((variant) =>
    BASE_COLOR_KEYS.map((key) => `${key}_${variant}` as const),
  ),
];

/**
 * Picks all color-related parameters from a query object.
 *
 * @param query Raw query parameters.
 * @returns All color-related parameters.
 */
const pickColorParams = (
  query: Record<string, string | undefined>,
): ColorParams =>
  Object.fromEntries(
    COLOR_PARAM_KEYS.filter((k) => k in query).map((k) => [k, query[k]]),
  );

/** Params naming a theme rather than holding a color value. */
const THEME_PARAM_KEYS: ReadonlyArray<keyof ColorParams> = [
  "theme",
  ...THEME_VARIANTS.map((variant) => `theme_${variant}` as const),
];

/**
 * Finds the first color param holding an invalid color.
 *
 * Theme params are skipped: they name a theme, and an unknown name falls back
 * to the default rather than being an error.
 *
 * @param params Color params, as returned by {@link pickColorParams}.
 * @returns The first invalid param name, or null if all are valid.
 */
const findInvalidColorParam = (params: ColorParams): string | null =>
  findInvalidColor(
    Object.fromEntries(
      Object.entries(params).filter(
        ([key]) => !THEME_PARAM_KEYS.includes(key as keyof ColorParams),
      ),
    ),
  );

export {
  getCardColors,
  getLightDarkColors,
  findInvalidColor,
  findInvalidColorParam,
  pickColorParams,
  isValidGradient,
  isBareHexColor,
  isPrefixedHexColor,

  // Not re-exported from the package index: internal,
  // exposed so tests can pin the accepted param list.
  BASE_COLOR_KEYS,
  THEME_VARIANTS,
  COLOR_PARAM_KEYS,
};
