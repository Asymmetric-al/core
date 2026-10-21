import path from "node:path";
import { fileURLToPath } from "node:url";

/** Preserve workspace globs, Next app discovery and the TS project root at any cwd. */
export function scopeWorkspaceConfig(config, configUrl) {
  const workspaceRoot = path.dirname(fileURLToPath(configUrl));
  return config.map((entry) => ({
    ...entry,
    ...(entry.plugins?.["@next/next"]
      ? {
          settings: {
            ...entry.settings,
            next: {
              ...entry.settings?.next,
              rootDir: entry.settings?.next?.rootDir ?? workspaceRoot,
            },
          },
        }
      : {}),
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
