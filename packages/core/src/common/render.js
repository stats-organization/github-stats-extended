// @ts-check

import { getCardColors } from "./color.js";
import { SECONDARY_ERROR_MESSAGES, TRY_AGAIN_LATER } from "./error.js";
import { encodeHTML } from "./html.js";
import { clampValue } from "./ops.js";

/**
 * Auto layout utility, allows us to layout things vertically or horizontally with
 * proper gaping.
 *
 * @param {object} props Function properties.
 * @param {string[]} props.items Array of items to layout.
 * @param {number} props.gap Gap between items.
 * @param {"column" | "row"=} props.direction Direction to layout items.
 * @param {number[]=} props.sizes Array of sizes for each item.
 * @returns {string[]} Array of items with proper layout.
 */
const flexLayout = ({ items, gap, direction, sizes = [] }) => {
  let lastSize = 0;
  // filter() for filtering out empty strings
  return items.filter(Boolean).map((item, i) => {
    const size = sizes[i] || 0;
    let transform = `translate(${lastSize}, 0)`;
    if (direction === "column") {
      transform = `translate(0, ${lastSize})`;
    }
    lastSize += size + gap;
    return `<g transform="${transform}">${item}</g>`;
  });
};

/**
 * Creates a node to display the primary programming language of the repository/gist.
 *
 * @param {string} langName Language name.
 * @param {string} langColor Language color.
 * @returns {string} Language display SVG object.
 */
const createLanguageNode = (langName, langColor) => {
  return `
    <g data-testid="primary-lang">
      <circle data-testid="lang-color" cx="0" cy="-5" r="6" fill="${langColor}" />
      <text data-testid="lang-name" class="gray" x="15">${langName}</text>
    </g>
    `;
};

/**
 * Create a node to indicate progress in percentage along a horizontal line.
 *
 * @param {Object} params Object that contains the createProgressNode parameters.
 * @param {number} params.x X-axis position.
 * @param {number} params.y Y-axis position.
 * @param {number} params.width Width of progress bar.
 * @param {string} params.color Progress color.
 * @param {number} params.progress Progress value.
 * @param {string} params.progressBarBackgroundColor Progress bar bg color.
 * @param {number} params.delay Delay before animation starts.
 * @returns {string} Progress node.
 */
const createProgressNode = ({
  x,
  y,
  width,
  color,
  progress,
  progressBarBackgroundColor,
  delay,
}) => {
  const progressPercentage = clampValue(progress, 2, 100);

  return `
    <svg width="${width}" x="${x}" y="${y}">
      <rect data-testid="progress-background" rx="5" ry="5" x="0" y="0" width="${width}" height="8" fill="${progressBarBackgroundColor}"></rect>
      <svg data-testid="lang-progress" width="${progressPercentage}%">
        <rect
            height="8"
            fill="${color}"
            rx="5" ry="5" x="0" y="0"
            class="lang-progress"
            style="animation-delay: ${delay}ms;"
        />
      </svg>
    </svg>
  `;
};

/**
 * Renders multi-line text via a `foreignObject` so the browser performs
 * native, font-aware wrapping. Content overflowing `lineCount` lines is
 * clipped (with an ellipsis on the last visible line) by CSS line-clamp.
 *
 * @param {object} props Function properties.
 * @param {string} props.text Text to render (will be HTML-encoded).
 * @param {number} props.x X position of the foreignObject.
 * @param {number} props.y Y position of the foreignObject.
 * @param {number} props.width Width of the wrap box.
 * @param {number} props.height Height of the wrap box.
 * @param {number} props.lineCount Maximum number of lines to display.
 * @param {string} props.className CSS class applied to the inner element.
 * @param {string=} props.testId Optional test id for the inner element.
 * @returns {string} foreignObject SVG node.
 */
const wrappedTextNode = ({
  text,
  x,
  y,
  width,
  height,
  lineCount,
  className,
  testId,
}) => {
  const testIdAttr = testId ? ` data-testid="${testId}"` : "";
  return `
    <foreignObject x="${x}" y="${y}" width="${width}" height="${height}">
      <div xmlns="http://www.w3.org/1999/xhtml" class="${className}" style="--lines: ${lineCount};"${testIdAttr}>${encodeHTML(
        text,
      )}</div>
    </foreignObject>
  `;
};

/**
 * CSS rules used to render multi-line text inside a `foreignObject`. Apply this
 * to a CSS class (e.g. `.description`) shared with `wrappedTextNode` so the
 * browser handles wrapping and the line count is taken from the `--lines`
 * custom property set on the element.
 */
const wrappedTextStyles = `
    margin: 0;
    line-height: 1.2;
    overflow-wrap: anywhere;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--lines);
    line-clamp: var(--lines);
    overflow: hidden;
    text-overflow: ellipsis;
`;

/**
 * Creates an icon with label to display repository/gist stats like forks, stars, etc.
 *
 * @param {string} icon The icon to display.
 * @param {number|string} label The label to display.
 * @param {string} testid The testid to assign to the label.
 * @param {number} iconSize The size of the icon.
 * @returns {string} Icon with label SVG object.
 */
const iconWithLabel = (icon, label, testid, iconSize) => {
  if (typeof label === "number" && label <= 0) {
    return "";
  }
  const iconSvg = `
      <svg
        class="icon"
        y="-12"
        viewBox="0 0 16 16"
        version="1.1"
        width="${iconSize}"
        height="${iconSize}"
      >
        ${icon}
      </svg>
    `;
  const text = `<text data-testid="${testid}" class="gray">${label}</text>`;
  return flexLayout({ items: [iconSvg, text], gap: 20 }).join("");
};

// Script parameters.
const ERROR_CARD_LENGTH = 576.5;

const UPSTREAM_API_ERRORS = [
  TRY_AGAIN_LATER,
  SECONDARY_ERROR_MESSAGES.MAX_RETRY,
];

/**
 * Renders error message on the card.
 *
 * @param {object} args Function arguments.
 * @param {string} args.message Main error message.
 * @param {string} [args.secondaryMessage=""] The secondary error message.
 * @param {object} [args.renderOptions={}] Render options.
 * @param {string=} args.renderOptions.title_color Card title color.
 * @param {string=} args.renderOptions.text_color Card text color.
 * @param {string=} args.renderOptions.bg_color Card background color.
 * @param {string=} args.renderOptions.border_color Card border color.
 * @param {Parameters<typeof getCardColors>[0]["theme"]=} args.renderOptions.theme Card theme.
 * @param {boolean=} args.renderOptions.show_repo_link Whether to show repo link or not.
 * @returns {string} The SVG markup.
 */
const renderError = ({
  message,
  secondaryMessage = "",
  renderOptions = {},
}) => {
  const {
    title_color,
    text_color,
    bg_color,
    border_color,
    theme = "default",
    show_repo_link = true,
  } = renderOptions;

  // returns theme based colors with proper overrides and defaults
  const { titleColor, textColor, bgColor, borderColor } = getCardColors({
    title_color,
    text_color,
    icon_color: "",
    bg_color,
    border_color,
    ring_color: "",
    theme,
  });

  return `
    <svg width="${ERROR_CARD_LENGTH}"  height="120" viewBox="0 0 ${ERROR_CARD_LENGTH} 120" fill="${bgColor}" xmlns="http://www.w3.org/2000/svg">
    <style>
    .text { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor} }
    .small { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
    .gray { fill: #858585 }
    </style>
    <rect x="0.5" y="0.5" width="${
      ERROR_CARD_LENGTH - 1
    }" height="99%" rx="4.5" fill="${bgColor}" stroke="${borderColor}"/>
    <text x="25" y="45" class="text">Something went wrong!${
      UPSTREAM_API_ERRORS.includes(secondaryMessage) || !show_repo_link
        ? ""
        : " file an issue at https://tinyurl.com/github-stats"
    }</text>
    <text data-testid="message" x="25" y="55" class="text small">
      <tspan x="25" dy="18">${encodeHTML(message)}</tspan>
      <tspan x="25" dy="18" class="gray">${secondaryMessage}</tspan>
    </text>
    </svg>
  `;
};

/**
 * Retrieve text length.
 *
 * @see https://stackoverflow.com/a/48172630/10629172
 * @param {string} str String to measure.
 * @param {number} fontSize Font size.
 * @returns {number} Text length.
 */
const measureText = (str, fontSize = 10) => {
  // prettier-ignore
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0.2796875, 0.2765625,
    0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625,
    0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125,
    0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875,
    1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625,
    0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625,
    0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625,
    0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375,
    0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625,
    0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5,
    0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875,
    0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875,
    0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625,
  ];

  const avg = 0.5279276315789471;
  // CJK character range: U+3000–U+9FFF (CJK Symbols/Punctuation, Hiragana,
  // Katakana, CJK Unified Ideographs incl. Extension A) plus U+FF00–U+FFEF
  // (Halfwidth/Fullwidth Forms — fullwidth ASCII, fullwidth punctuation).
  const cjkRange = /[\u3000-\u9FFF\uFF00-\uFFEF]/;

  return (
    str
      .split("")
      .map((c) => {
        if (cjkRange.test(c) || c === "\u3000") {
          // CJK glyphs and U+3000 IDEOGRAPHIC SPACE are full-width by default;
          return 1;
        }
        if (c.charCodeAt(0) < widths.length) {
          return widths[c.charCodeAt(0)];
        } else {
          return avg;
        }
      })
      .reduce((cur, acc) => acc + cur) * fontSize
  );
};

/**
 * Split text into the lines it would wrap to when laid out greedily at the
 * given font size inside a box of width `maxWidth`. Uses `measureText` so the
 * estimate reflects actual font metrics rather than a fixed character count.
 * The browser still does the real wrap inside the foreignObject; this is only
 * used to size the SVG.
 *
 * @param {string} text Text to split.
 * @param {number} fontSize Font size in px (matches `measureText`).
 * @param {number} maxWidth Available wrap width in px.
 * @returns {string[]} Estimated wrapped lines.
 */
const splitWrappedText = (text, fontSize, maxWidth) => {
  if (!text) {
    return [];
  }

  // Tokenize the text into atoms representing line-break opportunities:
  //   - ASCII whitespace runs (collapsed/dropped at line edges per CSS rules);
  //   - non-ASCII whitespaces
  //   - a single CJK codepoint (browsers break between any two CJK chars,
  //     punctuation or not, so each one is its own atom and ~1 em wide);
  //   - a run of non-whitespace non-CJK characters (a "word" that can only
  //     break at its boundaries, like Latin script).
  // Korean Hangul (U+AC00–U+D7AF) is intentionally NOT in the CJK range
  // because Korean wraps at word boundaries by default in HTML.
  // ASCII whitespace is collapsed to a single space per CSS `white-space: normal;`
  text = text.replace(/[\t\n\r ]+/g, " ");
  const tokens = text.match(
    /\s|[\u3000-\u9FFF\uFF00-\uFFEF]|[^\s\u3000-\u9FFF\uFF00-\uFFEF]+/g,
  );
  if (!tokens) {
    return [];
  }

  const takeFittingSegment = (token, availableWidth) => {
    const characters = token.split("");
    let segment = "";
    let width = 0;

    for (const character of characters) {
      const characterWidth = measureText(character);
      if (segment && width + characterWidth > availableWidth) {
        break;
      }
      segment += character;
      width += characterWidth;
    }

    return {
       segment,
       width,
    };
  };

  const lines = [""];
  let currentWidth = 0;

  for (const token of tokens) {
    if (token === " ") {
      // Whitespace at the start of a line is dropped by browsers.
      if (currentWidth === 0) {
        continue;
      }
      lines[lines.length - 1] += token;
      currentWidth += measureText(token);
      continue;
    }

    let remaining = token;

    while (remaining) {
      const w = measureText(remaining);
      if (currentWidth + w <= maxWidth) {
        lines[lines.length - 1] += remaining;
        currentWidth += w;
        break;
      }

      if (currentWidth > 0) {
        lines.push("");
        currentWidth = 0;
        continue;
      }

      // An atom wider than the box wraps mid-glyph (overflow-wrap: anywhere).
      const { segment, width } = takeFittingSegment(remaining, maxWidth);
      lines[lines.length - 1] += segment;
      currentWidth = width;
      remaining = remaining.slice(segment.length);
    }
  }

  return lines.map((line) => line.replace(/[\t\n\r ]+$/, ""));
};

/**
 * Estimate how many lines a string will wrap to when laid out greedily at the
 * given font size inside a box of width `maxWidth`, capped at `maxLines`.
 *
 * @param {string} text Text to estimate.
 * @param {number} fontSize Font size in px (matches `measureText`).
 * @param {number} maxWidth Available wrap width in px.
 * @param {number} maxLines Cap on the returned line count.
 * @returns {number} Estimated line count, at least 1, at most `maxLines`.
 */
const countWrappedLines = (text, fontSize, maxWidth, maxLines) => {
  return Math.min(Math.max(1, splitWrappedText(text, fontSize, maxWidth).length), maxLines);
};

export {
  renderError,
  createLanguageNode,
  createProgressNode,
  iconWithLabel,
  flexLayout,
  measureText,
  splitWrappedText,
  countWrappedLines,
  wrappedTextNode,
  wrappedTextStyles,
};
