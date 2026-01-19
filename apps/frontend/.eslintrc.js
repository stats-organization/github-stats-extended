module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'react/jsx-filename-extension': 'off',
    'react/forbid-prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'import/prefer-default-export': 'off',
    'react/function-component-definition': 'off',
    'react/no-unstable-nested-components': 'off',
    'no-console': 'off',
    radix: 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
  overrides: [
    {
      files: ['./src/backend/**/*'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
};
