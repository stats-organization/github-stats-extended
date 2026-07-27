import { themes } from "@stats-organization/github-readme-stats-core";
import type { JSX } from "react";

import { Card } from "../../../components/Card/Card";
import {
  getCardThemeBackdrop,
  getThemeSortRank,
} from "../../../components/Card/themeBackdrop";
import type { CardUrlBuilder } from "../../../models/CardUrl";
import { useTheme } from "../../../redux/selectors/themeSelectors";

const excludedThemes = [
  "merko",
  "blue-green",
  "gotham",
  "blueberry",
  "outrun",
  "holi",
];

// Light themes first, adaptive themes in the middle, dark themes last.
const themeList = Object.keys(themes)
  .filter((myTheme) => !excludedThemes.includes(myTheme))
  .sort((a, b) => getThemeSortRank(a) - getThemeSortRank(b));

interface ThemeStageProps {
  card: CardUrlBuilder;
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeStage({
  theme,
  card,
  onThemeChange,
}: ThemeStageProps): JSX.Element {
  const { isDark } = useTheme();

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
                card={card.theme(myTheme)}
                selected={theme === myTheme}
                stage={3}
                backgroundColor={getCardThemeBackdrop(myTheme, isDark)}
                titleColor={`#${
                  myTheme === "ambient_gradient" && !isDark
                    ? (themes["ambient_gradient"].bg_color.split(",")[1] ?? "")
                    : themeColors.title_color
                }`}
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
