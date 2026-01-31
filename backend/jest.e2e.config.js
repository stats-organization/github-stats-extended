export default {
  clearMocks: true,
  transform: {},
  testEnvironment: "node",
  coverageProvider: "v8",
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
  testRegex: "(\\.e2e)\\.(ts|tsx|js)$",
};
