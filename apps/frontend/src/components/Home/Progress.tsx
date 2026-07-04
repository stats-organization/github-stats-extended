import { clsx } from "clsx";
import type { JSX, MouseEventHandler } from "react";
import {
  FaArrowLeft as LeftArrowIcon,
  FaArrowRight as RightArrowIcon,
} from "react-icons/fa";

interface ProgressSectionProps {
  num: number;
  item: string;
  passed: boolean;
  isActive: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

function ProgressSection({
  num,
  item,
  passed,
  isActive,
  onClick,
}: ProgressSectionProps): JSX.Element {
  return (
    <button
      className={clsx(
        "w-1/4 flex flex-col mx-2 p-2 cursor-pointer",
        passed ? "border-primary" : "border-base-content/60",
        isActive ? "border-t-[14px] -mt-[5px]" : "border-t-4",
      )}
      type="button"
      onClick={onClick}
    >
      <div
        className={clsx("text-lg font-bold", {
          "text-primary": passed,
          "text-base-content/60": !passed,
          "-mt-[4px]": isActive,
        })}
      >
        {`Step ${num + 1}`}
      </div>
      <div className={passed ? "text-base-content/80" : "text-base-content/60"}>
        {item}
      </div>
    </button>
  );
}

interface ProgressBarProps {
  items: Array<string>;
  currItemIndex: number;
  onItemClick: (itemIndex: number) => void;
}

export function ProgressBar({
  items,
  currItemIndex,
  onItemClick,
}: ProgressBarProps): JSX.Element {
  const leftDisabled = currItemIndex === 0;
  const rightDisabled = currItemIndex === items.length - 1;

  return (
    <div className="w-full flex items-center sticky top-0 bg-base-300 z-50 pt-3 pb-1 px-1 md:px-20 shadow-md">
      <button
        type="button"
        aria-label="Previous step"
        disabled={leftDisabled}
        className="btn btn-ghost btn-circle"
        onClick={() => {
          onItemClick(Math.max(currItemIndex - 1, 0));
        }}
      >
        <LeftArrowIcon
          className={clsx("w-8 h-8", {
            "text-base-content/30": leftDisabled,
            "text-base-content/70": !leftDisabled,
          })}
        />
      </button>
      <div className="px-2 flex-grow flex flex-row">
        {items.map((item, index) => {
          return (
            <ProgressSection
              num={index}
              key={item} // each step should have a unique name
              item={item}
              passed={currItemIndex >= index}
              isActive={currItemIndex === index}
              onClick={() => {
                onItemClick(index);
              }}
            />
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Next step"
        disabled={rightDisabled}
        className="btn btn-ghost btn-circle"
        onClick={() => {
          onItemClick(Math.min(currItemIndex + 1, items.length - 1));
        }}
      >
        <RightArrowIcon
          className={clsx("w-8 h-8", {
            "text-base-content/30": rightDisabled,
            "text-base-content/70": !rightDisabled,
          })}
        />
      </button>
    </div>
  );
}
