import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./tests/bench",
    environment: "jsdom",
    setupFiles: ["./tests/_setup.js"],
  },
});
