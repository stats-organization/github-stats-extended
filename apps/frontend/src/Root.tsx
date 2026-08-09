import { Suspense, lazy, useEffect, useState } from "react";
import type { JSX } from "react";

import { isDocsPath } from "./route";

/*
 * Both views are loaded on demand so neither pays for the other:
 * - the wizard does not ship the markdown renderer
 * - the documentation does not ship the card builder
 */
const DocsApp = lazy(async () => ({
  default: (await import("./docs/DocsApp")).DocsApp,
}));

const Wizard = lazy(async () => ({
  default: (await import("./wizard/Wizard")).Wizard,
}));

export function Root(): JSX.Element {
  const [docs, setDocs] = useState(() => isDocsPath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setDocs(isDocsPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return <Suspense fallback={null}>{docs ? <DocsApp /> : <Wizard />}</Suspense>;
}
