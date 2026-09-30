import path from "node:path";
import { fileURLToPath } from "node:url";

/** Preserve a workspace config's relative globs and TS project root at any cwd. */
export function scopeWorkspaceConfig(config, configUrl) {
  const workspaceRoot = path.dirname(fileURLToPath(configUrl));
  return config.map((entry) => ({
    ...entry,
    basePath: entry.basePath
      ? path.resolve(workspaceRoot, entry.basePath)
      : workspaceRoot,
    ...(entry.languageOptions?.parserOptions
      ? {
          languageOptions: {
            ...entry.languageOptions,
            parserOptions: {
              ...entry.languageOptions.parserOptions,
              tsconfigRootDir: workspaceRoot,
            },
          },
        }
      : {}),
  }));
}
