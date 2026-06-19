#!/usr/bin/env node
// Gate the autofix run: eligibility + a hard round cap so the fix loop always terminates.
// Writes `proceed`, `round`, and `head_ref` to $GITHUB_OUTPUT.

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const REPO = process.env.GITHUB_REPOSITORY || "Asymmetric-al/core";
const N = Number(process.env.PR_NUMBER);
const MAX_ROUNDS = 3;

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
  console.log(`autofix: skip — ${reason}`);
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

// Require a Safe-Fix Plan with blocking items > 0. The planner posts its plan as a PR *review*
// (author cursor[bot]), not an issue comment, so read reviews — and only trust cursor[bot] so a
// hand-written comment can't spoof the fixer into running.
const TRUSTED = new Set(["cursor[bot]"]);
const reviews = ghJson(
  [`/repos/${REPO}/pulls/${N}/reviews?per_page=100`, "--paginate"],
  [],
);
const plan = [...reviews]
  .reverse()
  .find(
    (r) =>
      TRUSTED.has(r.user?.login) && /Simple Safe-Fix Plan/i.test(r.body || ""),
  );
const match = plan && plan.body.match(/<!--\s*fix-plan\s+blocking=(\d+)/i);
const blocking = match ? Number(match[1]) : null;
if (blocking === 0) stop("Safe-Fix Plan reports no blocking items");
if (blocking === null) stop("no Safe-Fix Plan marker yet");

// Round cap: count prior [autofix] commits on the branch.
const commits = ghJson(
  [`/repos/${REPO}/pulls/${N}/commits?per_page=100`, "--paginate"],
  [],
);
const rounds = commits.filter((c) =>
  /\[autofix/i.test(c.commit?.message || ""),
).length;
if (rounds >= MAX_ROUNDS) {
  gh([
    "pr",
    "comment",
    String(N),
    "--repo",
    REPO,
    "--body",
    `⚠️ Autofix reached the ${MAX_ROUNDS}-round cap without converging. Labeling \`needs-human\` so a person can take over.`,
  ]);
  gh([
    "issue",
    "edit",
    String(N),
    "--repo",
    REPO,
    "--add-label",
    "needs-human",
  ]);
  stop(`round cap (${MAX_ROUNDS}) reached`);
}

console.log(
  `autofix: proceed — round ${rounds + 1}, ${blocking} blocking item(s)`,
);
out("proceed", "true");
out("round", String(rounds + 1));
out("head_ref", pr.head.ref);
