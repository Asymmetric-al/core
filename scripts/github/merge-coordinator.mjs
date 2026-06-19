#!/usr/bin/env node
// Merge coordinator — the GitHub-side brain of the hands-off PR pipeline.
//
// Why this exists: the Cursor review bots all fire at the same time (on CI completion) and
// each runs exactly once. There is no reliable "run after the others" in Cursor, so an
// in-Cursor merge gate can fire before the reviewers finish and then never re-run — clean
// PRs would stall. This coordinator moves that decision to GitHub, where a schedule + CI
// completion give it as many re-checks as it needs.
//
// IMPORTANT: the Cursor bots post their verdicts as PR *reviews* (a "Comment on Pull Request"
// shows up under GET /pulls/{n}/reviews as author `cursor[bot]`), NOT as issue/timeline
// comments. So we read reviews, and we only trust reviews authored by `cursor[bot]` — a PR
// author cannot post as that account, which prevents spoofing the gate with a fake comment.
// Each review body ends with `SEVERITY: <one value>`, and the "Simple Safe-Fix Plan" review
// carries `<!-- fix-plan blocking=<N> ... -->`. A review's `commit_id` ties it to the exact
// commit it reviewed, so we know whether the *current* head was reviewed.
//
// From those plus CI status it decides, per open develop PR on its current head:
//   • MERGE  — arm GitHub native auto-merge (merges when required checks pass), or
//   • FIX    — dispatch the autofix workflow (a headless cursor-agent applies the plan), or
//   • WAIT   — do nothing; the next CI completion or cron tick re-checks.
//
// Runs inside GitHub Actions where `gh` is preinstalled and authenticated via GH_TOKEN
// (PIPELINE_PAT). This workflow must live on the repo default branch to fire on schedule /
// check_suite events.

import { execFileSync } from "node:child_process";

const REPO = process.env.GITHUB_REPOSITORY || "Asymmetric-al/core";
const BASE = "develop";
const REQUIRED_CHECKS = ["ci-gate", "integration-gate"];
const SKIP_LABEL = "needs-human";

// Only verdicts from the actual review bots are trusted. All our Cursor reviewer automations
// post as `cursor[bot]`; nobody else can. This is the anti-spoofing guard.
const TRUSTED_REVIEWER_LOGINS = new Set(["cursor[bot]"]);

// Tier-1 bug bots re-run on every commit, so a review of the *current* head proves the latest
// code was bug-checked. We require both before any merge.
const BUG_BOT_TITLES = ["Critical Bug Check", "Pre-Mortem Bug Finder"];
const PLAN_TITLE = "Simple Safe-Fix Plan";
const PLAN_MARKER = /<!--\s*fix-plan\s+blocking=(\d+)/i;
const AUTOFIX_COMMIT = /\[autofix/i;

// Give the reviewers time to land after CI finishes before we judge "no blockers".
const SETTLE_MINUTES = 6;
// If a PR sits unresolved this long (e.g., a review bot hit a usage limit and never posted),
// stop waiting silently and hand it to a human.
const STALE_MINUTES = 45;
// Hard stop so the fix loop always terminates.
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

function hasLabel(issue, name) {
  return (issue.labels || []).some(
    (label) => (typeof label === "string" ? label : label.name) === name,
  );
}

// A bot titles its review exactly "<title>". Match that as a heading or near the start of the
// body, not just any mention. Combined with the trusted-author check, this identifies which
// bot a review came from.
function isTitled(body, title) {
  const text = body || "";
  const headingMatch = text.match(/^#{0,6}\s*(.+?)\s*$/m);
  if (headingMatch && headingMatch[1] === title) return true;
  return text.trimStart().slice(0, 200).includes(title);
}

// Only a real single-value verdict counts. The literal template line
// "SEVERITY: Blocker | High | Medium | Suggestion | None" has pipes and must NOT match.
function severityOf(body) {
  const matches = [
    ...(body || "").matchAll(
      /^SEVERITY:\s*(Blocker|High|Medium|Suggestion|None)\s*$/gim,
    ),
  ];
  if (matches.length === 0) return null;
  return matches[matches.length - 1][1].toLowerCase();
}

function isBlocking(severity) {
  return severity === "blocker" || severity === "high";
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

function headCommitDate(headSha) {
  const commit = ghJson([`/repos/${REPO}/commits/${headSha}`], null);
  return commit?.commit?.committer?.date || null;
}

// Trusted reviews of the CURRENT head only. `commit_id` is exact, so a Tier-2 review left on an
// earlier commit (it runs once per PR) is correctly treated as not-fresh after an autofix push,
// while the per-commit bug bots and planner re-review each head.
function freshTrustedReviews(prNumber, headSha) {
  const reviews = ghJson(
    [`/repos/${REPO}/pulls/${prNumber}/reviews?per_page=100`, "--paginate"],
    [],
  );
  return reviews.filter(
    (review) =>
      TRUSTED_REVIEWER_LOGINS.has(review.user?.login) &&
      review.commit_id === headSha,
  );
}

// Required-check status for a commit, reading both the Checks API and the legacy Statuses API
// (ci-gate / integration-gate may be reported by either). Returns whether every required
// context is green, whether any failed, and the latest completion time we saw.
function requiredCheckState(headSha) {
  const result = new Map();
  let latestCompleted = null;

  const noteCompleted = (iso) => {
    if (
      iso &&
      (!latestCompleted || new Date(iso) > new Date(latestCompleted))
    ) {
      latestCompleted = iso;
    }
  };

  const checkRuns = ghJson(
    [`/repos/${REPO}/commits/${headSha}/check-runs?per_page=100`, "--paginate"],
    { check_runs: [] },
  );
  for (const run of checkRuns.check_runs || []) {
    if (!REQUIRED_CHECKS.includes(run.name)) continue;
    const ok = run.status === "completed" && run.conclusion === "success";
    const failed =
      run.status === "completed" &&
      [
        "failure",
        "timed_out",
        "cancelled",
        "action_required",
        "stale",
      ].includes(run.conclusion);
    result.set(run.name, ok ? "success" : failed ? "failure" : "pending");
    noteCompleted(run.completed_at);
  }

  const status = ghJson([`/repos/${REPO}/commits/${headSha}/status`], {
    statuses: [],
  });
  for (const ctx of status.statuses || []) {
    if (!REQUIRED_CHECKS.includes(ctx.context)) continue;
    const mapped =
      ctx.state === "success"
        ? "success"
        : ctx.state === "failure" || ctx.state === "error"
          ? "failure"
          : "pending";
    if (result.get(ctx.context) !== "success") result.set(ctx.context, mapped);
    noteCompleted(ctx.updated_at);
  }

  const states = REQUIRED_CHECKS.map((name) => result.get(name) || "pending");
  return {
    allGreen: states.every((s) => s === "success"),
    anyFailed: states.some((s) => s === "failure"),
    latestCompleted,
  };
}

function armMerge(prNumber) {
  try {
    gh(["pr", "merge", String(prNumber), "--repo", REPO, "--auto", "--merge"]);
    return "armed";
  } catch (error) {
    const message = String(error.stderr || error.message || "");
    if (/already|clean status|not mergeable|enabled/i.test(message))
      return "noop";
    throw error;
  }
}

// Returns true on success. On failure we do NOT pretend it worked — the caller escalates so the
// PR can never loop silently on a broken dispatch.
function dispatchAutofix(prNumber) {
  try {
    gh([
      "workflow",
      "run",
      "autofix.yml",
      "--repo",
      REPO,
      "-f",
      `pr_number=${prNumber}`,
    ]);
    return true;
  } catch (error) {
    console.log(
      `#${prNumber}: autofix dispatch failed — ${String(error.stderr || error.message || "").trim()}`,
    );
    return false;
  }
}

function escalateToHuman(prNumber, reason) {
  gh([
    "pr",
    "comment",
    String(prNumber),
    "--repo",
    REPO,
    "--body",
    `⚠️ Merge coordinator stopping automated handling: ${reason}. Labeling \`${SKIP_LABEL}\`.`,
  ]);
  gh([
    "issue",
    "edit",
    String(prNumber),
    "--repo",
    REPO,
    "--add-label",
    SKIP_LABEL,
  ]);
}

function evaluatePr(number) {
  const pr = ghJson([`/repos/${REPO}/pulls/${number}`], null);
  if (!pr || pr.state !== "open" || pr.draft || pr.base?.ref !== BASE) {
    console.log(`#${number}: skip (not an open ${BASE} PR)`);
    return;
  }

  const issue = ghJson([`/repos/${REPO}/issues/${number}`], {});
  if (hasLabel(issue, SKIP_LABEL)) {
    console.log(`#${number}: skip (${SKIP_LABEL})`);
    return;
  }

  const headSha = pr.head?.sha;
  const headDate = headCommitDate(headSha);
  if (!headDate) {
    console.log(`#${number}: skip (could not read head commit date)`);
    return;
  }

  // Trusted bot reviews of THIS head (anti-spoof: cursor[bot] only; exact via commit_id).
  const fresh = freshTrustedReviews(number, headSha);
  const bugBotsFresh = BUG_BOT_TITLES.every((title) =>
    fresh.some((r) => isTitled(r.body, title)),
  );
  const activeBlocker = fresh.some((r) => isBlocking(severityOf(r.body)));

  const planReview = [...fresh]
    .reverse()
    .find((r) => isTitled(r.body, PLAN_TITLE));
  const planMatch = planReview && planReview.body.match(PLAN_MARKER);
  const planBlocking = planMatch ? Number(planMatch[1]) : null;

  const ci = requiredCheckState(headSha);
  const settleAnchor = ci.latestCompleted
    ? Math.max(
        new Date(headDate).getTime(),
        new Date(ci.latestCompleted).getTime(),
      )
    : new Date(headDate).getTime();
  const settled = (Date.now() - settleAnchor) / 60000 >= SETTLE_MINUTES;

  const commits = ghJson(
    [`/repos/${REPO}/pulls/${number}/commits?per_page=100`, "--paginate"],
    [],
  );
  const rounds = commits.filter((c) =>
    AUTOFIX_COMMIT.test(c.commit?.message || ""),
  ).length;

  // MERGE: current code is green, freshly bug-checked, no active blocker, the planner (if it
  // ran on this head) sees nothing left, and reviewers have had time to weigh in.
  const planClear = planBlocking === null || planBlocking === 0;
  if (ci.allGreen && bugBotsFresh && !activeBlocker && planClear && settled) {
    console.log(`#${number}: merge-ready → auto-merge ${armMerge(number)}`);
    return;
  }

  // FIX: something is wrong AND there is a concrete plan (on this head) to act on.
  const needsFix = ci.anyFailed || activeBlocker || (planBlocking || 0) > 0;
  if (needsFix && (planBlocking || 0) > 0) {
    if (rounds >= MAX_ROUNDS) {
      escalateToHuman(number, `autofix reached the ${MAX_ROUNDS}-round cap`);
      console.log(`#${number}: round cap → ${SKIP_LABEL}`);
      return;
    }
    if (dispatchAutofix(number)) {
      console.log(
        `#${number}: needs fix (${planBlocking} blocking, round ${rounds + 1}) → dispatched`,
      );
    } else {
      escalateToHuman(number, "could not dispatch the autofix workflow");
      console.log(`#${number}: dispatch failed → ${SKIP_LABEL}`);
    }
    return;
  }

  // Don't wait forever: if a head has been stuck well past the settle window, a bot likely
  // failed to post. Hand it to a human instead of hanging silently.
  const minutesStuck = (Date.now() - settleAnchor) / 60000;
  if (minutesStuck >= STALE_MINUTES) {
    escalateToHuman(
      number,
      `no merge decision after ${Math.round(minutesStuck)} min (a review bot may not have posted)`,
    );
    console.log(`#${number}: stale → ${SKIP_LABEL}`);
    return;
  }

  const why = !ci.allGreen
    ? ci.anyFailed
      ? "CI failing, waiting for a Safe-Fix Plan"
      : "CI pending"
    : !bugBotsFresh
      ? "waiting for bug-bot review on current head"
      : activeBlocker
        ? "blocker open, waiting for a Safe-Fix Plan"
        : !settled
          ? "waiting for reviewers to settle"
          : "waiting";
  console.log(`#${number}: ${why}`);
}

function main() {
  for (const number of targetPrNumbers()) {
    try {
      evaluatePr(number);
    } catch (error) {
      console.log(`#${number}: error — ${String(error.message || error)}`);
    }
  }
}

main();
