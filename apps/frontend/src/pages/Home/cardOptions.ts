import type { SelectOption } from "../../components/Generic/Select";
import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as STATS_DEFAULT_RANK } from "../../components/Home/StatsRankSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import { DEMO_GIST, DEMO_REPO, DEMO_WAKATIME_USER } from "../../constants";

/**
 * All user-tunable card parameters collected during the customize stage.
 * Held as a single state object in `HomeScreen` and updated one key at a time.
 */
export interface CardOptions {
  selectedUserId: string;
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

export function getDefaultCardOptions(userId: string): CardOptions {
  return {
    selectedUserId: userId,
    repo: DEMO_REPO,
    gist: DEMO_GIST,
    wakatimeUser: DEMO_WAKATIME_USER,
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
    includeAllCommits: true,
    enableAnimations: true,
    usePercent: false,
  };
}
