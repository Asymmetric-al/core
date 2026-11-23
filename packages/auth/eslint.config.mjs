import { libraryConfig } from "@asym/eslint-config/library.mjs";
import { ownApiConfig } from "@asym/eslint-config/own-api.mjs";
import { tenantNavigationConfig } from "@asym/eslint-config/tenant-navigation.mjs";

export { libraryConfig };

export default [
  ...libraryConfig,
  ...ownApiConfig,
  ...tenantNavigationConfig({ workspace: "packages/auth" }),
];
