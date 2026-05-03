import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["@stats/source"],
  },
  test: {
    dir: "./tests/bench",
    environment: "jsdom",
    setupFiles: ["./tests/_setup.js"],
  },
});
