import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "./base.mjs";

export const libraryConfig = [
  ...baseConfig,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { "react-hooks": reactHooksPlugin },
    rules: { "react-hooks/rules-of-hooks": "error" },
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
];

export default libraryConfig;
