import { describe, expect, it } from "vitest";

import {
  findInvalidColor,
  getCardColors,
  getLightDarkColors,
  isBareHexColor,
  isPrefixedHexColor,
  isValidGradient,
} from "../src/common/color.js";

describe("getCardColors", () => {
  it("should return expected values", () => {
    const colors = getCardColors({
      title_color: "f00",
      text_color: "0f0",
      ring_color: "0000ff",
      icon_color: "00f",
      bg_color: "fff",
      border_color: "fff",
      prog_bar_bg_color: "f0f",
      theme: "dark",
    });
    expect(colors).toStrictEqual({
      titleColor: "#f00",
      textColor: "#0f0",
      iconColor: "#00f",
      ringColor: "#0000ff",
      bgColor: "#fff",
      borderColor: "#fff",
      progBarBgColor: "#f0f",
    });
  });

  it("should fallback to default colors if color is invalid", () => {
    const colors = getCardColors({
      title_color: "invalidcolor",
      text_color: "0f0",
      icon_color: "00f",
      bg_color: "fff",
      border_color: "invalidColor",
      theme: "dark",
    });
    expect(colors).toStrictEqual({
      titleColor: "#2f80ed",
      textColor: "#0f0",
      iconColor: "#00f",
      ringColor: "#2f80ed",
      bgColor: "#fff",
      borderColor: "#e4e2e2",
      progBarBgColor: "#ddd",
    });
  });

  it("should fallback to specified theme colors if is not defined", () => {
    const colors = getCardColors({
      theme: "dark",
    });
    expect(colors).toStrictEqual({
      titleColor: "#fff",
      textColor: "#9f9f9f",
      ringColor: "#fff",
      iconColor: "#79ff97",
      bgColor: "#151515",
      borderColor: "#e4e2e2",
      progBarBgColor: "#ddd",
    });
  });

  it("should return ring color equal to title color if not ring color is defined", () => {
    const colors = getCardColors({
      title_color: "f00",
      text_color: "0f0",
      icon_color: "00f",
      bg_color: "fff",
      border_color: "fff",
      theme: "dark",
    });
    expect(colors).toStrictEqual({
      titleColor: "#f00",
      textColor: "#0f0",
      iconColor: "#00f",
      ringColor: "#f00",
      bgColor: "#fff",
      borderColor: "#fff",
      progBarBgColor: "#ddd",
    });
  });

  it("should fallback to default theme if theme is invalid", () => {
    const colors = getCardColors({
      theme: "invalidTheme",
    });
    expect(colors).toStrictEqual({
      titleColor: "#2f80ed",
      textColor: "#434d58",
      iconColor: "#4c71f2",
      ringColor: "#2f80ed",
      bgColor: "#fffefe",
      borderColor: "#e4e2e2",
      progBarBgColor: "#ddd",
    });
  });
});

describe("isPrefixedHexColor", () => {
  it("should validate hex colors with # prefix", () => {
    expect(isPrefixedHexColor("#f00")).toBe(true);
    expect(isPrefixedHexColor("#ffffff")).toBe(true);
    expect(isPrefixedHexColor("#12345678")).toBe(true);
    expect(isPrefixedHexColor("f00")).toBe(false);
    expect(isPrefixedHexColor("#red")).toBe(false);
    expect(isPrefixedHexColor("red")).toBe(false);
  });

  it("should reject non-string values", () => {
    expect(isPrefixedHexColor(null)).toBe(false);
    expect(isPrefixedHexColor(undefined)).toBe(false);
  });
});

describe("isBareHexColor", () => {
  it("should validate hex colors without # prefix", () => {
    expect(isBareHexColor("f00")).toBe(true);
    expect(isBareHexColor("ffffff")).toBe(true);
    expect(isBareHexColor("12345678")).toBe(true);
    expect(isBareHexColor("#f00")).toBe(false);
    expect(isBareHexColor("#red")).toBe(false);
    expect(isBareHexColor("red")).toBe(false);
  });

  it("should reject non-string values", () => {
    expect(isBareHexColor(null)).toBe(false);
    expect(isBareHexColor(undefined)).toBe(false);
  });
});

describe("isValidGradient", () => {
  it("should validate valid gradients", () => {
    expect(isValidGradient(["90", "f00", "0f0"])).toBe(true);
    expect(isValidGradient(["45", "fff", "000", "abc"])).toBe(true);
    expect(isValidGradient(["180", "ff0000", "00ff00", "0000ff"])).toBe(true);
  });

  it("should reject invalid gradients", () => {
    expect(isValidGradient(["90", "#f00", "#0f0"])).toBe(false); // # prefix not allowed
    expect(isValidGradient(["red", "f00", "0f0"])).toBe(false);
    expect(isValidGradient(["90", "f00"])).toBe(false); // too few colors
    expect(isValidGradient(["90"])).toBe(false);
    expect(isValidGradient(["", "f00", "0f0"])).toBe(false); // empty angle
    expect(isValidGradient(["90", "f00", "red"])).toBe(false); // invalid color
    expect(isValidGradient(["Infinity", "f00", "0f0"])).toBe(false); // non-finite angle
    expect(isValidGradient(["-Infinity", "f00", "0f0"])).toBe(false); // non-finite angle
    expect(isValidGradient(["abc", "f00", "0f0"])).toBe(false); // non-numeric angle
  });
});

describe("getLightDarkColors", () => {
  it("returns darkColors null when no mode-specific params are given", () => {
    const { lightColors, darkColors } = getLightDarkColors({
      title_color: "f00",
      theme: "cobalt",
    });
    expect(darkColors).toBeNull();
    expect(lightColors.titleColor).toBe("#f00");
  });

  it("lightColors equal base colors when only dark params are given", () => {
    const base = getCardColors({ theme: "cobalt" });
    const { lightColors } = getLightDarkColors({
      theme: "cobalt",
      title_color_dark: "0f0",
    });
    expect(lightColors).toStrictEqual(base);
  });

  it("lightColors use light-specific color override, darkColors use dark-specific", () => {
    const { lightColors, darkColors } = getLightDarkColors({
      title_color_light: "f00",
      title_color_dark: "0f0",
    });
    expect(lightColors.titleColor).toBe("#f00");
    expect(darkColors?.titleColor).toBe("#0f0");
  });

  it("theme_light sets the light mode base theme independently", () => {
    const radicalColors = getCardColors({ theme: "radical" });
    const { lightColors, darkColors } = getLightDarkColors({
      theme_light: "radical",
      theme_dark: "cobalt",
    });
    expect(lightColors).toStrictEqual(radicalColors);
    expect(darkColors).toStrictEqual(getCardColors({ theme: "cobalt" }));
  });

  it("mode-specific params win over general color param", () => {
    const { lightColors, darkColors } = getLightDarkColors({
      title_color: "f00",
      title_color_light: "0f0",
      title_color_dark: "00f",
    });
    expect(lightColors.titleColor).toBe("#0f0");
    expect(darkColors?.titleColor).toBe("#00f");
  });

  it("general theme param is used as base for both modes", () => {
    const { lightColors, darkColors } = getLightDarkColors({
      theme: "cobalt",
      title_color_dark: "0f0",
    });
    expect(lightColors).toStrictEqual(getCardColors({ theme: "cobalt" }));
    expect(darkColors?.titleColor).toBe("#0f0");
    expect(darkColors?.bgColor).toBe(
      getCardColors({ theme: "cobalt" }).bgColor,
    );
  });

  it("ring color follows title color when ring is not set explicitly", () => {
    const { darkColors } = getLightDarkColors({ title_color_dark: "0f0" });
    expect(darkColors?.ringColor).toBe("#0f0");
  });

  it("ring_color_dark can be set independently", () => {
    const { darkColors } = getLightDarkColors({
      title_color_dark: "0f0",
      ring_color_dark: "f0f",
    });
    expect(darkColors?.titleColor).toBe("#0f0");
    expect(darkColors?.ringColor).toBe("#f0f");
  });

  it("prog_bar_bg_color_dark overrides prog bar color for dark mode", () => {
    const { lightColors, darkColors } = getLightDarkColors({
      prog_bar_bg_color_dark: "333",
      title_color_dark: "fff",
    });
    expect(darkColors?.progBarBgColor).toBe("#333");
    expect(lightColors.progBarBgColor).toBe("#ddd"); // default
  });

  it("bg gradient works in dark mode", () => {
    const { darkColors } = getLightDarkColors({ bg_color_dark: "90,f00,0f0" });
    expect(darkColors?.bgColor).toStrictEqual(["90", "f00", "0f0"]);
  });

  it("mode-specific theme and color override general", () => {
    const { lightColors, darkColors } = getLightDarkColors({
      theme: "vue",
      theme_light: "radical",
      theme_dark: "cobalt",
      title_color: "f00",
      title_color_light: "0f0",
      title_color_dark: "00f",
    });
    expect(lightColors.titleColor).toBe("#0f0");
    expect(darkColors?.titleColor).toBe("#00f");
    expect(lightColors.bgColor).toBe(
      getCardColors({ theme: "radical" }).bgColor,
    );
    expect(darkColors?.bgColor).toBe(
      getCardColors({ theme: "cobalt" }).bgColor,
    );
  });
});

describe("findInvalidColor", () => {
  it("should return null for valid colors", () => {
    expect(
      findInvalidColor({
        title_color: "f00",
        text_color: "0f0",
        bg_color: "fff",
      }),
    ).toBeNull();
  });

  it("should return null for null/undefined values", () => {
    expect(
      findInvalidColor({
        title_color: null,
        text_color: undefined,
        bg_color: "fff",
      }),
    ).toBeNull();
  });

  it("should return the key of first invalid color", () => {
    expect(
      findInvalidColor({
        title_color: "0f0",
        text_color: "red",
        bg_color: "fff",
      }),
    ).toBe("text_color");
  });

  it("should validate gradients in color inputs", () => {
    expect(
      findInvalidColor({
        title_color: "90,f00,0f0",
        bg_color: "fff",
      }),
    ).toBeNull();
  });

  it("should reject invalid gradients in color inputs", () => {
    expect(
      findInvalidColor({
        title_color: "invalid,f00,0f0",
        bg_color: "fff",
      }),
    ).toBe("title_color");
  });
});
