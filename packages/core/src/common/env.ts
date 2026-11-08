/**
 * Whether the code runs in a browser.
 *
 * Actually checks for Node rather than for a browser, because `window` is missing in Web Workers
 * and present in DOM-emulating test environments.
 *
 * @returns True in browsers and Web Workers, false on the server.
 */
const isBrowser = (): boolean => {
  // typed loosely: Node's types claim `process` always exists,
  // but browsers lack it and bundler polyfills may lack `versions`
  const { process } = globalThis as {
    process?: { versions?: { node?: string } };
  };
  return process?.versions?.node === undefined;
};

export { isBrowser };
