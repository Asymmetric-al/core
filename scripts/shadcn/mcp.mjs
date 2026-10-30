#!/usr/bin/env bun
// Project MCP launcher for the shadcn server, shared by Claude Code, Cursor and
// Codex. shadcn reads registries from process.cwd() (`mcp --cwd` only loads env
// files), so the server must start beside packages/ui/components.json.
// It runs the workspace-installed CLI pinned in the root package.json. Before
// `bun install` (fresh worktrees) it falls back to `bun x` with the same pin;
// npx cannot run here because the root `overrides` make it fail with EOVERRIDE.
// Registry credentials come from the inherited environment; the git-ignored
// root .env.local fills only missing components.json placeholders.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const UI_PACKAGE_DIR = path.join(REPO_ROOT, "packages/ui");
const INSTALLED_PACKAGE_DIR = path.join(REPO_ROOT, "node_modules/shadcn");

function readText(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch {
    return null;
  }
}

const SHADCN_VERSION = readJson(path.join(REPO_ROOT, "package.json"))
  .devDependencies.shadcn;

export const SHADCN_MCP_PACKAGE = `shadcn@${SHADCN_VERSION}`;

/** The installed CLI entry, only when it matches the pin and its bin exists. */
export function installedShadcnCli(packageDir = INSTALLED_PACKAGE_DIR) {
  const manifest = readJson(path.join(packageDir, "package.json"));
  const bin =
    typeof manifest?.bin === "string" ? manifest.bin : manifest?.bin?.shadcn;
  if (manifest?.version !== SHADCN_VERSION || typeof bin !== "string") {
    return null;
  }
  const entry = path.join(packageDir, bin);
  return existsSync(entry) ? entry : null;
}

/** The real environment wins; .env.local supplies only registry placeholders. */
export function registryEnvironment({
  env = process.env,
  envFile = readText(path.join(REPO_ROOT, ".env.local")),
  components = readText(path.join(UI_PACKAGE_DIR, "components.json")),
} = {}) {
  const fallback = envFile ? parseEnv(envFile) : {};
  const result = { ...env };
  for (const [, name] of (components ?? "").matchAll(
    /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
  )) {
    if (!result[name] && fallback[name]) result[name] = fallback[name];
  }
  return result;
}

/** Fallback uses `bun x`, never `bunx`: a resolved bunx.EXE runs as plain `bun`. */
export function shadcnMcpSpawnSpec({
  env = registryEnvironment(),
  execPath = process.execPath,
  versions = process.versions,
  installedCli = installedShadcnCli(),
} = {}) {
  const options = { cwd: UI_PACKAGE_DIR, env, shell: false, stdio: "inherit" };
  if (installedCli) {
    // The CLI's shebang is `node`; Core's engines require Node.
    return { command: "node", args: [installedCli, "mcp"], options };
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
