import type { JSX } from "react";

import { CardImage } from "../../../../components/Card/CardImage";
import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
} from "../../../../constants";
import { CardType } from "../../../../models/CardType";
import { cardUrl } from "../../../../models/CardUrl";
import { useTheme } from "../../../../redux/selectors/themeSelectors";

const cards = [
  cardUrl(CardType.PIN).repo(DEMO_REPO).disableAnimations(),
  cardUrl(CardType.TOP_LANGS)
    .username(DEMO_USER)
    .langsCount(4)
    .disableAnimations(),
  cardUrl(CardType.STATS)
    .username(DEMO_USER)
    .includeAllCommits()
    .disableAnimations(),
  cardUrl(CardType.WAKATIME)
    .username(DEMO_WAKATIME_USER)
    .langsCount(6)
    .cardWidth(450)
    .disableAnimations(),
  cardUrl(CardType.GIST).gistId(DEMO_GIST).disableAnimations(),
];

function getCardXPosition(cardIndex: number): number {
  const radius = 60;
  const centerX = 70;
  const startAngle = Math.PI * 0.75; // 135 degrees
  const endAngle = Math.PI * 1.25; // 225 degrees

  const angle =
    startAngle + (endAngle - startAngle) * (cardIndex / (cards.length - 1));
  const x = centerX + radius * Math.cos(angle);
  return x;
}

export function LoginBoxDemoCards(): JSX.Element {
  const { isDark } = useTheme();

  return (
    <div className="w-full h-full lg:w-2/5 flex lg:flex-col lg:p-8 relative overflow-hidden">
      <div className="relative w-full h-full">
        {cards.map((card, index) => {
          // Show dark-themed demo cards in dark mode so they fit the surroundings.
          const demoCard = isDark ? card.theme("github_dark") : card;
          return (
            <div
              key={demoCard.toString()}
              style={{
                left: `${getCardXPosition(index)}%`,
                position: "relative",
                zoom: "0.5",
                marginBottom: "1%",
              }}
            >
              <CardImage card={demoCard} compact={false} stage={0} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
