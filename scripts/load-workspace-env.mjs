import { createRequire } from "node:module";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env");

export function loadWorkspaceEnvironment(workspaceRoot) {
  // Next loads the app directory first. Refresh that cache from the workspace
  // while preserving variables supplied by the calling process.
  return loadEnvConfig(
    workspaceRoot,
    process.env.NODE_ENV !== "production",
    undefined,
    true,
  );
}
