import js from "@eslint/js";

export default [
  {
    ignores: ["coverage/", "dist/", "node_modules/"]
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        URL: "readonly",
        document: "readonly",
        setTimeout: "readonly",
        fetch: "readonly",
        localStorage: "readonly"
      }
    },
    rules: {
      "no-console": "error"
    }
  }
];
