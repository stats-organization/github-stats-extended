// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { transformDocHtml } from "./transformDocHtml";

const OVERVIEW = "docs/index.md";
const HOSTED = "https://github-stats-extended.vercel.app";

describe("transformDocHtml", () => {
  it("rewrites hosted card samples to the serving deployment", () => {
    const html = transformDocHtml(
      `<img src="${HOSTED}/api?username=anuraghazra&theme=dark">`,
      OVERVIEW,
    );
    expect(html).toContain('src="/api?username=anuraghazra&amp;theme=dark"');
  });

  it("rewrites the srcset of a dark-mode picture source", () => {
    const html = transformDocHtml(
      `<picture><source srcset="${HOSTED}/api?username=x" media="(prefers-color-scheme: dark)"></picture>`,
      OVERVIEW,
    );
    expect(html).toContain('srcset="/api?username=x"');
  });

  it("turns a cross-document link into a page query", () => {
    const html = transformDocHtml('<a href="fork.md">Fork</a>', OVERVIEW);
    expect(html).toContain('href="?page=fork"');
  });

  it("opens off-site links in a new tab", () => {
    const html = transformDocHtml(
      '<a href="https://github.com/anuraghazra">GitHub</a>',
      OVERVIEW,
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("keeps in-app navigation in the same tab", () => {
    const html = transformDocHtml('<a href="fork.md">Fork</a>', OVERVIEW);
    expect(html).not.toContain("target=");
  });

  it("defers image loading", () => {
    const html = transformDocHtml('<img src="/api?username=x">', OVERVIEW);
    expect(html).toContain('loading="lazy"');
  });
});
