import { libraryConfig } from "@asym/eslint-config/library.mjs";
import { scopeWorkspaceConfig } from "@asym/eslint-config/workspace.mjs";
import { designSystemConfig } from "@asym/eslint-config/design-system.mjs";
import { tenantNavigationConfig } from "@asym/eslint-config/tenant-navigation.mjs";

export { libraryConfig };

export default [
  ...scopeWorkspaceConfig(libraryConfig, import.meta.url),
  ...designSystemConfig({ workspace: "packages/ui" }),
  ...tenantNavigationConfig({ workspace: "packages/ui" }),
];
