import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Fails CI when installed shadcn/ui components in packages/ui diverge from the
 * registry for the local components.json (same signal as `shadcn diff`).
 *
 * Run from repo root: `node scripts/verify/shadcn-diff.mjs`
 */
const root = fileURLToPath(new URL("../..", import.meta.url));
const uiDir = path.join(root, "packages", "ui");

const result = spawnSync("bunx", ["shadcn@latest", "diff"], {
  cwd: uiDir,
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(`[shadcn-diff] failed to spawn: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `[shadcn-diff] shadcn CLI exited ${result.status ?? "unknown"} — update components or refresh the registry.`,
  );
  process.exit(result.status ?? 1);
}

console.log("[shadcn-diff] OK (no component drift vs registry)");
