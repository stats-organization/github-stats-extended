export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  testMatch: ["<rootDir>/tests/bench/*.bench.{ts,js}"],
  setupFiles: ["<rootDir>/tests/setup.jest.js"],
};
