import { describe, expect, it } from "vitest";

import { getConfig, loadConfigFromEnv } from "../src/common/config.js";

describe("loadConfigFromEnv / getConfig", () => {
  it("uses defaults when no environment variables are set", () => {
    loadConfigFromEnv({});
    const config = getConfig();
    expect(config.whitelist).toBeUndefined();
    expect(config.gistWhitelist).toBeUndefined();
    expect(config.excludeRepositories).toEqual([]);
    expect(config.fetchMultiPageStars).toBe(1);
    expect(config.pats).toEqual([]);
  });

  it("parses comma-separated whitelist values", () => {
    loadConfigFromEnv({
      WHITELIST: "user1,user2",
      GIST_WHITELIST: "gist1",
      EXCLUDE_REPO: "repo1,repo2,repo3",
    });
    const config = getConfig();
    expect(config.whitelist).toEqual(["user1", "user2"]);
    expect(config.gistWhitelist).toEqual(["gist1"]);
    expect(config.excludeRepositories).toEqual(["repo1", "repo2", "repo3"]);
  });

  it("treats FETCH_MULTI_PAGE_STARS=true as unlimited pages", () => {
    loadConfigFromEnv({ FETCH_MULTI_PAGE_STARS: "true" });
    expect(getConfig().fetchMultiPageStars).toBe(Infinity);
  });

  it("parses a positive FETCH_MULTI_PAGE_STARS page limit", () => {
    loadConfigFromEnv({ FETCH_MULTI_PAGE_STARS: "3" });
    expect(getConfig().fetchMultiPageStars).toBe(3);
  });

  it.each(["0", "-2", "abc", ""])(
    "falls back to a single page for FETCH_MULTI_PAGE_STARS=%j",
    (value) => {
      loadConfigFromEnv({ FETCH_MULTI_PAGE_STARS: value });
      expect(getConfig().fetchMultiPageStars).toBe(1);
    },
  );

  it("collects only PAT_* variables as personal access tokens", () => {
    loadConfigFromEnv({
      PAT_1: "token-one",
      PAT_2: "token-two",
      OTHER: "ignored",
      WHITELIST: "also-ignored",
    });
    const config = getConfig();
    expect(config.pats).toEqual([
      { name: "PAT_1", value: "token-one" },
      { name: "PAT_2", value: "token-two" },
    ]);
  });

  it("replaces the previous config on each load", () => {
    loadConfigFromEnv({ WHITELIST: "user1" });
    loadConfigFromEnv({});
    expect(getConfig().whitelist).toBeUndefined();
  });
});
