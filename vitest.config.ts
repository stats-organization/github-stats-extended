import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    projects: ["apps/backend/vitest.config.ts", "apps/core/vitest.config.ts"],
  },
});
