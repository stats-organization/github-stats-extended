import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import StringReplace from "vite-plugin-string-replace";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/frontend/",
  plugins: [
    StringReplace([
      {
        search: "process.env",
        replace: "window.process.env",
        fileName: ".*backend.*",
      },
    ]),
    nodePolyfills({
      include: [
        "path",
        "querystring",
        "url",
        "http",
        "util",
        "stream",
        "buffer",
      ],
      exclude: ["fs", "net"],
    }),

    react(),
    tailwindcss(),

    /**
     * mock pg (postgres) package in the browser to avoid runtime errors
     * @see apps/backend/src/common/database.js
     */
    {
      name: "empty-pg-package",
      resolveId(id) {
        if (id === "pg") {
          return id;
        }
        return undefined;
      },
      load(id) {
        if (id === "pg") {
          return "export class Pool { constructor(config) {} }";
        }
        return undefined;
      },
    },
  ],
  build: {
    outDir: "build",

    /** @todo use chunks to split bundle? */
    chunkSizeWarningLimit: 800,
  },
  resolve: {
    alias: [
      {
        find: "dotenv",
        replacement: path.resolve(
          import.meta.dirname,
          "src/dotenv-browser-stub.ts",
        ),
      },
      {
        find: "../src/fetchers/wakatime.js",
        replacement: path.resolve(
          import.meta.dirname,
          "src/wakatime-override.ts",
        ),
      },
    ],
  },
  test: {
    dir: "./src",
    exclude: ["**/backend/**"],
  },
});
