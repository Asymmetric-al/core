#!/usr/bin/env node

import { fileURLToPath } from "node:url";

export const SURFACES = Object.freeze(["admin", "donor", "missionary"]);

const SURFACE_PREFIXES = Object.freeze({
  admin: "apps/admin/",
  donor: "apps/donor/",
  missionary: "apps/missionary/",
});

const SHARED_ALL_PREFIXES = Object.freeze([
  "packages/api/",
  "packages/auth/",
  "packages/config/",
  "packages/env/",
  "packages/lib/",
  "packages/ui/",
  "tooling/",
]);

const SHARED_ALL_FILES = Object.freeze([
  ".bun-version",
  ".node-version",
  ".npmrc",
  ".nvmrc",
  ".vercelignore",
  "bun.lock",
  "bun.lockb",
  "bunfig.toml",
  "eslint.config.mjs",
  "middleware.js",
  "middleware.mjs",
  "middleware.ts",
  "next-env.d.ts",
  "package-lock.json",
  "package.json",
  "pnpm-lock.yaml",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "turbo.json",
  "yarn.lock",
  "scripts/resolve-monorepo-root.mjs",
  "scripts/run-with-ci-env.mjs",
]);

const SHARED_ALL_PATTERNS = Object.freeze([
  /^playwright(?:\..+)?\.config\.ts$/,
  /^tests\/e2e\/.*(?:smoke|demo-auth-preflight|donate|upload-crop).*\.spec\.tsx?$/,
  /^tsconfig(?:\..+)?\.json$/,
]);

function normalizeChangedFile(file) {
  return String(file ?? "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.\//, "");
}

function hasPrefix(file, prefix) {
  return file === prefix.slice(0, -1) || file.startsWith(prefix);
}

function isSharedAllFile(file) {
  if (SHARED_ALL_FILES.includes(file)) {
    return true;
  }

  if (SHARED_ALL_PREFIXES.some((prefix) => hasPrefix(file, prefix))) {
    return true;
  }

  return SHARED_ALL_PATTERNS.some((pattern) => pattern.test(file));
}

function createEmptyResult(changedFiles) {
  return {
    admin: false,
    donor: false,
    missionary: false,
    any: false,
    scope: "none",
    changedFiles,
    reasons: [],
  };
}

function buildScope(result) {
  const affectedSurfaces = SURFACES.filter((surface) => result[surface]);

  if (affectedSurfaces.length === 0) {
    return "none";
  }

  if (affectedSurfaces.length === SURFACES.length) {
    return "all";
  }

  return affectedSurfaces.join("/");
}

export function resolvePreviewSmokeScope(inputFiles) {
  const changedFiles = inputFiles.map(normalizeChangedFile).filter(Boolean);
  const result = createEmptyResult(changedFiles);

  for (const file of changedFiles) {
    if (isSharedAllFile(file)) {
      for (const surface of SURFACES) {
        result[surface] = true;
      }
      result.reasons.push({
        file,
        surface: "all",
        reason: "shared smoke/runtime input",
      });
      continue;
    }

    for (const surface of SURFACES) {
      if (hasPrefix(file, SURFACE_PREFIXES[surface])) {
        result[surface] = true;
        result.reasons.push({
          file,
          surface,
          reason: `${surface} app path`,
        });
      }
    }
  }

  result.any = SURFACES.some((surface) => result[surface]);
  result.scope = buildScope(result);

  return result;
}

async function readStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function parseInput(text, argv) {
  const trimmed = text.trim();

  if (trimmed.length > 0) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return trimmed.split(/\r?\n/);
    }

    return trimmed.split(/\r?\n/);
  }

  return argv.filter((arg) => arg !== "--json");
}

async function runCli() {
  const input = await readStdin();
  const changedFiles = parseInput(input, process.argv.slice(2));
  const result = resolvePreviewSmokeScope(changedFiles);

  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
