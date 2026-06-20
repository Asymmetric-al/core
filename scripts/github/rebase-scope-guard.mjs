#!/usr/bin/env node
// Verify the rebase agent only CHANGED files that were conflicted. Compares the post-`git add`
// index against the pre-agent index snapshot (argv[1]); any non-conflicted file (argv[2] lists the
// conflicted paths) whose staged blob hash changed — or any new non-conflicted file — is a stray
// edit. Catches BOTH staged and unstaged stray edits (a sneaky `git add other-file` cannot slip
// past, because we compare staged hashes). Exits non-zero and prints the paths so the workflow
// escalates to needs-human instead of pushing the stray change on PIPELINE_PAT.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [, , beforePath, conflictedPath] = process.argv;

// `git ls-files -s` lines look like "<mode> <hash> <stage>\t<path>". Keep stage-0 entries
// (cleanly merged / non-conflicted); conflicted files are at stages 1/2/3 before resolution.
function stage0(lines) {
  const map = new Map();
  for (const line of lines) {
    const tab = line.indexOf("\t");
    if (tab === -1) continue;
    const meta = line.slice(0, tab).split(/\s+/);
    const path = line.slice(tab + 1);
    if (meta.length === 3 && meta[2] === "0") map.set(path, meta[1]);
  }
  return map;
}

const before = stage0(readFileSync(beforePath, "utf8").split("\n"));
const conflicted = new Set(
  readFileSync(conflictedPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);
const after = stage0(
  execFileSync("git", ["ls-files", "-s"], { encoding: "utf8" }).split("\n"),
);

const stray = [];
for (const [path, hash] of after) {
  if (conflicted.has(path)) continue; // resolving a conflicted file is allowed
  if (before.get(path) !== hash) stray.push(path); // new or content-changed non-conflicted file
}

if (stray.length > 0) {
  console.error("Agent changed files outside the conflict set:");
  for (const path of stray.sort()) console.error(`  ${path}`);
  process.exit(1);
}
console.log("rebase scope guard: agent stayed within the conflict set");
