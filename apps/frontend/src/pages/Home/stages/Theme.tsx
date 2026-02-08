import type { JSX } from "react";

import { Card } from "../../../components/Card/Card";
// @ts-expect-error this will be provided by the npm package
import { themes } from "../../../backend/themes/index";

// to be removed once npm package has been created
type ThemeData = Record<
  string,
  {
    title_color: string;
    icon_color: string;
    text_color: string;
    bg_color: string;
    border_color: string;
  }
>;

const excludedThemes = [
  "merko",
  "blue-green",
  "gotham",
  "blueberry",
  "outrun",
  "holi",
];

const themeList = Object.keys(
  /* Needed until themes is typed correctly and retrieved from npm package */
  themes as ThemeData,
).filter((myTheme) => !excludedThemes.includes(myTheme));

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
        {themeList.map((myTheme) => (
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
            />
          </button>
        ))}
      </div>
      <div className="pl-10 pr-10">
        For more theme options check the{" "}
        <a
          href="https://github.com/stats-organization/github-stats-extended/blob/master/docs/advanced_documentation.md#themes"
          target="_blank"
          className="underline text-blue-900"
        >
          customization documentation
        </a>{" "}
        after you copied your card URL in step 5.
      </div>
    </>
  );
}
