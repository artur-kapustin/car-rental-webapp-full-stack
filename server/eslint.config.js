import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },

  {
    rules: {
      "no-duplicate-imports": "warn",
      "no-unassigned-vars": "error",
      "no-useless-assignment": "error",
      "camelcase": "warn",
      "eqeqeq": "error",
      "no-console": "warn",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-var": "error",
      "prefer-const": "warn",
      "require-await": "error",
    },
  },
]);
