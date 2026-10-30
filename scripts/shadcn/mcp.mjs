#!/usr/bin/env bun
// Project MCP launcher for the shadcn server, shared by Claude Code, Cursor and
// Codex. shadcn reads registries from process.cwd() (`mcp --cwd` only loads env
// files), so the server must start beside packages/ui/components.json.
// It runs the workspace-installed CLI pinned in the root package.json. Before
// `bun install` (fresh worktrees) it falls back to `bun x` with the same pin;
// npx cannot run here because the root `overrides` make it fail with EOVERRIDE.
// Registry credentials arrive through the inherited environment; Bun's .env
// loading keeps a git-ignored root .env.local as the fallback.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const UI_PACKAGE_DIR = path.join(REPO_ROOT, "packages/ui");
const INSTALLED_PACKAGE_DIR = path.join(REPO_ROOT, "node_modules/shadcn");

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const SHADCN_VERSION = readJson(path.join(REPO_ROOT, "package.json"))
  .devDependencies.shadcn;

export const SHADCN_MCP_PACKAGE = `shadcn@${SHADCN_VERSION}`;

/** Fallback uses `bun x`, never `bunx`: a resolved bunx.EXE runs as plain `bun`. */
export function shadcnMcpSpawnSpec({
  env = process.env,
  execPath = process.execPath,
  versions = process.versions,
  installedVersion = readJson(path.join(INSTALLED_PACKAGE_DIR, "package.json"))
    ?.version ?? null,
} = {}) {
  const options = { cwd: UI_PACKAGE_DIR, env, shell: false, stdio: "inherit" };
  if (installedVersion === SHADCN_VERSION) {
    // The CLI's shebang is `node`; Core's engines require Node.
    return {
      command: "node",
      args: [path.join(INSTALLED_PACKAGE_DIR, "dist/index.js"), "mcp"],
      options,
    };
  }
  return {
    command: versions.bun ? execPath : "bun",
    args: ["x", SHADCN_MCP_PACKAGE, "mcp"],
    options,
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
