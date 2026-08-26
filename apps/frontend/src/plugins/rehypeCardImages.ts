import type { RehypePlugin } from "@astrojs/markdown-remark";

import { CATEGORY_BY_CARD_TYPE, CardType } from "../wizard/models/CardType";
import { getCardThemeDefault } from "../wizard/models/cardThemeDefault";

const CARD_ENDPOINT = "/api";

/** The card each endpoint renders; `/api` itself is the stats card. */
const CARD_TYPE_BY_PATH: Record<string, CardType> = {
  [CARD_ENDPOINT]: CardType.STATS,
  [`${CARD_ENDPOINT}/top-langs`]: CardType.TOP_LANGS,
  [`${CARD_ENDPOINT}/pin`]: CardType.PIN,
  [`${CARD_ENDPOINT}/gist`]: CardType.GIST,
  [`${CARD_ENDPOINT}/wakatime`]: CardType.WAKATIME,
};

/** An `<img>` for a card that does not already say how it loads. */
const RAW_CARD_IMAGE = /<img(?![^>]*\bloading=)(?=[^>]*\bsrc="\/api)/g;

/** Card URLs are root-relative, so `URL` needs a base it never reads. */
const RELATIVE_BASE = "https://cards.invalid";

/**
 * Defers every card image, and renders one that names no theme twice,
 * once per site theme — so a preview is a single line of markdown.
 */
export const rehypeCardImages: RehypePlugin = () => (tree) => {
  // Typed off the tree so the plugin needs no hast types of its own.
  function walk(children: typeof tree.children) {
    for (const [index, child] of children.entries()) {
      // `rehype-raw` runs after this plugin, so a card written as HTML is still text.
      if (child.type === "raw") {
        child.value = child.value.replaceAll(
          RAW_CARD_IMAGE,
          '<img loading="lazy" decoding="async"',
        );
        continue;
      }

      if (child.type !== "element") {
        continue;
      }

      if (child.tagName !== "img") {
        walk(child.children);
        continue;
      }

      const { properties } = child;
      const src = properties.src;
      if (typeof src !== "string" || !src.startsWith(CARD_ENDPOINT)) {
        continue;
      }

      properties.loading ??= "lazy";
      properties.decoding ??= "async";

      const { pathname, search, searchParams } = new URL(src, RELATIVE_BASE);
      const cardType = CARD_TYPE_BY_PATH[pathname];

      // A named theme is the point of the preview, so leave it as one image.
      if (cardType === undefined || searchParams.has("theme")) {
        continue;
      }

      const category = CATEGORY_BY_CARD_TYPE[cardType];

      // `styles/starlight-theme.css` hides the copy that does not match the
      // site theme; rename these classes in both places.
      const copy = (variant: "light" | "dark") => ({
        ...child,
        properties: {
          ...properties,
          // Appended, not re-serialized, so the rest of the query survives verbatim.
          src: `${src}${search === "" ? "?" : "&"}theme=${getCardThemeDefault(variant === "dark", category)}`,
          className: [
            variant === "dark" ? `card-preview-dark` : `card-preview-light`,
          ],
        },
      });

      // Both copies name a theme, so the one the iterator lands on next is skipped.
      children.splice(index, 1, copy("light"), copy("dark"));
    }
  }

  walk(tree.children);
};
