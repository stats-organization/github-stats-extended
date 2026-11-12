import { describe, expect, it } from "vitest";

import { icons, rankIcon } from "../src/common/icons.js";

describe("icons", () => {
  it("exposes the expected icon set", () => {
    expect(Object.keys(icons).sort()).toEqual([
      "comments",
      "commits",
      "contribs",
      "contributions",
      "discussions_answered",
      "discussions_started",
      "fork",
      "gist",
      "icon",
      "issues",
      "prs",
      "prs_merged",
      "prs_merged_percentage",
      "reviews",
      "star",
    ]);
  });

  it("every icon is a non-empty SVG path", () => {
    for (const [name, svg] of Object.entries(icons)) {
      expect(svg.startsWith("<path "), name).toBe(true);
      expect(svg, name).toContain('d="');
    }
  });
});

describe("rankIcon", () => {
  it("renders the GitHub logo variant", () => {
    expect(rankIcon("github", "A+", 1.5)).toContain(
      'data-testid="github-rank-icon"',
    );
  });

  it("renders the percentile variant with one decimal place", () => {
    const svg = rankIcon("percentile", "A", 12.34);
    expect(svg).toContain("Top");
    expect(svg).toContain("12.3%");
  });

  it("renders the rank level for the default variant", () => {
    const svg = rankIcon("default", "S", 0.5);
    expect(svg).toContain('data-testid="level-rank-icon"');
    expect(svg).toContain("S");
  });

  it("falls back to the rank level for unknown variants", () => {
    const svg = rankIcon("unknown", "B+", 99);
    expect(svg).toContain('data-testid="level-rank-icon"');
    expect(svg).toContain("B+");
  });
});
