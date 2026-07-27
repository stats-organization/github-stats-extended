import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import { useDispatch } from "react-redux";
import { BounceLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";

import { authenticate } from "../../api/user";
import { DEFAULT_OPTION as LANGUAGES_DEFAULT_LAYOUT } from "../../components/Home/LanguagesLayoutSection";
import { DEFAULT_OPTION as WAKATIME_DEFAULT_LAYOUT } from "../../components/Home/WakatimeLayoutSection";
import { DEMO_USER } from "../../constants";
import { CardType } from "../../models/CardType";
import { STAGE_LABELS } from "../../models/Stage";
import type { StageIndex } from "../../models/Stage";
import { useTheme } from "../../redux/selectors/themeSelectors";
import {
  useIsAuthenticated,
  usePrivateAccess,
  useUserId,
} from "../../redux/selectors/userSelectors";
import { login } from "../../redux/slices/user";

import { buildCardUrl } from "./buildCardUrl";
import { getDefaultCardOptions } from "./cardOptions";
import type { CardOptions } from "./cardOptions";
import { CustomizeStage } from "./stages/Customize";
import { DisplayStage } from "./stages/Display";
import { LoginStage } from "./stages/Login/Login";
import { SelectCardStage } from "./stages/SelectCard";
import { ThemeStage } from "./stages/Theme";
import { useCardDescriptor } from "./useCardDescriptor";

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

  const [selectedCard, setSelectedCard] = useState<CardType>(CardType.STATS);

  // for stages two and three
  const [cardOptions, setCardOptions] = useState(() =>
    getDefaultCardOptions(userId),
  );

  const setCardOption = useCallback<
    <K extends keyof CardOptions>(key: K, value: CardOptions[K]) => void
  >((key, value) => {
    setCardOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Reset the selected user to the resolved account id when it changes,
  // adjusting state during render rather than in an effect:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setCardOptions((prev) => ({ ...prev, selectedUserId: userId }));
  }

  const { isDark } = useTheme();
  const [theme, setTheme] = useState(isDark ? "dark" : "default");

  const handleCardTypeChange = (cardType: CardType) => {
    if (cardType === CardType.TOP_LANGS) {
      setCardOptions((prev) => ({
        ...prev,
        langsCount: 4,
        selectedWakatimeLayout: WAKATIME_DEFAULT_LAYOUT,
      }));
    } else if (cardType === CardType.WAKATIME) {
      setCardOptions((prev) => ({
        ...prev,
        langsCount: 6,
        selectedLanguagesLayout: LANGUAGES_DEFAULT_LAYOUT,
      }));
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

  // Memoized so the builder keeps a stable reference across renders when its
  // inputs are unchanged. Card components consume it by value (they derive a URL
  // string), but memoizing keeps it safe to pass as a prop if any of them are
  // ever wrapped in React.memo.
  const cardBuilder = useMemo(
    () => buildCardUrl(userId, selectedCard, cardOptions),
    [userId, selectedCard, cardOptions],
  );

  // Preview builder for the customize stage, dark-themed to match the surroundings.
  const customizeCardBuilder = useMemo(
    () => (isDark ? cardBuilder.theme("github_dark") : cardBuilder),
    [cardBuilder, isDark],
  );

  // for stage four
  const isRepoCard =
    selectedCard === CardType.PIN || selectedCard === CardType.GIST;
  const defaultTheme = isRepoCard ? "default_repocard" : "default";
  const isDefaultTheme = theme === defaultTheme;

  const themeBuilder = useMemo(
    () => (isDefaultTheme ? cardBuilder : cardBuilder.theme(theme)),
    [cardBuilder, isDefaultTheme, theme],
  );

  // for stage five
  const cardDescriptor = useCardDescriptor({
    selectedCard,
    themeBuilder,
    repo: cardOptions.repo,
    userId,
    wakatimeUser: cardOptions.wakatimeUser,
    gist: cardOptions.gist,
  });

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
    // After requesting GitHub access, GitHub redirects back to the app with a
    // code parameter appended to the redirect URI (which carries mode=private|public).
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code === null) {
      return;
    }

    const tempPrivateAccess = url.searchParams.get("mode") === "private";
    window.history.pushState({}, "", `${url.origin}/frontend`);

    async function exchangeCode(code: string) {
      setIsLoading(true);
      try {
        const userKey = uuidv4();
        const newUserId = await authenticate(code, tempPrivateAccess, userKey);
        dispatch(login({ userId: newUserId, userKey }));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    void exchangeCode(code);
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
      className="h-full px-2 lg:px-8 text-base-content/70"
    >
      <div className="flex flex-col">
        <div className="m-4 rounded-sm">
          <div className="lg:p-4">
            <h1 className="text-2xl text-base-content/70 font-semibold">
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
                      className="text-primary hover:underline font-semibold"
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
                STAGE_LABELS[stage].description
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
              options={cardOptions}
              onOptionChange={setCardOption}
              card={customizeCardBuilder}
              setStage={setStage}
            />
          )}
          {stage === 3 && (
            <ThemeStage
              card={cardBuilder}
              theme={theme}
              onThemeChange={(theme) => {
                setTheme(theme);
                setStage(4);
              }}
            />
          )}
          {stage === 4 && (
            <DisplayStage
              filename={cardBuilder.filename()}
              link={cardDescriptor.link}
              theme={theme}
              card={themeBuilder}
              guestHint={
                isAuthenticated
                  ? null
                  : `Replace the sample ${cardDescriptor.guestHint} with your own after copying your Markdown or URL!`
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
