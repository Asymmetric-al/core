import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const TS_FILES = ["**/*.{ts,tsx,mts,cts}"];
const JS_FILES = ["**/*.{js,jsx,mjs,cjs}"];
const REACT_FILES = ["**/*.{js,jsx,ts,tsx}"];
const NEXT_APP_FILES = ["apps/**/*.{js,jsx,ts,tsx,mjs,mts,cts}"];

const nextBase = nextVitals.find((config) => config.name === "next");
const nextTypeScript = nextVitals.find(
  (config) => config.name === "next/typescript",
);
const nextCoreWebVitals = nextVitals.find(
  (config) => config.name === "next/core-web-vitals",
);

const tsEslintRecommended = tseslint.configs.recommended.find(
  (config) => config.name === "typescript-eslint/eslint-recommended",
);

if (!nextBase || !nextTypeScript || !nextCoreWebVitals) {
  throw new Error("Failed to load Next.js ESLint flat config presets.");
}
if (!tsEslintRecommended) {
  throw new Error("Failed to load TypeScript-ESLint flat config presets.");
}

const nextBaseWithoutReactHooks = {
  ...nextBase,
  plugins: { ...nextBase.plugins },
};
delete nextBaseWithoutReactHooks.plugins["react-hooks"];

export default defineConfig([
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "**/coverage/**",
    "**/node_modules/**",
    "next-env.d.ts",
    "eslint.config.mjs",
  ]),

  // JS baseline (don't apply these core rules to TS/TSX).
  { ...js.configs.recommended, files: JS_FILES },

  // Provide react-hooks rule definitions everywhere (packages include eslint-disable directives).
  { files: REACT_FILES, plugins: { "react-hooks": reactHooks } },

  // TS parsing + plugin wiring (safe across the monorepo).
  nextTypeScript,

  // TS core-rule shims (disable rules that conflict with TypeScript).
  { ...tsEslintRecommended, files: TS_FILES },

  // Next.js rules should apply only to actual Next apps (avoid package lint errors).
  { ...nextBaseWithoutReactHooks, files: NEXT_APP_FILES },
  { ...nextCoreWebVitals, files: NEXT_APP_FILES },
]);
