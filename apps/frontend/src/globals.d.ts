declare global {
  interface Window {
    process: {
      env: {
        FETCH_MULTI_PAGE_STARS: string | undefined;
        PAT_1: string | undefined;
      };
    };
  }
}

export {};
