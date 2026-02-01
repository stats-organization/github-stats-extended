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
        {/* Needed until themes is typed correctly and retrieved from npm package */}
        {Object.keys(themes as ThemeData)
          .filter(
            (myTheme) =>
              ![
                "merko",
                "blue-green",
                "gotham",
                "blueberry",
                "outrun",
                "holi",
              ].includes(myTheme),
          )
          .map((myTheme) => (
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
