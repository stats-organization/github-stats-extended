import { describe, expect, it } from "vitest";

import {
  dateDiff,
  getGitHubYearRange,
  toGitHubDateTime,
} from "../src/common/date.js";

describe("Test date.js", () => {
  it("should test dateDiff", () => {
    const a = new Date("2020-01-01T00:10:00Z");
    const b = new Date("2020-01-01T00:00:00Z");
    expect(dateDiff(a, b)).toBe(10);

    const c = new Date("2020-01-01T00:00:00Z");
    const d = new Date("2020-01-01T00:10:30Z");
    // rounds to nearest minute
    expect(dateDiff(c, d)).toBe(-10);
  });

  it("should test toGitHubDateTime", () => {
    expect(toGitHubDateTime(new Date(Date.UTC(2024, 0, 1)))).toBe(
      "2024-01-01T00:00:00Z",
    );
    // milliseconds are dropped, not rounded
    expect(toGitHubDateTime(new Date("2024-06-15T10:20:30.999Z"))).toBe(
      "2024-06-15T10:20:30Z",
    );
  });

  it("should test getGitHubYearRange", () => {
    const { from, to } = getGitHubYearRange(2024);
    expect(toGitHubDateTime(from)).toBe("2024-01-01T00:00:00Z");
    expect(toGitHubDateTime(to)).toBe("2024-12-31T23:59:59Z");
  });

  it("should cover a leap day", () => {
    const { from, to } = getGitHubYearRange(2024);
    const days = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
    expect(Math.ceil(days)).toBe(366);
  });
});
