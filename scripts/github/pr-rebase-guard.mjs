#!/usr/bin/env node
// Gate the rebase/conflict-resolver run: eligibility check + the round NUMBER for the commit
// message. Writes `proceed`, `round`, and `head_ref` to $GITHUB_OUTPUT. Dispatched by the merge
// coordinator when an open develop PR's mergeable_state is "dirty".
//
// Conflict SIZE is decided in one place only — the workflow's precise post-merge conflicted-path
// count (pr-rebase.yml). The round CAP is decided in one place only — the coordinator's per-head
// `coord-state.rebaseAttempts`. This guard owns neither, to avoid divergent thresholds.

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const REPO = process.env.GITHUB_REPOSITORY || "Asymmetric-al/core";
const N = Number(process.env.PR_NUMBER);

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" });
}
function ghJson(args, fallback = null) {
  try {
    return JSON.parse(gh(["api", ...args]));
  } catch (error) {
    if (fallback !== null) return fallback;
    throw error;
  }
}
function out(key, value) {
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}
function stop(reason) {
  console.log(`rebase: skip — ${reason}`);
  out("proceed", "false");
  process.exit(0);
}

const pr = ghJson([`/repos/${REPO}/pulls/${N}`], null);
if (!pr || pr.state !== "open" || pr.draft || pr.base?.ref !== "develop") {
  stop("not an open develop PR");
}

const issue = ghJson([`/repos/${REPO}/issues/${N}`], {});
if ((issue.labels || []).some((l) => (l.name || l) === "needs-human")) {
  stop("needs-human label present");
}

// Round NUMBER only (for the commit-message label). The round CAP is owned solely by the merge
// coordinator's per-head `coord-state.rebaseAttempts` counter — a single source of truth so a
// dispatched- vs. resolved-count mismatch can't let the loop run past the cap.
const commits = ghJson(
  [`/repos/${REPO}/pulls/${N}/commits?per_page=100`, "--paginate"],
  [],
);
const rounds = commits.filter((c) =>
  /\[rebase/i.test(c.commit?.message || ""),
).length;

console.log(`rebase: proceed — round ${rounds + 1}`);
out("proceed", "true");
out("round", String(rounds + 1));
out("head_ref", pr.head.ref);
