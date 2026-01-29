declare global {
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
