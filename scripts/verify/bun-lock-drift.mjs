#!/usr/bin/env node

/**
 * Guards against `package.json` <-> `bun.lock` workspace-manifest drift.
 *
 * Bun records every workspace's declared dependency ranges inside
 * `bun.lock`'s `workspaces` map. When a manifest edit lands without the
 * regenerated lockfile, that map silently falls behind: `bun install
 * --frozen-lockfile` (and therefore CI's `bun ci`) still exits 0, and the only
 * symptom is that each contributor's next plain `bun install` rewrites
 * `bun.lock` and dirties their working tree. This verifier compares the two
 * files directly so the drift fails a check instead of a teammate's checkout.
 *
 * Scope: the four dependency groups Bun mirrors into `workspaces`. Workspace
 * `name`/`version` are deliberately not compared, because Bun omits `version`
 * for the root workspace even when the root manifest declares one, so a naive
 * equality check would fail on a lockfile that is actually in sync.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { globSync } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, "..", "..");

/** Dependency groups Bun copies verbatim into each `workspaces` entry. */
export const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

/** Bun keys the root workspace by the empty string. */
export const ROOT_WORKSPACE_KEY = "";

const MANIFEST_SUFFIX = "/package.json";

export const WORKSPACE_DRIFT_REMEDIATION =
  "Run `bun install` and commit the updated bun.lock.";

export const LOCKFILE_VERSION_REMEDIATION =
  "Keep or restore lockfileVersion 0 or 1. Do not run `bun install` to rewrite bun.lock on Bun 1.4+.";

export function isLockfileVersionViolation(violation) {
  return violation.startsWith("bun.lock lockfileVersion ");
}

export function formatBunLockDriftFailure(violations) {
  if (violations.some((violation) => isLockfileVersionViolation(violation))) {
    return [
      "bun.lock lockfileVersion is not supported:",
      ...violations.map((violation) => `- ${violation}`),
      LOCKFILE_VERSION_REMEDIATION,
    ].join("\n");
  }

  return [
    "bun.lock is out of sync with workspace package.json files:",
    ...violations.map((violation) => `- ${violation}`),
    WORKSPACE_DRIFT_REMEDIATION,
  ].join("\n");
}

export function collectUnsupportedLockfileVersion(lockfileVersion) {
  if (
    typeof lockfileVersion === "number" &&
    Number.isInteger(lockfileVersion) &&
    lockfileVersion >= 0 &&
    lockfileVersion <= 1
  ) {
    return [];
  }

  return [
    `bun.lock lockfileVersion ${JSON.stringify(lockfileVersion)} is not supported. Keep lockfileVersion 0 or 1 until installed turbo prune can parse a rewritten lock.`,
  ];
}

/**
 * `bun.lock` is JSONC-ish: it is JSON apart from trailing commas before `}`
 * and `]`. Strip those so `JSON.parse` accepts it, skipping over string
 * literals so a comma inside a package specifier is never touched.
 */
export function stripTrailingCommas(jsonText) {
  const output = [];
  let insideString = false;
  let lastCommaOutputIndex = -1;

  for (let index = 0; index < jsonText.length; index += 1) {
    const character = jsonText[index];

    if (insideString) {
      output.push(character);

      if (character === "\\" && index + 1 < jsonText.length) {
        // Copy the escaped character too, so an escaped quote does not end the string.
        index += 1;
        output.push(jsonText[index]);
        continue;
      }

      if (character === '"') {
        insideString = false;
      }
      continue;
    }

    if (character === '"') {
      insideString = true;
      lastCommaOutputIndex = -1;
      output.push(character);
      continue;
    }

    if (character === ",") {
      lastCommaOutputIndex = output.length;
      output.push(character);
      continue;
    }

    const closesContainer = character === "}" || character === "]";
    if (closesContainer && lastCommaOutputIndex !== -1) {
      output[lastCommaOutputIndex] = "";
      lastCommaOutputIndex = -1;
      output.push(character);
      continue;
    }

    const isWhitespace = /\s/.test(character);
    if (!isWhitespace) {
      lastCommaOutputIndex = -1;
    }
    output.push(character);
  }

  return output.join("");
}

export function parseBunLock(lockText) {
  return JSON.parse(stripTrailingCommas(lockText));
}

function describeWorkspace(workspaceKey) {
  return `bun.lock workspaces[${JSON.stringify(workspaceKey)}]`;
}

function getDependencyGroup(container, field) {
  const group = container?.[field];
  if (!group || typeof group !== "object") {
    return {};
  }

  return group;
}

function collectWorkspaceFieldViolations({
  workspaceKey,
  manifestPath,
  manifest,
  lockWorkspace,
}) {
  const violations = [];
  const workspaceLabel = describeWorkspace(workspaceKey);

  for (const field of DEPENDENCY_FIELDS) {
    const manifestGroup = getDependencyGroup(manifest, field);
    const lockGroup = getDependencyGroup(lockWorkspace, field);

    for (const name of Object.keys(manifestGroup).sort()) {
      const manifestSpecifier = manifestGroup[name];

      if (!Object.hasOwn(lockGroup, name)) {
        violations.push(
          `${manifestPath}: ${field} "${name}": "${manifestSpecifier}" is missing from ${workspaceLabel}`,
        );
        continue;
      }

      const lockSpecifier = lockGroup[name];
      if (lockSpecifier !== manifestSpecifier) {
        violations.push(
          `${manifestPath}: ${field} "${name}" specifier drift: manifest has "${manifestSpecifier}", ${workspaceLabel} has "${lockSpecifier}"`,
        );
      }
    }

    for (const name of Object.keys(lockGroup).sort()) {
      if (Object.hasOwn(manifestGroup, name)) {
        continue;
      }

      violations.push(
        `${workspaceLabel}: ${field} "${name}": "${lockGroup[name]}" is not declared in ${manifestPath}`,
      );
    }
  }

  return violations;
}

/**
 * Compares already-loaded inputs so tests can drive fixtures without touching disk.
 *
 * @param {object} input
 * @param {Record<string, unknown>} input.lockWorkspaces `bun.lock`'s `workspaces` map.
 * @param {Map<string, {manifestPath: string, manifest: object}>} input.manifests
 *   Workspace manifests keyed the way Bun keys them (`""` for the repo root).
 * @returns {string[]} Human-readable violations; empty when the lockfile matches.
 */
export function collectBunLockDriftViolations({ lockWorkspaces, manifests }) {
  const violations = [];
  const workspaceKeys = new Set([
    ...Object.keys(lockWorkspaces),
    ...manifests.keys(),
  ]);

  for (const workspaceKey of [...workspaceKeys].sort()) {
    const manifestEntry = manifests.get(workspaceKey);
    const lockWorkspace = lockWorkspaces[workspaceKey];

    if (!manifestEntry) {
      violations.push(
        `${describeWorkspace(workspaceKey)} has no matching package.json on disk`,
      );
      continue;
    }

    if (!lockWorkspace) {
      violations.push(
        `${manifestEntry.manifestPath} declares a workspace that ${describeWorkspace(workspaceKey)} does not record`,
      );
      continue;
    }

    violations.push(
      ...collectWorkspaceFieldViolations({
        workspaceKey,
        manifestPath: manifestEntry.manifestPath,
        manifest: manifestEntry.manifest,
        lockWorkspace,
      }),
    );
  }

  return violations;
}

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

/**
 * Reads the root manifest plus every workspace manifest its globs resolve to,
 * keyed the way Bun keys them inside `bun.lock`.
 */
export async function readWorkspaceManifests(repoRoot = defaultRepoRoot) {
  const rootManifest = await readJsonFile(path.join(repoRoot, "package.json"));
  const manifests = new Map([
    [
      ROOT_WORKSPACE_KEY,
      { manifestPath: "package.json", manifest: rootManifest },
    ],
  ]);

  const workspaceGlobs = Array.isArray(rootManifest.workspaces)
    ? rootManifest.workspaces
    : [];
  const manifestPaths = new Set();

  for (const workspaceGlob of workspaceGlobs) {
    for (const match of globSync(`${workspaceGlob}${MANIFEST_SUFFIX}`, {
      cwd: repoRoot,
    })) {
      manifestPaths.add(match.replaceAll("\\", "/"));
    }
  }

  for (const manifestPath of [...manifestPaths].sort()) {
    const workspaceKey = manifestPath.slice(0, -MANIFEST_SUFFIX.length);
    manifests.set(workspaceKey, {
      manifestPath,
      manifest: await readJsonFile(path.join(repoRoot, manifestPath)),
    });
  }

  return manifests;
}

export async function findBunLockDrift(repoRoot = defaultRepoRoot) {
  const lockText = await readFile(path.join(repoRoot, "bun.lock"), "utf8");
  const lock = parseBunLock(lockText);
  const versionViolations = collectUnsupportedLockfileVersion(
    lock.lockfileVersion,
  );

  if (versionViolations.length > 0) {
    return versionViolations;
  }

  return collectBunLockDriftViolations({
    lockWorkspaces: lock.workspaces ?? {},
    manifests: await readWorkspaceManifests(repoRoot),
  });
}

async function main() {
  const violations = await findBunLockDrift();
  if (violations.length === 0) {
    console.log("bun.lock workspace manifests verified.");
    return;
  }

  console.error(formatBunLockDriftFailure(violations));

  process.exit(1);
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === __filename
) {
  main().catch((error) => {
    console.error("bun.lock drift verification failed");
    console.error(error);
    process.exit(1);
  });
}
