import languageColorsJson from "./languageColors.json" with { type: "json" };

/** Shown for languages missing from the generated table, and for a null API color. */
const DEFAULT_LANG_COLOR = "#858585";

// Build a case-insensitive lookup from the generated JSON.
const languageColors = new Map<string, string>(
  Object.entries(languageColorsJson as Record<string, string>).map(([k, v]) => [
    k.toLowerCase(),
    v,
  ]),
);

/**
 * Resolves a language's brand color from the generated table.
 * The lookup is case-insensitive.
 *
 * @param name Language name.
 * @returns The language's hex color, or the default gray when it is unknown.
 */
const getLanguageColor = (name: string): string => {
  return languageColors.get(name.toLowerCase()) ?? DEFAULT_LANG_COLOR;
};

export { DEFAULT_LANG_COLOR, getLanguageColor };
