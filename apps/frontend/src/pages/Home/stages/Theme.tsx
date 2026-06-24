import { themes } from "@stats-organization/github-readme-stats-core";
import type { JSX } from "react";

import { Card } from "../../../components/Card/Card";
import { getCardThemeBackdrop } from "../../../components/Card/themeBackdrop";

const excludedThemes = [
  "merko",
  "blue-green",
  "gotham",
  "blueberry",
  "outrun",
  "holi",
];

const themeList = Object.keys(themes).filter(
  (myTheme) => !excludedThemes.includes(myTheme),
);

interface ThemeStageProps {
  fullSuffix: string;
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeStage({
  theme,
  fullSuffix,
  onThemeChange,
}: ThemeStageProps): JSX.Element {
  return (
    <>
      <div className="flex flex-wrap">
        {themeList.map((myTheme) => {
          const themeColors = themes[myTheme as keyof typeof themes];
          return (
            <button
              className="p-2 lg:p-4"
              key={myTheme}
              type="button"
              onClick={() => {
                onThemeChange(myTheme);
              }}
            >
              <Card
                title={myTheme}
                description=""
                imageSrc={`${fullSuffix}&theme=${myTheme}`}
                selected={theme === myTheme}
                stage={3}
                backgroundColor={getCardThemeBackdrop(myTheme)}
                titleColor={`#${themeColors.title_color}`}
              />
            </button>
          );
        })}
      </div>
      <div className="pl-10 pr-10">
        {"For more theme options check the "}
        <a
          href="https://github.com/stats-organization/github-stats-extended/blob/master/docs/advanced_documentation.md#themes"
          target="_blank"
          className="underline text-primary"
        >
          customization documentation
        </a>
        {" after you copied your card URL in step 5."}
      </div>
    </>
  );
}
