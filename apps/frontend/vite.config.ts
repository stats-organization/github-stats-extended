import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { default as MarkdownIt } from "markdown-it";
import { default as anchor } from "markdown-it-anchor";
import { default as githubAlerts } from "markdown-it-github-alerts";
import { Mode, plugin as markdown } from "vite-plugin-markdown";
import { defineProject } from "vitest/config";

import { slugify } from "./src/docs/slugify";

/**
 * `html: true` keeps
 * - the raw `<picture>` elements the sources use for theme-aware card samples
 * - the alerts plugin renders GitHub's
 *   `> [!NOTE]` blockquotes the same way github.com does.
 *
 * Heading ids and their permalinks are done here rather than in
 * `transformDocHtml`, because headings are plain markdown and markdown-it
 * already has them as tokens. The rest of the rewriting stays at runtime: it
 * has to reach inside raw HTML blocks, which markdown-it passes through
 * untouched, and it resolves local images to hashed Vite asset URLs, which are
 * only known to the bundler.
 */
const markdownIt = MarkdownIt({ html: true })
  .use(githubAlerts)
  .use(anchor, {
    // The page title is the whole document, so it needs no link of its own.
    level: [2, 3, 4],
    slugify,
    permalink: anchor.permalink.linkInsideHeader({
      class: "heading-anchor",
      symbol: "#",
      placement: "after",
      // `docs.css` owns the gap.
      space: false,
      // The link is decorative next to its heading text, but it is still a
      // real tab stop, so it gets a label rather than being hidden.
      ariaHidden: false,
      renderAttrs: (slug) => ({ "aria-label": `Link to ${slug}` }),
    }),
  });

// https://vitejs.dev/config/
export default defineProject({
  base: "/frontend/",
  plugins: [
    react(),
    tailwindcss(),
    // Compiles the documentation markdown to HTML at build time, so no markdown
    // parser is shipped to the browser.
    markdown({ mode: [Mode.HTML], markdownIt }),
  ],
  build: {
    outDir: "build",
    sourcemap: true,

    /** @todo use chunks to split bundle? */
    chunkSizeWarningLimit: 800,

    rolldownOptions: {
      external: ["pg"],

      onwarn(warning, defaultHandler) {
        /**
         * `vite-plugin-markdown` transforms each documentation file without emitting a sourcemap,
         * so every one of them raises `SOURCEMAP_BROKEN`.
         * @see https://github.com/hmsk/vite-plugin-markdown/issues/474
         * Reported upstream, closed without a fix and not re-opened after a later report.
         * The compiled output is markup rather than code,
         * so there is nothing to map back to and the warning carries no information.
         */
        if (
          warning.code === "SOURCEMAP_BROKEN" &&
          warning.plugin === "vite-plugin-markdown"
        ) {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
  resolve: {
    conditions: ["@stats/source"],
    alias: [
      {
        find: "../fetchers/wakatime.js",
        replacement: path.resolve(
          import.meta.dirname,
          "src/wakatime-override.ts",
        ),
      },
    ],
  },
  test: {
    dir: path.join(import.meta.dirname, "./src"),
  },
});
