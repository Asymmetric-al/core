#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const BUILD_APPS = Object.freeze(["admin", "donor", "missionary"]);
const BUILD_CONFIG =
  /(?:^|\/)(?:package\.json|vercel\.json|tsconfig(?:\.[^/]+)?\.json|(?:next|postcss|tailwind|vite)\.config\.[cm]?[jt]s)$/;
const SHARED_INPUTS = new Set([
  "bun.lock",
  "bun.lockb",
  "package.json",
  "turbo.json",
  "bunfig.toml",
  ".bun-version",
  ".node-version",
  ".nvmrc",
  ".npmrc",
  ".vercelignore",
]);

export function resolveCompilation({
  event,
  branch,
  baseBranch,
  changedFiles,
  full = false,
}) {
  if (
    full ||
    branch === "production" ||
    baseBranch === "production" ||
    event === "workflow_dispatch"
  )
    return [...BUILD_APPS];
  if (event === "push" && branch === "develop") return [];
  if (
    event !== "pull_request" ||
    baseBranch !== "develop" ||
    !Array.isArray(changedFiles)
  )
    return [...BUILD_APPS];

  const apps = new Set();
  for (const file of changedFiles) {
    const app = /^apps\/(admin|donor|missionary)\//.exec(file)?.[1];
    const shared =
      SHARED_INPUTS.has(file) ||
      (!app && BUILD_CONFIG.test(file)) ||
      /^scripts\/(?:vercel\/|verify\/ci-build|repair-workspace-links\.mjs|dedupe-tanstack-db\.mjs|resolve-monorepo-root\.mjs)/.test(
        file,
      ) ||
      /^\.github\/workflows\/(?:ci|ci-integration|qa-smoke-preview-deploy)\.yml$/.test(
        file,
      );
    if (shared) return [...BUILD_APPS];
    if (app && BUILD_CONFIG.test(file)) apps.add(app);
  }
  return BUILD_APPS.filter((app) => apps.has(app));
}

export function readCompilationChanges({
  base = "origin/develop",
  head = "HEAD",
  includeWorkingTree = false,
} = {}) {
  try {
    const git = (args) =>
      execFileSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    const changes = [
      git(["diff", "--no-renames", "--name-only", `${base}...${head}`, "--"]),
    ];
    if (includeWorkingTree) {
      changes.push(git(["diff", "--no-renames", "--name-only", "HEAD", "--"]));
      changes.push(git(["ls-files", "--others", "--exclude-standard"]));
    }
    return [
      ...new Set(
        changes.flatMap((text) => text.split(/\r?\n/)).filter(Boolean),
      ),
    ];
  } catch {
    return null;
  }
}

export function validateCiGate({ results, buildRequested }) {
  if (
    !["plan", "format", "integrity", "lint", "typecheck", "unit"].every(
      (key) => results[key] === "success",
    )
  )
    return false;
  return (
    results.build === "success" ||
    (buildRequested === false && results.build === "skipped")
  );
}

function main() {
  if (process.argv.includes("--build")) {
    const apps = JSON.parse(process.env.CI_BUILD_APPS ?? "[]");
    if (
      !Array.isArray(apps) ||
      apps.length === 0 ||
      apps.some((app) => !BUILD_APPS.includes(app))
    )
      throw new Error("Invalid compilation app selection");
    for (const app of apps) {
      const result = spawnSync("bun", ["run", `build:${app}`], {
        stdio: "inherit",
        shell: false,
      });
      if (result.error || result.status !== 0) return result.status ?? 1;
    }
    return 0;
  }
  if (process.argv.includes("--gate")) {
    const results = JSON.parse(process.env.CI_RESULTS ?? "{}");
    const buildRequested = process.env.CI_BUILD_REQUESTED !== "false";
    console.log(
      `CI results: ${JSON.stringify(results)}; compilation requested: ${buildRequested}`,
    );
    return validateCiGate({ results, buildRequested }) ? 0 : 1;
  }
  const event = process.env.GITHUB_EVENT_NAME;
  const base = process.env.CI_BASE_SHA;
  const head = process.env.CI_HEAD_SHA;
  const validDiff =
    /^[0-9a-f]{40}$/.test(base ?? "") && /^[0-9a-f]{40}$/.test(head ?? "");
  const apps = resolveCompilation({
    event,
    branch: process.env.GITHUB_REF_NAME,
    baseBranch: process.env.GITHUB_BASE_REF,
    changedFiles: validDiff ? readCompilationChanges({ base, head }) : null,
  });
  const output = `requested=${apps.length > 0}\napps=${JSON.stringify(apps)}\n`;
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, output);
  console.log(
    `Compilation plan: ${apps.join(", ") || "none (development feedback checks only)"}`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
