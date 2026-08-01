#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { repairWorkspaceLinks } from "../repair-workspace-links.mjs";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const TURBO_BIN = resolveTurboBin();

const NEXT_APPS = Object.freeze([
  {
    id: "admin",
    filter: "@asym/admin",
    cwd: "apps/admin",
    nextDir: "apps/admin/.next",
  },
  {
    id: "donor",
    filter: "@asym/donor",
    cwd: "apps/donor",
    nextDir: "apps/donor/.next",
  },
  {
    id: "missionary",
    filter: "@asym/missionary-app",
    cwd: "apps/missionary",
    nextDir: "apps/missionary/.next",
  },
]);

const NEXT_APP_FILTERS = Object.freeze([
  "--filter=!@asym/admin",
  "--filter=!@asym/donor",
  "--filter=!@asym/missionary-app",
]);

const SHARED_PACKAGES = Object.freeze([
  { id: "api", cwd: "packages/api" },
  { id: "auth", cwd: "packages/auth" },
  { id: "config", cwd: "packages/config" },
  { id: "database", cwd: "packages/database" },
  { id: "email", cwd: "packages/email" },
  { id: "env", cwd: "packages/env" },
  { id: "graphql", cwd: "packages/graphql" },
  { id: "lib", cwd: "packages/lib" },
  { id: "missionary", cwd: "packages/missionary" },
  { id: "ui", cwd: "packages/ui" },
]);

export function resolveTurboBin({
  platform = process.platform,
  exists = existsSync,
} = {}) {
  const binDir = path.join(REPO_ROOT, "node_modules", ".bin");
  const candidates =
    platform === "win32" ? ["turbo.exe", "turbo.cmd", "turbo"] : ["turbo"];

  for (const candidate of candidates) {
    const absolutePath = path.join(binDir, candidate);
    if (exists(absolutePath)) {
      return absolutePath;
    }
  }

  return path.join(binDir, candidates.at(-1));
}

export function getProcessListCommand(platform = process.platform) {
  if (platform === "win32") {
    return {
      command: "powershell",
      args: [
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Process | Select-Object -ExpandProperty CommandLine",
      ],
    };
  }

  return { command: "ps", args: ["-axo", "command="] };
}

export function getSleepCommand(seconds, platform = process.platform) {
  if (platform === "win32") {
    return {
      command: "powershell",
      args: [
        "-NoProfile",
        "-Command",
        `Start-Sleep -Seconds ${Math.max(1, Math.ceil(seconds))}`,
      ],
    };
  }

  return { command: "sleep", args: [String(seconds)] };
}

function createRunWithCiEnvStep(label, command, args) {
  return {
    label,
    command: "node",
    args: ["scripts/run-with-ci-env.mjs", "--", command, ...args],
  };
}

function createBuildStep(label, command, args, { strict = false } = {}) {
  if (strict) {
    return { label, command, args };
  }

  return createRunWithCiEnvStep(label, command, args);
}

export function getSharedPackageBuildSteps({
  platform = process.platform,
  strict = false,
  turboBin = TURBO_BIN,
} = {}) {
  if (platform === "win32") {
    return SHARED_PACKAGES.map((workspace) =>
      createBuildStep(
        workspace.id,
        "bun",
        ["run", "--cwd", workspace.cwd, "build"],
        { strict },
      ),
    );
  }

  return [
    createBuildStep(
      "shared packages",
      turboBin,
      ["run", "build", ...NEXT_APP_FILTERS, "--concurrency=1"],
      { strict },
    ),
  ];
}

export function getAppBuildStep(
  app,
  { platform = process.platform, strict = false, turboBin = TURBO_BIN } = {},
) {
  if (platform === "win32") {
    return createBuildStep(app.id, "bun", ["run", "--cwd", app.cwd, "build"], {
      strict,
    });
  }

  return createBuildStep(
    app.id,
    turboBin,
    ["run", "build", `--filter=${app.filter}`, "--concurrency=1"],
    { strict },
  );
}

export function getRequestedApps(args = [], apps = NEXT_APPS) {
  const appFlagIndex = args.indexOf("--app");
  if (appFlagIndex === -1) {
    return apps;
  }

  const requestedId = args.at(appFlagIndex + 1);
  if (!requestedId) {
    throw new Error("Missing app id after --app.");
  }

  const requestedApp = apps.find((app) => app.id === requestedId);
  if (!requestedApp) {
    const validIds = apps.map((app) => app.id).join(", ");
    throw new Error(
      `Unknown app "${requestedId}". Expected one of: ${validIds}.`,
    );
  }

  return [requestedApp];
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

function sleepSeconds(seconds) {
  const sleepCommand = getSleepCommand(seconds);
  spawnSync(sleepCommand.command, sleepCommand.args, { stdio: "ignore" });
}

function isNextBuildRunning() {
  const processListCommand = getProcessListCommand();
  const result = spawnSync(
    processListCommand.command,
    processListCommand.args,
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  if (result.status !== 0) return false;

  return result.stdout
    .split(/\r?\n/)
    .some((line) => /\bnext build\b/i.test(line));
}

function waitForNextBuildsToExit() {
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (!isNextBuildRunning()) return true;
    sleepSeconds(1);
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

/** Heal hollow workspace links (Bun isolated-linker corruption) before builds. */
function repairAndLogWorkspaceLinks() {
  const { repaired } = repairWorkspaceLinks(REPO_ROOT);
  for (const entry of repaired) {
    console.log(`[repair-workspace-links] restored ${entry}`);
  }
}

function main(args = process.argv.slice(2)) {
  const strict = args.includes("--strict");
  let requestedApps;
  try {
    requestedApps = getRequestedApps(args);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  repairAndLogWorkspaceLinks();

  for (const step of getSharedPackageBuildSteps({ strict })) {
    clearStaleNextLocks();
    run(step.command, step.args, step.label);
    clearStaleNextLocks();
  }

  for (const app of requestedApps) {
    const step = getAppBuildStep(app, { strict });
    // Repeated per app on purpose, not a duplicate of the call at CI entry: a
    // turbo cache hit during an earlier app's build can restore tsbuildinfo
    // files over a workspace junction and re-hollow it mid-pipeline. See
    // scripts/repair-workspace-links.mjs.
    repairAndLogWorkspaceLinks();
    clearStaleNextLocks();
    run(step.command, step.args, step.label);
    clearStaleNextLocks();
  }

  console.log("==> PASS ci-build");
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  main();
}
