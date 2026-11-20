import { afterEach, describe, expect, it, vi } from "vitest";

import { isBrowser } from "../src/common/env.js";

describe("isBrowser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false under Node.js", () => {
    expect(isBrowser()).toBe(false);
  });

  it("returns true when Node globals are unavailable (browser or Web Worker)", () => {
    vi.stubGlobal("process", undefined);
    expect(isBrowser()).toBe(true);
  });

  it("returns true when process exists without Node version info (bundler polyfill)", () => {
    vi.stubGlobal("process", {});
    expect(isBrowser()).toBe(true);
  });
});
