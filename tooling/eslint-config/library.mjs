import { baseConfig } from "./base.mjs";

export const libraryConfig = [
  ...baseConfig,
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
