import { describe, expect, it } from "vitest";

import { I18n } from "../src/common/I18n.js";
import { isLocaleAvailable, statCardLocales } from "../src/translations.js";

describe("I18n", () => {
  it("should return translated string", () => {
    const i18n = new I18n({
      locale: "en",
      translations: statCardLocales({ name: "Anurag Hazra", apostrophe: "s" }),
    });
    expect(i18n.t("statcard.title")).toBe("Anurag Hazra's GitHub Stats");
  });

  it("should return translated string for Korean (ko)", () => {
    const i18n = new I18n({
      locale: "ko",
      translations: statCardLocales({ name: "Anurag Hazra", apostrophe: "" }),
    });
    expect(i18n.t("statcard.title")).toBe("Anurag Hazra의 GitHub 통계");
  });

  it("should throw error if translation string not found", () => {
    const i18n = new I18n({
      locale: "en",
      translations: statCardLocales({ name: "Anurag Hazra", apostrophe: "s" }),
    });
    expect(
      // @ts-expect-error using a non-existing key should be reported by ts
      () => i18n.t("statcard.title1"),
    ).toThrow("statcard.title1 Translation string not found");
  });

  it("should fall back to English if translation is missing for requested locale", () => {
    const i18n = new I18n({
      locale: "fr",
      translations: {
        "statcard.new-stat": {
          en: "English Only Stat",
        },
      },
    });
    expect(i18n.t("statcard.new-stat")).toBe("English Only Stat");
  });

  it("should throw error if translation not found for locale and fallback", () => {
    const i18n = new I18n({
      locale: "asdf",
      translations: {
        "statcard.title": {
          fr: "Statistiques",
        },
      },
    });
    expect(() => i18n.t("statcard.title")).toThrow(
      "'statcard.title' translation not found for locale 'asdf'",
    );
  });

  it("should support both ko and kr locales", () => {
    expect(isLocaleAvailable("ko")).toBe(true);
    expect(isLocaleAvailable("kr")).toBe(true);
  });
});
