import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import { importX } from "eslint-plugin-import-x";
import { default as jsdoc } from "eslint-plugin-jsdoc";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { default as tseslint } from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  js.configs.recommended,

  {
    extends: [importX.flatConfigs.recommended, importX.flatConfigs.typescript],
    rules: {
      "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: false,
          },
          named: { enabled: true, export: false },
          "newlines-between": "always",
        },
      ],
    },
  },
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
    files: ["**/*.{d.ts,ts,tsx}"],
    ignores: ["apps/backend/**"],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylistic],
    rules: {
      "@typescript-eslint/array-type": ["error", { default: "generic" }],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: false,
          allowBoolean: true, // for query parameters
          allowNever: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
        },
      ],

      // We don't need this we have typescript
      "jsdoc/require-returns": "off",
      "jsdoc/require-returns-description": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-jsdoc": "off",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
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
    files: ["apps/frontend/**/*.{js,jsx,ts,tsx}"],
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
