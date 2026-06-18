#!/usr/bin/env node
// Enables GitHub native auto-merge on PRs the Final Merge Gate has approved.
//
// A PR is eligible when, on its CURRENT head commit, there is an APPROVED review whose
// body contains the marker `<!-- gate:approved -->` (emitted only by the Final Merge Gate
// Cursor automation when it is confident the PR is safe). GitHub then completes the merge
// once the required checks (ci-gate, integration-gate) pass — branch protection enforces
// those, so no branch-protection change is needed here.
//
// Runs in GitHub Actions where `gh` is preinstalled and authenticated via GH_TOKEN.

import { execFileSync } from "node:child_process";

const REPO = process.env.GITHUB_REPOSITORY || "Asymmetric-al/core";
const BASE = "develop";
const GATE_MARKER = "<!-- gate:approved -->";
const SKIP_LABEL = "needs-human";

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

function targetPrNumbers() {
  const explicit = process.env.INPUT_PR_NUMBER || process.env.EVENT_PR_NUMBER;
  if (explicit && explicit.trim()) return [Number(explicit.trim())];
  const prs = ghJson(
    [`/repos/${REPO}/pulls?state=open&base=${BASE}&per_page=100`, "--paginate"],
    [],
  );
  return prs.map((pr) => pr.number);
}

function hasLabel(issue, name) {
  return (issue.labels || []).some(
    (label) => (typeof label === "string" ? label : label.name) === name,
  );
}

// Gate-approved = an APPROVED review on the current head SHA carrying the marker.
// A push dismisses stale approvals, and `commit_id` ties the approval to a specific
// commit, so this is true only when the gate approved THIS head.
function isGateApproved(prNumber, headSha) {
  const reviews = ghJson(
    [`/repos/${REPO}/pulls/${prNumber}/reviews?per_page=100`, "--paginate"],
    [],
  );
  return reviews.some(
    (review) =>
      review.state === "APPROVED" &&
      review.commit_id === headSha &&
      (review.body || "").includes(GATE_MARKER),
  );
}

function enableAutoMerge(prNumber) {
  try {
    // --auto queues the merge until required checks pass; --merge keeps merge commits
    // (the repo disables squash/rebase). Idempotent on re-runs.
    gh(["pr", "merge", String(prNumber), "--repo", REPO, "--auto", "--merge"]);
    return "armed";
  } catch (error) {
    const message = String(error.stderr || error.message || "");
    if (/already|clean status|not mergeable|enabled/i.test(message)) return "noop";
    throw error;
  }
}

function main() {
  for (const number of targetPrNumbers()) {
    const pr = ghJson([`/repos/${REPO}/pulls/${number}`], null);
    if (!pr || pr.state !== "open" || pr.draft || pr.base?.ref !== BASE) {
      console.log(`#${number}: skip (not an open develop PR)`);
      continue;
    }
    const issue = ghJson([`/repos/${REPO}/issues/${number}`], {});
    if (hasLabel(issue, SKIP_LABEL)) {
      console.log(`#${number}: skip (needs-human)`);
      continue;
    }
    const headSha = pr.head?.sha;
    if (!isGateApproved(number, headSha)) {
      console.log(`#${number}: not gate-approved on ${headSha?.slice(0, 7)}`);
      continue;
    }
    console.log(`#${number}: gate-approved → auto-merge ${enableAutoMerge(number)}`);
  }
}

main();
