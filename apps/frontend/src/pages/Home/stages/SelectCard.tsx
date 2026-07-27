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
import { cardUrl } from "../../../models/CardUrl";
import type { CardUrlBuilder } from "../../../models/CardUrl";
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

  const options = useMemo<
    Array<{
      title: string;
      description: string;
      demoCard: CardUrlBuilder;
      cardType: CardType;
    }>
  >(
    () => [
      {
        title: "GitHub Stats Card",
        description: "your overall GitHub statistics",
        demoCard: cardUrl(CardType.STATS).username(userId).includeAllCommits(),
        cardType: CardType.STATS,
      },
      {
        title: "Top Languages Card",
        description: "your most frequently used languages",
        demoCard: cardUrl(CardType.TOP_LANGS).username(userId).langsCount(4),
        cardType: CardType.TOP_LANGS,
      },
      {
        title: "GitHub Extra Pin",
        description:
          "pin more than 6 repositories in your profile using a GitHub profile readme",
        demoCard: cardUrl(CardType.PIN).repo(DEMO_REPO),
        cardType: CardType.PIN,
      },
      {
        title: "GitHub Gist Pin",
        description:
          "pin gists in your GitHub profile using a GitHub profile readme",
        demoCard: cardUrl(CardType.GIST).gistId(DEMO_GIST),
        cardType: CardType.GIST,
      },
      {
        title: "WakaTime Stats Card",
        description: "your coding activity from WakaTime",
        demoCard: cardUrl(CardType.WAKATIME)
          .username(DEMO_WAKATIME_USER)
          .langsCount(6)
          .cardWidth(450),
        cardType: CardType.WAKATIME,
      },
    ],
    [userId],
  );

  return (
    <div className="w-full flex flex-wrap">
      {options.map((card) => {
        // Show dark-themed demo cards in dark mode so they fit the surroundings.
        const demoCard = isDark
          ? card.demoCard.theme("github_dark")
          : card.demoCard;
        return (
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
              card={demoCard}
              selected={selectedCardType === card.cardType}
              fixedSize
              stage={1}
            />
          </button>
        );
      })}
    </div>
  );
}
