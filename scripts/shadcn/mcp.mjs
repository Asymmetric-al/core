#!/usr/bin/env bun
// Project MCP launcher for the shadcn server, shared by Claude Code, Cursor and
// Codex. shadcn 4.22.1 reads registries from process.cwd() (`mcp --cwd` only
// loads env files), so the server must start beside packages/ui/components.json.
// npx cannot run here: the root `overrides` make it fail with EOVERRIDE.
// Registry credentials arrive through the inherited environment; Bun's .env
// loading keeps a git-ignored root .env.local as the fallback.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SHADCN_MCP_PACKAGE = "shadcn@4.22.1";

const UI_PACKAGE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../packages/ui",
);

/** Uses `bun x`, never `bunx`: a resolved bunx.EXE runs as plain `bun`. */
export function shadcnMcpSpawnSpec({
  env = process.env,
  execPath = process.execPath,
  versions = process.versions,
} = {}) {
  return {
    command: versions.bun ? execPath : "bun",
    args: ["x", SHADCN_MCP_PACKAGE, "mcp"],
    options: { cwd: UI_PACKAGE_DIR, env, shell: false, stdio: "inherit" },
  };
}

function main() {
  const { command, args, options } = shadcnMcpSpawnSpec();
  const child = spawn(command, args, options);
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", (error) => {
    console.error(`[shadcn-mcp] ${error.message}`);
    process.exit(1);
  });
  child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main();
