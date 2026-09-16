import { Card } from "../common/Card.js";
import { I18n } from "../common/I18n.js";
import { getLightDarkColors, isPrefixedHexColor } from "../common/color.js";
import { encodeHTML } from "../common/html.js";
import { getLanguageColor } from "../common/languageColors.js";
import { clampValue, lowercaseTrim } from "../common/ops.js";
import { createProgressNode, flexLayout } from "../common/render.js";
import type { WakaTimeData, WakaTimeLang } from "../fetchers/types.js";
import { wakatimeCardLocales } from "../translations.js";

import type { CommonCardOptions } from "./options.js";

const DEFAULT_CARD_WIDTH = 495;
const MIN_CARD_WIDTH = 250;
const COMPACT_LAYOUT_MIN_WIDTH = 400;
const DEFAULT_LINE_HEIGHT = 25;
const PROGRESSBAR_PADDING = 130;
const HIDDEN_PROGRESSBAR_PADDING = 170;
const COMPACT_LAYOUT_PROGRESSBAR_PADDING = 25;
const TOTAL_TEXT_WIDTH = 275;

type WakaTimeLayout = "compact" | "normal";
type DisplayFormat = "time" | "percent";

interface WakaTimeOptions extends CommonCardOptions {
  locale: string;
  hide_title: boolean;
  hide: Array<string>;
  card_width: number;
  line_height: number | string;
  hide_progress: boolean;
  custom_title: string;
  layout: WakaTimeLayout;
  langs_count: number;
  display_format: DisplayFormat;
  disable_animations: boolean;
}

/**
 * Creates the no coding activity SVG node.
 *
 * @param props The function properties.
 * @param props.text No coding activity translated text.
 * @returns No coding activity SVG node string.
 */
const noCodingActivityNode = ({ text }: { text: string }): string => {
  return `
    <text x="25" y="11" class="stat bold">${encodeHTML(text)}</text>
  `;
};

/**
 * Format language value.
 *
 * @param args The function arguments.
 * @param args.lang The language object.
 * @param args.display_format The display format of the language node.
 * @returns The formatted language value.
 */
const formatLanguageValue = ({
  display_format,
  lang,
}: {
  display_format: DisplayFormat;
  lang: WakaTimeLang;
}): string => {
  return display_format === "percent"
    ? `${lang.percent.toFixed(2)} %`
    : lang.text;
};

/**
 * Create compact WakaTime layout.
 *
 * @param args The function arguments.
 * @param args.lang The languages array.
 * @param args.x The x position of the language node.
 * @param args.y The y position of the language node.
 * @param args.display_format The display format of the language node.
 * @returns The compact layout language SVG node.
 */
const createCompactLangNode = ({
  lang,
  x,
  y,
  display_format,
}: {
  lang: WakaTimeLang;
  x: number;
  y: number;
  display_format: DisplayFormat;
}): string => {
  if (!Number.isFinite(x)) {
    throw new Error(`Invalid x: "${x}"`);
  }
  if (!Number.isFinite(y)) {
    throw new Error(`Invalid y: "${y}"`);
  }

  const color = getLanguageColor(lang.name);
  const value = formatLanguageValue({ display_format, lang });

  return `
    <g transform="translate(${x}, ${y})">
      <circle cx="5" cy="6" r="5" fill="${color}" />
      <text data-testid="lang-name" x="15" y="10" class='lang-name'>
        ${encodeHTML(lang.name)} - ${encodeHTML(value)}
      </text>
    </g>
  `;
};

/**
 * Create WakaTime language text node item.
 *
 * @param args The function arguments.
 * @param args.langs The language objects.
 * @param args.y The y position of the language node.
 * @param args.display_format The display format of the language node.
 * @param args.card_width Width in px of the card.
 * @returns The language text node items.
 */
const createLanguageTextNode = ({
  langs,
  y,
  display_format,
  card_width,
}: {
  langs: Array<WakaTimeLang>;
  y: number;
  display_format: DisplayFormat;
  card_width: number;
}): Array<string> => {
  const LEFT_X = 25;
  const RIGHT_X_BASE = 230;
  const rightOffset = (card_width - DEFAULT_CARD_WIDTH) / 2;
  const RIGHT_X = RIGHT_X_BASE + rightOffset;

  return langs.map((lang, index) => {
    const isLeft = index % 2 === 0;
    return createCompactLangNode({
      lang,
      x: isLeft ? LEFT_X : RIGHT_X,
      y: y + DEFAULT_LINE_HEIGHT * Math.floor(index / 2),
      display_format,
    });
  });
};

/**
 * Create WakaTime text item.
 *
 * @param args The function arguments.
 * @param args.id The id of the text node item.
 * @param args.label The label of the text node item.
 * @param args.value The value of the text node item.
 * @param args.index The index of the text node item.
 * @param args.percent Percentage of the text node item.
 * @param args.hideProgress Whether to hide the progress bar.
 * @param args.progressBarWidth The width of the progress bar.
 * @returns The text SVG node.
 */
const createTextNode = ({
  id,
  label,
  value,
  index,
  percent,
  hideProgress,
  progressBarWidth,
}: {
  id: string;
  label: string;
  value: string;
  index: number;
  percent: number;
  hideProgress?: boolean | undefined;
  progressBarWidth: number;
}): string => {
  if (!Number.isFinite(index)) {
    throw new Error(`Invalid index: "${index}"`);
  }
  if (!Number.isFinite(progressBarWidth)) {
    throw new Error(`Invalid progressBarWidth: "${progressBarWidth}"`);
  }

  const staggerDelay = (index + 3) * 150;
  const cardProgress = hideProgress
    ? null
    : createProgressNode({
        x: 110,
        y: 4,
        progress: percent,
        width: progressBarWidth,
        delay: staggerDelay + 300,
      });

  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms" transform="translate(25, 0)">
      <text class="stat bold" y="12.5" data-testid="${encodeHTML(id)}">${encodeHTML(label)}:</text>
      <text
        class="stat"
        x="${hideProgress ? HIDDEN_PROGRESSBAR_PADDING : PROGRESSBAR_PADDING + progressBarWidth}"
        y="12.5"
      >${encodeHTML(value)}</text>
      ${String(cardProgress)}
    </g>
  `;
};

/**
 * Recalculating percentages so that, compact layout's progress bar does not break when
 * hiding languages.
 *
 * @param languages The languages array.
 */
const recalculatePercentages = (languages: Array<WakaTimeLang>): void => {
  const totalSum = languages.reduce(
    (totalSum, language) => totalSum + language.percent,
    0,
  );
  const weight = +(100 / totalSum).toFixed(2);
  languages.forEach((language) => {
    language.percent = +(language.percent * weight).toFixed(2);
  });
};

/**
 * Retrieves CSS styles for a card.
 *
 * @param colors The colors to use for the card.
 * @param colors.textColor The text color.
 * @returns Card CSS styles.
 */
const getStyles = ({ textColor }: { textColor: string }): string => {
  if (!isPrefixedHexColor(textColor)) {
    throw new Error(`Invalid text color: "${textColor}"`);
  }

  return `
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${textColor};
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .stat { font-size:12px; }
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    .not_bold { font-weight: 400 }
    .bold { font-weight: 700 }
  `;
};

/**
 * Normalize incoming width (string or number) and clamp to minimum.
 *
 * @param args The function arguments.
 * @param args.layout The incoming layout value.
 * @param args.value The incoming width value.
 * @returns The normalized width value.
 */
const normalizeCardWidth = ({
  value,
  layout,
}: {
  value?: number | undefined;
  layout?: WakaTimeLayout | undefined;
}): number => {
  if (value === undefined || isNaN(value)) {
    return DEFAULT_CARD_WIDTH;
  }
  return Math.max(
    layout === "compact" ? COMPACT_LAYOUT_MIN_WIDTH : MIN_CARD_WIDTH,
    value,
  );
};

/**
 * Renders WakaTime card.
 *
 * @param stats WakaTime stats.
 * @param options Card options.
 * @returns WakaTime card SVG.
 */
const renderWakatimeCard = (
  stats: Partial<WakaTimeData> = {},
  options: Partial<WakaTimeOptions> = { hide: [] },
): string => {
  let { languages = [] } = stats;
  const {
    hide_title = false,
    hide_border = false,
    card_width,
    hide,
    line_height = DEFAULT_LINE_HEIGHT,
    hide_progress,
    custom_title,
    locale,
    layout,
    langs_count = languages.length,
    border_radius,
    display_format = "time",
    disable_animations,
  } = options;

  const normalizedWidth = normalizeCardWidth({ value: card_width, layout });

  const shouldHideLangs = Array.isArray(hide) && hide.length > 0;
  if (shouldHideLangs) {
    const languagesToHide = new Set(hide.map((lang) => lowercaseTrim(lang)));
    languages = languages.filter(
      (lang) => !languagesToHide.has(lowercaseTrim(lang.name)),
    );
  }

  // Since the percentages are sorted in descending order, we can just
  // slice from the beginning without sorting.
  languages = languages.slice(0, langs_count);
  recalculatePercentages(languages);

  const i18n = new I18n({
    locale,
    translations: wakatimeCardLocales,
  });

  const lheight = parseInt(String(line_height), 10);

  const langsCount = clampValue(langs_count, 1, langs_count);

  const { lightColors, darkColors } = getLightDarkColors(options);

  const filteredLanguages = languages
    .filter((language) => language.hours || language.minutes)
    .slice(0, langsCount);

  // Calculate the card height depending on how many items there are
  // but if rank circle is visible clamp the minimum height to `150`
  let height = Math.max(45 + (filteredLanguages.length + 1) * lheight, 150);

  let finalLayout: string;

  // RENDER COMPACT LAYOUT
  if (layout === "compact") {
    const width = normalizedWidth - 5;
    height =
      90 + Math.round(filteredLanguages.length / 2) * DEFAULT_LINE_HEIGHT;

    // progressOffset holds the previous language's width and used to offset the next language
    // so that we can stack them one after another, like this: [--][----][---]
    let progressOffset = 0;
    const compactProgressBar = filteredLanguages
      .map((language) => {
        const progress =
          ((width - COMPACT_LAYOUT_PROGRESSBAR_PADDING) * language.percent) /
          100;

        const languageColor = getLanguageColor(language.name);

        const output = `
          <rect
            mask="url(#rect-mask)"
            data-testid="lang-progress"
            x="${progressOffset}"
            y="0"
            width="${progress}"
            height="8"
            fill="${languageColor}"
          />
        `;
        progressOffset += progress;
        return output;
      })
      .join("");

    finalLayout = `
      <mask id="rect-mask">
      <rect x="${COMPACT_LAYOUT_PROGRESSBAR_PADDING}" y="0" width="${width - 2 * COMPACT_LAYOUT_PROGRESSBAR_PADDING}" height="8" fill="white" rx="5" />
      </mask>
      ${compactProgressBar}
      ${
        filteredLanguages.length
          ? createLanguageTextNode({
              y: 25,
              langs: filteredLanguages,
              display_format,
              card_width: normalizedWidth,
            }).join("")
          : noCodingActivityNode({
              text: stats.is_coding_activity_visible
                ? stats.is_other_usage_visible
                  ? i18n.t("wakatimecard.nocodingactivity")
                  : i18n.t("wakatimecard.nocodedetails")
                : i18n.t("wakatimecard.notpublic"),
            })
      }
    `;
  } else {
    finalLayout = flexLayout({
      items: filteredLanguages.length
        ? filteredLanguages.map((language, index) => {
            return createTextNode({
              id: language.name,
              label: language.name,
              value: formatLanguageValue({ display_format, lang: language }),
              index,
              percent: language.percent,
              hideProgress: hide_progress,
              progressBarWidth: normalizedWidth - TOTAL_TEXT_WIDTH,
            });
          })
        : [
            noCodingActivityNode({
              text: stats.is_coding_activity_visible
                ? stats.is_other_usage_visible
                  ? i18n.t("wakatimecard.nocodingactivity")
                  : i18n.t("wakatimecard.nocodedetails")
                : i18n.t("wakatimecard.notpublic"),
            }),
          ],
      gap: lheight,
      direction: "column",
    }).join("");
  }

  // Get title range text
  let titleText = i18n.t("wakatimecard.title");
  switch (stats.range) {
    case "last_7_days":
      titleText += ` (${i18n.t("wakatimecard.last7days")})`;
      break;
    case "last_year":
      titleText += ` (${i18n.t("wakatimecard.lastyear")})`;
      break;
  }

  const card = new Card({
    customTitle: custom_title,
    defaultTitle: titleText,
    width: normalizedWidth,
    height,
    border_radius,
    colors: { light: lightColors, dark: darkColors },
  });

  if (disable_animations) {
    card.disableAnimations();
  }

  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  card.setCSS({
    light: ({ titleColor, textColor }) => `
    ${getStyles({ textColor })}
    @keyframes slideInAnimation {
      from {
        width: 0;
      }
      to {
        width: calc(100%-100px);
      }
    }
    @keyframes growWidthAnimation {
      from {
        width: 0;
      }
      to {
        width: 100%;
      }
    }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
    #rect-mask rect{
      animation: slideInAnimation 1s ease-in-out forwards;
    }
    .lang-progress{
      animation: growWidthAnimation 0.6s ease-in-out forwards;
      fill: ${titleColor};
    }
    .progress-background { fill: ${textColor === titleColor ? "#fff0" /* transparent */ : textColor}; }
    `,
    dark: ({ titleColor, textColor }) => `
      ${getStyles({ textColor })}
      .lang-name { fill: ${textColor} }
      .lang-progress { fill: ${titleColor}; }
      .progress-background { fill: ${textColor === titleColor ? "#fff0" /* transparent */ : textColor}; }
    `,
  });

  return card.render(`
    <svg x="0" y="0" width="100%">
      ${finalLayout}
    </svg>
  `);
};

export { renderWakatimeCard };
