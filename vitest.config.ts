import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    projects: [
      "packages/core/vitest.config.ts",
      "apps/backend/vitest.config.ts",
      "apps/frontend/vite.config.ts",
    ],
  },
});
