import { libraryConfig } from "@asym/eslint-config/library.mjs";
import { scopeWorkspaceConfig } from "@asym/eslint-config/workspace.mjs";
import { designSystemConfig } from "@asym/eslint-config/design-system.mjs";
import { ownApiConfig } from "@asym/eslint-config/own-api.mjs";
import { tenantNavigationConfig } from "@asym/eslint-config/tenant-navigation.mjs";

export { libraryConfig };

export default [
  ...scopeWorkspaceConfig(libraryConfig, import.meta.url),
  // Page code calls the app's own API only through ownApiFetch (plan 5.2).
  ...scopeWorkspaceConfig(ownApiConfig, import.meta.url),
  ...designSystemConfig({ workspace: "packages/ui" }),
  ...tenantNavigationConfig({ workspace: "packages/ui" }),
];
