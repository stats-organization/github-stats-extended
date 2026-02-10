import { describe, expect, it } from "vitest";

import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as STATS_DEFAULT_RANK } from "../../components/Home/StatsRankSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import { CardType } from "../../models/CardType";

import { getFullSuffix } from "./getFullSuffix";

const baseOptions = {
  selectedCard: CardType.STATS,
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
  showAllStats: false,
  showIcons: false,
  includeAllCommits: false,
  enableAnimations: true,
  usePercent: false,
};

describe("getFullSuffix", () => {
  it("builds stats suffix with defaults", () => {
    const result = getFullSuffix(baseOptions);

    expect(result).toBe("?username=john");
  });

  it("adds stats options", () => {
    const result = getFullSuffix({
      ...baseOptions,
      showIcons: true,
      includeAllCommits: true,
      showAllStats: true,
      showTitle: false,
    });

    expect(result).toBe(
      "?username=john" +
        "&hide_title=true" +
        "&show=reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage,prs_commented,prs_reviewed,issues_commented" +
        "&show_icons=true" +
        "&include_all_commits=true",
    );
  });

  it("builds top-langs suffix", () => {
    const result = getFullSuffix({
      ...baseOptions,
      selectedCard: CardType.TOP_LANGS,
      langsCount: 5,
      showTitle: false,
    });

    expect(result).toBe(
      "/top-langs?username=john&hide_title=true&langs_count=5",
    );
  });

  it("builds pin suffix", () => {
    const result = getFullSuffix({
      ...baseOptions,
      selectedCard: CardType.PIN,
      showOwner: true,
      descriptionLines: 3,
    });

    expect(result).toBe(
      "/pin?username=john&repo=repo1&show_owner=true&description_lines_count=3",
    );
  });

  it("builds gist suffix", () => {
    const result = getFullSuffix({
      ...baseOptions,
      selectedCard: CardType.GIST,
      showOwner: true,
    });

    expect(result).toBe("/gist?id=gist1&show_owner=true");
  });

  it("builds wakatime suffix with percent and custom title", () => {
    const result = getFullSuffix({
      ...baseOptions,
      selectedCard: CardType.WAKATIME,
      wakatimeUser: "waka",
      usePercent: true,
      customTitle: "My Stats",
      showTitle: false,
    });

    expect(result).toBe(
      "/wakatime?username=waka&hide_title=true&custom_title=My%20Stats&display_format=percent",
    );
  });

  it("adds non-default layouts", () => {
    const result = getFullSuffix({
      ...baseOptions,
      selectedCard: CardType.TOP_LANGS,
      selectedLanguagesLayout: { id: 2, value: "compact", label: "Compact" },
    });

    expect(result).toBe("/top-langs?username=john&layout=compact");
  });
});
