import { clsx } from "clsx";
import type { JSX } from "react";

import { isPlainClick } from "./isPlainClick";
import { DOC_PAGES } from "./pages";

interface DocsSidebarProps {
  currentSlug: string;
  onNavigate: (slug: string) => void;
}

export function DocsSidebar({
  currentSlug,
  onNavigate,
}: DocsSidebarProps): JSX.Element {
  return (
    <nav
      aria-label="Documentation"
      className="bg-base-200 md:bg-transparent md:w-56 md:shrink-0 md:sticky md:top-4 md:self-start"
    >
      <ul className="menu w-full gap-1">
        {DOC_PAGES.map((page) => {
          const current = page.slug === currentSlug;

          return (
            <li key={page.slug}>
              <a
                href={`?page=${page.slug}`}
                aria-current={current ? "page" : undefined}
                className={clsx(current && "menu-active font-medium")}
                onClick={(event) => {
                  if (!isPlainClick(event)) {
                    return;
                  }
                  event.preventDefault();
                  onNavigate(page.slug);
                }}
              >
                {page.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
