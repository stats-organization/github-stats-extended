export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "jsdom",
  testMatch: [
    "<rootDir>/tests/*.test.{ts,js}",
    "<rootDir>/tests/public-instance/*.test.{ts,js}",
  ],
  setupFiles: ["<rootDir>/tests/setup.jest.js"],
};
