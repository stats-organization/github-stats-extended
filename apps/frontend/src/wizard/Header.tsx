import type { JSX } from "react";

import { DOCS_PATH } from "../route";
import { AppBar } from "../shared/AppBar";

import { ProgressBar } from "./components/Home/Progress";
import { STAGE_LABELS } from "./models/Stage";
import type { StageIndex } from "./models/Stage";

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
      <AppBar crossLink={{ href: DOCS_PATH, label: "Docs" }} />
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
