export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  testRegex: "\\.(public-instance|test)\\.(ts|tsx|js)$",
  setupFiles: ["<rootDir>/tests/setup.jest.js"],
};
