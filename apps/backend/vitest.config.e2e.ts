import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "backend/public-instance",
    environment: "node",
    dir: "tests",
    include: ["e2e/*.test.{ts,js}"],
  },
});
