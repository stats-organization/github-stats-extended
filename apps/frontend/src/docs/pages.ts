/*
 * The docs site renders the markdown under `docs/`, compiled to HTML at build
 * time by `vite-plugin-markdown`. The sources stay where they are so they
 * remain readable on GitHub and are the single source for both.
 */
import { html as advancedHtml } from "../../../../docs/advanced_documentation.md";
import { html as deployHtml } from "../../../../docs/deploy.md";
import { html as forkHtml } from "../../../../docs/fork.md";
import { html as overviewHtml } from "../../../../docs/index.md";
import { html as themesHtml } from "../../../../packages/core/src/themes/README.md";

export interface DocPage {
  /** Value of the `?page=` query parameter. */
  slug: string;
  /** Label shown in the navigation. */
  title: string;
  /**
   * Path relative to the repository root. Used to resolve the relative links
   * inside the document and to link back to the source on GitHub.
   */
  file: string;
  /** Markup compiled from the markdown at build time. */
  html: string;
}

/** Landing page, and the fallback for an unknown slug. */
const OVERVIEW = {
  slug: "overview",
  title: "Overview",
  file: "docs/index.md",
  html: overviewHtml,
} as const satisfies DocPage;

export const DOC_PAGES = [
  OVERVIEW,
  {
    slug: "customization",
    title: "Advanced Customization",
    file: "docs/advanced_documentation.md",
    html: advancedHtml,
  },
  {
    slug: "themes",
    title: "Available Themes",
    file: "packages/core/src/themes/README.md",
    html: themesHtml,
  },
  {
    slug: "deploy",
    title: "Run It Yourself",
    file: "docs/deploy.md",
    html: deployHtml,
  },
  {
    slug: "fork",
    title: "Fork Information",
    file: "docs/fork.md",
    html: forkHtml,
  },
] as const satisfies ReadonlyArray<DocPage>;

/** Every slug the documentation actually serves. */
export type DocSlug = (typeof DOC_PAGES)[number]["slug"];

/**
 * Repository path to page slug, for resolving cross-document links. The key
 * stays a plain `string` because lookups come from links in the markdown.
 */
export const SLUG_BY_FILE = new Map<string, DocSlug>(
  DOC_PAGES.map((page) => [page.file, page.slug]),
);

/**
 * An unknown slug (stale link, hand-edited URL) falls back to the overview
 * rather than rendering an empty page.
 */
export function findPage(slug: string | null): DocPage {
  return DOC_PAGES.find((page) => page.slug === slug) ?? OVERVIEW;
}
