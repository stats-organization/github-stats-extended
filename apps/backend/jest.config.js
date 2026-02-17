export default {
  projects: [
    "<rootDir>/jest.public-instance.config.js",
    "<rootDir>/jest.private-instance.config.js",
  ],
  coverageProvider: "v8",
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.vercel/"],
};
