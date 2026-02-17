export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  testMatch: [
    "<rootDir>/tests/*.test.{ts,tsx,js}",
    "<rootDir>/tests/private-instance/*.test.{ts,tsx,js}",
  ],
  setupFiles: [
    "<rootDir>/tests/setup.jest.js",
    "<rootDir>/tests/setup.private-instance.jest.js",
  ],
};
