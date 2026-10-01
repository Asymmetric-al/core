import { nextjsConfig } from "@asym/eslint-config/nextjs.mjs";
import { scopeWorkspaceConfig } from "@asym/eslint-config/workspace.mjs";
import { designSystemConfig } from "@asym/eslint-config/design-system.mjs";

export default [
  ...scopeWorkspaceConfig(nextjsConfig, import.meta.url),
  ...designSystemConfig({ workspace: "apps/admin" }),
];
