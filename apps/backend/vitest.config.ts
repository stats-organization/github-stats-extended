import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    projects: [
      {
        test: {
          name: "backend/public-instance",
          environment: "jsdom",
          dir: "tests",
          include: ["./*.test.{ts,js}", "./public-instance/*.test.{ts,js}"],
          setupFiles: ["./tests/_setup.js"],
        },
      },
      {
        test: {
          name: "backend/private-instance",
          environment: "jsdom",
          dir: "tests",
          include: ["./*.test.{ts,js}", "./private-instance/*.test.{ts,js}"],
          setupFiles: [
            "./tests/_setup.js",
            "./tests/_setup.private-instance.js",
          ],
        },
      },
    ],
  },
});
