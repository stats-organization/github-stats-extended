import languageColorsJson from "./languageColors.json" with { type: "json" };

/** Shown for languages missing from the generated table, and for a null API color. */
const DEFAULT_LANG_COLOR = "#858585";

// The generated JSON types has literal keys; index it as a plain lookup table.
const languageColors: Record<string, string> = languageColorsJson;

/**
 * Resolves a language's brand color from the generated table.
 *
 * @param name Language name as GitHub spells it.
 * @returns The language's hex color, or the default gray when it is unknown.
 */
const getLanguageColor = (name: string): string => {
  return languageColors[name] ?? DEFAULT_LANG_COLOR;
};

export { DEFAULT_LANG_COLOR, getLanguageColor };
