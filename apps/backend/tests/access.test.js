import { describe, expect, it } from "vitest";

import { guardAccess } from "../src/common/access.js";

describe("Test guardAccess", () => {
  it("should block blacklisted users regardless of casing", () => {
    // "renovate-bot" is a standard blacklisted bot
    const lowerResult = guardAccess({
      id: "renovate-bot",
      type: "username",
      colors: {},
    });
    expect(lowerResult.isPassed).toBe(false);
    expect(lowerResult.result).toContain("This username is blacklisted");

    const mixedCaseResult = guardAccess({
      id: "Renovate-Bot",
      type: "username",
      colors: {},
    });
    expect(mixedCaseResult.isPassed).toBe(false);
    expect(mixedCaseResult.result).toContain("This username is blacklisted");
  });

  it("should enforce blacklist on wakatime requests", () => {
    const wakatimeResult = guardAccess({
      id: "Renovate-Bot",
      type: "wakatime",
      colors: {},
    });
    expect(wakatimeResult.isPassed).toBe(false);
    expect(wakatimeResult.result).toContain("This username is blacklisted");
  });

  it("should allow non-blacklisted users", () => {
    const validResult = guardAccess({
      id: "valid-developer-12345",
      type: "username",
      colors: {},
    });
    expect(validResult.isPassed).toBe(true);
  });
});
