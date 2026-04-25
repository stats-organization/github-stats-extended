import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineProject } from "vitest/config";

// https://vitejs.dev/config/
export default defineProject({
  base: "/frontend/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "build",
    sourcemap: true,

    /** @todo use chunks to split bundle? */
    chunkSizeWarningLimit: 800,

    rolldownOptions: {
      external: ["pg"],
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
