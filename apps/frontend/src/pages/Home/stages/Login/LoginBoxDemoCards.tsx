import type { JSX } from "react";

import { CardImage } from "../../../../components/Card/CardImage";
import {
  DEMO_GIST,
  DEMO_REPO,
  DEMO_USER,
  DEMO_WAKATIME_USER,
} from "../../../../constants";

const cards: Array<{ demoImageSrc: string }> = [
  {
    demoImageSrc: `/pin?repo=${DEMO_REPO}&disable_animations=true`,
  },
  {
    demoImageSrc: `/top-langs?username=${DEMO_USER}&langs_count=4&disable_animations=true`,
  },
  {
    demoImageSrc: `?username=${DEMO_USER}&include_all_commits=true&disable_animations=true`,
  },
  {
    demoImageSrc: `/wakatime?username=${DEMO_WAKATIME_USER}&langs_count=6&card_width=450&disable_animations=true`,
  },
  {
    demoImageSrc: `/gist?id=${DEMO_GIST}&disable_animations=true`,
  },
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
  return (
    <div className="w-full h-full lg:w-2/5 flex lg:flex-col lg:p-8 relative overflow-hidden">
      <div className="relative w-full h-full">
        {cards.map((card, index) => (
          <div
            key={card.demoImageSrc}
            style={{
              left: `${getCardXPosition(index)}%`,
              position: "relative",
              zoom: "0.5",
              marginBottom: "1%",
            }}
          >
            <CardImage imageSrc={card.demoImageSrc} compact={false} stage={0} />
          </div>
        ))}
      </div>
    </div>
  );
}
