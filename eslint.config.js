import { fileURLToPath } from "node:url";

import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { includeIgnoreFile } from "@eslint/compat";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  js.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      jsdoc,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-unexpected-multiline": "error",
      "accessor-pairs": [
        "error",
        {
          getWithoutSet: false,
          setWithoutGet: true,
        },
      ],
      "block-scoped-var": "warn",
      "consistent-return": "error",
      curly: "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-warning-comments": [
        "warn",
        {
          terms: ["TODO", "FIXME"],
          location: "start",
        },
      ],
      "no-with": "warn",
      radix: "warn",
      "no-delete-var": "error",
      "no-undef-init": "off",
      "no-undef": "error",
      "no-undefined": "off",
      "no-unused-vars": "warn",
      "no-use-before-define": "error",
      "constructor-super": "error",
      "no-class-assign": "error",
      "no-const-assign": "error",
      "no-dupe-class-members": "error",
      "no-this-before-super": "error",
      "object-shorthand": ["warn"],
      "no-mixed-spaces-and-tabs": "warn",
      "no-multiple-empty-lines": "warn",
      "no-negated-condition": "warn",
      "no-unneeded-ternary": "warn",
      "keyword-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-jsdoc": "warn",
    },
  },
  {
    files: ["apps/backend/**/*.{js}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["apps/frontend/**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/jsx-no-undef": "error",
      "react/jsx-uses-vars": "error",
      "react/no-array-index-key": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
