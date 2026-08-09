import { describe, expect, it } from "vitest";

import { slugify } from "./slugify";

describe("slugify", () => {
  it("matches the anchors GitHub generates", () => {
    expect(slugify("Run It Yourself")).toBe("run-it-yourself");
    expect(slugify("Migration from github-readme-stats")).toBe(
      "migration-from-github-readme-stats",
    );
    expect(slugify("What's new?")).toBe("whats-new");
  });
});
