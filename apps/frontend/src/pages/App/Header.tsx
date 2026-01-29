import type { JSX } from "react";

import appIcon from "../../assets/appLogo64.png";
import { FaGithub as GithubIcon } from "react-icons/fa";
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
      <div className="text-gray-100 bg-gray-800 shadow-md body-font z-50">
        <div className="px-5 py-2 flex flex-wrap">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center title-font font-medium text-gray-50 mb-0 md:mr-8"
          >
            <img src={appIcon} alt="logo" className="w-6 h-6" />
            <span className="ml-2 text-xl">GitHub Stats Extended</span>
          </a>
          {/* Star on GitHub */}
          <div className="flex ml-auto items-center text-base justify-center">
            <a
              href="https://github.com/stats-organization/github-stats-extended"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                type="button"
                className="rounded-[0.25rem] shadow bg-gray-200 hover:bg-gray-300 text-black px-3 py-1 flex items-center"
              >
                Star on
                <GithubIcon className="ml-1.5 w-5 h-5" />
              </button>
            </a>
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
