import path from "node:path";

import { designSystemConfig } from "@asym/eslint-config/design-system.mjs";
import { nextjsConfig } from "@asym/eslint-config/nextjs.mjs";
import { scopeWorkspaceConfig } from "@asym/eslint-config/workspace.mjs";

export default [
  ...scopeWorkspaceConfig(nextjsConfig, import.meta.url),
  ...designSystemConfig({
    workspace: "apps/factory-console",
    rootDir: path.resolve(import.meta.dirname, "../.."),
  }),
];
