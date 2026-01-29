import path from "node:path";

import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/frontend/",
  plugins: [
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

    // mock pg (postgres) package in the browser to avoid runtime errors
    {
      name: "empty-pg-package",
      resolveId(id) {
        if (id === "pg") return id;
      },
      load(id) {
        if (id === "pg") return "export default {}";
      },
    },
  ],
  build: {
    outDir: "build",

    /** @todo use chunks to split bundle? */
    chunkSizeWarningLimit: 800,
  },
  define: {
    // Prevent Vite from injecting process.env like Webpack DefinePlugin
    "process.env": {},
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
});
