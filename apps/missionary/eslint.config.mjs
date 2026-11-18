import { nextjsConfig } from "@asym/eslint-config/nextjs.mjs";
import { scopeWorkspaceConfig } from "@asym/eslint-config/workspace.mjs";
import { designSystemConfig } from "@asym/eslint-config/design-system.mjs";
import { tenantNavigationConfig } from "@asym/eslint-config/tenant-navigation.mjs";

export default [
  ...scopeWorkspaceConfig(nextjsConfig, import.meta.url),
  ...designSystemConfig({ workspace: "apps/missionary" }),
  ...tenantNavigationConfig({ workspace: "apps/missionary" }),
];
