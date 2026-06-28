import { useMemo } from "react";
import type { JSX } from "react";

import { Card } from "../../../components/Card/Card";
import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
} from "../../../constants";
import { CardType } from "../../../models/CardType";
import { useTheme } from "../../../redux/selectors/themeSelectors";
import { useUserId } from "../../../redux/selectors/userSelectors";

interface SelectCardStageProps {
  selectedCardType: CardType;
  onCardTypeChange: (cardType: CardType) => void;
}

export function SelectCardStage({
  selectedCardType,
  onCardTypeChange,
}: SelectCardStageProps): JSX.Element {
  const userId = useUserId(DEMO_USER);
  const { isDark } = useTheme();
  // Show dark-themed demo cards in dark mode so they fit the surroundings.
  const themeParam = isDark ? "&theme=github_dark" : "";

  const options = useMemo<
    Array<{
      title: string;
      description: string;
      demoImageSrc: string;
      cardType: CardType;
    }>
  >(
    () => [
      {
        title: "GitHub Stats Card",
        description: "your overall GitHub statistics",
        demoImageSrc: `?username=${userId}&include_all_commits=true${themeParam}`,
        cardType: CardType.STATS,
      },
      {
        title: "Top Languages Card",
        description: "your most frequently used languages",
        demoImageSrc: `/top-langs?username=${userId}&langs_count=4${themeParam}`,
        cardType: CardType.TOP_LANGS,
      },
      {
        title: "GitHub Extra Pin",
        description:
          "pin more than 6 repositories in your profile using a GitHub profile readme",
        demoImageSrc: `/pin?repo=${DEMO_REPO}${themeParam}`,
        cardType: CardType.PIN,
      },
      {
        title: "GitHub Gist Pin",
        description:
          "pin gists in your GitHub profile using a GitHub profile readme",
        demoImageSrc: `/gist?id=${DEMO_GIST}${themeParam}`,
        cardType: CardType.GIST,
      },
      {
        title: "WakaTime Stats Card",
        description: "your coding activity from WakaTime",
        demoImageSrc: `/wakatime?username=${DEMO_WAKATIME_USER}&langs_count=6&card_width=450${themeParam}`,
        cardType: CardType.WAKATIME,
      },
    ],
    [userId, themeParam],
  );

  return (
    <div className="w-full flex flex-wrap">
      {options.map((card) => (
        <button
          className="p-2 lg:p-4"
          key={card.cardType}
          type="button"
          onClick={() => {
            onCardTypeChange(card.cardType);
          }}
        >
          <Card
            title={card.title}
            description={card.description}
            imageSrc={card.demoImageSrc}
            selected={selectedCardType === card.cardType}
            fixedSize
            stage={1}
          />
        </button>
      ))}
    </div>
  );
}
