import { Card } from "../../../components/Card/Card";
import { useUserId } from "../../../redux/selectors/userSelectors";
import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
} from "../../../constants";
import { CardType } from "../../../models/CardType";
import { useMemo, type JSX } from "react";

interface SelectCardStageProps {
  selectedCardType: CardType;
  onCardTypeChange: (cardType: CardType) => void;
}

export function SelectCardStage({
  selectedCardType,
  onCardTypeChange,
}: SelectCardStageProps): JSX.Element {
  const userId = useUserId(DEMO_USER);

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
        demoImageSrc: `?username=${userId}&include_all_commits=true`,
        cardType: CardType.STATS,
      },
      {
        title: "Top Languages Card",
        description: "your most frequently used languages",
        demoImageSrc: `/top-langs?username=${userId}&langs_count=4`,
        cardType: CardType.TOP_LANGS,
      },
      {
        title: "GitHub Extra Pin",
        description:
          "pin more than 6 repositories in your profile using a GitHub profile readme",
        demoImageSrc: `/pin?repo=${DEMO_REPO}`,
        cardType: CardType.PIN,
      },
      {
        title: "GitHub Gist Pin",
        description:
          "pin gists in your GitHub profile using a GitHub profile readme",
        demoImageSrc: `/gist?id=${DEMO_GIST}`,
        cardType: CardType.GIST,
      },
      {
        title: "WakaTime Stats Card",
        description: "your coding activity from WakaTime",
        demoImageSrc: `/wakatime?username=${DEMO_WAKATIME_USER}&langs_count=6&card_width=450`,
        cardType: CardType.WAKATIME,
      },
    ],
    [userId],
  );

  return (
    <div className="w-full flex flex-wrap">
      {options.map((card, index) => (
        <button
          className="p-2 lg:p-4"
          key={index}
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
