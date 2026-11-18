import { nextjsConfig } from "@asym/eslint-config/nextjs.mjs";
import { scopeWorkspaceConfig } from "@asym/eslint-config/workspace.mjs";
import { designSystemConfig } from "@asym/eslint-config/design-system.mjs";
import { ownApiConfig } from "@asym/eslint-config/own-api.mjs";
import { tenantNavigationConfig } from "@asym/eslint-config/tenant-navigation.mjs";

export default [
  ...scopeWorkspaceConfig(nextjsConfig, import.meta.url),
  // Page code calls the app's own API only through ownApiFetch (plan 5.2).
  ...scopeWorkspaceConfig(ownApiConfig, import.meta.url),
  ...designSystemConfig({ workspace: "apps/missionary" }),
  ...tenantNavigationConfig({ workspace: "apps/missionary" }),
];
