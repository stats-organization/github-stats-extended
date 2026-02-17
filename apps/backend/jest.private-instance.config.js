export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "jsdom",
  testMatch: [
    "<rootDir>/tests/*.test.{ts,tsx,js}",
    "<rootDir>/tests/private-instance/*.test.{ts,tsx,js}",
  ],
  setupFiles: [
    "<rootDir>/tests/setup.jest.js",
    "<rootDir>/tests/setup.private-instance.jest.js",
  ],
};
