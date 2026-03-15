import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/frontend/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "build",
    sourcemap: true,

    /** @todo use chunks to split bundle? */
    chunkSizeWarningLimit: 800,
  },
  resolve: {
    alias: [
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
