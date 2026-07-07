import type { SelectOption } from "../../components/Generic/Select";
import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as STATS_DEFAULT_RANK } from "../../components/Home/StatsRankSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import { CardType } from "../../models/CardType";
import { cardUrl } from "../../models/CardUrl";
import type { CardUrlBuilder } from "../../models/CardUrl";

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
  hideValues: boolean;
  showAllStats: boolean;
  showIcons: boolean;
  includeAllCommits: boolean;
  enableAnimations: boolean;
  usePercent: boolean;
}

export function buildCardUrl({
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
  hideValues,
  showAllStats,
  showIcons,
  includeAllCommits,
  enableAnimations,
  usePercent,
}: Options): CardUrlBuilder {
  switch (selectedCard) {
    case CardType.STATS: {
      let url = cardUrl(CardType.STATS);
      if (selectedUserId) {
        url = url.username(selectedUserId);
      }
      if (selectedStatsRank !== STATS_DEFAULT_RANK) {
        url = url.rankIcon(selectedStatsRank.value);
      }
      if (!showTitle) {
        url = url.hideTitle();
      }
      if (customTitle) {
        url = url.customTitle(customTitle);
      }
      if (showAllStats) {
        url = url.show(
          "reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage,prs_commented,prs_reviewed,issues_commented",
        );
      }
      if (showIcons) {
        url = url.showIcons();
      }
      if (includeAllCommits) {
        url = url.includeAllCommits();
      }
      if (!enableAnimations) {
        url = url.disableAnimations();
      }
      return url;
    }

    case CardType.TOP_LANGS: {
      let url = cardUrl(CardType.TOP_LANGS);
      if (selectedUserId) {
        url = url.username(selectedUserId);
      }
      if (selectedLanguagesLayout !== LANGUAGES_DEFAULT_LAYOUT) {
        url = url.layout(selectedLanguagesLayout.value);
      }
      if (!showTitle) {
        url = url.hideTitle();
      }
      if (langsCount) {
        url = url.langsCount(langsCount);
      }
      if (hideValues) {
        url = url.hideValues();
      }
      if (!enableAnimations) {
        url = url.disableAnimations();
      }
      return url;
    }

    case CardType.PIN: {
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
      let url = cardUrl(CardType.PIN);
      if (userId) {
        url = url.username(userId);
      }
      if (repo) {
        url = url.repo(repo);
      }
      if (showOwner) {
        url = url.showOwner();
      }
      if (descriptionLines) {
        url = url.descriptionLines(descriptionLines);
      }
      return url;
    }

    case CardType.GIST: {
      let url = cardUrl(CardType.GIST);
      if (gist) {
        url = url.gistId(gist);
      }
      if (showOwner) {
        url = url.showOwner();
      }
      return url;
    }

    case CardType.WAKATIME: {
      let url = cardUrl(CardType.WAKATIME);
      if (wakatimeUser) {
        url = url.username(wakatimeUser);
      }
      if (selectedWakatimeLayout !== WAKATIME_DEFAULT_LAYOUT) {
        url = url.layout(selectedWakatimeLayout.value);
      }
      if (!showTitle) {
        url = url.hideTitle();
      }
      if (customTitle) {
        url = url.customTitle(customTitle);
      }
      if (langsCount) {
        url = url.langsCount(langsCount);
      }
      if (!enableAnimations) {
        url = url.disableAnimations();
      }
      if (usePercent) {
        url = url.displayFormat("percent");
      }
      return url;
    }

    default:
      selectedCard satisfies never;
      throw new Error(`unknown card type: ${selectedCard as string}`);
  }
}
