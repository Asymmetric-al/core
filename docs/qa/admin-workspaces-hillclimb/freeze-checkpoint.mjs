// Freezes the task-owned working-tree changes as a named checkpoint:
// snapshots/<name>-checkpoint/ (full copies of every changed or new file),
// snapshots/<name>.diff (tracked changes vs the base commit plus new files),
// and snapshots/<name>-manifest.json (SHA-256 of every file and of the diff).
//
// Task-owned = every modified or untracked path, minus the exclusions below:
// unrelated user changes, the earlier Mission Control home hillclimb, QA
// evidence (images, logs, checkpoints) and generated files.
//
// Usage: node docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs <name>
//        node docs/qa/admin-workspaces-hillclimb/freeze-checkpoint.mjs --verify <name>
// Restore a checkpoint by copying snapshots/<name>-checkpoint/* back over the
// repository root (and deleting files the manifest lists as absent there).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildTrackedDiff } from "./checkpoint-diff.mjs";

const BASE = "8368004b339384eb98129a086ca71b7db88534ed";
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const snapshots = join(here, "snapshots");

/**
 * Preserved changes this task does not own. From round 5 the Mission Control
 * home files (first changed by the earlier home hillclimb) are in scope here
 * too, so reviewers see the home code they score in the snapshot.
 */
const EXCLUDED_EXACT = new Set([
  "bun.lock",
  "packages/eve-runtime/package.json",
  "supabase/.temp/cli-latest",
]);
const EXCLUDED_PREFIXES = [
  "docs/qa/admin-home-hillclimb/",
  "docs/qa/.probe-",
  "test-results/",
];
/** QA evidence inside this hillclimb folder: keep scripts and docs only. */
function isEvidence(path) {
  if (!path.startsWith("docs/qa/admin-workspaces-hillclimb/")) return false;
  const rel = path.slice("docs/qa/admin-workspaces-hillclimb/".length);
  if (rel.startsWith("snapshots/") || rel.startsWith("fixtures/")) return true;
  if (/\.(png|json|log|webp)$/i.test(rel)) return true;
  return rel.includes("/"); // capture folders (original/, candidate-*/, ...)
}

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function taskOwnedPaths() {
  const out = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  const entries = out.split("\0").filter(Boolean);
  const paths = [];
  for (const entry of entries) {
    const status = entry.slice(0, 2);
    const path = entry.slice(3);
    if (status.startsWith("R")) continue; // none expected; renames unsupported
    if (EXCLUDED_EXACT.has(path)) continue;
    if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) continue;
    if (isEvidence(path)) continue;
    paths.push({ path, status: status.trim() || "M" });
  }
  // Tracked files the base has but the working tree deleted.
  return paths.sort((a, b) => a.path.localeCompare(b.path));
}

function buildDiff(paths) {
  const tracked = paths.filter((p) => p.status !== "??").map((p) => p.path);
  const untracked = paths.filter((p) => p.status === "??").map((p) => p.path);
  let diff = buildTrackedDiff(git, BASE, tracked);
  for (const path of untracked) {
    try {
      git(["diff", "--no-index", "--binary", "--", "/dev/null", path]);
    } catch (error) {
      // git diff --no-index exits 1 when files differ; stdout holds the diff.
      diff += error.stdout ?? "";
    }
  }
  return diff;
}

const args = process.argv.slice(2);
const verify = args[0] === "--verify";
const name = verify ? args[1] : args[0];
if (!name || !/^[a-z0-9-]+$/.test(name)) {
  throw new Error("usage: freeze-checkpoint.mjs [--verify] <name>");
}
const manifestPath = join(snapshots, `${name}-manifest.json`);

if (verify) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const mismatches = [];
  for (const file of manifest.files) {
    const current = existsSync(join(root, file.path))
      ? sha256(readFileSync(join(root, file.path)))
      : "absent";
    if (current !== file.sha256) mismatches.push(file.path);
  }
  const extra = taskOwnedPaths()
    .map((p) => p.path)
    .filter((p) => !manifest.files.some((f) => f.path === p));
  console.log(
    JSON.stringify(
      { name, files: manifest.files.length, mismatches, extra },
      null,
      2,
    ),
  );
  process.exit(mismatches.length || extra.length ? 1 : 0);
}

mkdirSync(snapshots, { recursive: true });
const checkpointDir = join(snapshots, `${name}-checkpoint`);
rmSync(checkpointDir, { recursive: true, force: true });
const paths = taskOwnedPaths();
const files = [];
for (const { path, status } of paths) {
  const source = join(root, path);
  if (!existsSync(source)) {
    files.push({ path, status, sha256: "absent" });
    continue;
  }
  const target = join(checkpointDir, path);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  files.push({ path, status, sha256: sha256(readFileSync(source)) });
}
const diff = buildDiff(paths);
writeFileSync(join(snapshots, `${name}.diff`), diff);
const manifest = {
  checkpoint: name,
  base: BASE,
  diffSha256: sha256(Buffer.from(diff)),
  excluded: [...EXCLUDED_EXACT, ...EXCLUDED_PREFIXES.map((p) => `${p}**`)],
  files,
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `froze ${files.length} files as ${name}; diff sha256 ${manifest.diffSha256}`,
);
