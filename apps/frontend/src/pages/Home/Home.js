import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import BounceLoader from "react-spinners/BounceLoader";

import { v4 as uuidv4 } from "uuid";
import {
  CustomizeStage,
  DisplayStage,
  LoginStage,
  SelectCardStage,
  ThemeStage,
} from "./stages";

import { authenticate } from "../../api";
import { login as _login } from "../../redux/actions/userActions";
import {
  HOST,
  DEMO_USER,
  DEMO_WAKATIME_USER,
  DEMO_REPO,
  DEMO_GIST,
} from "../../constants";
import { CardTypes } from "../../utils";
import { DEFAULT_OPTION as STATS_DEFAULT_RANK } from "../../components/Home/StatsRankSection";
import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import {
  useUserId,
  useIsAuthenticated,
  usePrivateAccess,
} from "../../redux/selectors/userSelectors";
import axios from "axios";

const HomeScreen = ({ stage, setStage }) => {
  const [isLoading, setIsLoading] = useState(false);

  const userId = useUserId(DEMO_USER);
  const privateAccess = usePrivateAccess();
  const isAuthenticated = useIsAuthenticated();

  const dispatch = useDispatch();

  const login = (newUserId, userKey) => dispatch(_login(newUserId, userKey));

  // for stage two
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [repo, setRepo] = useState(DEMO_REPO);
  const [gist, setGist] = useState(DEMO_GIST);
  const [wakatimeUser, setWakatimeUser] = useState(DEMO_WAKATIME_USER);

  const [selectedCard, setSelectedCard] = useState("stats");

  useEffect(() => {
    setSelectedUserId(userId);
  }, [userId]);

  // for stage three
  const [selectedStatsRank, setSelectedStatsRank] =
    useState(STATS_DEFAULT_RANK);
  const [selectedLanguagesLayout, setSelectedLanguagesLayout] = useState(
    LANGUAGES_DEFAULT_LAYOUT,
  );
  const [selectedWakatimeLayout, setSelectedWakatimeLayout] = useState(
    WAKATIME_DEFAULT_LAYOUT,
  );

  const [showTitle, setShowTitle] = useState(true);
  const [showOwner, setShowOwner] = useState(false);
  const [descriptionLines, setDescriptionLines] = useState();
  const [customTitle, setCustomTitle] = useState("");
  const [langsCount, setLangsCount] = useState();
  const [showAllStats, setShowAllStats] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [includeAllCommits, setIncludeAllCommits] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [usePercent, setUsePercent] = useState(false);

  const resetCustomization = () => {
    if (selectedCard === CardTypes.TOP_LANGS) {
      setLangsCount(4);
    }
    if (selectedCard === CardTypes.WAKATIME) {
      setLangsCount(6);
    }

    if (selectedCard === CardTypes.TOP_LANGS) {
      setSelectedWakatimeLayout(WAKATIME_DEFAULT_LAYOUT);
    }
    if (selectedCard === CardTypes.WAKATIME) {
      setSelectedLanguagesLayout(LANGUAGES_DEFAULT_LAYOUT);
    }

    if (theme === "default" || theme === "default_repocard") {
      if (selectedCard === CardTypes.PIN || selectedCard === CardTypes.GIST) {
        setTheme("default_repocard");
      } else {
        setTheme("default");
      }
    }
  };

  useEffect(() => {
    resetCustomization();
  }, [selectedCard]);

  let fullSuffix = `${selectedCard === CardTypes.STATS ? "" : "/" + selectedCard}?`;

  switch (selectedCard) {
    case CardTypes.STATS:
    case CardTypes.TOP_LANGS:
      fullSuffix += `username=${selectedUserId}`;
      break;
    case CardTypes.PIN:
      fullSuffix += `username=${userId}&repo=${repo}`;
      break;
    case CardTypes.GIST:
      fullSuffix += `id=${gist}`;
      break;
    case CardTypes.WAKATIME:
      fullSuffix += `username=${wakatimeUser}`;
  }

  if (
    selectedStatsRank !== STATS_DEFAULT_RANK &&
    selectedCard === CardTypes.STATS
  ) {
    fullSuffix += `&rank_icon=${selectedStatsRank.value}`;
  }

  if (
    selectedLanguagesLayout !== LANGUAGES_DEFAULT_LAYOUT &&
    selectedCard === CardTypes.TOP_LANGS
  ) {
    fullSuffix += `&layout=${selectedLanguagesLayout.value}`;
  }

  if (
    selectedWakatimeLayout !== WAKATIME_DEFAULT_LAYOUT &&
    selectedCard === CardTypes.WAKATIME
  ) {
    fullSuffix += `&layout=${selectedWakatimeLayout.value}`;
  }

  if (
    !showTitle &&
    (selectedCard === CardTypes.STATS ||
      selectedCard === CardTypes.TOP_LANGS ||
      selectedCard === CardTypes.WAKATIME)
  ) {
    fullSuffix += "&hide_title=true";
  }

  if (
    showOwner &&
    (selectedCard === CardTypes.PIN || selectedCard === CardTypes.GIST)
  ) {
    fullSuffix += "&show_owner=true";
  }

  if (descriptionLines && selectedCard === CardTypes.PIN) {
    fullSuffix += `&description_lines_count=${descriptionLines}`;
  }

  if (
    customTitle &&
    (selectedCard === CardTypes.STATS || selectedCard === CardTypes.WAKATIME)
  ) {
    const encodedTitle = encodeURIComponent(customTitle);
    fullSuffix += `&custom_title=${encodedTitle}`;
  }

  if (
    langsCount &&
    (selectedCard === CardTypes.TOP_LANGS ||
      selectedCard === CardTypes.WAKATIME)
  ) {
    fullSuffix += `&langs_count=${langsCount}`;
  }

  if (showAllStats && selectedCard === CardTypes.STATS) {
    fullSuffix += `&show=reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage,prs_commented,prs_reviewed,issues_commented`;
  }

  if (showIcons && selectedCard === CardTypes.STATS) {
    fullSuffix += `&show_icons=true`;
  }

  if (includeAllCommits && selectedCard === CardTypes.STATS) {
    fullSuffix += `&include_all_commits=true`;
  }

  if (
    !enableAnimations &&
    (selectedCard === CardTypes.STATS ||
      selectedCard === CardTypes.TOP_LANGS ||
      selectedCard === CardTypes.WAKATIME)
  ) {
    fullSuffix += `&disable_animations=${!enableAnimations}`;
  }

  if (usePercent && selectedCard === CardTypes.WAKATIME) {
    fullSuffix += `&display_format=percent`;
  }

  // for stage four
  const [theme, setTheme] = useState("default");
  let themeSuffix = fullSuffix;

  if (
    !(
      (theme === "default" &&
        [CardTypes.STATS, CardTypes.TOP_LANGS, CardTypes.WAKATIME].includes(
          selectedCard,
        )) ||
      (theme === "default_repocard" &&
        [CardTypes.PIN, CardTypes.GIST].includes(selectedCard))
    )
  ) {
    themeSuffix += `&theme=${theme}`;
  }

  // for stage five
  const [gistUrl, setGistUrl] = useState("");

  let guestHint;
  switch (selectedCard) {
    case CardTypes.STATS:
    case CardTypes.TOP_LANGS:
      guestHint = `username "${DEMO_USER}"`;
      break;
    case CardTypes.PIN:
      guestHint = `repo "${DEMO_REPO}"`;
      break;
    case CardTypes.GIST:
      guestHint = `Gist ID "${DEMO_GIST}"`;
      break;
    case CardTypes.WAKATIME:
      guestHint = `WakaTime username "${DEMO_WAKATIME_USER}"`;
  }

  useEffect(() => {
    const fetchGistUrl = async (gistId) => {
      try {
        const fullUrl = `https://api.github.com/gists/${gistId}`;
        const result = await axios.get(fullUrl);
        return result.data.html_url;
      } catch (error) {
        console.error(error);
        return "";
      }
    };

    fetchGistUrl(gist).then(setGistUrl);
  }, [gist]);

  const contentSectionRef = useRef(null);

  useEffect(() => {
    // scroll to top of content section if we're scrolled down
    if (contentSectionRef.current) {
      const rect = contentSectionRef.current.getBoundingClientRect();
      if (rect.top < 0) {
        contentSectionRef.current.scrollIntoView();
        // additional offset to account for sticky progress bar
        window.scrollBy({ top: -80 });
      }
    }
  }, [stage]);

  useEffect(() => {
    async function redirectCode() {
      // After requesting Github access, Github redirects back to your app with a code parameter
      const url = window.location.href;

      // If Github API returns the code parameter
      if (url.includes("code=")) {
        const tempPrivateAccess = url.includes("private");
        const newUrl = url.split("?code=");
        const redirect = `${url.split(HOST)[0]}${HOST}/frontend`;
        window.history.pushState({}, null, redirect);
        setIsLoading(true);
        const userKey = uuidv4();
        const newUserId = await authenticate(
          newUrl[1],
          tempPrivateAccess,
          userKey,
        );
        login(newUserId, userKey);
        setIsLoading(false);
      }
    }

    redirectCode();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full py-8 flex justify-center items-center">
        <BounceLoader color="#3B82F6" />
      </div>
    );
  }

  return (
    <div
      ref={contentSectionRef}
      className="h-full px-2 lg:px-8 text-gray-600 body-font"
    >
      <div className="flex flex-col">
        <div className="m-4 rounded-sm">
          <div className="lg:p-4">
            <div className="text-2xl text-gray-600 font-semibold">
              {
                [
                  "Login",
                  "Select a Card",
                  "Modify Card Parameters",
                  "Choose a Theme",
                  "Display your Card",
                ][stage]
              }
            </div>
            <div>
              {stage === 0 && isAuthenticated ? (
                <div>
                  <p>
                    You are logged in as{" "}
                    <a
                      href={`https://github.com/${userId}`}
                      target="_blank"
                      className="text-blue-500 hover:underline font-semibold"
                    >
                      {userId}
                    </a>
                    .
                  </p>
                  <p>
                    {privateAccess ? (
                      <>
                        You granted GitHub-Stats-Extended access to both your{" "}
                        <b>public and private</b> contributions.
                      </>
                    ) : (
                      <>
                        You granted GitHub-Stats-Extended access to your{" "}
                        <b>public</b> contributions.
                      </>
                    )}
                  </p>
                </div>
              ) : (
                [
                  "",
                  "You will be able to customize your card in future steps.",
                  "",
                  "",
                  "Display the finished card on GitHub, Twitter/X, LinkedIn, or anywhere else!",
                ][stage]
              )}
            </div>
          </div>
          {stage === 0 && <LoginStage setCurrItem={setStage} />}
          {stage === 1 && (
            <SelectCardStage
              selectedCard={selectedCard}
              setSelectedCard={setSelectedCard}
              setStage={setStage}
            />
          )}
          {stage === 2 && (
            <CustomizeStage
              selectedCard={selectedCard || CardTypes.STATS}
              selectedStatsRank={selectedStatsRank}
              setSelectedStatsRank={setSelectedStatsRank}
              selectedLanguagesLayout={selectedLanguagesLayout}
              setSelectedLanguagesLayout={setSelectedLanguagesLayout}
              selectedWakatimeLayout={selectedWakatimeLayout}
              setSelectedWakatimeLayout={setSelectedWakatimeLayout}
              showTitle={showTitle}
              setShowTitle={setShowTitle}
              showOwner={showOwner}
              setShowOwner={setShowOwner}
              descriptionLines={descriptionLines}
              setDescriptionLines={setDescriptionLines}
              customTitle={customTitle}
              setCustomTitle={setCustomTitle}
              langsCount={langsCount}
              setLangsCount={setLangsCount}
              showAllStats={showAllStats}
              setShowAllStats={setShowAllStats}
              showIcons={showIcons}
              setShowIcons={setShowIcons}
              includeAllCommits={includeAllCommits}
              setIncludeAllCommits={setIncludeAllCommits}
              enableAnimations={enableAnimations}
              setEnableAnimations={setEnableAnimations}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              repo={repo}
              setRepo={setRepo}
              gist={gist}
              setGist={setGist}
              wakatimeUser={wakatimeUser}
              setWakatimeUser={setWakatimeUser}
              usePercent={usePercent}
              setUsePercent={setUsePercent}
              fullSuffix={fullSuffix}
              setStage={setStage}
            />
          )}
          {stage === 3 && (
            <ThemeStage
              theme={theme}
              setTheme={setTheme}
              setStage={setStage}
              fullSuffix={fullSuffix}
            />
          )}
          {stage === 4 && (
            <DisplayStage
              filename={(() => {
                switch (selectedCard) {
                  case CardTypes.STATS:
                  case CardTypes.TOP_LANGS:
                    return `${selectedUserId}_card`;
                  case CardTypes.PIN:
                    return `${repo}_card`;
                  case CardTypes.GIST:
                    return `gist_card`;
                  case CardTypes.WAKATIME:
                    return `${wakatimeUser}_card`;
                }
              })()}
              link={(() => {
                switch (selectedCard) {
                  case CardTypes.STATS:
                  case CardTypes.TOP_LANGS:
                    return `https://${HOST}/api${themeSuffix}`;
                  case CardTypes.PIN:
                    let myRepo = repo;
                    if (!myRepo.includes("/")) {
                      myRepo = `${userId}/${myRepo}`;
                    }
                    return `https://github.com/${myRepo}`;
                  case CardTypes.GIST:
                    return gistUrl;
                  case CardTypes.WAKATIME:
                    return `https://wakatime.com/@${wakatimeUser}`;
                }
              })()}
              themeSuffix={themeSuffix}
              guestHint={
                isAuthenticated
                  ? null
                  : `Replace the sample ${guestHint} with your own after copying your Markdown or URL!`
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

HomeScreen.propTypes = {
  stage: PropTypes.number.isRequired,
  setStage: PropTypes.func.isRequired,
};

export default HomeScreen;
