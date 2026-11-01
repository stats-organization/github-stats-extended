import fs from "fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("generate-theme-readme", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates the appropriate themes and usable links for both card tables", async () => {
    // @ts-expect-error -- This script is executed directly as TypeScript.
    await import("../../../scripts/generate-theme-readme.ts");

    expect(fs.writeFileSync).toHaveBeenCalledOnce();
    const call = vi.mocked(fs.writeFileSync).mock.calls[0];
    if (!call) {
      throw new Error("Expected generated theme documentation");
    }
    const [destination, contents] = call;
    if (typeof destination !== "string" || typeof contents !== "string") {
      throw new Error("Expected a file path and Markdown text");
    }
    expect(destination.replaceAll("\\", "/")).toMatch(
      /\/apps\/frontend\/src\/content\/docs\/docs\/customization\/themes\.md$/,
    );

    const markdown = contents;
    const [, afterStats] = markdown.split("## Stats");
    const [statsTable, repoAndLinks] = (afterStats ?? "").split("## Repo Card");
    const repoTable = (repoAndLinks ?? "").split(/\n\n\[/)[0] ?? "";

    expect(statsTable).toContain("`default` ![default][default]");
    expect(statsTable).not.toContain("`default_repocard`");
    expect(repoTable).toContain(
      "`default_repocard` ![default_repocard][default_repocard_repo]",
    );
    expect(repoTable).not.toContain("`default` ![default][default_repo]");
    expect(statsTable).toContain("`transparent` ![transparent][transparent]");
    expect(repoTable).toContain(
      "`transparent` ![transparent][transparent_repo]",
    );
    expect(markdown).toContain(
      "[default]: /api?username=anuraghazra&show_icons=true&hide=contribs,prs&cache_seconds=86400&theme=default",
    );
    expect(markdown).toContain(
      "[default_repocard_repo]: /api/pin?username=anuraghazra&repo=github-readme-stats&cache_seconds=86400&theme=default_repocard",
    );
    expect(markdown).not.toContain("undefined");
    expect(markdown).not.toMatch(
      /<!-- (?:REPO|STATS)_CARD_(?:LINKS|TABLE) -->/,
    );

    const references = new Set(
      [...markdown.matchAll(/^\[([^\]]+)\]:\s+\S+/gm)].map((match) => match[1]),
    );
    const images = [...markdown.matchAll(/!\[[^\]]+\]\[([^\]]+)\]/g)];
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(references.has(image[1])).toBe(true);
    }

    for (const table of [statsTable ?? "", repoTable]) {
      const rows = table.split("\n").filter((line) => line.startsWith("|"));
      expect(rows.length).toBeGreaterThan(2);
      for (const row of rows) {
        expect(row.split("|")).toHaveLength(5);
      }
    }
  });
});
