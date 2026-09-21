#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepoRoot = path.resolve(path.dirname(scriptPath), "../..");
const require = createRequire(import.meta.url);
// Use the repository-pinned merger, not a second Markdown parser. These
// internal read-only helpers must be rechecked when the OpenSpec pin changes.
const mergerUrl = pathToFileURL(
  path.join(
    path.dirname(require.resolve("@fission-ai/openspec")),
    "core/specs-apply.js",
  ),
).href;

export async function verifyOpenSpecDeltaCompatibility(
  repoRoot = defaultRepoRoot,
) {
  const { findSpecUpdates, buildUpdatedSpec } = await import(mergerUrl);
  const changesRoot = path.join(repoRoot, "openspec/changes");
  const specsRoot = path.join(repoRoot, "openspec/specs");
  const changes = (await readdir(changesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .sort((a, b) => a.name.localeCompare(b.name));
  const failures = [];
  let checked = 0;

  for (const change of changes) {
    const updates = await findSpecUpdates(
      path.join(changesRoot, change.name),
      specsRoot,
    );
    for (const update of updates) {
      checked += 1;
      try {
        // Build each delta against today's base independently. Never apply,
        // write, archive, or treat a successful build as implementation proof.
        await buildUpdatedSpec(update, change.name, { silent: true });
      } catch (error) {
        failures.push({
          change: change.name,
          capability: update.id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return { checked, failures };
}

async function main() {
  const result = await verifyOpenSpecDeltaCompatibility();
  if (result.failures.length > 0) {
    for (const failure of result.failures) {
      console.error(
        `${failure.change}/${failure.capability}: ${failure.message}`,
      );
    }
    console.error(
      `OpenSpec delta compatibility: ${result.failures.length} failed of ${result.checked}.`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `OpenSpec delta compatibility: ${result.checked} checked; no files written.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error("OpenSpec delta compatibility verification failed:", error);
    process.exitCode = 1;
  });
}
