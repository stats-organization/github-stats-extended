import { useMemo } from "react";
import type { JSX, MouseEvent } from "react";

import { isPlainClick } from "./isPlainClick";
import type { DocPage } from "./pages";
import { transformDocHtml } from "./transformDocHtml";

interface DocsContentProps {
  page: DocPage;
  onNavigate: (slug: string, hash?: string) => void;
}

/**
 * Whether the document opens with its own title.
 * The generated theme list starts at `<h2>`,
 * so the page supplies a heading for it rather than leaving the document without one.
 */
function hasTopLevelHeading(html: string): boolean {
  return /<h1[\s>]/i.test(html);
}

export function DocsContent({
  page,
  onNavigate,
}: DocsContentProps): JSX.Element {
  const html = useMemo(
    () => transformDocHtml(page.html, page.file),
    [page.html, page.file],
  );

  /**
   * Intercepts clicks on links this app can serve itself, so moving between
   * documents does not reload the page. Everything else keeps its default
   * behaviour.
   */
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    const href = anchor?.getAttribute("href");
    if (!href?.startsWith("?page=") || !isPlainClick(event)) {
      return;
    }

    event.preventDefault();
    const [query = "", hash] = href.slice(1).split("#");
    const slug = new URLSearchParams(query).get("page");
    if (slug) {
      onNavigate(slug, hash);
    }
  };

  return (
    // Link handling is delegated from the container; the rendered anchors keep
    // their href and focus behaviour, so keyboard users are unaffected.
    <div className="docs-content" onClick={handleClick}>
      {!hasTopLevelHeading(page.html) && <h1>{page.title}</h1>}
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- the markup is the repository's own markdown, compiled at build time; nothing here comes from user input or the network */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
