/**
 * Pages the wizard links to, named by the slug Starlight serves them under.
 * Typed so renaming or dropping one turns every stale link into a compile error.
 *
 * @todo extract them statically from the config or other astro exports to build this dynamically.
 */
type DocPage =
  | "cards/stats"
  | "customization/common-options"
  | "customization/theming"
  | "customization/themes"
  | "deploy"
  | "fork";

/**
 * @param page - Slug of the target page.
 */
export function docsUrl(page: DocPage): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/docs/${page}/`;
}
