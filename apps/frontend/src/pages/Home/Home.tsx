import { useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import { useDispatch } from "react-redux";
import BounceLoader from "react-spinners/BounceLoader";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { authenticate } from "../../api/user";
import { login } from "../../redux/slices/user";
import {
  HOST,
  DEMO_USER,
  DEMO_WAKATIME_USER,
  DEMO_REPO,
  DEMO_GIST,
} from "../../constants";
import { CardType } from "../../models/CardType";
import { DEFAULT_OPTION as STATS_DEFAULT_RANK } from "../../components/Home/StatsRankSection";
import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import {
  useUserId,
  useIsAuthenticated,
  usePrivateAccess,
} from "../../redux/selectors/userSelectors";
import { STAGE_LABELS } from "../../models/Stage";
import type { StageIndex } from "../../models/Stage";

import { CustomizeStage } from "./stages/Customize";
import { DisplayStage } from "./stages/Display";
import { LoginStage } from "./stages/Login/Login";
import { SelectCardStage } from "./stages/SelectCard";
import { ThemeStage } from "./stages/Theme";

interface HomeScreenProps {
  stage: StageIndex;
  setStage: (stageIndex: StageIndex) => void;
}

export function HomeScreen({ stage, setStage }: HomeScreenProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

  const userId = useUserId(DEMO_USER);
  const privateAccess = usePrivateAccess();
  const isAuthenticated = useIsAuthenticated();

  const dispatch = useDispatch();

  // for stage two
  const [selectedUserId, setSelectedUserId] = useState<string>(userId);
  const [repo, setRepo] = useState(DEMO_REPO);
  const [gist, setGist] = useState(DEMO_GIST);
  const [wakatimeUser, setWakatimeUser] = useState(DEMO_WAKATIME_USER);

  const [selectedCard, setSelectedCard] = useState<CardType>(CardType.STATS);

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
  const [descriptionLines, setDescriptionLines] = useState<
    number | undefined
  >();
  const [customTitle, setCustomTitle] = useState("");
  const [langsCount, setLangsCount] = useState<number | undefined>();
  const [showAllStats, setShowAllStats] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [includeAllCommits, setIncludeAllCommits] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [usePercent, setUsePercent] = useState(false);

  const [theme, setTheme] = useState("default");

  const handleCardTypeChange = (cardType: CardType) => {
    if (cardType === CardType.TOP_LANGS) {
      setLangsCount(4);
      setSelectedWakatimeLayout(WAKATIME_DEFAULT_LAYOUT);
    } else if (cardType === CardType.WAKATIME) {
      setLangsCount(6);
      setSelectedLanguagesLayout(LANGUAGES_DEFAULT_LAYOUT);
    }

    if (theme === "default" || theme === "default_repocard") {
      if (cardType === CardType.PIN || cardType === CardType.GIST) {
        setTheme("default_repocard");
      } else {
        setTheme("default");
      }
    }

    setSelectedCard(cardType);
    // Go to the next stage
    setStage(2);
  };

  let fullSuffix = `${selectedCard === CardType.STATS ? "" : "/" + selectedCard}?`;

  switch (selectedCard) {
    case CardType.STATS:
    case CardType.TOP_LANGS:
      fullSuffix += `username=${selectedUserId}`;
      break;
    case CardType.PIN:
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

  // for stage four
  let themeSuffix = fullSuffix;

  if (
    !(
      (theme === "default" &&
        [CardType.STATS, CardType.TOP_LANGS, CardType.WAKATIME].includes(
          selectedCard as never,
        )) ||
      (theme === "default_repocard" &&
        [CardType.PIN, CardType.GIST].includes(selectedCard as never))
    )
  ) {
    themeSuffix += `&theme=${theme}`;
  }

  // for stage five
  const [gistUrl, setGistUrl] = useState("");

  const guestHint = useMemo(() => {
    switch (selectedCard) {
      case CardType.STATS:
      case CardType.TOP_LANGS:
        return `username "${DEMO_USER}"`;
      case CardType.PIN:
        return `repo "${DEMO_REPO}"`;
      case CardType.GIST:
        return `Gist ID "${DEMO_GIST}"`;
      case CardType.WAKATIME:
        return `WakaTime username "${DEMO_WAKATIME_USER}"`;
      default:
        selectedCard satisfies never;
        return "";
    }
  }, [selectedCard]);

  useEffect(() => {
    async function fetchGistURL() {
      try {
        const fullUrl = `https://api.github.com/gists/${gist}`;
        const result = await axios.get<{ html_url: string }>(fullUrl);
        setGistUrl(result.data.html_url);
      } catch (error) {
        console.error(error);
      }
    }
    void fetchGistURL();
  }, [gist]);

  const contentSectionRef = useRef<HTMLDivElement | null>(null);

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
        const newUrl = url.split("?code=", 2) as [string, string];
        const redirect = `${url.split(HOST)[0] as string}${HOST}/frontend`;
        window.history.pushState({}, "", redirect);
        setIsLoading(true);
        const userKey = uuidv4();
        const newUserId = await authenticate(
          newUrl[1],
          tempPrivateAccess,
          userKey,
        );

        dispatch(login({ userId: newUserId, userKey }));

        setIsLoading(false);
      }
    }

    void redirectCode();
  }, [dispatch]);

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
            <h1 className="text-2xl text-gray-600 font-semibold">
              {STAGE_LABELS[stage].title}
            </h1>
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
          {stage === 0 && (
            <LoginStage
              onContinueAsGuest={() => {
                setStage(1);
              }}
            />
          )}
          {stage === 1 && (
            <SelectCardStage
              selectedCardType={selectedCard}
              onCardTypeChange={handleCardTypeChange}
            />
          )}
          {stage === 2 && (
            <CustomizeStage
              selectedCard={selectedCard}
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
              fullSuffix={fullSuffix}
              theme={theme}
              onThemeChange={(theme) => {
                setTheme(theme);
                setStage(4);
              }}
            />
          )}
          {stage === 4 && (
            <DisplayStage
              filename={(() => {
                switch (selectedCard) {
                  case CardType.STATS:
                  case CardType.TOP_LANGS:
                    return `${selectedUserId}_card`;
                  case CardType.PIN:
                    return `${repo}_card`;
                  case CardType.GIST:
                    return `gist_card`;
                  case CardType.WAKATIME:
                    return `${wakatimeUser}_card`;
                  default:
                    selectedCard satisfies never;
                    return "";
                }
              })()}
              link={(() => {
                switch (selectedCard) {
                  case CardType.STATS:
                  case CardType.TOP_LANGS:
                    return `https://${HOST}/api${themeSuffix}`;

                  case CardType.PIN: {
                    let myRepo = repo;
                    if (!myRepo.includes("/")) {
                      myRepo = `${userId}/${myRepo}`;
                    }
                    return `https://github.com/${myRepo}`;
                  }
                  case CardType.GIST:
                    return gistUrl;
                  case CardType.WAKATIME:
                    return `https://wakatime.com/@${wakatimeUser}`;
                  default:
                    selectedCard satisfies never;
                    return "";
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
}
