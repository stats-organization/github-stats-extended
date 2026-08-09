import { describe, expect, it } from "vitest";

import { resolveDocUrl, resolveRepoPath } from "./resolveDocUrl";

const HOSTED = "https://github-stats-extended.vercel.app";

describe("resolveRepoPath", () => {
  it("resolves against the directory of the linking document", () => {
    expect(resolveRepoPath("docs/fork.md", "advanced_documentation.md")).toBe(
      "docs/advanced_documentation.md",
    );
  });

  it("walks up out of the document directory", () => {
    expect(
      resolveRepoPath("docs/advanced_documentation.md", "../packages/core.md"),
    ).toBe("packages/core.md");
  });

  it("ignores the current directory marker", () => {
    expect(resolveRepoPath("docs/index.md", "./fork.md")).toBe("docs/fork.md");
  });
});

describe("resolveDocUrl", () => {
  it("makes hosted card samples relative so they hit the serving deployment", () => {
    expect(
      resolveDocUrl(
        `${HOSTED}/api?username=anuraghazra&theme=dark`,
        "docs/index.md",
      ),
    ).toBe("/api?username=anuraghazra&theme=dark");
  });

  it("maps the hosted root to a root-relative URL", () => {
    expect(resolveDocUrl(HOSTED, "docs/index.md")).toBe("/");
  });

  it("turns a link to another documentation page into a page query", () => {
    expect(resolveDocUrl("fork.md", "docs/index.md")).toBe("?page=fork");
  });

  it("keeps the anchor when linking into another page", () => {
    expect(resolveDocUrl("fork.md#compatibility-notes", "docs/index.md")).toBe(
      "?page=fork#compatibility-notes",
    );
  });

  it("resolves a link relative to the document that contains it", () => {
    expect(
      resolveDocUrl("advanced_documentation.md#themes", "docs/fork.md"),
    ).toBe("?page=customization#themes");
  });

  it("resolves the generated theme list outside the docs folder", () => {
    expect(
      resolveDocUrl(
        "../packages/core/src/themes/README.md",
        "docs/advanced_documentation.md",
      ),
    ).toBe("?page=themes");
  });

  it("sends markdown outside the docs site to the repository", () => {
    expect(
      resolveDocUrl(
        "../.github/CONTRIBUTING.md#translations-contribution",
        "docs/advanced_documentation.md",
      ),
    ).toBe(
      "https://github.com/stats-organization/github-stats-extended/blob/master/.github/CONTRIBUTING.md",
    );
  });

  it("resolves a local image to its bundled asset", () => {
    expect(resolveDocUrl("frontend-screenshot.png", "docs/fork.md")).toContain(
      "frontend-screenshot",
    );
  });

  it("leaves bare anchors alone", () => {
    expect(resolveDocUrl("#card-types", "docs/index.md")).toBe("#card-types");
  });

  it("leaves links to other sites alone", () => {
    const url = "https://github.com/anuraghazra/github-readme-stats";
    expect(resolveDocUrl(url, "docs/index.md")).toBe(url);
  });

  it("leaves root-relative URLs alone", () => {
    expect(resolveDocUrl("/api?username=x", "docs/index.md")).toBe(
      "/api?username=x",
    );
  });
});
