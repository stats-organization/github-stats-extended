import type { RehypePlugin } from "@astrojs/markdown-remark";

import { CATEGORY_BY_CARD_TYPE, CardType } from "../wizard/models/CardType";
import { getCardThemeDefault } from "../wizard/models/cardThemeDefault";

/** The card each endpoint renders; `/api` itself is the stats card. */
const CARD_TYPE_BY_PATH: Record<string, CardType> = {
  "/api": CardType.STATS,
  "/api/top-langs": CardType.TOP_LANGS,
  "/api/pin": CardType.PIN,
  "/api/gist": CardType.GIST,
  "/api/wakatime": CardType.WAKATIME,
};

/** An `<img>` for a card that does not already say how it loads. */
const RAW_CARD_IMAGE = /<img(?![^>]*\bloading=)(?=[^>]*\bsrc="\/api)/g;

/* `styles/starlight-theme.css` styles them; keep the class names in sync with that file. */
const CARD_PREVIEW_LIGHT = "card-preview-light";
const CARD_PREVIEW_DARK = "card-preview-dark";

/** Card URLs are root-relative, so `URL` needs a base it never reads. */
const RELATIVE_BASE = "https://cards.invalid";

/**
 * Builds a card preview out of one line of markdown.
 *
 * A `/api` image that names no theme is rendered twice, once per site theme,
 * and `styles/starlight-theme.css` shows whichever copy matches.
 * Every card image loads lazily, so the hidden copy is never fetched,
 * and links to its own URL unless the markdown already points it somewhere better.
 */
export const rehypeCardImages: RehypePlugin = () => (tree) => {
  // Typed off the tree so the plugin needs no hast types of its own.
  type Node = (typeof tree.children)[number];
  type ElementNode = Extract<Node, { tagName: string }>;

  /** Opening a preview shows how the card is configured. */
  const linked = (
    image: ElementNode,
    className?: Array<string>,
  ): ElementNode => ({
    type: "element",
    tagName: "a",
    properties: { href: image.properties.src, className },
    children: [image],
  });

  /** Each image in the tree, with its siblings and whether the markdown linked it. */
  const images: Array<{
    image: ElementNode;
    siblings: Array<Node>;
    insideLink: boolean;
  }> = [];

  function collect(children: Array<Node>, insideLink: boolean) {
    for (const child of children) {
      // `rehype-raw` runs after this plugin, so a card written as HTML is still text.
      if (child.type === "raw") {
        child.value = child.value.replaceAll(
          RAW_CARD_IMAGE,
          '<img loading="lazy"',
        );
        continue;
      }

      if (child.type !== "element") {
        continue;
      }

      if (child.tagName === "img") {
        images.push({ image: child, siblings: children, insideLink });
        continue;
      }

      collect(child.children, insideLink || child.tagName === "a");
    }
  }

  // Collected before anything is rewritten, so a copy added below is never revisited.
  collect(tree.children, false);

  for (const { image, siblings, insideLink } of images) {
    const { properties } = image;
    const src = properties.src;
    if (typeof src !== "string") {
      continue;
    }

    const { pathname, search, searchParams } = new URL(src, RELATIVE_BASE);
    const cardType = CARD_TYPE_BY_PATH[pathname];
    if (cardType === undefined) {
      continue;
    }

    // A hidden copy has no layout box, so only the shown theme is fetched.
    properties.loading ??= "lazy";

    const index = siblings.indexOf(image);

    // A named theme is the point of the preview, so leave it as one image.
    if (
      searchParams.has("theme") ||
      searchParams.has("theme_light") ||
      searchParams.has("theme_dark")
    ) {
      if (!insideLink) {
        siblings.splice(index, 1, linked(image));
      }
      continue;
    }

    const category = CATEGORY_BY_CARD_TYPE[cardType];

    const themed = (variant: "light" | "dark") => {
      const className =
        variant === "dark" ? CARD_PREVIEW_DARK : CARD_PREVIEW_LIGHT;
      const copy = {
        ...image,
        properties: {
          ...properties,
          // Appended, not re-serialized, so the rest of the query survives verbatim.
          src: `${src}${search === "" ? "?" : "&"}theme=${getCardThemeDefault(variant === "dark", category)}`,
          className: [className],
        },
      };
      // The class goes on the link too, so a hidden copy leaves nothing focusable behind.
      return insideLink ? copy : linked(copy, [className]);
    };

    siblings.splice(index, 1, themed("light"), themed("dark"));
  }
};
