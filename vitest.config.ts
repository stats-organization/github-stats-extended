import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/core/vitest.config.ts",
      "apps/backend/vitest.config.ts",
      "apps/frontend/vitest.config.ts",
      "apps/isr-proxy/vitest.config.ts",
    ],
  },
});
