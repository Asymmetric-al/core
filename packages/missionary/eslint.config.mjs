import { libraryConfig } from "@asym/eslint-config/library.mjs";

const missionaryConfig = [
  ...libraryConfig,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      // TODO(T10-missionary-eslint-migration): Re-enable these strict rules after missionary package cleanup.
      "import-x/order": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
];

export { libraryConfig, missionaryConfig };

export default missionaryConfig;
