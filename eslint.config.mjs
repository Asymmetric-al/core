import { defineConfig } from "eslint/config";
import core from "ultracite/eslint/core";
import next from "ultracite/eslint/next";
import react from "ultracite/eslint/react";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "**/.next/**",
      "dist/**",
      "**/dist/**",
      "build/**",
      "**/build/**",
      "out/**",
      "**/out/**",
      "coverage/**",
      "**/coverage/**",
      ".turbo/**",
      "**/.turbo/**",
      ".agent/**",
      ".agents/**",
      ".cursor/skills/**",
      ".next-docs/**",
      "skills/**",
    ],
  },
  {
    extends: [core, react],
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        project: null,
        projectService: true,
      },
    },
  },
  {
    files: ["apps/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    extends: [next],
    settings: {
      next: {
        rootDir: ["apps/*/"],
      },
    },
  },
]);
