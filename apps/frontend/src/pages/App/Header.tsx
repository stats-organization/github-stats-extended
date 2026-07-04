import type { JSX } from "react";
import { FaGithub as GithubIcon } from "react-icons/fa";

import appIcon from "../../assets/appLogo64.png";
import { ThemePicker } from "../../components/Generic/ThemePicker";
import { ProgressBar } from "../../components/Home/Progress";
import { STAGE_LABELS } from "../../models/Stage";
import type { StageIndex } from "../../models/Stage";

interface HeaderProps {
  currStageIndex: StageIndex;
  onStageIndexChange: (stageIndex: StageIndex) => void;
}

const items = STAGE_LABELS.map((it) => it.shortTitle);

export function Header({
  currStageIndex,
  onStageIndexChange,
}: HeaderProps): JSX.Element {
  return (
    <>
      <div
        className="text-neutral-content shadow-md z-50"
        style={{
          backgroundColor:
            "color-mix(in oklab, var(--color-primary), #000 50%)",
        }}
      >
        <div className="px-5 py-2 flex flex-wrap">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center title-font font-medium text-neutral-content mb-0 md:mr-8"
          >
            <img src={appIcon} alt="logo" className="w-6 h-6" />
            <span className="ml-2 text-xl">GitHub Stats Extended</span>
          </a>
          {/* Star on GitHub + theme toggle */}
          <div className="flex ml-auto items-center gap-2 text-base justify-center">
            <a
              href="https://github.com/stats-organization/github-stats-extended"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[0.25rem] shadow bg-neutral-content hover:opacity-90 text-neutral px-3 py-1 flex items-center"
            >
              Star on
              <GithubIcon className="ml-1.5 w-5 h-5" />
            </a>
            <ThemePicker />
          </div>
        </div>
      </div>
      <ProgressBar
        items={items}
        currItemIndex={currStageIndex}
        onItemClick={(itemIndex) => {
          onStageIndexChange(itemIndex as StageIndex);
        }}
      />
    </>
  );
}
