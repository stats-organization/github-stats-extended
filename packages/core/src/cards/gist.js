// @ts-check

import { default as Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { kFormatter } from "../common/fmt.js";
import { icons } from "../common/icons.js";
import languageColors from "../common/languageColors.json" with { type: "json" };
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

const ICON_SIZE = 16;
const CARD_DEFAULT_WIDTH = 400;
const X_OFFSET = 25;
const HEADER_MAX_LENGTH = 35;
const DESCRIPTION_BOX_WIDTH = CARD_DEFAULT_WIDTH - 2 * X_OFFSET;
const DESCRIPTION_FONT_SIZE = 13;
const DESCRIPTION_LINE_HEIGHT_PX = 16;
const DESCRIPTION_MAX_LINES = 10;

/**
 * @typedef {import('./types').GistCardOptions} GistCardOptions Gist card options.
 * @typedef {import('../fetchers/types').GistData} GistData Gist data.
 */

/**
 * Render gist card.
 *
 * @param {GistData} gistData Gist data.
 * @param {Partial<GistCardOptions>} options Gist card options.
 * @returns {string} Gist card.
 */
const renderGistCard = (gistData, options = {}) => {
  const { name, nameWithOwner, description, language, starsCount, forksCount } =
    gistData;
  const {
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme = "default_repocard",
    border_radius,
    border_color,
    show_owner = false,
    hide_border = false,
  } = options;

  // returns theme based colors with proper overrides and defaults
  const { titleColor, textColor, iconColor, bgColor, borderColor } =
    getCardColors({
      title_color,
      icon_color,
      text_color,
      bg_color,
      border_color,
      theme,
    });

  const desc = parseEmojis(description || "No description provided");
  // The browser performs the actual text wrapping inside the foreignObject;
  // we only estimate the line count server-side so the SVG can reserve enough
  // height. The estimate uses measureText for font-aware widths instead of a
  // fixed character count.
  const descriptionLines = countWrappedLines(
    desc,
    DESCRIPTION_FONT_SIZE,
    DESCRIPTION_BOX_WIDTH,
    DESCRIPTION_MAX_LINES,
  );

  const descriptionSvg = wrappedTextNode({
    text: desc,
    x: X_OFFSET,
    y: 0,
    width: DESCRIPTION_BOX_WIDTH,
    height: descriptionLines * DESCRIPTION_LINE_HEIGHT_PX,
    lineCount: descriptionLines,
    className: "description",
    testId: "description-text",
  });

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
  // @ts-ignore
  const languageColor = languageColors[languageName] || "#858585";

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
    colors: {
      titleColor,
      textColor,
      iconColor,
      bgColor,
      borderColor,
    },
  });

  card.setCSS(`
    .description {
      font: 400 ${DESCRIPTION_FONT_SIZE}px 'Segoe UI', Ubuntu, Sans-Serif;${wrappedTextStyles(textColor)}    }
    .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
    .icon { fill: ${iconColor} }
  `);
  card.setHideBorder(hide_border);

  return card.render(`
    ${descriptionSvg}

    <g transform="translate(30, ${height - 75})">
        ${starAndForkCount}
    </g>
  `);
};

export { renderGistCard };
