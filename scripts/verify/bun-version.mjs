#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const packageJsonPath = path.join(repoRoot, "package.json");

function candidateBunPaths() {
  const candidates = process.env.BUN_BINARY ? [process.env.BUN_BINARY] : [];
  candidates.push("bun");
  const executableNames =
    process.platform === "win32" ? ["bun.exe", "bun.cmd", "bun"] : ["bun"];
  const candidateDirs = [
    process.env.BUN_INSTALL ? path.join(process.env.BUN_INSTALL, "bin") : null,
    path.join(homedir(), ".bun", "bin"),
    ...(process.env.PATH ?? "").split(path.delimiter),
  ].filter(Boolean);

  for (const dir of candidateDirs) {
    for (const executableName of executableNames) {
      candidates.push(path.join(dir, executableName));
    }
  }

  return [...new Set(candidates)];
}

function readExpectedVersion() {
  if (!existsSync(packageJsonPath)) {
    throw new Error(`missing root package.json at ${packageJsonPath}`);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const packageManager = packageJson.packageManager;

  if (!packageManager || typeof packageManager !== "string") {
    throw new Error("package.json is missing packageManager");
  }

  const match = packageManager.match(/^bun@(.+)$/);

  if (!match) {
    throw new Error(
      `packageManager must look like bun@<version>, got: ${packageManager}`,
    );
  }

  return match[1].replace(/^v/, "");
}

function readInstalledVersion() {
  for (const candidate of candidateBunPaths()) {
    const result = spawnSync(candidate, ["--version"], {
      encoding: "utf8",
      shell: process.platform === "win32" && candidate.endsWith(".cmd"),
      stdio: ["ignore", "pipe", "ignore"],
    });

    if (result.status === 0) {
      return result.stdout.trim().replace(/^v/, "");
    }
  }

  return null;
}

function main() {
  let expected;

  try {
    expected = readExpectedVersion();
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(2);
  }

  const installed = readInstalledVersion();

  if (!installed) {
    console.error("error: bun is not installed or not on PATH.");
    console.error("Install Bun from https://bun.sh/docs/installation");
    process.exit(1);
  }

  if (installed !== expected) {
    console.error("error: Bun version mismatch.");
    console.error(`  expected (package.json packageManager): bun@${expected}`);
    console.error(`  installed (bun --version):              bun@${installed}`);
    console.error("");
    console.error("Upgrade Bun to match the repo pin, for example:");
    console.error("  curl -fsSL https://bun.sh/install | bash");
    console.error("  # or: bun upgrade");
    process.exit(1);
  }

  console.log(`Bun version OK: bun@${installed}`);
}

main();
