import { clsx } from "clsx";
import type { CSSProperties, JSX } from "react";

import type { CardUrlBuilder } from "../../models/CardUrl";

import { CardImage } from "./CardImage";
import { LIGHT_CARD_BG } from "./themeBackdrop";

interface CardProps {
  title: string;
  description: string;
  card: CardUrlBuilder;
  stage: number;
  selected?: boolean;
  compact?: boolean;
  fixedSize?: boolean;
  /** CSS background for the card surface (e.g. a theme's own background). */
  backgroundColor?: string;
  /** Title color, used when the card sits on a custom background. */
  titleColor?: string;
}

export const Card = ({
  title,
  description,
  card,
  stage,
  selected = false,
  compact = false,
  fixedSize = false,
  backgroundColor,
  titleColor,
}: CardProps): JSX.Element => {
  const customBackground = backgroundColor
    ? selected
      ? `color-mix(in oklab, var(--color-primary) ${backgroundColor === LIGHT_CARD_BG ? "10%" : "25%"}, ${backgroundColor})`
      : backgroundColor
    : undefined;

  const cardStyle = customBackground
    ? ({ "--card-bg": customBackground } as CSSProperties)
    : undefined;

  return (
    <div
      className={clsx("p-6 rounded border-4", {
        "h-[370px] w-[510px]": fixedSize,
        "border-primary": selected,
        "border-base-300": !selected,
        "bg-[var(--card-bg)]": !!customBackground,
        // Token backgrounds only apply when no custom background is given.
        "bg-primary/10": selected && !customBackground,
        "bg-base-100 hover:bg-base-200": !selected && !customBackground,
        "hover:bg-base-300": !selected && !!customBackground,
      })}
      style={cardStyle}
      data-theme={
        stage == 3
          ? backgroundColor === LIGHT_CARD_BG || !backgroundColor
            ? "light"
            : "dark"
          : undefined
      }
    >
      <h2
        className="text-xl font-medium title-font text-base-content"
        style={titleColor ? { color: titleColor } : undefined}
      >
        {title}
      </h2>
      <p className="text-base leading-relaxed mt-2 mb-4">{description}</p>
      <CardImage
        card={card}
        compact={compact}
        className={clsx({ "flex justify-center": fixedSize })}
        stage={stage}
      />
    </div>
  );
};
