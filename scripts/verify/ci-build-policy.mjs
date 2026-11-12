#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, globSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Product apps: the Vercel-deployed release set. Production, merge-queue and
// manual (workflow_dispatch) CI, `bun run build` and shared product inputs
// compile exactly these three.
export const BUILD_APPS = Object.freeze(["admin", "donor", "missionary"]);
// Private operator apps (apps/factory-console: a loopback service on VM 100,
// never deployed to Vercel). They are compilation targets but deliberately not
// in the product release set: a non-product build must not gate a product
// release or lengthen the 15-minute CI build job on every full compile. They
// compile on develop PRs, the only place their changes are reviewed, whenever
// their own files, a workspace package in their dependency graph, or a shared
// install/compilation input changes, or when the diff is unknown. Unlike the
// product apps, ordinary source edits count: no Vercel preview builds an
// operator app, and only `next build` proves its server/client boundaries and
// Cache Components prerendering, which typecheck and lint do not.
export const OPERATOR_BUILD_APPS = Object.freeze(["factory-console"]);
export const COMPILATION_APPS = Object.freeze([
  ...BUILD_APPS,
  ...OPERATOR_BUILD_APPS,
]);
const BUILD_CONFIG =
  /(?:^|\/)(?:package\.json|vercel\.json|tsconfig(?:\.[^/]+)?\.json|(?:next|postcss|tailwind|vite)\.config\.[cm]?[jt]s)$/;
// Root installation and toolchain inputs shared by every compiled app.
const INSTALL_INPUTS = new Set([
  "bun.lock",
  "bun.lockb",
  "package.json",
  "turbo.json",
  "bunfig.toml",
  ".bun-version",
  ".node-version",
  ".nvmrc",
  ".npmrc",
]);
const SHARED_INPUTS = new Set([
  ...INSTALL_INPUTS,
  ".vercelignore",
  "scripts/load-workspace-env.mjs",
]);
const SHARED_TYPESCRIPT_CONFIG = /^tooling\/typescript-config\/.*\.jsonc?$/;

export function resolveCompilation({
  event,
  branch,
  baseBranch,
  changedFiles,
  full = false,
}) {
  return [
    ...resolveProductCompilation({
      event,
      branch,
      baseBranch,
      changedFiles,
      full,
    }),
    ...resolveOperatorCompilation({ event, baseBranch, changedFiles }),
  ];
}

function resolveProductCompilation({
  event,
  branch,
  baseBranch,
  changedFiles,
  full,
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
    // Operator app files are that app's own inputs, never shared product
    // build configuration.
    const app = compilationAppOf(file);
    const shared =
      SHARED_INPUTS.has(file) ||
      file.startsWith("vendor/react-pdf-packages/") ||
      SHARED_TYPESCRIPT_CONFIG.test(file) ||
      (!app && BUILD_CONFIG.test(file)) ||
      /^scripts\/(?:vercel\/|verify\/ci-build|repair-workspace-links\.mjs|resolve-monorepo-root\.mjs)/.test(
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

function resolveOperatorCompilation({ event, baseBranch, changedFiles }) {
  if (event !== "pull_request" || baseBranch !== "develop") return [];
  if (!Array.isArray(changedFiles)) return [...OPERATOR_BUILD_APPS];
  return OPERATOR_BUILD_APPS.filter((app) => {
    const inputs = [
      `apps/${app}`,
      ...readWorkspaceDependencyDirs(`apps/${app}`),
    ];
    return changedFiles.some(
      (file) =>
        INSTALL_INPUTS.has(file) ||
        SHARED_TYPESCRIPT_CONFIG.test(file) ||
        // ci-build and its link repair dispatch every compilation; ci.yml
        // owns the build job. Vercel-only inputs are excluded.
        /^scripts\/(?:verify\/ci-build|repair-workspace-links\.mjs)/.test(
          file,
        ) ||
        file === ".github/workflows/ci.yml" ||
        inputs.some((directory) => file.startsWith(`${directory}/`)),
    );
  });
}

function compilationAppOf(file) {
  const app = /^apps\/([^/]+)\//.exec(file)?.[1];
  return COMPILATION_APPS.includes(app) ? app : undefined;
}

/**
 * Workspace directories an app compiles against: the transitive closure of
 * its `workspace:` runtime dependencies (`dependencies`, `peerDependencies`,
 * `optionalDependencies`), read from the manifests. Development-only
 * workspaces (lint and TypeScript configuration) do not change `next build`
 * output; shared TypeScript configuration is a separate shared input.
 */
export function readWorkspaceDependencyDirs(appDirectory, rootDir = REPO_ROOT) {
  const readManifest = (directory) =>
    JSON.parse(
      readFileSync(path.join(rootDir, directory, "package.json"), "utf8"),
    );
  const workspaceDirectories = new Map(
    globSync(
      readManifest(".").workspaces.map((pattern) => `${pattern}/package.json`),
      { cwd: rootDir },
    ).map((manifest) => {
      const directory = path.dirname(manifest).replaceAll("\\", "/");
      return [readManifest(directory).name, directory];
    }),
  );
  const found = new Set();
  const pending = [appDirectory];
  while (pending.length > 0) {
    const manifest = readManifest(pending.pop());
    for (const field of [
      "dependencies",
      "peerDependencies",
      "optionalDependencies",
    ])
      for (const [name, specifier] of Object.entries(manifest[field] ?? {})) {
        const directory = workspaceDirectories.get(name);
        if (
          !String(specifier).startsWith("workspace:") ||
          !directory ||
          found.has(directory)
        )
          continue;
        found.add(directory);
        pending.push(directory);
      }
  }
  return [...found].sort();
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
  if (typeof buildRequested !== "boolean") return false;
  if (
    ![
      "plan",
      "format",
      "integrity",
      "lint",
      "typecheck",
      "unit",
      "acceptance",
    ].every((key) => results[key] === "success")
  )
    return false;
  return (
    results.build === "success" ||
    (buildRequested === false && results.build === "skipped")
  );
}

export function parseBuildSelection(text = "[]") {
  let apps;
  try {
    apps = JSON.parse(text);
  } catch {
    apps = null;
  }
  if (
    !Array.isArray(apps) ||
    apps.length === 0 ||
    apps.some((app) => !COMPILATION_APPS.includes(app))
  )
    throw new Error("Invalid compilation app selection");
  return apps;
}

function main() {
  if (process.argv.includes("--build")) {
    const apps = parseBuildSelection(process.env.CI_BUILD_APPS ?? "[]");
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
    const requested = process.env.CI_BUILD_REQUESTED;
    const buildRequested =
      requested === "true" ? true : requested === "false" ? false : undefined;
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
