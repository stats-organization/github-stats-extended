import type { JSX } from "react";

import { CardImage } from "../../../components/Card/CardImage";
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
import type { CardUrlBuilder } from "../../../models/CardUrl";
import type { StageIndex } from "../../../models/Stage";
import { useIsAuthenticated } from "../../../redux/selectors/userSelectors";
import type { CardOptions } from "../cardOptions";

/**
 * Extract the trailing path segments from pasted text, so pasting a full
 * GitHub URL yields just the username (1 segment), owner/repo (2), or Gist id (1).
 */
function pastedPathTail(text: string, segments: number): string {
  let value = text;
  if (value.endsWith("/")) {
    value = value.slice(0, -1);
  }
  const parts = value.split("/");
  if (parts.length > segments) {
    value = parts.slice(-segments).join("/");
  }
  return value;
}

interface CustomizeStageProps {
  selectedCard: CardType;
  options: CardOptions;
  onOptionChange: <K extends keyof CardOptions>(
    key: K,
    value: CardOptions[K],
  ) => void;
  card: CardUrlBuilder;
  setStage: (stageIndex: StageIndex) => void;
}

export function CustomizeStage({
  selectedCard,
  options,
  onOptionChange,
  card,
  setStage,
}: CustomizeStageProps): JSX.Element {
  const cardType = selectedCard;
  const isAuthenticated = useIsAuthenticated();

  const {
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
  } = options;

  return (
    <div className="w-full flex flex-wrap">
      <div className="h-auto lg:w-2/5 md:w-1/2 p-10 rounded-sm bg-base-200">
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
                      className="underline text-primary"
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
            onValueChange={(value) => {
              onOptionChange("selectedUserId", value);
            }}
            onPaste={(e) => {
              e.preventDefault();
              // if the user pasted a full GitHub URL, extract username
              onOptionChange(
                "selectedUserId",
                pastedPathTail(e.clipboardData.getData("text"), 1),
              );
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
                      className="underline text-primary"
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
            onValueChange={(value) => {
              onOptionChange("repo", value);
            }}
            onPaste={(e) => {
              e.preventDefault();
              // if the user pasted a full GitHub URL, extract owner/repo
              onOptionChange(
                "repo",
                pastedPathTail(e.clipboardData.getData("text"), 2),
              );
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
                      className="underline text-primary"
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
            onValueChange={(value) => {
              onOptionChange("gist", value);
            }}
            onPaste={(e) => {
              e.preventDefault();
              // if the user pasted a full GitHub URL, extract Gist ID
              onOptionChange(
                "gist",
                pastedPathTail(e.clipboardData.getData("text"), 1),
              );
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
                  className="underline text-primary"
                >
                  WakaTime
                </a>{" "}
                username to fetch your stats.
              </>
            }
            placeholder={`e.g. "${DEMO_WAKATIME_USER}"`}
            value={wakatimeUser}
            onValueChange={(value) => {
              onOptionChange("wakatimeUser", value);
            }}
          />
        )}
        {cardType === CardType.STATS && (
          <CheckboxSection
            title="Show All Stats?"
            text="Show all available statistics."
            question="Show all stats?"
            checked={showAllStats}
            onCheckedChange={(checked) => {
              onOptionChange("showAllStats", checked);
            }}
          />
        )}
        {cardType === CardType.STATS && (
          <StatsRankSection
            selectedOption={selectedStatsRank}
            onOptionChange={(option) => {
              onOptionChange("selectedStatsRank", option);
            }}
          />
        )}
        {cardType === CardType.STATS && (
          <CheckboxSection
            title="Show Icons?"
            text="Show icons next to all stats."
            question="Show icons?"
            checked={showIcons}
            onCheckedChange={(checked) => {
              onOptionChange("showIcons", checked);
            }}
          />
        )}
        {cardType === CardType.STATS && (
          <CheckboxSection
            title="Include All Commits?"
            text="Count total commits or just commits of the last 365 days."
            question="Include all commits?"
            checked={includeAllCommits}
            onCheckedChange={(checked) => {
              onOptionChange("includeAllCommits", checked);
            }}
          />
        )}
        {cardType === CardType.TOP_LANGS && (
          <LanguagesLayoutSection
            selectedLanguageLayoutOption={selectedLanguagesLayout}
            onLanguageLayoutOptionChange={(option) => {
              onOptionChange("selectedLanguagesLayout", option);
            }}
          />
        )}
        {cardType === CardType.WAKATIME && (
          <WakatimeLayoutSection
            selectedOption={selectedWakatimeLayout}
            onOptionChange={(option) => {
              onOptionChange("selectedWakatimeLayout", option);
            }}
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
            onValueChange={(value) => {
              onOptionChange("langsCount", value);
            }}
            min={1}
            max={20}
          />
        )}
        {cardType === CardType.TOP_LANGS && (
          <CheckboxSection
            title="Hide Values?"
            text="Hide language percentages or bytes while keeping the selected layout visible."
            question="Hide values?"
            checked={hideValues}
            onCheckedChange={(checked) => {
              onOptionChange("hideValues", checked);
            }}
          />
        )}
        {cardType === CardType.WAKATIME && (
          <CheckboxSection
            title="Show Percentages?"
            text="Show time spent in hours or percentages."
            question="Show percentages?"
            checked={usePercent}
            onCheckedChange={(checked) => {
              onOptionChange("usePercent", checked);
            }}
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
            onCheckedChange={(checked) => {
              onOptionChange("showTitle", checked);
            }}
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
            onValueChange={(value) => {
              onOptionChange("customTitle", value);
            }}
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
            onCheckedChange={(checked) => {
              onOptionChange("enableAnimations", checked);
            }}
          />
        )}
        {(cardType === CardType.PIN || cardType === CardType.GIST) && (
          <CheckboxSection
            title="Show Owner?"
            text="Shows the repo owner's name next to the repo name."
            question="Show owner?"
            checked={showOwner}
            onCheckedChange={(checked) => {
              onOptionChange("showOwner", checked);
            }}
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
            onValueChange={(value) => {
              onOptionChange("descriptionLines", value);
            }}
            min={1}
            max={3}
          />
        )}
        <div className="pl-10 pr-10">
          For more customization options check the{" "}
          <a
            href="https://github.com/stats-organization/github-stats-extended/blob/master/docs/advanced_documentation.md"
            target="_blank"
            className="underline text-primary"
          >
            customization documentation
          </a>{" "}
          after you copied your card URL in step 5.
        </div>
      </div>
      <div className="w-full lg:w-3/5 md:w-1/2 object-center pt-5 md:pt-0 pl-0 md:pl-5 lg:pl-0">
        <div className="w-full lg:w-3/5 mx-auto flex flex-col justify-center sticky top-32">
          <CardImage card={card} stage={2} />
        </div>
      </div>
    </div>
  );
}
