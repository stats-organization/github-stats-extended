import type { SelectOption } from "../../components/Generic/Select";
import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as STATS_DEFAULT_RANK } from "../../components/Home/StatsRankSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import { CardType } from "../../models/CardType";

interface Options {
  userId: string;
  selectedUserId: string;
  selectedCard: CardType;
  repo: string;
  gist: string;
  wakatimeUser: string;
  selectedStatsRank: SelectOption;
  selectedLanguagesLayout: SelectOption;
  selectedWakatimeLayout: SelectOption;
  showTitle: boolean;
  showOwner: boolean;
  descriptionLines: number | undefined;
  customTitle: string;
  langsCount: number | undefined;
  showAllStats: boolean;
  showIcons: boolean;
  includeAllCommits: boolean;
  enableAnimations: boolean;
  usePercent: boolean;
}

export function getFullSuffix({
  userId,
  selectedCard,
  selectedUserId,
  repo,
  gist,
  wakatimeUser,
  selectedStatsRank,
  selectedLanguagesLayout,
  selectedWakatimeLayout,
  showTitle,
  showOwner,
  descriptionLines,
  customTitle,
  langsCount,
  showAllStats,
  showIcons,
  includeAllCommits,
  enableAnimations,
  usePercent,
}: Options): string {
  let fullSuffix = `${selectedCard === CardType.STATS ? "" : "/" + selectedCard}?`;

  switch (selectedCard) {
    case CardType.STATS:
    case CardType.TOP_LANGS:
      fullSuffix += `username=${selectedUserId}`;
      break;
    case CardType.PIN:
      /**
       * We should use the name of the logged-in user, not the value entered in the
       * username field in step 3.
       *
       * This input is not shown when the PIN card type is selected,
       * but it may still contain a different value if the user previously chose another card type.
       *
       * For example,
       * 1. the user could select the STATS card
       * 2. enter a username
       * 3. then go back and switch to the PIN card, leaving the old value behind.
       *
       * @see https://github.com/stats-organization/github-stats-extended/pull/73#discussion_r2792177515
       */
      fullSuffix += `username=${userId}&repo=${repo}`;
      break;
    case CardType.GIST:
      fullSuffix += `id=${gist}`;
      break;
    case CardType.WAKATIME:
      fullSuffix += `username=${wakatimeUser}`;
      break;

    default:
      selectedCard satisfies never;
  }

  if (
    selectedStatsRank !== STATS_DEFAULT_RANK &&
    selectedCard === CardType.STATS
  ) {
    fullSuffix += `&rank_icon=${selectedStatsRank.value}`;
  }

  if (
    selectedLanguagesLayout !== LANGUAGES_DEFAULT_LAYOUT &&
    selectedCard === CardType.TOP_LANGS
  ) {
    fullSuffix += `&layout=${selectedLanguagesLayout.value}`;
  }

  if (
    selectedWakatimeLayout !== WAKATIME_DEFAULT_LAYOUT &&
    selectedCard === CardType.WAKATIME
  ) {
    fullSuffix += `&layout=${selectedWakatimeLayout.value}`;
  }

  if (
    !showTitle &&
    (selectedCard === CardType.STATS ||
      selectedCard === CardType.TOP_LANGS ||
      selectedCard === CardType.WAKATIME)
  ) {
    fullSuffix += "&hide_title=true";
  }

  if (
    showOwner &&
    (selectedCard === CardType.PIN || selectedCard === CardType.GIST)
  ) {
    fullSuffix += "&show_owner=true";
  }

  if (descriptionLines && selectedCard === CardType.PIN) {
    fullSuffix += `&description_lines_count=${descriptionLines}`;
  }

  if (
    customTitle &&
    (selectedCard === CardType.STATS || selectedCard === CardType.WAKATIME)
  ) {
    const encodedTitle = encodeURIComponent(customTitle);
    fullSuffix += `&custom_title=${encodedTitle}`;
  }

  if (
    langsCount &&
    (selectedCard === CardType.TOP_LANGS || selectedCard === CardType.WAKATIME)
  ) {
    fullSuffix += `&langs_count=${langsCount}`;
  }

  if (showAllStats && selectedCard === CardType.STATS) {
    fullSuffix += `&show=reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage,prs_commented,prs_reviewed,issues_commented`;
  }

  if (showIcons && selectedCard === CardType.STATS) {
    fullSuffix += `&show_icons=true`;
  }

  if (includeAllCommits && selectedCard === CardType.STATS) {
    fullSuffix += `&include_all_commits=true`;
  }

  if (
    !enableAnimations &&
    (selectedCard === CardType.STATS ||
      selectedCard === CardType.TOP_LANGS ||
      selectedCard === CardType.WAKATIME)
  ) {
    fullSuffix += `&disable_animations=${!enableAnimations}`;
  }

  if (usePercent && selectedCard === CardType.WAKATIME) {
    fullSuffix += `&display_format=percent`;
  }

  return fullSuffix;
}
