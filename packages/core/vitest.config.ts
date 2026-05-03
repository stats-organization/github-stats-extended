import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    environment: "jsdom",
    include: ["./tests/*.test.{ts,js}"],
    setupFiles: ["./tests/_setup.js"],
  },
});
