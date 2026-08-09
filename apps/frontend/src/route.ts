import type { DocSlug } from "./docs/pages";

/**
 * The documentation is part of the frontend, not a separate app, so it lives
 * under the same Vite `base` as the card wizard. That makes the path identical
 * in the dev server and in the deployment.
 */
export const WIZARD_PATH = import.meta.env.BASE_URL;

export const DOCS_PATH = `${WIZARD_PATH}docs`;

/** Whether `pathname` addresses the documentation rather than the wizard. */
export function isDocsPath(pathname: string): boolean {
  return /\/docs\/?$/.test(pathname);
}

/**
 * Link to a documentation page, by the slug it is registered under in
 * `docs/pages.ts`. Linking here rather than to the markdown on GitHub keeps the
 * wizard pointing at the documentation for the version that is running.
 *
 * The slug is typed from the page list, so renaming or dropping a page turns
 * every stale link into a compile error. The import is type-only, so the wizard
 * does not pull the compiled documentation into its bundle.
 */
export function docsUrl(slug: DocSlug, hash?: string): string {
  return `${DOCS_PATH}?page=${slug}${hash ? `#${hash}` : ""}`;
}
