import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    projects: [
      {
        test: {
          environment: "jsdom",
          dir: "tests",
          include: ["./*.test.{ts,js}", "./public-instance/*.test.{ts,js}"],
          setupFiles: ["./tests/_setup.js"],
        },
      },
    ],
  },
});
