export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "jsdom",
  testMatch: [
    "<rootDir>/tests/*.test.{ts,js}",
    "<rootDir>/tests/private-instance/*.test.{ts,js}",
  ],
  setupFiles: [
    "<rootDir>/tests/setup.jest.js",
    "<rootDir>/tests/setup.private-instance.jest.js",
  ],
};
