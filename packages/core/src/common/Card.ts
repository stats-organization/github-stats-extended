import { getCardColors, isPrefixedHexColor, isValidGradient } from "./color.js";
import type { CardColors } from "./color.js";
import { encodeHTML } from "./html.js";
import { flexLayout } from "./render.js";

/**
 * Builds the card CSS for one color scheme from that scheme's resolved colors.
 */
type CardCSSBuilder = (colors: CardColors) => string;

class Card {
  width: number;
  height: number;
  hideBorder: boolean;
  hideTitle: boolean;
  border_radius: number;
  colors: { light: CardColors; dark: CardColors | null };
  title: string;
  css: string;
  darkCss: string;
  paddingX: number;
  paddingY: number;
  titlePrefixIcon: string | undefined;
  animations: boolean;
  a11yTitle: string;
  a11yDesc: string;

  /**
   * Creates a new card instance.
   *
   * The caller must ensure that the passed `titlePrefixIcon` is properly sanitized!
   *
   * @param props Card arguments.
   * @param props.width Card width.
   * @param props.height Card height.
   * @param props.border_radius Card border radius.
   * @param props.colors Card colors for light and dark mode.
   * @param props.colors.light Card colors for light mode.
   * @param props.colors.dark Card colors for dark mode, or `null` when no dark-mode override is needed.
   * @param props.customTitle Card custom title.
   * @param props.defaultTitle Card default title.
   * @param props.titlePrefixIcon Sanitized card title prefix icon.
   */
  constructor({
    width = 100,
    height = 100,
    border_radius = 4.5,
    colors = { light: getCardColors({}), dark: null },
    customTitle,
    defaultTitle = "",
    titlePrefixIcon,
  }: {
    width?: number;
    height?: number;
    // `| undefined`: card callers forward possibly-undefined query options
    border_radius?: number | undefined;
    colors?: { light: CardColors; dark: CardColors | null };
    customTitle?: string | undefined;
    defaultTitle?: string;
    titlePrefixIcon?: string;
  }) {
    this.width = width;
    this.height = height;

    this.hideBorder = false;
    this.hideTitle = false;

    this.border_radius = parseFloat(String(border_radius));

    this.colors = colors;
    this.title = customTitle === undefined ? defaultTitle : customTitle;

    this.css = "";
    this.darkCss = "";

    this.paddingX = 25;
    this.paddingY = 35;
    this.titlePrefixIcon = titlePrefixIcon;
    this.animations = true;
    this.a11yTitle = "";
    this.a11yDesc = "";
  }

  disableAnimations(): void {
    this.animations = false;
  }

  /**
   * @param props The props object.
   * @param props.title Accessibility title.
   * @param props.desc Accessibility description.
   */
  setAccessibilityLabel({
    title,
    desc,
  }: {
    title: string;
    desc: string;
  }): void {
    this.a11yTitle = title;
    this.a11yDesc = desc;
  }

  /**
   * Sets the card CSS for light and dark mode.
   *
   * Each builder receives the colors of its own color scheme,
   * so a card never handles a missing dark palette itself:
   * `dark` runs only when the card has dark colors, and always with non-null ones.
   *
   * @warning The caller must ensure that the returned CSS strings are properly sanitized!
   *
   * @param props The props object.
   * @param props.light Builds the CSS applied unconditionally (light/default mode).
   * @param props.dark Builds the CSS placed inside a `@media (prefers-color-scheme: dark)` block.
   */
  setCSS({
    light,
    dark,
  }: {
    light: CardCSSBuilder;
    dark: CardCSSBuilder;
  }): void {
    this.css = light(this.colors.light);
    this.darkCss = this.colors.dark ? dark(this.colors.dark) : "";
  }

  /**
   * @param value Whether to hide the border or not.
   */
  setHideBorder(value: boolean): void {
    this.hideBorder = value;
  }

  /**
   * @param value Whether to hide the title or not.
   */
  setHideTitle(value: boolean): void {
    if (value && !this.hideTitle) {
      this.height -= 30;
    }
    if (!value && this.hideTitle) {
      this.height += 30;
    }
    this.hideTitle = value;
  }

  /**
   * @param text The title to set.
   */
  setTitle(text: string): void {
    this.title = text;
  }

  /**
   * @returns The rendered card title.
   */
  renderTitle(): string {
    const titleText = `
      <text
        x="0"
        y="0"
        class="header"
        data-testid="header"
      >${encodeHTML(this.title)}</text>
    `;

    const prefixIcon = `
      <svg
        class="icon"
        x="0"
        y="-13"
        viewBox="0 0 16 16"
        version="1.1"
        width="16"
        height="16"
      >
        ${String(this.titlePrefixIcon)}
      </svg>
    `;
    return `
      <g
        data-testid="card-title"
        transform="translate(${this.paddingX}, ${this.paddingY})"
      >
        ${flexLayout({
          items: [this.titlePrefixIcon ? prefixIcon : "", titleText],
          gap: 25,
        }).join("")}
      </g>
    `;
  }

  /**
   * @returns The rendered card gradient.
   */
  renderGradient(): string {
    const buildGradientDef = (id: string, bgColor: Array<string>): string => {
      const gradients = bgColor.slice(1);
      return `
          <linearGradient
            id="${id}"
            gradientTransform="rotate(${String(bgColor[0])})"
            gradientUnits="userSpaceOnUse"
          >
            ${gradients
              .map((grad, index) => {
                const offset = (index * 100) / (gradients.length - 1);
                return `<stop offset="${offset}%" stop-color="#${grad}" />`;
              })
              .join(",")}
          </linearGradient>`;
    };

    if (
      typeof this.colors.light.bgColor === "object" &&
      !isValidGradient(this.colors.light.bgColor)
    ) {
      throw new Error(
        `Invalid gradient: ${this.colors.light.bgColor.join(",")}`,
      );
    }
    if (
      this.colors.dark &&
      typeof this.colors.dark.bgColor === "object" &&
      !isValidGradient(this.colors.dark.bgColor)
    ) {
      throw new Error(
        `Invalid dark gradient: ${this.colors.dark.bgColor.join(",")}`,
      );
    }

    return `
        <defs>
          ${typeof this.colors.light.bgColor === "object" ? buildGradientDef("gradient", this.colors.light.bgColor) : ""}
          ${this.colors.dark && typeof this.colors.dark.bgColor === "object" ? buildGradientDef("gradient-dark", this.colors.dark.bgColor) : ""}
        </defs>
        `;
  }

  /**
   * Retrieves css animations for a card.
   *
   * @returns Animation css.
   */
  getAnimations = (): string => {
    return `
      /* Animations */
      @keyframes scaleInAnimation {
        from {
          transform: translate(-5px, 5px) scale(0);
        }
        to {
          transform: translate(-5px, 5px) scale(1);
        }
      }
      @keyframes fadeInAnimation {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
  };

  /**
   * Builds the @media (prefers-color-scheme: dark) CSS block for the card.
   * Returns an empty string when no dark colors are set.
   */
  private renderDarkMediaBlock(): string {
    if (!this.colors.dark) {
      return "";
    }

    const bgFill =
      typeof this.colors.dark.bgColor === "object"
        ? "url(#gradient-dark)"
        : this.colors.dark.bgColor;

    return `
          @media (prefers-color-scheme: dark) {
            .header { fill: ${this.colors.dark.titleColor}; }
            .card-bg { fill: ${bgFill}; stroke: ${this.colors.dark.borderColor}; }
            ${this.darkCss}
          }`;
  }

  /**
   * The caller must ensure that the passed `body` string is properly sanitized!
   *
   * @param body The sanitized inner body of the card.
   * @returns The rendered card.
   */
  render(body: string): string {
    if (!Number.isFinite(this.border_radius)) {
      throw new Error(`Invalid border radius: "${this.border_radius}"`);
    }
    if (!isPrefixedHexColor(this.colors.light.titleColor)) {
      throw new Error(`Invalid title color: "${this.colors.light.titleColor}"`);
    }
    if (!isPrefixedHexColor(this.colors.light.borderColor)) {
      throw new Error(
        `Invalid border color: "${this.colors.light.borderColor}"`,
      );
    }
    if (
      !(typeof this.colors.light.bgColor === "object"
        ? isValidGradient(this.colors.light.bgColor)
        : isPrefixedHexColor(this.colors.light.bgColor))
    ) {
      throw new Error(
        `Invalid background color: ${String(this.colors.light.bgColor)}`,
      );
    }

    return `
      <svg
        width="${this.width}"
        height="${this.height}"
        viewBox="0 0 ${this.width} ${this.height}"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="descId"
      >
        <title id="titleId">${encodeHTML(this.a11yTitle)}</title>
        <desc id="descId">${encodeHTML(this.a11yDesc)}</desc>
        <style>
          .header {
            font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
            fill: ${this.colors.light.titleColor};
            animation: fadeInAnimation 0.8s ease-in-out forwards;
          }
          @supports(-moz-appearance: auto) {
            /* Selector detects Firefox */
            .header { font-size: 15.5px; }
          }
          ${this.css}
          ${this.renderDarkMediaBlock()}

          ${this.getAnimations()}
          ${
            this.animations
              ? ""
              : `* { animation-duration: 0s !important; animation-delay: 0s !important; }`
          }
        </style>

        ${this.renderGradient()}

        <rect
          data-testid="card-bg"
          class="card-bg"
          x="0.5"
          y="0.5"
          rx="${this.border_radius}"
          height="99%"
          stroke="${this.colors.light.borderColor}"
          width="${this.width - 1}"
          fill="${
            typeof this.colors.light.bgColor === "object"
              ? "url(#gradient)"
              : this.colors.light.bgColor
          }"
          stroke-opacity="${this.hideBorder ? 0 : 1}"
        />

        ${this.hideTitle ? "" : this.renderTitle()}

        <g
          data-testid="main-card-body"
          transform="translate(0, ${
            this.hideTitle ? this.paddingX : this.paddingY + 20
          })"
        >
          ${body}
        </g>
      </svg>
    `;
  }
}

export { Card };
export default Card;
