import { default as Card } from "../common/Card.js";
import { getLightDarkColors } from "../common/color.js";
import { kFormatter, wrapTextMultiline } from "../common/fmt.js";
import { encodeHTML } from "../common/html.js";
import { icons } from "../common/icons.js";
import { getLanguageColor } from "../common/languageColors.js";
import { parseEmojis } from "../common/ops.js";
import {
  countWrappedLines,
  createLanguageNode,
  flexLayout,
  iconWithLabel,
  measureText,
  wrappedTextNode,
  wrappedTextStyles,
} from "../common/render.js";
import type { GistData } from "../fetchers/types.js";

import type { CardOptions, CommonCardOptions } from "./options.js";

const ICON_SIZE = 16;
const CARD_DEFAULT_WIDTH = 400;
const X_OFFSET = 25;
const HEADER_MAX_LENGTH = 35;
const DESCRIPTION_BOX_WIDTH = CARD_DEFAULT_WIDTH - 2 * X_OFFSET;
const DESCRIPTION_FONT_SIZE = 13;
const DESCRIPTION_LINE_HEIGHT_PX = 16;
const DESCRIPTION_MAX_LINES = 10;

interface GistCardOptions extends CommonCardOptions {
  show_owner: boolean;
  browser_rendering: boolean;
}

/**
 * Render gist card.
 *
 * @param gistData Gist data.
 * @param options Gist card options.
 * @returns Gist card.
 */
const renderGistCard = (
  gistData: GistData,
  options: CardOptions<GistCardOptions> = {},
): string => {
  const { name, nameWithOwner, description, language, starsCount, forksCount } =
    gistData;
  const {
    theme = "default_repocard",
    border_radius,
    show_owner = false,
    browser_rendering = false,
    hide_border = false,
  } = options;

  const { lightColors, darkColors } = getLightDarkColors({ ...options, theme });

  const desc = parseEmojis(description || "No description provided");

  let descriptionLines: number;
  let descriptionSvg: string;
  if (browser_rendering) {
    // The browser performs the actual text wrapping inside the foreignObject;
    // we only estimate the line count server-side so the SVG can reserve enough
    // height. The estimate uses measureText for font-aware widths instead of a
    // fixed character count.
    descriptionLines = countWrappedLines(
      desc,
      DESCRIPTION_FONT_SIZE,
      DESCRIPTION_BOX_WIDTH,
      DESCRIPTION_MAX_LINES,
    );

    descriptionSvg = wrappedTextNode({
      text: desc,
      x: X_OFFSET,
      y: -3,
      width: DESCRIPTION_BOX_WIDTH,
      height: descriptionLines * DESCRIPTION_LINE_HEIGHT_PX + 10, // 10px extra for "descenders" like g, j, q, p, y
      lineCount: descriptionLines,
      className: "description",
      testId: "description-text",
    });
  } else {
    const linesLimit = 10;
    const multiLineDescription = wrapTextMultiline(
      desc,
      DESCRIPTION_BOX_WIDTH,
      DESCRIPTION_FONT_SIZE,
      linesLimit,
    );
    descriptionLines = multiLineDescription.length;
    descriptionSvg = multiLineDescription
      .map(
        (line) =>
          `<tspan dy="1.2em" x="${X_OFFSET}">${encodeHTML(line)}</tspan>`,
      )
      .join("");
    descriptionSvg = `<text class="description" x="${X_OFFSET}" y="-5">
        ${descriptionSvg}
    </text>`;
  }

  const lineHeight = descriptionLines > 3 ? 12 : 10;
  const height =
    (descriptionLines > 1 ? 120 : 110) + descriptionLines * lineHeight;

  const totalStars = kFormatter(starsCount);
  const totalForks = kFormatter(forksCount);
  const svgStars = iconWithLabel(
    icons.star,
    totalStars,
    "starsCount",
    ICON_SIZE,
  );
  const svgForks = iconWithLabel(
    icons.fork,
    totalForks,
    "forksCount",
    ICON_SIZE,
  );

  const languageName = language || "Unspecified";
  const languageColor = getLanguageColor(languageName);

  const svgLanguage = createLanguageNode(languageName, languageColor);

  const starAndForkCount = flexLayout({
    items: [svgLanguage, svgStars, svgForks],
    sizes: [
      measureText(languageName, 12),
      ICON_SIZE + measureText(`${totalStars}`, 12),
      ICON_SIZE + measureText(`${totalForks}`, 12),
    ],
    gap: 25,
  }).join("");

  const header = show_owner ? nameWithOwner : name;

  const card = new Card({
    defaultTitle:
      header.length > HEADER_MAX_LENGTH
        ? `${header.slice(0, HEADER_MAX_LENGTH)}...`
        : header,
    titlePrefixIcon: icons.gist,
    width: CARD_DEFAULT_WIDTH,
    height,
    border_radius,
    colors: { light: lightColors, dark: darkColors },
  });

  card.setCSS({
    light: ({ textColor, iconColor }) => `
    .description {
      font: 400 ${DESCRIPTION_FONT_SIZE}px 'Segoe UI', Ubuntu, Sans-Serif;fill: ${textColor};
      ${browser_rendering ? wrappedTextStyles(textColor) : ""}
    }
    .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
    .icon { fill: ${iconColor} }
  `,
    dark: ({ textColor, iconColor }) => `
      .description {
        fill: ${textColor};
        ${browser_rendering ? wrappedTextStyles(textColor) : ""}
      }
      .gray { fill: ${textColor} }
      .icon { fill: ${iconColor} }
    `,
  });

  card.setHideBorder(hide_border);

  return card.render(`
    ${descriptionSvg}

    <g transform="translate(30, ${height - 75})">
        ${starAndForkCount}
    </g>
  `);
};

export { renderGistCard };
