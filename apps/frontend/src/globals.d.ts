declare global {
  /** The subset of Vite's build-time constants this app reads. */
  interface ImportMeta {
    readonly env: {
      /** Value of `base` in `vite.config.ts`, with a trailing slash. */
      readonly BASE_URL: string;
    };
  }

  interface CustomProcess {
    env: {
      FETCH_MULTI_PAGE_STARS: string | undefined;
      PAT_1: string | undefined;
    };
  }

  interface Window {
    process?: CustomProcess;
  }
}

export {};
