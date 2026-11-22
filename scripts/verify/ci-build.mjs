#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { repairWorkspaceLinks } from "../repair-workspace-links.mjs";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const TURBO_BIN = resolveTurboBin();

export const NEXT_APPS = Object.freeze([
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
  // Private VM 100 operator Console: built only on request
  // (`--app factory-console`), never by the product `bun run build`. See
  // OPERATOR_BUILD_APPS in ./ci-build-policy.mjs.
  {
    id: "factory-console",
    filter: "@asym/factory-console",
    cwd: "apps/factory-console",
    nextDir: "apps/factory-console/.next",
    defaultBuild: false,
  },
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
  // Web dependency compilation is not authorization to provision Eve sandboxes.
  const env = { CORE_EVE_BUILD_MODE: "artifacts" };
  if (strict) {
    return { label, command, args, env };
  }

  return { ...createRunWithCiEnvStep(label, command, args), env };
}

export function getSharedPackageBuildSteps({
  platform = process.platform,
  strict = false,
  turboBin = TURBO_BIN,
  apps = getRequestedApps(),
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

  // `<pkg>^...` is Turbo's "dependencies of <pkg>, not <pkg> itself". Scoping to
  // the requested apps keeps a single-app deploy off unrelated workspaces:
  // Vercel runs `bun run build:donor`, and "everything except the three apps"
  // pulled in @asym/eve-runtime (admin-only, `eve build`, requires Node >= 24)
  // and @asym/missionary. Building all three apps still resolves to the same
  // set, so `bun run build` is unchanged.
  const dependencyFilters = apps.map((app) => `--filter=${app.filter}^...`);

  return [
    createBuildStep(
      "shared packages",
      turboBin,
      ["run", "build", ...dependencyFilters, "--concurrency=1"],
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
    return apps.filter((app) => app.defaultBuild !== false);
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

/**
 * A failure-only rebuild with `next build --debug-prerender` (server source
 * maps, every failing route reported). Never used for the normal build:
 * Vercel runs the same `bun run build:<app>`, and Next.js says a debug
 * prerender build must not be deployed.
 */
export function getDebugPrerenderStep(app) {
  return createBuildStep(`${app.id} (debug prerender)`, "bun", [
    "run",
    "--cwd",
    app.cwd,
    "build",
    "--",
    "--debug-prerender",
  ]);
}

const FAILED_APPS_FILE = "ci-build-failed-apps";

/** Where a failed app build is recorded: GitHub Actions only, never Vercel. */
export function failedAppsRecordPath(env = process.env) {
  if (env.GITHUB_ACTIONS !== "true" || env.VERCEL || !env.RUNNER_TEMP)
    return null;
  return path.join(env.RUNNER_TEMP, FAILED_APPS_FILE);
}

function recordFailedApp(app, env = process.env) {
  const file = failedAppsRecordPath(env);
  if (!file) return;
  try {
    appendFileSync(file, `${app.id}\n`);
  } catch (error) {
    console.error(
      `Could not record the failed ${app.id} build: ${error.message}`,
    );
  }
}

/** The debug rebuilds a failure-only CI step should run, with the reason. */
export function planDebugPrerender({
  env = process.env,
  read = (file) => readFileSync(file, "utf8"),
} = {}) {
  const file = failedAppsRecordPath(env);
  if (!file)
    return {
      steps: [],
      reason:
        "debug prerender rebuilds run only in GitHub Actions, never on Vercel",
    };
  let text;
  try {
    text = read(file);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    text = "";
  }
  const ids = new Set(text.split(/\r?\n/).map((line) => line.trim()));
  const apps = NEXT_APPS.filter((app) => ids.has(app.id));
  if (apps.length === 0)
    return {
      steps: [],
      reason:
        "no app build failed (the failure came earlier); nothing to rebuild",
    };
  return {
    steps: apps.map(getDebugPrerenderStep),
    reason: `rebuilding ${apps.map((app) => app.id).join(", ")} with --debug-prerender`,
  };
}

function run(command, args, label, environment, onFailure = () => {}) {
  console.log(`==> CI build: ${label}`);
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: { ...process.env, ...environment },
  });

  if (result.error) {
    console.error(`==> FAIL ${label} (${result.error.message})`);
    onFailure();
    process.exit(result.status ?? 1);
  }

  if (result.status !== 0) {
    console.error(`==> FAIL ${label} (exit ${result.status ?? "unknown"})`);
    onFailure();
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

/**
 * Build lock files under each app's `.next`. `.next/dev` belongs to a
 * running `next dev`: Next.js holds its lock as an operating-system lock that
 * is released when the process dies, so it is never stale and never removed.
 */
export function findStaleNextLockFiles(root = REPO_ROOT, apps = NEXT_APPS) {
  const lockFiles = [];

  for (const app of apps) {
    const nextDir = path.join(root, app.nextDir);
    if (!existsSync(nextDir)) continue;

    collectLockFiles(nextDir, lockFiles, path.join(nextDir, "dev"));
  }

  return lockFiles;
}

function collectLockFiles(directory, lockFiles, devDirectory) {
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entryPath === devDirectory) continue;
      collectLockFiles(entryPath, lockFiles, devDirectory);
    } else if (entry.isFile() && entry.name === "lock") {
      lockFiles.push(entryPath);
    }
  }
}

function clearStaleNextLocks() {
  const lockFiles = findStaleNextLockFiles();
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

  for (const step of getSharedPackageBuildSteps({
    strict,
    apps: requestedApps,
  })) {
    clearStaleNextLocks();
    run(step.command, step.args, step.label, step.env);
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
    run(step.command, step.args, step.label, step.env, () =>
      recordFailedApp(app),
    );
    clearStaleNextLocks();
  }

  console.log("==> PASS ci-build");
}

/** CI `if: failure()` step: rebuild each recorded failed app for diagnostics. */
function debugPrerender() {
  const plan = planDebugPrerender();
  console.log(`==> CI build diagnostics: ${plan.reason}`);
  for (const step of plan.steps) {
    console.log(`==> CI build: ${step.label}`);
    spawnSync(step.command, step.args, {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: { ...process.env, ...step.env },
    });
  }
  // Diagnostics only: the build job has already failed.
  return 0;
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  if (process.argv.includes("--debug-prerender"))
    process.exit(debugPrerender());
  main();
}
