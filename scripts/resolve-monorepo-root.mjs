import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function isWorkspaceRoot(directory) {
  if (!fs.existsSync(path.join(directory, "turbo.json"))) return false;
  try {
    const { workspaces } = JSON.parse(
      fs.readFileSync(path.join(directory, "package.json"), "utf8"),
    );
    return (
      Array.isArray(workspaces) &&
      workspaces.length > 0 &&
      workspaces.every(
        (workspace) =>
          typeof workspace === "string" && workspace.trim().length > 0,
      )
    );
  } catch {
    return false;
  }
}

/**
 * Find the repo root (Turbo configuration plus a workspace package manifest).
 * Next may bundle `next.config` under `.next/`; `import.meta.url`-relative `../..`
 * then misses monorepo `.env.local`. Walking upward from cwd + config dir fixes it.
 *
 * @param {string | URL} importMetaUrl `import.meta.url` from the app's `next.config`
 * @returns {string} Absolute filesystem path to monorepo root
 */
export function resolveMonorepoRoot(importMetaUrl) {
  const fromConfigDir = fileURLToPath(new URL(".", importMetaUrl));
  const seeds = [
    process.cwd(),
    fromConfigDir,
    path.resolve(fromConfigDir, ".."),
  ];

  for (const seed of seeds) {
    let dir = path.resolve(seed);
    for (let depth = 0; depth < 12; depth += 1) {
      if (isWorkspaceRoot(dir)) {
        return dir;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  return path.resolve(fromConfigDir, "../..");
}
