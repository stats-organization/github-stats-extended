import { encodeHTML } from "./html.js";
import { flexLayout } from "./render.js";

interface CardColors {
  /** Card title color. */
  titleColor?: string;
  /** Card text color. */
  textColor?: string;
  /** Card icon color. */
  iconColor?: string;
  /** Card background color. */
  bgColor?: string | Array<string>;
  /** Card border color. */
  borderColor?: string;
}

class Card {
  width: number;
  height: number;
  hideBorder: boolean;
  hideTitle: boolean;
  border_radius: number;
  colors: CardColors;
  title: string;
  css: string;
  paddingX: number;
  paddingY: number;
  titlePrefixIcon: string | undefined;
  animations: boolean;
  a11yTitle: string;
  a11yDesc: string;

  /**
   * Creates a new card instance.
   *
   * @param props Card arguments.
   * @param props.width Card width.
   * @param props.height Card height.
   * @param props.border_radius Card border radius.
   * @param props.colors Card colors arguments.
   * @param props.customTitle Card custom title.
   * @param props.defaultTitle Card default title.
   * @param props.titlePrefixIcon Card title prefix icon.
   */
  constructor({
    width = 100,
    height = 100,
    border_radius = 4.5,
    colors = {},
    customTitle,
    defaultTitle = "",
    titlePrefixIcon,
  }: {
    width?: number;
    height?: number;
    border_radius?: number;
    colors?: CardColors;
    customTitle?: string;
    defaultTitle?: string;
    titlePrefixIcon?: string;
  }) {
    this.width = width;
    this.height = height;

    this.hideBorder = false;
    this.hideTitle = false;

    this.border_radius = border_radius;

    // returns theme based colors with proper overrides and defaults
    this.colors = colors;
    this.title = encodeHTML(
      customTitle === undefined ? defaultTitle : customTitle,
    );

    this.css = "";

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
   * @param value The CSS to add to the card.
   */
  setCSS(value: string): void {
    this.css = value;
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
    this.hideTitle = value;
    if (value) {
      this.height -= 30;
    }
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
      >${this.title}</text>
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
    if (typeof this.colors.bgColor !== "object") {
      return "";
    }

    const gradients = this.colors.bgColor.slice(1);
    return typeof this.colors.bgColor === "object"
      ? `
        <defs>
          <linearGradient
            id="gradient"
            gradientTransform="rotate(${String(this.colors.bgColor[0])})"
            gradientUnits="userSpaceOnUse"
          >
            ${gradients
              .map((grad, index) => {
                const offset = (index * 100) / (gradients.length - 1);
                return `<stop offset="${offset}%" stop-color="#${grad}" />`;
              })
              .join(",")}
          </linearGradient>
        </defs>
        `
      : "";
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
   * @param body The inner body of the card.
   * @returns The rendered card.
   */
  render(body: string): string {
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
        <title id="titleId">${this.a11yTitle}</title>
        <desc id="descId">${this.a11yDesc}</desc>
        <style>
          .header {
            font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
            fill: ${String(this.colors.titleColor)};
            animation: fadeInAnimation 0.8s ease-in-out forwards;
          }
          @supports(-moz-appearance: auto) {
            /* Selector detects Firefox */
            .header { font-size: 15.5px; }
          }
          ${this.css}

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
          x="0.5"
          y="0.5"
          rx="${this.border_radius}"
          height="99%"
          stroke="${String(this.colors.borderColor)}"
          width="${this.width - 1}"
          fill="${
            typeof this.colors.bgColor === "object"
              ? "url(#gradient)"
              : String(this.colors.bgColor)
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
