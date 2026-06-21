const FALLBACK_LOCALE = "en";

/**
 * I18n translation class.
 */
class I18n<Translations extends Record<string, Record<string, string>>> {
  locale: string;
  translations: Translations;

  /**
   * @param props Constructor arguments.
   * @param props.locale Locale.
   * @param props.translations Translations.
   */
  constructor({
    locale,
    translations,
  }: {
    locale?: string;
    translations: Translations;
  }) {
    this.locale = locale || FALLBACK_LOCALE;
    this.translations = translations;
  }

  /**
   * Get translation.
   *
   * @param str String to translate.
   * @returns Translated string.
   */
  t(str: keyof Translations & string): string {
    const translation = this.translations[str];
    if (!translation) {
      throw new Error(`${str} Translation string not found`);
    }

    const localized = translation[this.locale];
    if (!localized) {
      throw new Error(
        `'${str}' translation not found for locale '${this.locale}'`,
      );
    }

    return localized;
  }
}

export { I18n };
