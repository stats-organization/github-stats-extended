import { clsx } from "clsx";
import type { JSX } from "react";

import { CardImage } from "./CardImage";

interface CardProps {
  title: string;
  description: string;
  imageSrc: string;
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
  imageSrc,
  stage,
  selected = false,
  compact = false,
  fixedSize = false,
  backgroundColor,
  titleColor,
}: CardProps): JSX.Element => {
  return (
    <div
      className={clsx("p-6 rounded border-2", {
        "h-[370px] w-[510px]": fixedSize,
        "border-primary": selected,
        "border-base-300": !selected,
        // Token backgrounds only apply when no custom background is given.
        "bg-primary/10": selected && !backgroundColor,
        "bg-base-100 hover:bg-base-200": !selected && !backgroundColor,
      })}
      style={backgroundColor ? { background: backgroundColor } : undefined}
    >
      <h2
        className="text-xl font-medium title-font text-base-content"
        style={titleColor ? { color: titleColor } : undefined}
      >
        {title}
      </h2>
      <p className="text-base leading-relaxed mt-2 mb-4">{description}</p>
      <CardImage
        imageSrc={imageSrc}
        compact={compact}
        className={clsx({ "flex justify-center": fixedSize })}
        stage={stage}
      />
    </div>
  );
};
