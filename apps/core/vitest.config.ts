import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    environment: "jsdom",
    dir: "tests",
    include: ["./*.test.{ts,js}"],
    setupFiles: ["./tests/_setup.js"],
  },
});
