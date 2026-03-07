#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const MANAGED_WORKFLOWS = [
  "propose",
  "explore",
  "new",
  "continue",
  "ff",
  "apply",
  "verify",
  "sync",
  "archive",
];

const MANAGED_GLOBAL_CONFIG = {
  profile: "custom",
  delivery: "both",
  workflows: MANAGED_WORKFLOWS,
  featureFlags: {},
};

const MUTATING_CONFIG_COMMANDS = new Set([
  "set",
  "unset",
  "reset",
  "edit",
  "profile",
]);

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function getRuntimeRoot() {
  const repoHash = createHash("sha1").update(repoRoot).digest("hex").slice(0, 12);
  return path.join(os.tmpdir(), `openspec-${repoHash}`);
}

function writeManagedGlobalConfig(configHome) {
  const configDir = path.join(configHome, "openspec");
  ensureDir(configDir);
  writeFileSync(
    path.join(configDir, "config.json"),
    `${JSON.stringify(MANAGED_GLOBAL_CONFIG, null, 2)}\n`,
    "utf8",
  );
}

function resolveOpenSpecBin() {
  const moduleEntryPath = require.resolve("@fission-ai/openspec", {
    paths: [repoRoot],
  });

  return path.join(path.dirname(moduleEntryPath), "..", "bin", "openspec.js");
}

function maybeBlockConfigMutation(args) {
  if (args[0] !== "config") {
    return;
  }

  const subcommand = args[1];
  if (!MUTATING_CONFIG_COMMANDS.has(subcommand)) {
    return;
  }

  console.error(
    [
      "This repository manages OpenSpec workflow selection through",
      "`scripts/openspec-cli.mjs` for deterministic team behavior.",
      "Edit that script if you need to change the managed OPSX workflow set,",
      "then rerun `bun run openspec:update`.",
    ].join(" "),
  );
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);

  maybeBlockConfigMutation(args);

  const runtimeRoot = getRuntimeRoot();
  const xdgConfigHome = path.join(runtimeRoot, "config");
  const xdgDataHome = path.join(runtimeRoot, "data");

  ensureDir(xdgConfigHome);
  ensureDir(xdgDataHome);
  writeManagedGlobalConfig(xdgConfigHome);

  const openspecBin = resolveOpenSpecBin();
  const result = spawnSync(process.execPath, [openspecBin, ...args], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      OPENSPEC_TELEMETRY: process.env.OPENSPEC_TELEMETRY || "0",
      XDG_CONFIG_HOME: xdgConfigHome,
      XDG_DATA_HOME: xdgDataHome,
    },
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 0);
}

main();
