import type { ThemeName } from "@stats-organization/github-readme-stats-core";
import { themes } from "@stats-organization/github-readme-stats-core";
import type { JSX } from "react";

import { Card } from "../../../components/Card/Card";
import {
  getCardThemeBackdrop,
  getThemeSortRank,
} from "../../../components/Card/themeBackdrop";
import { CardCategory } from "../../../models/CardType";
import type { CardUrlBuilder } from "../../../models/CardUrl";
import { useTheme } from "../../../redux/selectors/themeSelectors";

const excludedThemes: Array<ThemeName> = [
  "default",
  "default_repocard",
  "github_dark",
  "merko",
  "blue-green",
  "gotham",
  "blueberry",
  "outrun",
  "holi",
];

const allThemeNames = Object.keys(themes) as Array<ThemeName>;

// Light themes first, adaptive themes in the middle, dark themes last.
const forPicker = (names: ReadonlyArray<ThemeName>) =>
  names
    .filter((name) => !excludedThemes.includes(name))
    .sort((a, b) => getThemeSortRank(a) - getThemeSortRank(b));

// Some themes come in pairs: `X_repocard` for the repo and gist cards, `X` for
// the stats, top languages and WakaTime cards. Each side offers only its own
// variant, so the theme Home.tsx starts on is always one of the entries here.
//
// Keep in sync with `generateTable` in `packages/core/scripts/generate-theme-readme.js`,
// which splits the theme README tables by the same rule.
const repoCardThemes = forPicker(
  allThemeNames.filter(
    (name) => !allThemeNames.includes(`${name}_repocard` as ThemeName),
  ),
);

const nonRepoCardThemes = forPicker(
  allThemeNames.filter((name) => !name.endsWith("_repocard")),
);

interface ThemeStageProps {
  card: CardUrlBuilder;
  theme: string;
  category: CardCategory;
  onThemeChange: (theme: ThemeName) => void;
}

export function ThemeStage({
  theme,
  card,
  category,
  onThemeChange,
}: ThemeStageProps): JSX.Element {
  const { isDark } = useTheme();
  const themeList =
    category === CardCategory.REPO ? repoCardThemes : nonRepoCardThemes;

  return (
    <>
      <div className="flex flex-wrap">
        {themeList.map((myTheme) => {
          const themeColors = themes[myTheme];
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
