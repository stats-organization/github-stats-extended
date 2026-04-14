import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["@stats/source"],
  },
  test: {
    environment: "node",
    dir: "tests/e2e",
  },
});
