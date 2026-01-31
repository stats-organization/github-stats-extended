export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  setupFiles: [
    "<rootDir>/tests/setup.jest.js",
    "<rootDir>/tests/setup.private-instance.jest.js",
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  testRegex: "\\.(private-instance|test)\\.(ts|tsx|js)$",
};
