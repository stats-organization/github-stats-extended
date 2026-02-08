import clsx from "clsx";
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
        passed ? "border-blue-500" : "border-gray-500",
        isActive ? "border-t-[14px] -mt-[5px]" : "border-t-4",
      )}
      type="button"
      onClick={onClick}
    >
      <div
        className={clsx("text-lg font-bold", {
          "text-blue-500": passed,
          "text-gray-500": !passed,
          "-mt-[4px]": isActive,
        })}
      >
        {`Step ${num + 1}`}
      </div>
      <div className={passed ? "text-gray-700" : "text-gray-500"}>{item}</div>
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
    <div className="w-full flex items-center sticky top-0 bg-gray-200 z-50 pt-3 pb-1 px-1 md:px-20 shadow-md">
      <LeftArrowIcon
        className={clsx("w-8 h-8", {
          "text-gray-400 cursor-not-allowed": leftDisabled,
          "text-gray-700 cursor-pointer": !leftDisabled,
        })}
        onClick={() => {
          onItemClick(Math.max(currItemIndex - 1, 0));
        }}
      />
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
      <RightArrowIcon
        className={clsx("w-8 h-8", {
          "text-gray-400 cursor-not-allowed": rightDisabled,
          "text-gray-700 cursor-pointer": !rightDisabled,
        })}
        onClick={() => {
          onItemClick(Math.min(currItemIndex + 1, items.length - 1));
        }}
      />
    </div>
  );
}
