import { Card } from "../common/Card.js";
import { I18n } from "../common/I18n.js";
import { getLightDarkColors, isPrefixedHexColor } from "../common/color.js";
import { formatBytes } from "../common/fmt.js";
import { encodeHTML } from "../common/html.js";
import { DEFAULT_LANG_COLOR } from "../common/languageColors.js";
import { chunkArray, clampValue, lowercaseTrim } from "../common/ops.js";
import {
  createProgressNode,
  flexLayout,
  measureText,
} from "../common/render.js";
import type { Lang, TopLangData } from "../fetchers/types.js";
import { langCardLocales } from "../translations.js";

import type { CommonCardOptions } from "./options.js";

const DEFAULT_CARD_WIDTH = 300;
const MIN_CARD_WIDTH = 280;
const CARD_PADDING = 25;
const COMPACT_LAYOUT_BASE_HEIGHT = 90;
const MAXIMUM_LANGS_COUNT = 20;

const NORMAL_LAYOUT_DEFAULT_LANGS_COUNT = 5;
const COMPACT_LAYOUT_DEFAULT_LANGS_COUNT = 6;
const DONUT_LAYOUT_DEFAULT_LANGS_COUNT = 5;
const PIE_LAYOUT_DEFAULT_LANGS_COUNT = 6;
const DONUT_VERTICAL_LAYOUT_DEFAULT_LANGS_COUNT = 6;

type TopLangLayout = "compact" | "normal" | "donut" | "donut-vertical" | "pie";

interface TopLangOptions extends CommonCardOptions {
  locale: string;
  hide_title: boolean;
  card_width: number;
  hide: Array<string>;
  layout: TopLangLayout;
  custom_title: string;
  langs_count: number;
  disable_animations: boolean;
  hide_progress: boolean;
  hide_values: boolean;
  prog_bar_bg_color: string;
  stats_format: "percentages" | "bytes";
}

/**
 * Retrieves the programming language whose name is the longest.
 *
 * @param arr Array of programming languages.
 * @returns Longest programming language object.
 */
const getLongestLang = (
  arr: Array<Lang>,
): Pick<Lang, "name" | "size" | "color"> =>
  arr.reduce<Pick<Lang, "name" | "size" | "color">>(
    (savedLang, lang) =>
      lang.name.length > savedLang.name.length ? lang : savedLang,
    { name: "", size: 0, color: "" },
  );

/**
 * Convert degrees to radians.
 *
 * @param angleInDegrees Angle in degrees.
 * @returns Angle in radians.
 */
const degreesToRadians = (angleInDegrees: number): number =>
  angleInDegrees * (Math.PI / 180.0);

/**
 * Convert radians to degrees.
 *
 * @param angleInRadians Angle in radians.
 * @returns Angle in degrees.
 */
const radiansToDegrees = (angleInRadians: number): number =>
  angleInRadians / (Math.PI / 180.0);

/**
 * Convert polar coordinates to cartesian coordinates.
 *
 * @param centerX Center x coordinate.
 * @param centerY Center y coordinate.
 * @param radius Radius of the circle.
 * @param angleInDegrees Angle in degrees.
 * @returns Cartesian coordinates.
 */
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
): { x: number; y: number } => {
  const rads = degreesToRadians(angleInDegrees);
  return {
    x: centerX + radius * Math.cos(rads),
    y: centerY + radius * Math.sin(rads),
  };
};

/**
 * Convert cartesian coordinates to polar coordinates.
 *
 * @param centerX Center x coordinate.
 * @param centerY Center y coordinate.
 * @param x Point x coordinate.
 * @param y Point y coordinate.
 * @returns Polar coordinates.
 */
const cartesianToPolar = (
  centerX: number,
  centerY: number,
  x: number,
  y: number,
): { radius: number; angleInDegrees: number } => {
  const radius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  let angleInDegrees = radiansToDegrees(Math.atan2(y - centerY, x - centerX));
  if (angleInDegrees < 0) {
    angleInDegrees += 360;
  }
  return { radius, angleInDegrees };
};

/**
 * Calculates length of circle.
 *
 * @param radius Radius of the circle.
 * @returns The length of the circle.
 */
const getCircleLength = (radius: number): number => {
  return 2 * Math.PI * radius;
};

/**
 * Calculates height for the compact layout.
 *
 * @param totalLangs Total number of languages.
 * @returns Card height.
 */
const calculateCompactLayoutHeight = (totalLangs: number): number => {
  return COMPACT_LAYOUT_BASE_HEIGHT + Math.round(totalLangs / 2) * 25;
};

/**
 * Calculates height for the normal layout.
 *
 * @param totalLangs Total number of languages.
 * @returns Card height.
 */
const calculateNormalLayoutHeight = (totalLangs: number): number => {
  return 45 + (totalLangs + 1) * 40;
};

/**
 * Calculates height for the donut layout.
 *
 * @param totalLangs Total number of languages.
 * @returns Card height.
 */
const calculateDonutLayoutHeight = (totalLangs: number): number => {
  return 215 + Math.max(totalLangs - 5, 0) * 32;
};

/**
 * Calculates height for the donut vertical layout.
 *
 * @param totalLangs Total number of languages.
 * @returns Card height.
 */
const calculateDonutVerticalLayoutHeight = (totalLangs: number): number => {
  return 300 + Math.round(totalLangs / 2) * 25;
};

/**
 * Calculates height for the pie layout.
 *
 * @param totalLangs Total number of languages.
 * @returns Card height.
 */
const calculatePieLayoutHeight = (totalLangs: number): number => {
  return 300 + Math.round(totalLangs / 2) * 25;
};

/**
 * Calculates the center translation needed to keep the donut chart centred.
 *
 * @param totalLangs Total number of languages.
 * @returns Donut center translation.
 */
const donutCenterTranslation = (totalLangs: number): number => {
  return -45 + Math.max(totalLangs - 5, 0) * 16;
};

/**
 * Trim top languages to lang_count while also hiding certain languages.
 *
 * @param topLangs Top languages.
 * @param langs_count Number of languages to show.
 * @param hide Languages to hide.
 * @returns Trimmed top languages and total size.
 */
const trimTopLanguages = (
  topLangs: TopLangData,
  langs_count: number,
  hide?: Array<string>,
): { langs: Array<Lang>; totalLanguageSize: number } => {
  let langs = Object.values(topLangs);
  const langsToHide: Record<string, boolean> = {};
  const langsCount = clampValue(langs_count, 1, MAXIMUM_LANGS_COUNT);

  // populate langsToHide map for quick lookup while filtering out
  if (hide) {
    hide.forEach((langName) => {
      langsToHide[lowercaseTrim(langName)] = true;
    });
  }

  // filter out languages to be hidden
  langs = langs
    .sort((a, b) => b.size - a.size)
    .filter((lang) => !langsToHide[lowercaseTrim(lang.name)])
    .slice(0, langsCount);

  const totalLanguageSize = langs.reduce((acc, curr) => acc + curr.size, 0);

  return { langs, totalLanguageSize };
};

/**
 * Get display value corresponding to the format.
 *
 * @param size Bytes size.
 * @param percentages Percentage value.
 * @param format Format of the stats.
 * @returns Display value.
 */
const getDisplayValue = (
  size: number,
  percentages: number,
  format: string,
): string => {
  return format === "bytes" ? formatBytes(size) : `${percentages.toFixed(2)}%`;
};

/**
 * Resolves a language's display color, falling back to the default, and
 * validates it is a prefixed hex color.
 *
 * @param lang Programming language object.
 * @returns Validated language color.
 */
const resolveLangColor = (lang: Lang): string => {
  const color = lang.color || DEFAULT_LANG_COLOR;
  if (!isPrefixedHexColor(color)) {
    throw new Error(`Invalid language color: "${color}"`);
  }
  return color;
};

/**
 * Create progress bar text item for a programming language.
 *
 * @param props Function properties.
 * @param props.width The card width
 * @param props.color Color of the programming language.
 * @param props.name Name of the programming language.
 * @param props.size Size of the programming language.
 * @param props.totalSize Total size of all languages.
 * @param props.statsFormat Stats format.
 * @param props.hideValues Whether to hide stats values.
 * @param props.index Index of the programming language.
 * @returns Programming language SVG node.
 */
const createProgressTextNode = ({
  width,
  color,
  name,
  size,
  totalSize,
  statsFormat,
  hideValues,
  index,
}: {
  width: number;
  color: string;
  name: string;
  size: number;
  totalSize: number;
  statsFormat: string;
  hideValues?: boolean | undefined;
  index: number;
}): string => {
  const staggerDelay = (index + 3) * 150;
  const paddingRight = hideValues ? CARD_PADDING * 2 : 95;
  const progressTextX = width - paddingRight + 10;
  const progressWidth = width - paddingRight;

  const progress = (size / totalSize) * 100;
  const displayValue = getDisplayValue(size, progress, statsFormat);

  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms">
      <text data-testid="lang-name" x="2" y="15" class="lang-name">${encodeHTML(name)}</text>
      ${hideValues ? "" : `<text x="${progressTextX}" y="34" class="lang-name">${encodeHTML(displayValue)}</text>`}
      ${createProgressNode({
        x: 0,
        y: 25,
        color,
        width: progressWidth,
        progress,
        delay: staggerDelay + 300,
      })}
    </g>
  `;
};

/**
 * Creates compact text item for a programming language.
 *
 * @param props Function properties.
 * @param props.lang Programming language object.
 * @param props.totalSize Total size of all languages.
 * @param props.hideProgress Whether to hide percentage.
 * @param props.hideValues Whether to hide stats values (percentages/bytes).
 * @param props.statsFormat Stats format
 * @param props.index Index of the programming language.
 * @returns Compact layout programming language SVG node.
 */
const createCompactLangNode = ({
  lang,
  totalSize,
  hideProgress,
  hideValues,
  statsFormat = "percentages",
  index,
}: {
  lang: Lang;
  totalSize: number;
  hideProgress?: boolean | undefined;
  hideValues?: boolean | undefined;
  statsFormat?: string | undefined;
  index: number;
}): string => {
  const percentages = (lang.size / totalSize) * 100;
  const displayValue = getDisplayValue(lang.size, percentages, statsFormat);

  const staggerDelay = (index + 3) * 150;
  const color = resolveLangColor(lang);

  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms">
      <circle cx="5" cy="6" r="5" fill="${color}" />
      <text data-testid="lang-name" x="15" y="10" class='lang-name'>
        ${encodeHTML(lang.name)} ${hideProgress || hideValues ? "" : encodeHTML(displayValue)}
      </text>
    </g>
  `;
};

/**
 * Create compact languages text items for all programming languages.
 *
 * @param props Function properties.
 * @param props.langs Array of programming languages.
 * @param props.totalSize Total size of all languages.
 * @param props.hideProgress Whether to hide percentage.
 * @param props.hideValues Whether to hide stats values.
 * @param props.statsFormat Stats format
 * @returns Programming languages SVG node.
 */
const createLanguageTextNode = ({
  langs,
  totalSize,
  hideProgress,
  hideValues,
  statsFormat,
}: {
  langs: Array<Lang>;
  totalSize: number;
  hideProgress?: boolean | undefined;
  hideValues?: boolean | undefined;
  statsFormat?: string | undefined;
}): string => {
  const longestLang = getLongestLang(langs);
  const chunked = chunkArray(langs, langs.length / 2);
  const layouts = chunked.map((array) => {
    const items = array.map((lang, index) =>
      createCompactLangNode({
        lang,
        totalSize,
        hideProgress,
        hideValues,
        statsFormat,
        index,
      }),
    );
    return flexLayout({
      items,
      gap: 25,
      direction: "column",
    }).join("");
  });

  const percent = ((longestLang.size / totalSize) * 100).toFixed(2);
  const minGap = 150;
  const maxGap = 20 + measureText(`${longestLang.name} ${percent}%`, 11);
  return flexLayout({
    items: layouts,
    gap: maxGap < minGap ? minGap : maxGap,
  }).join("");
};

/**
 * Create donut languages text items for all programming languages.
 *
 * @param props Function properties.
 * @param props.langs Array of programming languages.
 * @param props.totalSize Total size of all languages.
 * @param props.hideValues Whether to hide stats values.
 * @param props.statsFormat Stats format
 * @returns Donut layout programming language SVG node.
 */
const createDonutLanguagesNode = ({
  langs,
  totalSize,
  hideValues,
  statsFormat,
}: {
  langs: Array<Lang>;
  totalSize: number;
  hideValues?: boolean | undefined;
  statsFormat?: string | undefined;
}): string => {
  return flexLayout({
    items: langs.map((lang, index) => {
      return createCompactLangNode({
        lang,
        totalSize,
        hideProgress: false,
        hideValues,
        statsFormat,
        index,
      });
    }),
    gap: 32,
    direction: "column",
  }).join("");
};

/**
 * Renders the default language card layout.
 *
 * @param langs Array of programming languages.
 * @param width Card width.
 * @param totalLanguageSize Total size of all languages.
 * @param statsFormat Stats format.
 * @param hideValues Whether to hide stats values.
 * @returns Normal layout card SVG object.
 */
const renderNormalLayout = (
  langs: Array<Lang>,
  width: number,
  totalLanguageSize: number,
  statsFormat: string,
  hideValues?: boolean,
): string => {
  return flexLayout({
    items: langs.map((lang, index) => {
      return createProgressTextNode({
        width,
        name: lang.name,
        color: lang.color || DEFAULT_LANG_COLOR,
        size: lang.size,
        totalSize: totalLanguageSize,
        statsFormat,
        hideValues,
        index,
      });
    }),
    gap: 40,
    direction: "column",
  }).join("");
};

/**
 * Renders the compact language card layout.
 *
 * @param langs Array of programming languages.
 * @param width Card width.
 * @param totalLanguageSize Total size of all languages.
 * @param hideProgress Whether to hide progress bar.
 * @param statsFormat Stats format.
 * @param hideValues Whether to hide stats values.
 * @returns Compact layout card SVG object.
 */
const renderCompactLayout = (
  langs: Array<Lang>,
  width: number,
  totalLanguageSize: number,
  hideProgress?: boolean,
  statsFormat = "percentages",
  hideValues?: boolean,
): string => {
  const paddingRight = 50;
  const offsetWidth = width - paddingRight;
  // progressOffset holds the previous language's width and used to offset the next language
  // so that we can stack them one after another, like this: [--][----][---]
  let progressOffset = 0;
  const compactProgressBar = langs
    .map((lang) => {
      const langColor = resolveLangColor(lang);

      const percentage = parseFloat(
        ((lang.size / totalLanguageSize) * offsetWidth).toFixed(2),
      );

      const progress = percentage < 10 ? percentage + 10 : percentage;

      const output = `
        <rect
          mask="url(#rect-mask)"
          data-testid="lang-progress"
          x="${progressOffset}"
          y="0"
          width="${progress}"
          height="8"
          fill="${langColor}"
        />
      `;
      progressOffset += percentage;
      return output;
    })
    .join("");

  return `
  ${
    hideProgress
      ? ""
      : `
      <mask id="rect-mask">
          <rect x="0" y="0" width="${offsetWidth}" height="8" fill="white" rx="5"/>
        </mask>
        ${compactProgressBar}
      `
  }
    <g transform="translate(0, ${hideProgress ? "0" : "25"})">
      ${createLanguageTextNode({
        langs,
        totalSize: totalLanguageSize,
        hideProgress,
        statsFormat,
        hideValues,
      })}
    </g>
  `;
};

/**
 * Renders donut vertical layout to display user's most frequently used programming languages.
 *
 * @param langs Array of programming languages.
 * @param totalLanguageSize Total size of all languages.
 * @param statsFormat Stats format.
 * @param hideValues Whether to hide stats values.
 * @returns Compact layout card SVG object.
 */
const renderDonutVerticalLayout = (
  langs: Array<Lang>,
  totalLanguageSize: number,
  statsFormat: string,
  hideValues?: boolean,
): string => {
  // Donut vertical chart radius and total length
  const radius = 80;
  const totalCircleLength = getCircleLength(radius);

  // SVG circles
  const circles = [];

  // Start indent for donut vertical chart parts
  let indent = 0;

  // Start delay coefficient for donut vertical chart parts
  let startDelayCoefficient = 1;

  // Generate each donut vertical chart part
  for (const lang of langs) {
    const langColor = resolveLangColor(lang);

    const percentage = (lang.size / totalLanguageSize) * 100;
    const circleLength = totalCircleLength * (percentage / 100);
    const delay = startDelayCoefficient * 100;

    circles.push(`
      <g class="stagger" style="animation-delay: ${delay}ms">
        <circle
          cx="150"
          cy="100"
          r="${radius}"
          fill="transparent"
          stroke="${langColor}"
          stroke-width="25"
          stroke-dasharray="${totalCircleLength}"
          stroke-dashoffset="${indent}"
          size="${percentage}"
          data-testid="lang-donut"
        />
      </g>
    `);

    // Update the indent for the next part
    indent += circleLength;
    // Update the start delay coefficient for the next part
    startDelayCoefficient += 1;
  }

  return `
    <svg data-testid="lang-items">
      <g transform="translate(0, 0)">
        <svg data-testid="donut">
          ${circles.join("")}
        </svg>
      </g>
      <g transform="translate(0, 220)">
        <svg data-testid="lang-names" x="${CARD_PADDING}">
          ${createLanguageTextNode({
            langs,
            totalSize: totalLanguageSize,
            hideProgress: false,
            statsFormat,
            hideValues,
          })}
        </svg>
      </g>
    </svg>
  `;
};

/**
 * Renders pie layout to display user's most frequently used programming languages.
 *
 * @param langs Array of programming languages.
 * @param totalLanguageSize Total size of all languages.
 * @param statsFormat Stats format.
 * @param hideValues Whether to hide stats values.
 * @returns Compact layout card SVG object.
 */
const renderPieLayout = (
  langs: Array<Lang>,
  totalLanguageSize: number,
  statsFormat: string,
  hideValues?: boolean,
): string => {
  // Pie chart radius and center coordinates
  const radius = 90;
  const centerX = 150;
  const centerY = 100;

  // Start angle for the pie chart parts
  let startAngle = 0;

  // Start delay coefficient for the pie chart parts
  let startDelayCoefficient = 1;

  // SVG paths
  const paths = [];

  // Generate each pie chart part
  for (const lang of langs) {
    const langColor = resolveLangColor(lang);

    if (langs.length === 1) {
      paths.push(`
        <circle
          cx="${centerX}"
          cy="${centerY}"
          r="${radius}"
          stroke="none"
          fill="${langColor}"
          data-testid="lang-pie"
          size="100"
        />
      `);
      break;
    }

    const langSizePart = lang.size / totalLanguageSize;
    const percentage = langSizePart * 100;
    // Calculate the angle for the current part
    const angle = langSizePart * 360;

    // Calculate the end angle
    const endAngle = startAngle + angle;

    // Calculate the coordinates of the start and end points of the arc
    const startPoint = polarToCartesian(centerX, centerY, radius, startAngle);
    const endPoint = polarToCartesian(centerX, centerY, radius, endAngle);

    // Determine the large arc flag based on the angle
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Calculate delay
    const delay = startDelayCoefficient * 100;

    // SVG arc markup
    paths.push(`
      <g class="stagger" style="animation-delay: ${delay}ms">
        <path
          data-testid="lang-pie"
          size="${percentage}"
          d="M ${centerX} ${centerY} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y} Z"
          fill="${langColor}"
        />
      </g>
    `);

    // Update the start angle for the next part
    startAngle = endAngle;
    // Update the start delay coefficient for the next part
    startDelayCoefficient += 1;
  }

  return `
    <svg data-testid="lang-items">
      <g transform="translate(0, 0)">
        <svg data-testid="pie">
          ${paths.join("")}
        </svg>
      </g>
      <g transform="translate(0, 220)">
        <svg data-testid="lang-names" x="${CARD_PADDING}">
          ${createLanguageTextNode({
            langs,
            totalSize: totalLanguageSize,
            hideProgress: false,
            statsFormat,
            hideValues,
          })}
        </svg>
      </g>
    </svg>
  `;
};

/**
 * Creates the SVG paths for the language donut chart.
 *
 * @param cx Donut center x-position.
 * @param cy Donut center y-position.
 * @param radius Donut arc Radius.
 * @param percentages Array with donut section percentages.
 * @returns Array of svg path elements
 */
const createDonutPaths = (
  cx: number,
  cy: number,
  radius: number,
  percentages: Array<number>,
): Array<{ d: string; percent: number }> => {
  const paths: Array<{ d: string; percent: number }> = [];
  let startAngle = 0;

  const totalPercent = percentages.reduce((acc, curr) => acc + curr, 0);
  for (const rawPercent of percentages) {
    const percent = parseFloat(((rawPercent / totalPercent) * 100).toFixed(2));

    const endAngle = 3.6 * percent + startAngle;
    const startPoint = polarToCartesian(cx, cy, radius, endAngle - 90); // rotate donut 90 degrees counter-clockwise.
    const endPoint = polarToCartesian(cx, cy, radius, startAngle - 90); // rotate donut 90 degrees counter-clockwise.
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    paths.push({
      percent,
      d: `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y}`,
    });
    startAngle = endAngle;
  }

  return paths;
};

/**
 * Renders the donut language card layout.
 *
 * @param langs Array of programming languages.
 * @param width Card width.
 * @param totalLanguageSize Total size of all languages.
 * @param statsFormat Stats format.
 * @param hideValues Whether to hide stats values.
 * @returns Donut layout card SVG object.
 */
const renderDonutLayout = (
  langs: Array<Lang>,
  width: number,
  totalLanguageSize: number,
  statsFormat: string,
  hideValues?: boolean,
): string => {
  if (!Number.isFinite(width)) {
    throw new Error(`Invalid width: "${width}"`);
  }

  const centerX = width / 3;
  const centerY = width / 3;
  const radius = centerX - 60;
  const strokeWidth = 12;

  const colors = langs.map(resolveLangColor);
  const langsPercents = langs.map((lang) =>
    parseFloat(((lang.size / totalLanguageSize) * 100).toFixed(2)),
  );

  const langPaths = createDonutPaths(centerX, centerY, radius, langsPercents);

  const donutPaths =
    langs.length === 1
      ? `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="${colors[0] ?? DEFAULT_LANG_COLOR}" fill="none" stroke-width="${strokeWidth}" data-testid="lang-donut" size="100"/>`
      : langPaths
          .map((section, index) => {
            const staggerDelay = (index + 3) * 100;
            const delay = staggerDelay + 300;

            const output = `
       <g class="stagger" style="animation-delay: ${delay}ms">
        <path
          data-testid="lang-donut"
          size="${section.percent}"
          d="${section.d}"
          stroke="${colors[index] ?? DEFAULT_LANG_COLOR}"
          fill="none"
          stroke-width="${strokeWidth}">
        </path>
      </g>
      `;

            return output;
          })
          .join("");

  const donut = `<svg width="${width}" height="${width}">${donutPaths}</svg>`;

  return `
    <g transform="translate(0, 0)">
      <g transform="translate(0, 0)">
        ${createDonutLanguagesNode({ langs, totalSize: totalLanguageSize, hideValues, statsFormat })}
      </g>

      <g transform="translate(125, ${donutCenterTranslation(langs.length)})">
        ${donut}
      </g>
    </g>
  `;
};

/**
 * Creates the no languages data SVG node.
 *
 * @param props Object with function properties.
 * @param props.text No languages data translated text.
 * @param props.layout Card layout.
 * @returns No languages data SVG node string.
 */
const noLanguagesDataNode = ({
  text,
  layout,
}: {
  text: string;
  layout: TopLangLayout | undefined;
}): string => {
  return `
    <text x="${
      layout === "pie" || layout === "donut-vertical" ? CARD_PADDING : 0
    }" y="11" class="stat bold">${encodeHTML(text)}</text>
  `;
};

/**
 * Get default languages count for provided card layout.
 *
 * @param props Function properties.
 * @param props.layout Input layout string.
 * @param props.hide_progress Input hide_progress parameter value.
 * @returns Default languages count for input layout.
 */
const getDefaultLanguagesCountByLayout = ({
  layout,
  hide_progress,
}: {
  layout?: TopLangLayout | undefined;
  hide_progress?: boolean | undefined;
}): number => {
  if (layout === "compact" || hide_progress === true) {
    return COMPACT_LAYOUT_DEFAULT_LANGS_COUNT;
  } else if (layout === "donut") {
    return DONUT_LAYOUT_DEFAULT_LANGS_COUNT;
  } else if (layout === "donut-vertical") {
    return DONUT_VERTICAL_LAYOUT_DEFAULT_LANGS_COUNT;
  } else if (layout === "pie") {
    return PIE_LAYOUT_DEFAULT_LANGS_COUNT;
  } else {
    return NORMAL_LAYOUT_DEFAULT_LANGS_COUNT;
  }
};

/**
 * Renders card that display user's most frequently used programming languages.
 *
 * @param topLangs User's most frequently used programming languages.
 * @param options Card options.
 * @returns Language card SVG object.
 */
const renderTopLanguages = (
  topLangs: TopLangData,
  options: Partial<TopLangOptions> = {},
): string => {
  const {
    hide_title = false,
    hide_border = false,
    card_width,
    hide,
    hide_progress,
    hide_values,
    layout,
    custom_title,
    locale,
    langs_count = getDefaultLanguagesCountByLayout({ layout, hide_progress }),
    border_radius,
    disable_animations,
    stats_format = "percentages",
  } = options;

  const i18n = new I18n({
    locale,
    translations: langCardLocales,
  });

  const { langs, totalLanguageSize } = trimTopLanguages(
    topLangs,
    langs_count,
    hide,
  );

  let width = card_width
    ? isNaN(card_width)
      ? DEFAULT_CARD_WIDTH
      : card_width < MIN_CARD_WIDTH
        ? MIN_CARD_WIDTH
        : card_width
    : DEFAULT_CARD_WIDTH;
  let height = calculateNormalLayoutHeight(langs.length);

  const { lightColors, darkColors } = getLightDarkColors(options);

  let finalLayout: string;
  if (langs.length === 0) {
    height = COMPACT_LAYOUT_BASE_HEIGHT;
    finalLayout = noLanguagesDataNode({
      text: i18n.t("langcard.nodata"),
      layout,
    });
  } else if (layout === "pie") {
    height = calculatePieLayoutHeight(langs.length);
    finalLayout = renderPieLayout(
      langs,
      totalLanguageSize,
      stats_format,
      hide_values,
    );
  } else if (layout === "donut-vertical") {
    height = calculateDonutVerticalLayoutHeight(langs.length);
    finalLayout = renderDonutVerticalLayout(
      langs,
      totalLanguageSize,
      stats_format,
      hide_values,
    );
  } else if (layout === "compact" || hide_progress === true) {
    height =
      calculateCompactLayoutHeight(langs.length) + (hide_progress ? -25 : 0);

    finalLayout = renderCompactLayout(
      langs,
      width,
      totalLanguageSize,
      hide_progress,
      stats_format,
      hide_values,
    );
  } else if (layout === "donut") {
    height = calculateDonutLayoutHeight(langs.length);
    width = width + 50; // padding
    finalLayout = renderDonutLayout(
      langs,
      width,
      totalLanguageSize,
      stats_format,
      hide_values,
    );
  } else {
    finalLayout = renderNormalLayout(
      langs,
      width,
      totalLanguageSize,
      stats_format,
      hide_values,
    );
  }

  const card = new Card({
    customTitle: custom_title,
    defaultTitle: i18n.t("langcard.title"),
    width,
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
    light: ({ textColor, progBarBgColor }) => `
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
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${textColor};
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .stat { font-size:12px; }
    }
    .bold { font-weight: 700 }
    .lang-name {
      font: 400 11px "Segoe UI", Ubuntu, Sans-Serif;
      fill: ${textColor};
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    #rect-mask rect{
      animation: slideInAnimation 1s ease-in-out forwards;
    }
    .lang-progress{
      animation: growWidthAnimation 0.6s ease-in-out forwards;
    }
    .progress-background { fill: ${progBarBgColor}; }
    `,
    dark: ({ textColor, progBarBgColor }) => `
      .stat { fill: ${textColor}; }
      .lang-name { fill: ${textColor}; }
      .progress-background { fill: ${progBarBgColor}; }
    `,
  });

  if (layout === "pie" || layout === "donut-vertical") {
    return card.render(finalLayout);
  }

  return card.render(`
    <svg data-testid="lang-items" x="${CARD_PADDING}">
      ${finalLayout}
    </svg>
  `);
};

export {
  getLongestLang,
  degreesToRadians,
  radiansToDegrees,
  polarToCartesian,
  cartesianToPolar,
  getCircleLength,
  calculateCompactLayoutHeight,
  calculateNormalLayoutHeight,
  calculateDonutLayoutHeight,
  calculateDonutVerticalLayoutHeight,
  calculatePieLayoutHeight,
  donutCenterTranslation,
  trimTopLanguages,
  renderTopLanguages,
  MIN_CARD_WIDTH,
  getDefaultLanguagesCountByLayout,
};
