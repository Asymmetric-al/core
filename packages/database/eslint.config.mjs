import { libraryConfig } from "@asym/eslint-config/library.mjs";
import { ownApiConfig } from "@asym/eslint-config/own-api.mjs";

export { libraryConfig };

export default [
  ...libraryConfig,
  // Page code calls the app's own API only through ownApiFetch (plan 5.2).
  ...ownApiConfig,
];
