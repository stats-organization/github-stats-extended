import { useEffect } from "react";
import type { JSX } from "react";

import { WIZARD_PATH } from "../route";
import { AppBar } from "../shared/AppBar";
import { LinkExternal } from "../shared/LinkExternal";

import { DocsContent } from "./DocsContent";
import { DocsSidebar } from "./DocsSidebar";
import { repoBlobUrl } from "./resolveDocUrl";
import { useDocRoute } from "./useDocRoute";

// Loaded with this view, so the wizard never downloads the markdown styles.
import "./docs.css";

export function DocsApp(): JSX.Element {
  const { page, navigate } = useDocRoute();

  useEffect(() => {
    document.title = `${page.title} · GitHub Stats Extended`;
  }, [page.title]);

  return (
    <>
      <AppBar crossLink={{ href: WIZARD_PATH, label: "Wizard" }} />

      <div className="mx-auto max-w-6xl w-full px-4 py-6 flex flex-col md:flex-row gap-8">
        <DocsSidebar currentSlug={page.slug} onNavigate={navigate} />

        <main className="min-w-0 flex-1">
          <DocsContent page={page} onNavigate={navigate} />

          <footer className="mt-12 pt-4 border-t border-base-300 text-sm opacity-70">
            <LinkExternal
              href={repoBlobUrl(page.file)}
              className="hover:underline"
            >
              Edit this page on GitHub
            </LinkExternal>
          </footer>
        </main>
      </div>
    </>
  );
}
