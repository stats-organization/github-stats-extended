import { describe, expect, it } from "vitest";

import {
  findInvalidColor,
  getCardColors,
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
      theme: "dark",
    });
    expect(colors).toStrictEqual({
      titleColor: "#f00",
      textColor: "#0f0",
      iconColor: "#00f",
      ringColor: "#0000ff",
      bgColor: "#fff",
      borderColor: "#fff",
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
