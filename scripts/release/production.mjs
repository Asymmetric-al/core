#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { APPS, resolveBuildDecision } from "../vercel/should-ignore-build.mjs";

const TARGET_BRANCH = "epic";
const STAGING_BRANCH = "develop";
const DEFAULT_REMOTE = "origin";
const RELEASE_PUSH_ENV = "ASYM_RELEASE_PRODUCTION_PUSH";
const RELEASE_REASON_ENV = "ASYM_RELEASE_PRODUCTION_REASON";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: options.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    env: options.env ?? process.env,
  });

  if (result.error) {
    throw new Error(
      `${command} ${args.join(" ")} failed: ${result.error.message}`,
    );
  }

  if (result.status !== 0) {
    const detail =
      result.stderr?.trim() || result.stdout?.trim() || result.status;
    throw new Error(`${command} ${args.join(" ")} failed: ${detail}`);
  }

  return result.stdout?.trimEnd() ?? "";
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    remote: DEFAULT_REMOTE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--remote") {
      args.remote = argv.at(index + 1) ?? args.remote;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/release/production.mjs [options]

Runs the hard-gated production release path for Asymmetric.al.

Options:
  --dry-run          Run every gate and print the push that would happen
  --remote <name>    Git remote to push to. Default: ${DEFAULT_REMOTE}
  -h, --help         Show this help
`);
}

function readCurrentBranch() {
  return run("git", ["branch", "--show-current"]);
}

function readCurrentCommit() {
  return run("git", ["rev-parse", "HEAD"]);
}

function assertCleanWorktree() {
  const status = run("git", ["status", "--porcelain"]);
  if (status.length > 0) {
    throw new Error(
      "production release requires a clean worktree; commit or stash local changes first",
    );
  }
}

function assertReleaseSourceBranch(branch) {
  if (branch === TARGET_BRANCH || branch === STAGING_BRANCH) return;

  throw new Error(
    `production release must run from ${STAGING_BRANCH} or ${TARGET_BRANCH}; current branch is ${branch}`,
  );
}

function readChangedFiles(remote) {
  run("git", ["fetch", remote, TARGET_BRANCH], { inherit: true });
  const targetRef = `${remote}/${TARGET_BRANCH}`;
  const changed = run("git", [
    "diff",
    "--name-only",
    `${targetRef}...HEAD`,
    "--",
  ]);
  return changed.split(/\r?\n/).filter(Boolean);
}

export function summarizeDeploymentImpact(changedFiles) {
  const apps = Object.keys(APPS);
  return apps.map((app) => {
    const decision = resolveBuildDecision({ app, changedFiles });
    return {
      app,
      build: decision.build,
      reason: decision.reason,
      matchedFile: decision.matchedFile,
    };
  });
}

function formatImpactSummary(impact) {
  return impact
    .map((item) => {
      const verb = item.build ? "build" : "skip";
      const suffix = item.matchedFile ? ` (${item.matchedFile})` : "";
      return `- ${item.app}: ${verb} - ${item.reason}${suffix}`;
    })
    .join("\n");
}

function runGate(label, command, args, options = {}) {
  console.log(`==> ${label}`);
  run(command, args, { inherit: true, ...options });
}

function pushProduction({ remote, commit, dryRun }) {
  const releaseReason = `release ${commit.slice(0, 12)} to ${TARGET_BRANCH}`;
  const pushArgs = ["push", remote, `HEAD:${TARGET_BRANCH}`];

  if (dryRun) {
    console.log(`==> dry run: git ${pushArgs.join(" ")}`);
    return;
  }

  console.log(
    `==> pushing ${commit.slice(0, 12)} to ${remote}/${TARGET_BRANCH}`,
  );
  run("git", pushArgs, {
    inherit: true,
    env: {
      ...process.env,
      [RELEASE_PUSH_ENV]: "1",
      [RELEASE_REASON_ENV]: releaseReason,
    },
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const branch = readCurrentBranch();
  const commit = readCurrentCommit();

  assertReleaseSourceBranch(branch);
  assertCleanWorktree();

  runGate("verify deployment discipline", "bun", [
    "run",
    "verify:deployment-discipline",
  ]);
  runGate("verify git attribution", "bun", ["run", "verify:git-attribution"]);
  runGate("run CI preflight", "bun", ["run", "ci:preflight"]);

  const changedFiles = readChangedFiles(args.remote);
  const impact = summarizeDeploymentImpact(changedFiles);

  console.log("");
  console.log("# Production Release Summary");
  console.log("");
  console.log(`Source branch: ${branch}`);
  console.log(`Target branch: ${TARGET_BRANCH}`);
  console.log(`Commit: ${commit}`);
  console.log(
    `Changed files since ${args.remote}/${TARGET_BRANCH}: ${changedFiles.length}`,
  );
  console.log("");
  console.log(formatImpactSummary(impact));
  console.log("");

  pushProduction({ remote: args.remote, commit, dryRun: args.dryRun });

  console.log("");
  console.log("Next verification:");
  console.log(`- bun run verify:vercel-production -- --commit ${commit}`);
  console.log("- monitor Vercel deployments for admin, donor, and missionary");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(`release:production failed: ${error.message}`);
    process.exitCode = 1;
  });
}
