import { resolveDocUrl } from "./resolveDocUrl";

/**
 * Prepares the markup compiled at build time for display.
 *
 * This module exists because the sources are read in two places.
 * On github.com they have to work as they are, so they keep absolute card URLs and
 * repository-relative `.md` links; here those same links have to point at the
 * serving deployment and at `?page=` routes.
 * Rewriting them on the way to the DOM keeps one source correct in both.
 *
 * Heading ids and their permalinks are added by `markdown-it-anchor` during the build.
 * What is left for here is everything markdown-it cannot see:
 * URLs inside raw HTML blocks, which it passes through untouched, and local images,
 * whose hashed asset URL is only known to the bundler.
 *
 * If the site ever becomes the only place the docs are read, the raw HTML
 * blocks could use site-relative URLs and the rest could move into markdown-it
 * rules, at which point this module can go.
 */
export function transformDocHtml(html: string, file: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  for (const anchor of doc.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (href) {
      anchor.setAttribute("href", resolveDocUrl(href, file));
    }
    // Send off-site links to a new tab, but keep in-page navigation inline.
    if (/^https?:/i.test(anchor.getAttribute("href") ?? "")) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  }

  for (const image of doc.querySelectorAll("img[src]")) {
    const src = image.getAttribute("src");
    if (src) {
      image.setAttribute("src", resolveDocUrl(src, file));
    }
    image.setAttribute("loading", "lazy");
  }

  // `<picture>` offers a dark-mode variant of the same card.
  for (const source of doc.querySelectorAll("source[srcset]")) {
    const srcset = source.getAttribute("srcset");
    if (srcset) {
      source.setAttribute("srcset", resolveDocUrl(srcset, file));
    }
  }

  return doc.body.innerHTML;
}
