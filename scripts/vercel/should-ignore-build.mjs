#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const APPS = Object.freeze({
  admin: {
    root: "apps/admin",
  },
  donor: {
    root: "apps/donor",
  },
  missionary: {
    root: "apps/missionary",
  },
});

const SHARED_RUNTIME_PREFIXES = Object.freeze([
  "packages/",
  "tooling/",
  "scripts/vercel/",
]);

const SHARED_RUNTIME_FILES = Object.freeze([
  ".bun-version",
  ".node-version",
  ".npmrc",
  ".nvmrc",
  ".vercelignore",
  "bun.lock",
  "bun.lockb",
  "bunfig.toml",
  "eslint.config.mjs",
  "next-env.d.ts",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "scripts/resolve-monorepo-root.mjs",
  "turbo.json",
  "yarn.lock",
]);

const ROOT_BUILD_CONFIG_PATTERNS = Object.freeze([
  /^next\.config\.[cm]?[jt]s$/,
  /^postcss\.config\.[cm]?[jt]s$/,
  /^tailwind\.config\.[cm]?[jt]s$/,
  /^tsconfig(?:\..+)?\.json$/,
  /^vite\.config\.[cm]?[jt]s$/,
]);

function normalizeChangedFile(file) {
  return file.replaceAll("\\", "/").replace(/^\.\//, "");
}

function hasPathPrefix(file, prefix) {
  return file === prefix.slice(0, -1) || file.startsWith(prefix);
}

export function isSharedRuntimeInput(file) {
  const normalizedFile = normalizeChangedFile(file);

  if (SHARED_RUNTIME_FILES.includes(normalizedFile)) {
    return true;
  }

  if (
    SHARED_RUNTIME_PREFIXES.some((prefix) =>
      hasPathPrefix(normalizedFile, prefix),
    )
  ) {
    return true;
  }

  const isRootFile = !normalizedFile.includes("/");
  return (
    isRootFile &&
    ROOT_BUILD_CONFIG_PATTERNS.some((pattern) => pattern.test(normalizedFile))
  );
}

export function resolveBuildDecision({ app, changedFiles }) {
  const appConfig = APPS[app];

  if (!appConfig) {
    return {
      app,
      build: true,
      matchedFile: null,
      reason: `unknown app: ${app ?? "<missing>"}`,
    };
  }

  if (!Array.isArray(changedFiles) || changedFiles.length === 0) {
    return {
      app,
      build: true,
      matchedFile: null,
      reason: "missing diff context",
    };
  }

  const normalizedFiles = changedFiles
    .map((file) => normalizeChangedFile(file.trim()))
    .filter(Boolean);

  if (normalizedFiles.length === 0) {
    return {
      app,
      build: true,
      matchedFile: null,
      reason: "empty diff context",
    };
  }

  for (const file of normalizedFiles) {
    if (hasPathPrefix(file, `${appConfig.root}/`)) {
      return {
        app,
        build: true,
        matchedFile: file,
        reason: `changed app file: ${file}`,
      };
    }

    if (isSharedRuntimeInput(file)) {
      return {
        app,
        build: true,
        matchedFile: file,
        reason: `changed shared runtime input: ${file}`,
      };
    }
  }

  return {
    app,
    build: false,
    matchedFile: null,
    reason: "changed files do not affect this Vercel app",
  };
}

function listChangedFiles() {
  const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

  const diffOutput = execFileSync(
    "git",
    ["-C", repoRoot, "diff", "--name-only", "HEAD^", "HEAD", "--"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  return diffOutput.split(/\r?\n/).filter(Boolean);
}

function runCli(argv) {
  const [app] = argv;
  let changedFiles;

  try {
    changedFiles = listChangedFiles();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[vercel-ignore] building ${app ?? "<missing>"}: ${message}`);
    return 1;
  }

  const decision = resolveBuildDecision({ app, changedFiles });
  const verb = decision.build ? "building" : "skipping";
  console.log(`[vercel-ignore] ${verb} ${app}: ${decision.reason}`);

  return decision.build ? 1 : 0;
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (executedPath === fileURLToPath(import.meta.url)) {
  process.exitCode = runCli(process.argv.slice(2));
}
