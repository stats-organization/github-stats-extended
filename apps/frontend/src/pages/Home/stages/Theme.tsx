import type { JSX } from "react";

import { Card } from "../../../components/Card/Card";
// @ts-expect-error this will be provided by the npm package
import { themes } from "../../../backend/themes/index";

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
        {Object.keys(themes)
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
          .map((myTheme, index) => (
            <button
              className="p-2 lg:p-4"
              key={index}
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
