import nextVitals from "eslint-config-next/core-web-vitals";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "./base.mjs";

const nextVitalsWithoutTsPlugin = nextVitals.map((configEntry) => {
  if (!configEntry || typeof configEntry !== "object") {
    return configEntry;
  }

  if (!("plugins" in configEntry) || !configEntry.plugins) {
    return configEntry;
  }

  if (!("@typescript-eslint" in configEntry.plugins)) {
    return configEntry;
  }

  const remainingPlugins = { ...configEntry.plugins };
  delete remainingPlugins["@typescript-eslint"];

  return {
    ...configEntry,
    plugins: remainingPlugins,
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
