import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    environment: "jsdom",
    include: ["./tests/*.test.{ts,js}"],
  },
});
