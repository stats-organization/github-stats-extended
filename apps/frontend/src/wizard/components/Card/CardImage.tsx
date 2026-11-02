import { clsx } from "clsx";
import type { Ref } from "react";

import { HOST } from "../../../constants";
import type { CardUrlBuilder } from "../../models/CardUrl";

import { SvgInline } from "./SvgInline";

interface CardImageProps {
  card: CardUrlBuilder;
  stage: number;
  compact?: boolean;
  className?: string;
  /** Forwarded to `SvgInline`'s shadow-root host. */
  ref?: Ref<HTMLDivElement>;
}

export const CardImage = ({
  card,
  stage,
  compact = false,
  className,
  ref,
}: CardImageProps) => {
  // `client=wizard` marks requests coming from the wizard preview.
  const fullImageSrc = card.client("wizard").toApiUrl(HOST);

  return (
    <div className={clsx("w-full relative", className)}>
      <SvgInline
        className="object-cover"
        url={fullImageSrc}
        compact={compact}
        stage={stage}
        ref={ref}
      />
    </div>
  );
};
