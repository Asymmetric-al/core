import nextVitals from "eslint-config-next/core-web-vitals";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "./base.mjs";

export const nextjsConfig = [
  ...baseConfig,
  ...nextVitals,
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
];

export default nextjsConfig;
