import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "*.log",
      ".git/**",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
      "*.config.js",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      // TypeScript ESLint rules
      ...typescript.configs.recommended.rules,

      // Custom rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-var-requires": "error",

      // General ESLint rules
      "no-console": "off", // Allow console in Node.js environment
      "prefer-const": "error",
      "no-var": "error",
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
  {
    files: ["**/*.test.{ts,js}", "**/__tests__/**/*.{ts,js}"],
    rules: {
      // Allow console.log in tests
      "no-console": "off",
      // Allow any in tests for mocking
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Apply Prettier config to disable conflicting rules
  prettierConfig,
];
