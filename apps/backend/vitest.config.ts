import { defineProject } from "vitest/config";

export default defineProject({
  resolve: {
    conditions: ["@stats/source"],
  },
  test: {
    environment: "jsdom",
    include: [
      "./tests/*.test.{ts,js}",
      "./tests/public-instance/*.test.{ts,js}",
    ],
    setupFiles: ["./tests/_setup.js"],
  },
});
