import React from "react";
import PropTypes from "prop-types";

import { CheckboxSection, Image } from "../../../components";
import { CardTypes } from "../../../utils";
import TextSection from "../../../components/Home/TextSection";
import NumericSection from "../../../components/Home/NumericSection";
import StatsRankSection from "../../../components/Home/StatsRankSection";
import LanguagesLayoutSection from "../../../components/Home/LanguagesLayoutSection";
import WakatimeLayoutSection from "../../../components/Home/WakatimeLayoutSection";
import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
} from "../../../constants";
import { useIsAuthenticated } from "../../../redux/selectors/userSelectors";

const CustomizeStage = ({
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
}) => {
  const cardType = selectedCard || CardTypes.STATS;
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="w-full flex flex-wrap">
      <div className="h-auto lg:w-2/5 md:w-1/2 p-10 rounded-sm bg-gray-200">
        {(cardType === CardTypes.STATS || cardType === CardTypes.TOP_LANGS) && (
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
            setValue={setSelectedUserId}
            onPaste={(e) => {
              e.preventDefault();
              let newValue = e.clipboardData.getData("text");
              // if the user pasted a full GitHub URL, extract username
              if (newValue.endsWith("/")) {
                newValue = newValue.slice(0, -1);
              }
              let parts = newValue.split("/");
              if (parts.length > 1) {
                newValue = parts.slice(-1).join("/");
              }
              setSelectedUserId(newValue);
            }}
            disabled={!isAuthenticated}
          />
        )}
        {cardType === CardTypes.PIN && (
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
            setValue={setRepo}
            onPaste={(e) => {
              e.preventDefault();
              let newValue = e.clipboardData.getData("text");
              // if the user pasted a full GitHub URL, extract owner/repo
              if (newValue.endsWith("/")) {
                newValue = newValue.slice(0, -1);
              }
              let parts = newValue.split("/");
              if (parts.length > 2) {
                newValue = parts.slice(-2).join("/");
              }
              setRepo(newValue);
            }}
            disabled={!isAuthenticated}
          />
        )}
        {cardType === CardTypes.GIST && (
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
            setValue={setGist}
            onPaste={(e) => {
              e.preventDefault();
              let newValue = e.clipboardData.getData("text");
              // if the user pasted a full GitHub URL, extract Gist ID
              if (newValue.endsWith("/")) {
                newValue = newValue.slice(0, -1);
              }
              let parts = newValue.split("/");
              if (parts.length > 1) {
                newValue = parts.slice(-1).join("/");
              }
              setGist(newValue);
            }}
            disabled={!isAuthenticated}
          />
        )}
        {cardType === CardTypes.WAKATIME && (
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
            setValue={setWakatimeUser}
          />
        )}
        {cardType === CardTypes.STATS && (
          <CheckboxSection
            title="Show All Stats?"
            text="Show all available statistics."
            question="Show all stats?"
            variable={showAllStats}
            setVariable={setShowAllStats}
          />
        )}
        {cardType === CardTypes.STATS && (
          <StatsRankSection
            selectedOption={selectedStatsRank}
            setSelectedOption={setSelectedStatsRank}
          />
        )}
        {cardType === CardTypes.STATS && (
          <CheckboxSection
            title="Show Icons?"
            text="Show icons next to all stats."
            question="Show icons?"
            variable={showIcons}
            setVariable={setShowIcons}
          />
        )}
        {cardType === CardTypes.STATS && (
          <CheckboxSection
            title="Include All Commits?"
            text="Count total commits or just commits of the last 365 days."
            question="Include all commits?"
            variable={includeAllCommits}
            setVariable={setIncludeAllCommits}
          />
        )}
        {cardType === CardTypes.TOP_LANGS && (
          <LanguagesLayoutSection
            selectedOption={selectedLanguagesLayout}
            setSelectedOption={setSelectedLanguagesLayout}
          />
        )}
        {cardType === CardTypes.WAKATIME && (
          <WakatimeLayoutSection
            selectedOption={selectedWakatimeLayout}
            setSelectedOption={setSelectedWakatimeLayout}
          />
        )}
        {(cardType === CardTypes.TOP_LANGS ||
          cardType === CardTypes.WAKATIME) && (
          <NumericSection
            title="Language Count"
            text="Set the number of languages to be shown.<br>Leave empty for default count."
            value={langsCount}
            setValue={setLangsCount}
            min={1}
            max={20}
          />
        )}
        {cardType === CardTypes.WAKATIME && (
          <CheckboxSection
            title="Show Percentages?"
            text="Show time spent in hours or percentages."
            question="Show percentages?"
            variable={usePercent}
            setVariable={setUsePercent}
          />
        )}
        {(cardType === CardTypes.STATS ||
          cardType === CardTypes.TOP_LANGS ||
          cardType === CardTypes.WAKATIME) && (
          <CheckboxSection
            title="Show Title?"
            text="Shows a title at the top of the card."
            question="Show title?"
            variable={showTitle}
            setVariable={setShowTitle}
          />
        )}
        {(cardType === CardTypes.STATS || cardType === CardTypes.WAKATIME) && (
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
            setValue={setCustomTitle}
          />
        )}
        {(cardType === CardTypes.STATS ||
          cardType === CardTypes.TOP_LANGS ||
          cardType === CardTypes.WAKATIME) && (
          <CheckboxSection
            title="Enable Animations?"
            // text="Enable Animations."
            question="enable animations?"
            variable={enableAnimations}
            setVariable={setEnableAnimations}
          />
        )}
        {(cardType === CardTypes.PIN || cardType === CardTypes.GIST) && (
          <CheckboxSection
            title="Show Owner?"
            text="Shows the repo owner's name next to the repo name."
            question="Show owner?"
            variable={showOwner}
            setVariable={setShowOwner}
          />
        )}
        {cardType === CardTypes.PIN && (
          <NumericSection
            title="Description Lines Count"
            text="Set the number of lines for the description. Will be clamped between 1 and 3.<br>Leave empty for automatic adjustment."
            value={descriptionLines}
            setValue={setDescriptionLines}
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
          <Image imageSrc={fullSuffix} stage={2} />
        </div>
      </div>
    </div>
  );
};

CustomizeStage.propTypes = {
  selectedCard: PropTypes.string.isRequired,
  selectedStatsRank: PropTypes.object.isRequired,
  setSelectedStatsRank: PropTypes.func.isRequired,
  selectedLanguagesLayout: PropTypes.object.isRequired,
  setSelectedLanguagesLayout: PropTypes.func.isRequired,
  selectedWakatimeLayout: PropTypes.object.isRequired,
  setSelectedWakatimeLayout: PropTypes.func.isRequired,
  selectedUserId: PropTypes.string.isRequired,
  setSelectedUserId: PropTypes.func.isRequired,
  repo: PropTypes.string.isRequired,
  setRepo: PropTypes.func.isRequired,
  gist: PropTypes.string.isRequired,
  setGist: PropTypes.func.isRequired,
  wakatimeUser: PropTypes.string.isRequired,
  setWakatimeUser: PropTypes.func.isRequired,
  showTitle: PropTypes.bool.isRequired,
  setShowTitle: PropTypes.func.isRequired,
  descriptionLines: PropTypes.number.isRequired,
  setDescriptionLines: PropTypes.func.isRequired,
  showOwner: PropTypes.bool.isRequired,
  setShowOwner: PropTypes.func.isRequired,
  customTitle: PropTypes.string.isRequired,
  setCustomTitle: PropTypes.func.isRequired,
  langsCount: PropTypes.number.isRequired,
  setLangsCount: PropTypes.func.isRequired,
  showIcons: PropTypes.bool.isRequired,
  setShowIcons: PropTypes.func.isRequired,
  showAllStats: PropTypes.bool.isRequired,
  setShowAllStats: PropTypes.func.isRequired,
  includeAllCommits: PropTypes.bool.isRequired,
  setIncludeAllCommits: PropTypes.func.isRequired,
  enableAnimations: PropTypes.bool.isRequired,
  setEnableAnimations: PropTypes.func.isRequired,
  usePercent: PropTypes.bool.isRequired,
  setUsePercent: PropTypes.func.isRequired,
  fullSuffix: PropTypes.string.isRequired,
  setStage: PropTypes.func.isRequired,
};

export default CustomizeStage;
