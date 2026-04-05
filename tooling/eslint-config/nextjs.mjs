import nextVitals from "eslint-config-next/core-web-vitals";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "./base.mjs";

const nextVitalsWithoutTsPlugin = nextVitals.map((entry) => {
  if (!("plugins" in entry) || !entry.plugins?.["@typescript-eslint"]) {
    return entry;
  }

  const plugins = Object.fromEntries(
    Object.entries(entry.plugins).filter(
      ([pluginName]) => pluginName !== "@typescript-eslint",
    ),
  );
  return {
    ...entry,
    plugins,
  };
});

export const nextjsConfig = [
  ...baseConfig,
  ...nextVitalsWithoutTsPlugin,
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
