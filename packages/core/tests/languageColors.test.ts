import { describe, expect, it } from "vitest";

import { getLanguageColor } from "../src/common/languageColors.js";

describe("getLanguageColor", () => {
  it("should return the correct color for a known language", () => {
    expect(getLanguageColor("JavaScript")).toBe("#f1e05a");
  });

  it("should be case-insensitive", () => {
    const expected = getLanguageColor("JavaScript");
    expect(getLanguageColor("javascript")).toBe(expected);
    expect(getLanguageColor("JAVASCRIPT")).toBe(expected);
    expect(getLanguageColor("jAvAsCrIpT")).toBe(expected);
  });

  it("should return the default color for unknown languages", () => {
    expect(getLanguageColor("NonExistentLang123")).toBe("#858585");
  });
});
