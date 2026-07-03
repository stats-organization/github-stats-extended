import { describe, expect, it } from "vitest";

import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as STATS_DEFAULT_RANK } from "../../components/Home/StatsRankSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import { CardType } from "../../models/CardType";

import { buildCardUrl } from "./buildCardUrl";
import type { CardOptions } from "./cardOptions";

const USER_ID = "john-github";

// Built inline instead of via `getDefaultCardOptions`, which imports
// `constants.ts` and needs a `window` global these node-based tests lack.
const baseOptions: CardOptions = {
  selectedUserId: "john",
  repo: "repo1",
  gist: "gist1",
  wakatimeUser: "wakaUser",
  selectedStatsRank: STATS_DEFAULT_RANK,
  selectedLanguagesLayout: LANGUAGES_DEFAULT_LAYOUT,
  selectedWakatimeLayout: WAKATIME_DEFAULT_LAYOUT,
  showTitle: true,
  showOwner: false,
  descriptionLines: undefined,
  customTitle: "",
  langsCount: undefined,
  hideValues: false,
  showAllStats: false,
  showIcons: false,
  includeAllCommits: false,
  enableAnimations: true,
  usePercent: false,
};

describe("buildCardUrl", () => {
  it("builds stats suffix with defaults", () => {
    const result = buildCardUrl(USER_ID, CardType.STATS, baseOptions);

    expect(result.toString()).toBe("?username=john");
  });

  it("adds stats options", () => {
    const result = buildCardUrl(USER_ID, CardType.STATS, {
      ...baseOptions,
      showIcons: true,
      includeAllCommits: true,
      showAllStats: true,
      showTitle: false,
    });

    expect(result.toString()).toBe(
      "?username=john" +
        "&hide_title=true" +
        // commas are percent-encoded (%2C) now that params go through URLSearchParams
        "&show=reviews%2Cdiscussions_started%2Cdiscussions_answered%2Cprs_merged%2Cprs_merged_percentage%2Cprs_commented%2Cprs_reviewed%2Cissues_commented" +
        "&show_icons=true" +
        "&include_all_commits=true",
    );
  });

  it("builds top-langs suffix", () => {
    const result = buildCardUrl(USER_ID, CardType.TOP_LANGS, {
      ...baseOptions,
      langsCount: 5,
      showTitle: false,
    });

    expect(result.toString()).toBe(
      "/top-langs?username=john&hide_title=true&langs_count=5",
    );
  });

  it("builds pin suffix using userId not selectedUserId", () => {
    const result = buildCardUrl(USER_ID, CardType.PIN, {
      ...baseOptions,
      showOwner: true,
      descriptionLines: 3,
    });

    expect(result.toString()).toBe(
      "/pin?username=john-github&repo=repo1&show_owner=true&description_lines_count=3",
    );
  });

  it("builds gist suffix", () => {
    const result = buildCardUrl(USER_ID, CardType.GIST, {
      ...baseOptions,
      showOwner: true,
    });

    expect(result.toString()).toBe("/gist?id=gist1&show_owner=true");
  });

  it("builds wakatime suffix with percent and custom title", () => {
    const result = buildCardUrl(USER_ID, CardType.WAKATIME, {
      ...baseOptions,
      wakatimeUser: "waka",
      usePercent: true,
      customTitle: "My Stats",
      showTitle: false,
    });

    expect(result.toString()).toBe(
      "/wakatime?username=waka&hide_title=true&custom_title=My%20Stats&display_format=percent",
    );
  });

  it("adds non-default layouts", () => {
    const result = buildCardUrl(USER_ID, CardType.TOP_LANGS, {
      ...baseOptions,
      selectedLanguagesLayout: { id: 2, value: "compact", label: "Compact" },
    });

    expect(result.toString()).toBe("/top-langs?username=john&layout=compact");
  });
});
