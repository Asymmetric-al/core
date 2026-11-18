import { libraryConfig } from "@asym/eslint-config/library.mjs";
import { tenantNavigationConfig } from "@asym/eslint-config/tenant-navigation.mjs";

export { libraryConfig };

export default [
  ...libraryConfig,
  ...tenantNavigationConfig({ workspace: "packages/auth" }),
];
