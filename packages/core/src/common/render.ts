import { getCardColors, isPrefixedHexColor } from "./color.js";
import { SECONDARY_ERROR_MESSAGES, TRY_AGAIN_LATER } from "./error.js";
import { encodeHTML } from "./html.js";
import { clampValue } from "./ops.js";

/**
 * Auto layout utility, allows us to layout things vertically or horizontally with
 * proper gaping.
 *
 * The caller must ensure that the passed `items` are properly sanitized!
 *
 * @param props Function properties.
 * @param props.items Array of sanitized items to layout.
 * @param props.gap Gap between items.
 * @param props.direction Direction to layout items.
 * @param props.sizes Array of sizes for each item.
 * @returns Array of items with proper layout.
 */
const flexLayout = ({
  items,
  gap,
  direction,
  sizes = [],
}: {
  items: Array<string>;
  gap: number;
  direction?: "column" | "row";
  sizes?: Array<number>;
}): Array<string> => {
  if (sizes.some((size) => !Number.isFinite(size))) {
    throw new Error("flexLayout: `sizes` must contain only numbers");
  }

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
 * @param langName Language name.
 * @param langColor Language color.
 * @returns Language display SVG object.
 */
const createLanguageNode = (langName: string, langColor: string): string => {
  if (!isPrefixedHexColor(langColor)) {
    throw new Error(`Invalid language color: "${langColor}"`);
  }

  return `
    <g data-testid="primary-lang">
      <circle data-testid="lang-color" cx="0" cy="-5" r="6" fill="${langColor}" />
      <text data-testid="lang-name" class="gray" x="15">${encodeHTML(langName)}</text>
    </g>
    `;
};

/**
 * Create a node to indicate progress in percentage along a horizontal line.
 *
 * @param params Object that contains the createProgressNode parameters.
 * @param params.x X-axis position.
 * @param params.y Y-axis position.
 * @param params.width Width of progress bar.
 * @param params.color Progress color.
 * @param params.progress Progress value.
 * @param params.progressBarBackgroundColor Progress bar bg color.
 * @param params.delay Delay before animation starts.
 * @returns Progress node.
 */
const createProgressNode = ({
  x,
  y,
  width,
  color,
  progress,
  progressBarBackgroundColor,
  delay,
}: {
  x: number;
  y: number;
  width: number;
  color: string;
  progress: number;
  progressBarBackgroundColor: string;
  delay: number;
}): string => {
  if (!isPrefixedHexColor(color)) {
    throw new Error(`Invalid progress color: "${color}"`);
  }
  if (!isPrefixedHexColor(progressBarBackgroundColor)) {
    throw new Error(
      `Invalid progress bar background color: "${progressBarBackgroundColor}"`,
    );
  }
  if (!Number.isFinite(width)) {
    throw new Error(`Invalid width: "${width}"`);
  }
  if (!Number.isFinite(x)) {
    throw new Error(`Invalid x: "${x}"`);
  }
  if (!Number.isFinite(y)) {
    throw new Error(`Invalid y: "${y}"`);
  }
  if (!Number.isFinite(delay)) {
    throw new Error(`Invalid delay: "${delay}"`);
  }

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
 * @param props Function properties.
 * @param props.text Text to render (will be HTML-encoded).
 * @param props.x X position of the foreignObject.
 * @param props.y Y position of the foreignObject.
 * @param props.width Width of the wrap box.
 * @param props.height Height of the wrap box.
 * @param props.lineCount Maximum number of lines to display.
 * @param props.className CSS class applied to the inner element.
 * @param props.testId Optional test id for the inner element.
 * @returns foreignObject SVG node.
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
}: {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lineCount: number;
  className: string;
  testId?: string;
}): string => {
  if (!Number.isFinite(x)) {
    throw new Error(`Invalid x: "${x}"`);
  }
  if (!Number.isFinite(y)) {
    throw new Error(`Invalid y: "${y}"`);
  }
  if (!Number.isFinite(width)) {
    throw new Error(`Invalid width: "${width}"`);
  }
  if (!Number.isFinite(height)) {
    throw new Error(`Invalid height: "${height}"`);
  }
  if (!Number.isFinite(lineCount)) {
    throw new Error(`Invalid lineCount: "${lineCount}"`);
  }

  const testIdAttr = testId ? ` data-testid="${encodeHTML(testId)}"` : "";
  return `
    <foreignObject x="${x}" y="${y}" width="${width}" height="${height}">
      <div xmlns="http://www.w3.org/1999/xhtml" class="${encodeHTML(className)}" style="--lines: ${lineCount};"${testIdAttr}>${encodeHTML(
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
 *
 * @param color Text color (CSS `color` property).
 * @returns CSS rules block (without the surrounding selector).
 */
const wrappedTextStyles = (color: string): string => {
  if (!isPrefixedHexColor(color)) {
    throw new Error(`Invalid text color: "${color}"`);
  }

  return `
      color: ${color};
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
      padding-bottom: 0.15em;
  `;
};

/**
 * Creates an icon with label to display repository/gist stats like forks, stars, etc.
 *
 * The caller must ensure that the passed `icon` is properly sanitized!
 *
 * @param icon The sanitized icon to display.
 * @param label The label to display.
 * @param testid The testid to assign to the label.
 * @param iconSize The size of the icon.
 * @returns Icon with label SVG object.
 */
const iconWithLabel = (
  icon: string,
  label: number | string,
  testid: string,
  iconSize: number,
): string => {
  if (typeof label === "number" && label <= 0) {
    return "";
  }

  if (!Number.isFinite(iconSize)) {
    throw new Error(`Invalid iconSize: "${iconSize}"`);
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
  const text = `<text data-testid="${encodeHTML(testid)}" class="gray">${encodeHTML(String(label))}</text>`;
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
 * @param args Function arguments.
 * @param args.message Main error message.
 * @param args.secondaryMessage The secondary error message.
 * @param args.renderOptions Render options.
 * @param args.renderOptions.title_color Card title color.
 * @param args.renderOptions.text_color Card text color.
 * @param args.renderOptions.bg_color Card background color.
 * @param args.renderOptions.border_color Card border color.
 * @param args.renderOptions.theme Card theme.
 * @param args.renderOptions.show_repo_link Whether to show repo link or not.
 * @returns The SVG markup.
 */
const renderError = ({
  message,
  secondaryMessage = "",
  renderOptions = {},
}: {
  message: string;
  secondaryMessage?: string;
  renderOptions?: {
    title_color?: string;
    text_color?: string;
    bg_color?: string;
    border_color?: string;
    theme?: string;
    show_repo_link?: boolean;
  };
}): string => {
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
    <svg width="${ERROR_CARD_LENGTH}"  height="120" viewBox="0 0 ${ERROR_CARD_LENGTH} 120" fill="${String(bgColor)}" xmlns="http://www.w3.org/2000/svg">
    <style>
    .text { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor} }
    .small { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
    .gray { fill: #858585 }
    </style>
    <rect x="0.5" y="0.5" width="${
      ERROR_CARD_LENGTH - 1
    }" height="99%" rx="4.5" fill="${String(bgColor)}" stroke="${borderColor}"/>
    <text x="25" y="45" class="text">Something went wrong!${
      UPSTREAM_API_ERRORS.includes(secondaryMessage) || !show_repo_link
        ? ""
        : " file an issue at https://tinyurl.com/github-stats"
    }</text>
    <text data-testid="message" x="25" y="55" class="text small">
      <tspan x="25" dy="18">${encodeHTML(message)}</tspan>
      <tspan x="25" dy="18" class="gray">${encodeHTML(secondaryMessage)}</tspan>
    </text>
    </svg>
  `;
};

/**
 * Retrieve text length based on Segoe UI font.
 *
 * @see https://stackoverflow.com/a/48172630/10629172
 * @param str String to measure.
 * @param fontSize Font size.
 * @returns Text length.
 */
const measureText = (str: string, fontSize = 10): number => {
  // prettier-ignore
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0.2733333110809326, 0.28499999046325686,
    0.39166667461395266, 0.5900000095367431, 0.5383333206176758,
    0.8183333396911621, 0.8, 0.22999999523162842, 0.30166666507720946,
    0.30166666507720946, 0.41666665077209475, 0.6833333492279052,
    0.21666667461395264, 0.4, 0.21666667461395264, 0.3900000095367432,
    0.5383333206176758, 0.5383333206176758, 0.5383333206176758,
    0.5383333206176758, 0.5383333206176758, 0.5383333206176758,
    0.5383333206176758, 0.5383333206176758, 0.5383333206176758,
    0.5383333206176758, 0.21666667461395264, 0.21666667461395264,
    0.6833333492279052, 0.6833333492279052, 0.6833333492279052,
    0.4483333110809326, 0.9550000190734863, 0.6449999809265137,
    0.5733333110809327, 0.6183333396911621, 0.7016666889190674,
    0.5066666603088379, 0.48833332061767576, 0.6866666793823242,
    0.7099999904632568, 0.26666667461395266, 0.35666666030883787,
    0.5800000190734863, 0.4699999809265137, 0.8983333587646485,
    0.7483333110809326, 0.753333330154419, 0.5599999904632569,
    0.753333330154419, 0.5983333110809326, 0.5316666603088379,
    0.5233333110809326, 0.6866666793823242, 0.621666669845581,
    0.9333333015441895, 0.5900000095367431, 0.553333330154419,
    0.5699999809265137, 0.30166666507720946, 0.37833333015441895,
    0.30166666507720946, 0.6833333492279052, 0.41500000953674315,
    0.26833333969116213, 0.5083333492279053, 0.5883333206176757,
    0.4616666793823242, 0.5883333206176757, 0.5233333110809326,
    0.3133333444595337, 0.5883333206176757, 0.5666666507720948,
    0.24166667461395264, 0.24166667461395264, 0.49666666984558105,
    0.24166667461395264, 0.8616666793823242, 0.5666666507720948,
    0.5866666793823242, 0.5883333206176757, 0.5883333206176757,
    0.3483333349227905, 0.425, 0.33833334445953367, 0.5666666507720948,
    0.4783333301544189, 0.7233333110809326, 0.45833334922790525,
    0.4833333492279053, 0.45166668891906736, 0.30166666507720946,
    0.24000000953674316, 0.30166666507720946, 0.6833333492279052,
  ];

  const avg = 0.5131403493881227;
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
          return widths[c.charCodeAt(0)] ?? avg;
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
 * @param text Text to split.
 * @param fontSize Font size in px (matches `measureText`).
 * @param maxWidth Available wrap width in px.
 * @returns Estimated wrapped lines.
 */
const splitWrappedText = (
  text: string,
  fontSize: number,
  maxWidth: number,
): Array<string> => {
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
  const normalizedText = text.replace(/[\t\n\r ]+/g, " ");
  const tokens = normalizedText.match(
    /\s|[\u3000-\u9FFF\uFF00-\uFFEF]|[^\s\u3000-\u9FFF\uFF00-\uFFEF]+/g,
  );
  if (!tokens) {
    return [];
  }

  const takeFittingSegment = (token: string, availableWidth: number) => {
    const characters = token.split("");
    let segment = "";
    let width = 0;

    for (const character of characters) {
      const characterWidth = measureText(character, fontSize);
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
      lines[lines.length - 1] = (lines[lines.length - 1] ?? "") + token;
      currentWidth += measureText(token, fontSize);
      continue;
    }

    let remaining = token;

    while (remaining) {
      const w = measureText(remaining, fontSize);
      if (currentWidth + w <= maxWidth) {
        lines[lines.length - 1] = (lines[lines.length - 1] ?? "") + remaining;
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
      lines[lines.length - 1] = (lines[lines.length - 1] ?? "") + segment;
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
 * @param text Text to estimate.
 * @param fontSize Font size in px (matches `measureText`).
 * @param maxWidth Available wrap width in px.
 * @param maxLines Cap on the returned line count.
 * @returns Estimated line count, at least 1, at most `maxLines`.
 */
const countWrappedLines = (
  text: string,
  fontSize: number,
  maxWidth: number,
  maxLines: number,
): number => {
  return Math.min(
    Math.max(1, splitWrappedText(text, fontSize, maxWidth).length),
    maxLines,
  );
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
