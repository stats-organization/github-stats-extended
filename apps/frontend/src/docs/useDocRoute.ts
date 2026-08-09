import { useCallback, useEffect, useState } from "react";

import { findPage } from "./pages";
import type { DocPage } from "./pages";

/**
 * The page is selected with a query parameter rather than a path segment so the
 * docs stay a single static file: `/docs/index.html` answers every page without
 * the host needing rewrite rules. It also leaves the URL fragment free for the
 * heading anchors the markdown already links to.
 */
const PAGE_PARAM = "page";

/** Null when the URL names no page, which `findPage` resolves to the overview. */
function currentSlug(): string | null {
  return new URLSearchParams(window.location.search).get(PAGE_PARAM);
}

/**
 * Scrolls to the heading a hash names. Deferred a frame because the target only
 * exists once the page it belongs to has rendered, which is also true of a deep
 * link arriving on load.
 */
function scrollToHash(hash: string): void {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView();
  });
}

interface DocRoute {
  page: DocPage;
  /** Navigates without a reload, keeping an entry in the browser history. */
  navigate: (slug: string, hash?: string) => void;
}

export function useDocRoute(): DocRoute {
  const [slug, setSlug] = useState(currentSlug);

  useEffect(() => {
    const handlePopState = () => {
      setSlug(currentSlug());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    // A deep link arrives before the page is on screen, so the browser has
    // nothing to scroll to on load.
    if (window.location.hash) {
      scrollToHash(window.location.hash);
    }
  }, []);

  const navigate = useCallback((nextSlug: string, hash?: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(PAGE_PARAM, nextSlug);
    url.hash = hash ?? "";

    window.history.pushState(null, "", url);
    setSlug(nextSlug);

    if (hash) {
      scrollToHash(hash);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, []);

  return { page: findPage(slug), navigate };
}
