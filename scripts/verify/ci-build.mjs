#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const TURBO_BIN = resolveTurboBin();

const NEXT_APPS = Object.freeze([
  {
    id: "admin",
    filter: "@asym/admin",
    nextDir: "apps/admin/.next",
  },
  {
    id: "donor",
    filter: "@asym/donor",
    nextDir: "apps/donor/.next",
  },
  {
    id: "missionary",
    filter: "@asym/missionary-app",
    nextDir: "apps/missionary/.next",
  },
]);

const NEXT_APP_FILTERS = Object.freeze([
  "--filter=!@asym/admin",
  "--filter=!@asym/donor",
  "--filter=!@asym/missionary-app",
]);

function resolveTurboBin() {
  const binDir = path.join(REPO_ROOT, "node_modules", ".bin");
  const candidates =
    process.platform === "win32"
      ? ["turbo.exe", "turbo.cmd", "turbo"]
      : ["turbo"];

  for (const candidate of candidates) {
    const absolutePath = path.join(binDir, candidate);
    if (existsSync(absolutePath)) {
      return absolutePath;
    }
  }

  return path.join(binDir, candidates.at(-1));
}

function run(command, args, label) {
  console.log(`==> CI build: ${label}`);
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`==> FAIL ${label} (${result.error.message})`);
    process.exit(result.status ?? 1);
  }

  if (result.status !== 0) {
    console.error(`==> FAIL ${label} (exit ${result.status ?? "unknown"})`);
    process.exit(result.status ?? 1);
  }

  console.log(`==> PASS ${label}`);
}

function isNextBuildRunning() {
  const result = spawnSync("ps", ["-axo", "command="], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) return false;

  return result.stdout
    .split(/\r?\n/)
    .some((line) => /\bnext build\b/.test(line));
}

function waitForNextBuildsToExit() {
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (!isNextBuildRunning()) return true;
    spawnSync("sleep", ["1"], { stdio: "ignore" });
  }

  return !isNextBuildRunning();
}

function findNextLockFiles() {
  const lockFiles = [];

  for (const app of NEXT_APPS) {
    const nextDir = path.join(REPO_ROOT, app.nextDir);
    if (!existsSync(nextDir)) continue;

    collectLockFiles(nextDir, lockFiles);
  }

  return lockFiles;
}

function collectLockFiles(directory, lockFiles) {
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectLockFiles(entryPath, lockFiles);
    } else if (entry.isFile() && entry.name === "lock") {
      lockFiles.push(entryPath);
    }
  }
}

function clearStaleNextLocks() {
  const lockFiles = findNextLockFiles();
  if (lockFiles.length === 0) return;

  if (isNextBuildRunning()) {
    console.log("Waiting for active Next build process to release locks...");
  }

  if (!waitForNextBuildsToExit()) {
    console.error("Next build lock files are present while next build runs:");
    for (const lockFile of lockFiles) {
      console.error(`- ${path.relative(REPO_ROOT, lockFile)}`);
    }
    process.exit(1);
  }

  for (const lockFile of lockFiles) {
    rmSync(lockFile, { force: true });
    console.log(
      `Removed stale Next build lock: ${path.relative(REPO_ROOT, lockFile)}`,
    );
  }
}

clearStaleNextLocks();
run(
  "node",
  [
    "scripts/run-with-ci-env.mjs",
    "--",
    TURBO_BIN,
    "run",
    "build",
    ...NEXT_APP_FILTERS,
    "--concurrency=1",
  ],
  "shared packages",
);

for (const app of NEXT_APPS) {
  clearStaleNextLocks();
  run(
    "node",
    [
      "scripts/run-with-ci-env.mjs",
      "--",
      TURBO_BIN,
      "run",
      "build",
      `--filter=${app.filter}`,
      "--concurrency=1",
    ],
    app.id,
  );
  clearStaleNextLocks();
}

console.log("==> PASS ci-build");
