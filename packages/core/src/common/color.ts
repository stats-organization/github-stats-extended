import { themes } from "../themes/index.js";

/**
 * Checks if a string is a valid hex color.
 *
 * @param hexColor String to check.
 * @returns True if the given string is a valid hex color.
 */
const isValidHexColor = (hexColor: string): boolean => {
  return new RegExp(
    /^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/,
  ).test(hexColor);
};

/**
 * Check if the given string is a valid gradient.
 *
 * @param colors Array of colors.
 * @returns True if the given string is a valid gradient.
 */
const isValidGradient = (colors: Array<string>): boolean => {
  return (
    colors.length > 2 &&
    colors.slice(1).every((color) => isValidHexColor(color))
  );
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

  if (color !== undefined && isValidHexColor(color)) {
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
}: {
  title_color?: string | undefined;
  text_color?: string | undefined;
  icon_color?: string | undefined;
  bg_color?: string | undefined;
  border_color?: string | undefined;
  ring_color?: string | undefined;
  theme?: string | undefined;
}): CardColors => {
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

export { fallbackColor, getCardColors };
