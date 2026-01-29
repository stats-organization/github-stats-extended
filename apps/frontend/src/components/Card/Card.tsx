import type { JSX } from "react";
import clsx from "clsx";

import { CardImage } from "./CardImage";

interface CardProps {
  title: string;
  description: string;
  imageSrc: string;
  stage: number;
  selected?: boolean;
  compact?: boolean;
  fixedSize?: boolean;
}

export const Card = ({
  title,
  description,
  imageSrc,
  stage,
  selected = false,
  compact = false,
  fixedSize = false,
}: CardProps): JSX.Element => {
  return (
    <div
      className={clsx("p-6 rounded border-2", {
        "h-[370px] w-[510px]": fixedSize,
        "border-blue-500 bg-blue-50": selected,
        "border-gray-200 bg-white hover:bg-gray-50": !selected,
      })}
    >
      <h2 className="text-xl font-medium title-font text-gray-900">{title}</h2>
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
