/**
 * GitHub-compatible heading slug: lowercase, punctuation dropped, spaces to
 * dashes. Matching GitHub matters because the markdown sources already link
 * between headings with anchors that work on github.com.
 *
 * Used by `markdown-it-anchor` at build time, see `vite.config.ts`.
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}
