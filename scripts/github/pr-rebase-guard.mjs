#!/usr/bin/env node
// Gate the rebase/conflict-resolver run: eligibility, a size guard (never auto-resolve a huge
// conflict), and a hard round cap. Writes `proceed`, `round`, and `head_ref` to $GITHUB_OUTPUT.
// Dispatched by the merge coordinator when an open develop PR's mergeable_state is "dirty".

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const REPO = process.env.GITHUB_REPOSITORY || "Asymmetric-al/core";
const N = Number(process.env.PR_NUMBER);
const MAX_ROUNDS = 2;
// A conflict spanning more than this many files is too risky to auto-resolve — hand to a human.
const MAX_CHANGED_FILES = 40;

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
function escalate(reason) {
  try {
    gh([
      "label",
      "create",
      "automation:auto-escalated",
      "--repo",
      REPO,
      "--color",
      "FBCA04",
      "--description",
      "needs-human applied by the merge pipeline; auto-cleared when the blocker resolves",
      "--force",
    ]);
  } catch {
    /* label already exists */
  }
  gh([
    "pr",
    "comment",
    String(N),
    "--repo",
    REPO,
    "--body",
    `⚠️ Auto-rebase declined: ${reason}. Labeling \`needs-human\` so a person can resolve it.`,
  ]);
  gh(["issue", "edit", String(N), "--repo", REPO, "--add-label", "needs-human,automation:auto-escalated"]);
  stop(reason);
}

const pr = ghJson([`/repos/${REPO}/pulls/${N}`], null);
if (!pr || pr.state !== "open" || pr.draft || pr.base?.ref !== "develop") {
  stop("not an open develop PR");
}

const issue = ghJson([`/repos/${REPO}/issues/${N}`], {});
if ((issue.labels || []).some((l) => (l.name || l) === "needs-human")) {
  stop("needs-human label present");
}

if (typeof pr.changed_files === "number" && pr.changed_files > MAX_CHANGED_FILES) {
  escalate(`conflict spans ${pr.changed_files} files (> ${MAX_CHANGED_FILES})`);
}

// Round cap: count prior [rebase] commits on the branch.
const commits = ghJson(
  [`/repos/${REPO}/pulls/${N}/commits?per_page=100`, "--paginate"],
  [],
);
const rounds = commits.filter((c) => /\[rebase/i.test(c.commit?.message || "")).length;
if (rounds >= MAX_ROUNDS) {
  escalate(`auto-rebase reached the ${MAX_ROUNDS}-round cap without resolving the conflict`);
}

console.log(`rebase: proceed — round ${rounds + 1}`);
out("proceed", "true");
out("round", String(rounds + 1));
out("head_ref", pr.head.ref);
