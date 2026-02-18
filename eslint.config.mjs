import { defineConfig } from "eslint/config";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "@asym/eslint-config/base.mjs";

const eslintConfig = defineConfig([
  // Root fallback/orchestrator config.
  // Individual apps/packages should define local eslint.config.mjs files.
  ...baseConfig,
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    ignores: ["out/**", "**/out/**", "next-env.d.ts"],
  },
]);

export default eslintConfig;
