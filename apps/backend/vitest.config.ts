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
          setupFiles: ["./tests/setup.jest.js"],
        },
      },
      {
        test: {
          name: "backend/private-instance",
          environment: "jsdom",
          dir: "tests",
          include: ["./*.test.{ts,js}", "./private-instance/*.test.{ts,js}"],
          setupFiles: [
            "./tests/setup.jest.js",
            "./tests/setup.private-instance.jest.js",
          ],
        },
      },
    ],
  },
});
