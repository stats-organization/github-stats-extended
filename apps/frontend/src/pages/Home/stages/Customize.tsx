import type { JSX, default as React } from "react";

import { CardImage } from "../../../components/Card/CardImage";
import type { SelectOption } from "../../../components/Generic/Select";
import { CheckboxSection } from "../../../components/Home/CheckboxSection";
import { LanguagesLayoutSection } from "../../../components/Home/LanguagesLayoutSection";
import { NumericSection } from "../../../components/Home/NumericSection";
import { StatsRankSection } from "../../../components/Home/StatsRankSection";
import { TextSection } from "../../../components/Home/TextSection";
import { WakatimeLayoutSection } from "../../../components/Home/WakatimeLayoutSection";
import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
} from "../../../constants";
import { CardType } from "../../../models/CardType";
import type { StageIndex } from "../../../models/Stage";
import { useIsAuthenticated } from "../../../redux/selectors/userSelectors";

type Updater<T> = React.Dispatch<React.SetStateAction<T>>;

/** @todo todo consider using React context API to avoid prop drilling */
interface CustomizeStageProps {
  selectedCard: CardType;
  selectedStatsRank: SelectOption;
  setSelectedStatsRank: Updater<SelectOption>;
  selectedLanguagesLayout: SelectOption;
  setSelectedLanguagesLayout: Updater<SelectOption>;
  selectedWakatimeLayout: SelectOption;
  setSelectedWakatimeLayout: Updater<SelectOption>;
  selectedUserId: string;
  setSelectedUserId: Updater<string>;
  repo: string;
  setRepo: Updater<string>;
  gist: string;
  setGist: Updater<string>;
  wakatimeUser: string;
  setWakatimeUser: Updater<string>;
  showTitle: boolean;
  setShowTitle: Updater<boolean>;
  descriptionLines: number | undefined;
  setDescriptionLines: Updater<number | undefined>;
  showOwner: boolean;
  setShowOwner: Updater<boolean>;
  customTitle: string;
  setCustomTitle: Updater<string>;
  langsCount: number | undefined;
  setLangsCount: Updater<number | undefined>;
  showIcons: boolean;
  setShowIcons: Updater<boolean>;
  showAllStats: boolean;
  setShowAllStats: Updater<boolean>;
  includeAllCommits: boolean;
  setIncludeAllCommits: Updater<boolean>;
  enableAnimations: boolean;
  setEnableAnimations: Updater<boolean>;
  usePercent: boolean;
  setUsePercent: Updater<boolean>;
  fullSuffix: string;
  setStage: (stageIndex: StageIndex) => void;
}

export function CustomizeStage({
  selectedCard,
  selectedStatsRank,
  setSelectedStatsRank,
  selectedLanguagesLayout,
  setSelectedLanguagesLayout,
  selectedWakatimeLayout,
  setSelectedWakatimeLayout,
  selectedUserId,
  setSelectedUserId,
  repo,
  setRepo,
  gist,
  setGist,
  wakatimeUser,
  setWakatimeUser,
  showTitle,
  setShowTitle,
  showOwner,
  setShowOwner,
  descriptionLines,
  setDescriptionLines,
  customTitle,
  setCustomTitle,
  langsCount,
  setLangsCount,
  showIcons,
  setShowIcons,
  showAllStats,
  setShowAllStats,
  includeAllCommits,
  setIncludeAllCommits,
  enableAnimations,
  setEnableAnimations,
  usePercent,
  setUsePercent,
  fullSuffix,
  setStage,
}: CustomizeStageProps): JSX.Element {
  const cardType = selectedCard;
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="w-full flex flex-wrap">
      <div className="h-auto lg:w-2/5 md:w-1/2 p-10 rounded-sm bg-gray-200">
        {(cardType === CardType.STATS || cardType === CardType.TOP_LANGS) && (
          <TextSection
            title="Username"
            description={
              <>
                Enter a GitHub username.
                <br />
                {!isAuthenticated && (
                  <>
                    Please{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setStage(0);
                      }}
                      className="underline text-blue-900"
                    >
                      log in
                    </a>{" "}
                    to change the username.
                  </>
                )}
              </>
            }
            placeholder={`e.g. "${DEMO_USER}"`}
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            onPaste={(e) => {
              e.preventDefault();
              let newValue = e.clipboardData.getData("text");
              // if the user pasted a full GitHub URL, extract username
              if (newValue.endsWith("/")) {
                newValue = newValue.slice(0, -1);
              }
              const parts = newValue.split("/");
              if (parts.length > 1) {
                newValue = parts.slice(-1).join("/");
              }
              setSelectedUserId(newValue);
            }}
            disabled={!isAuthenticated}
          />
        )}
        {cardType === CardType.PIN && (
          <TextSection
            title="Repository"
            description={
              <>
                Enter a repository in <code>owner/repo</code> format.
                <br />
                {!isAuthenticated && (
                  <>
                    Please{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setStage(0);
                      }}
                      className="underline text-blue-900"
                    >
                      log in
                    </a>{" "}
                    to change the repo.
                  </>
                )}
              </>
            }
            placeholder={`e.g. "${DEMO_REPO}"`}
            value={repo}
            onValueChange={setRepo}
            onPaste={(e) => {
              e.preventDefault();
              let newValue = e.clipboardData.getData("text");
              // if the user pasted a full GitHub URL, extract owner/repo
              if (newValue.endsWith("/")) {
                newValue = newValue.slice(0, -1);
              }
              const parts = newValue.split("/");
              if (parts.length > 2) {
                newValue = parts.slice(-2).join("/");
              }
              setRepo(newValue);
            }}
            disabled={!isAuthenticated}
          />
        )}
        {cardType === CardType.GIST && (
          <TextSection
            title="Repository"
            description={
              <>
                Enter a Gist id.
                <br />
                {!isAuthenticated && (
                  <>
                    Please{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setStage(0);
                      }}
                      className="underline text-blue-900"
                    >
                      log in
                    </a>{" "}
                    to change the gist id.
                  </>
                )}
              </>
            }
            placeholder={`e.g. "${DEMO_GIST}"`}
            value={gist}
            onValueChange={setGist}
            onPaste={(e) => {
              e.preventDefault();
              let newValue = e.clipboardData.getData("text");
              // if the user pasted a full GitHub URL, extract Gist ID
              if (newValue.endsWith("/")) {
                newValue = newValue.slice(0, -1);
              }
              const parts = newValue.split("/");
              if (parts.length > 1) {
                newValue = parts.slice(-1).join("/");
              }
              setGist(newValue);
            }}
            disabled={!isAuthenticated}
          />
        )}
        {cardType === CardType.WAKATIME && (
          <TextSection
            title="WakaTime Username"
            description={
              <>
                Set your{" "}
                <a
                  href="https://wakatime.com/"
                  target="_blank"
                  className="underline text-blue-900"
                >
                  WakaTime
                </a>{" "}
                username to fetch your stats.
              </>
            }
            placeholder={`e.g. "${DEMO_WAKATIME_USER}"`}
            value={wakatimeUser}
            onValueChange={setWakatimeUser}
          />
        )}
        {cardType === CardType.STATS && (
          <CheckboxSection
            title="Show All Stats?"
            text="Show all available statistics."
            question="Show all stats?"
            checked={showAllStats}
            onCheckedChange={setShowAllStats}
          />
        )}
        {cardType === CardType.STATS && (
          <StatsRankSection
            selectedOption={selectedStatsRank}
            onOptionChange={setSelectedStatsRank}
          />
        )}
        {cardType === CardType.STATS && (
          <CheckboxSection
            title="Show Icons?"
            text="Show icons next to all stats."
            question="Show icons?"
            checked={showIcons}
            onCheckedChange={setShowIcons}
          />
        )}
        {cardType === CardType.STATS && (
          <CheckboxSection
            title="Include All Commits?"
            text="Count total commits or just commits of the last 365 days."
            question="Include all commits?"
            checked={includeAllCommits}
            onCheckedChange={setIncludeAllCommits}
          />
        )}
        {cardType === CardType.TOP_LANGS && (
          <LanguagesLayoutSection
            selectedLanguageLayoutOption={selectedLanguagesLayout}
            onLanguageLayoutOptionChange={setSelectedLanguagesLayout}
          />
        )}
        {cardType === CardType.WAKATIME && (
          <WakatimeLayoutSection
            selectedOption={selectedWakatimeLayout}
            onOptionChange={setSelectedWakatimeLayout}
          />
        )}
        {(cardType === CardType.TOP_LANGS ||
          cardType === CardType.WAKATIME) && (
          <NumericSection
            title="Language Count"
            description={
              <>
                Set the number of languages to be shown.
                <br />
                Leave empty for default count.
              </>
            }
            value={langsCount}
            onValueChange={setLangsCount}
            min={1}
            max={20}
          />
        )}
        {cardType === CardType.WAKATIME && (
          <CheckboxSection
            title="Show Percentages?"
            text="Show time spent in hours or percentages."
            question="Show percentages?"
            checked={usePercent}
            onCheckedChange={setUsePercent}
          />
        )}
        {(cardType === CardType.STATS ||
          cardType === CardType.TOP_LANGS ||
          cardType === CardType.WAKATIME) && (
          <CheckboxSection
            title="Show Title?"
            text="Shows a title at the top of the card."
            question="Show title?"
            checked={showTitle}
            onCheckedChange={setShowTitle}
          />
        )}
        {(cardType === CardType.STATS || cardType === CardType.WAKATIME) && (
          <TextSection
            title="Custom Title"
            description={
              <>
                Set a custom title for the card.
                <br />
                Leave empty for default title.
              </>
            }
            placeholder='e.g. "My GitHub Stats"'
            value={customTitle}
            onValueChange={setCustomTitle}
          />
        )}
        {(cardType === CardType.STATS ||
          cardType === CardType.TOP_LANGS ||
          cardType === CardType.WAKATIME) && (
          <CheckboxSection
            title="Enable Animations?"
            // text="Enable Animations."
            question="enable animations?"
            checked={enableAnimations}
            onCheckedChange={setEnableAnimations}
          />
        )}
        {(cardType === CardType.PIN || cardType === CardType.GIST) && (
          <CheckboxSection
            title="Show Owner?"
            text="Shows the repo owner's name next to the repo name."
            question="Show owner?"
            checked={showOwner}
            onCheckedChange={setShowOwner}
          />
        )}
        {cardType === CardType.PIN && (
          <NumericSection
            title="Description Lines Count"
            description={
              <>
                Set the number of lines for the description. Will be clamped
                between 1 and 3.
                <br />
                Leave empty for automatic adjustment.
              </>
            }
            value={descriptionLines}
            onValueChange={setDescriptionLines}
            min={1}
            max={3}
          />
        )}
        <div className="pl-10 pr-10">
          For more customization options check the{" "}
          <a
            href="https://github.com/stats-organization/github-stats-extended/blob/master/docs/advanced_documentation.md"
            target="_blank"
            className="underline text-blue-900"
          >
            customization documentation
          </a>{" "}
          after you copied your card URL in step 5.
        </div>
      </div>
      <div className="w-full lg:w-3/5 md:w-1/2 object-center pt-5 md:pt-0 pl-0 md:pl-5 lg:pl-0">
        <div className="w-full lg:w-3/5 mx-auto flex flex-col justify-center sticky top-32">
          <CardImage imageSrc={fullSuffix} stage={2} />
        </div>
      </div>
    </div>
  );
}
