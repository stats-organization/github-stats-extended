import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./tests/bench",
    include: ["*.bench.{ts,js}"],
    environment: "jsdom",
    setupFiles: ["./tests/setup.jest.js"],
  },
});
