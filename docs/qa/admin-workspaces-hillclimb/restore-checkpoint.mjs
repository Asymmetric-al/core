// Restores the app source of a frozen checkpoint into the working tree, so an
// earlier candidate can be served and recaptured under the current harness.
// Paths under docs/qa/ (the capture and check scripts) are never touched.
//
// For every task-owned path outside docs/qa/, in the checkpoint's manifest or
// changed now: a manifest file is copied back from snapshots/<name>-checkpoint/,
// a manifest "absent" is deleted, and a path the checkpoint did not change is
// returned to the base commit (deleted when the base lacks it). Then every
// such path is hashed against the manifest (or the base) and any mismatch
// fails the run.
//
// Usage: node docs/qa/admin-workspaces-hillclimb/restore-checkpoint.mjs <name>
//        node docs/qa/admin-workspaces-hillclimb/restore-checkpoint.mjs --check <name>
// Freeze the current state first (freeze-checkpoint.mjs) so it can be restored.
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

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const snapshots = join(here, "snapshots");

const args = process.argv.slice(2);
const checkOnly = args[0] === "--check";
const name = checkOnly ? args[1] : args[0];
if (!name || !/^[a-z0-9-]+$/.test(name)) {
  throw new Error("usage: restore-checkpoint.mjs [--check] <name>");
}
const manifest = JSON.parse(
  readFileSync(join(snapshots, `${name}-manifest.json`), "utf8"),
);
const base = manifest.base;
const excluded = new Set(
  manifest.excluded.filter((entry) => !entry.endsWith("**")),
);
const excludedPrefixes = manifest.excluded
  .filter((entry) => entry.endsWith("**"))
  .map((entry) => entry.slice(0, -2));

function git(gitArgs, options = {}) {
  return execFileSync("git", gitArgs, {
    cwd: root,
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  });
}

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

function inScope(path) {
  if (path.startsWith("docs/qa/")) return false;
  if (excluded.has(path)) return false;
  return !excludedPrefixes.some((prefix) => path.startsWith(prefix));
}

function baseContent(path) {
  try {
    return git(["show", `${base}:${path}`]);
  } catch {
    return null; // not in the base commit
  }
}

const recorded = new Map(
  manifest.files.filter((f) => inScope(f.path)).map((f) => [f.path, f]),
);
const changedNow = git([
  "status",
  "--porcelain=v1",
  "-z",
  "--untracked-files=all",
])
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .map((entry) => entry.slice(3))
  .filter(inScope);
const paths = [...new Set([...recorded.keys(), ...changedNow])].sort();

const counts = { copied: 0, deleted: 0, reset: 0 };
if (!checkOnly) {
  for (const path of paths) {
    const target = join(root, path);
    const entry = recorded.get(path);
    if (entry && entry.sha256 !== "absent") {
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(join(snapshots, `${name}-checkpoint`, path), target);
      counts.copied += 1;
    } else if (entry) {
      rmSync(target, { force: true });
      counts.deleted += 1;
    } else {
      const content = baseContent(path);
      if (content === null) {
        rmSync(target, { force: true });
        counts.deleted += 1;
      } else {
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, content);
        counts.reset += 1;
      }
    }
  }
}

const mismatches = [];
for (const path of paths) {
  const target = join(root, path);
  const current = existsSync(target) ? sha256(readFileSync(target)) : "absent";
  const entry = recorded.get(path);
  let expected;
  if (entry) expected = entry.sha256;
  else {
    const content = baseContent(path);
    expected = content === null ? "absent" : sha256(content);
  }
  if (current !== expected) mismatches.push(path);
}
console.log(
  JSON.stringify(
    { name, scope: paths.length, ...counts, checkOnly, mismatches },
    null,
    2,
  ),
);
process.exit(mismatches.length ? 1 : 0);
