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
// Decision (per open develop PR on its current head) — see decide():
//   • MERGE             — arm GitHub native auto-merge (merges when required checks pass)
//   • UPDATE_BRANCH     — branch is behind develop; merge develop in (no AI)
//   • RESOLVE_CONFLICTS — branch conflicts with develop; dispatch the rebase agent (pr-rebase.yml)
//   • DISPATCH_FIX      — a Safe-Fix Plan has blockers; dispatch autofix.yml
//   • NUDGE_REVIEWS     — CI green but a Tier-1 bot review is missing; re-run CI to re-fire bots
//   • ESCALATE          — give up *recoverably*: label needs-human + automation:auto-escalated
//   • CLEAR_ESCALATION  — a prior auto-escalation's blocker cleared; un-park and resume
//   • WAIT / SKIP       — do nothing this tick
//
// Self-healing design (so dispatch failures and missing reviews don't permanently trap a PR):
//   - dispatches retry inline and, if still failing, just WAIT and retry next tick until a
//     per-head attempt budget is hit; only then do we escalate, and recoverably.
//   - "stale" first NUDGES the reviewers (re-runs CI) up to a budget before escalating.
//   - escalations the coordinator makes carry automation:auto-escalated and are auto-cleared
//     when the head changes or the PR becomes merge-ready. A human-set needs-human (no marker)
//     is a hard stop we never touch.
// Per-head counters live in a single self-updating "<!-- coord-state ... -->" PR comment.
//
// Runs inside GitHub Actions where `gh` is preinstalled and authenticated via GH_TOKEN
// (PIPELINE_PAT). This workflow must live on the repo default branch to fire on schedule /
// check_suite events.

import { execFileSync } from "node:child_process";

const REPO = process.env.GITHUB_REPOSITORY || "Asymmetric-al/core";
const BASE = "develop";
const REQUIRED_CHECKS = ["ci-gate", "integration-gate"];
// Workflow files whose runs we re-trigger to nudge the "on CI completion" review bots.
const CI_WORKFLOW_PATHS = [
  ".github/workflows/ci.yml",
  ".github/workflows/ci-integration.yml",
];

const SKIP_LABEL = "needs-human";
// Marks a needs-human the coordinator applied itself (vs. a human). Only auto-applied ones are
// auto-cleared; a human-set needs-human is a hard stop.
const AUTO_LABEL = "automation:auto-escalated";
const STATE_MARKER = "coord-state";

// Only verdicts from the actual review bots are trusted. All our Cursor reviewer automations
// post as `cursor[bot]`; nobody else can. This is the anti-spoofing guard.
const TRUSTED_REVIEWER_LOGINS = new Set(["cursor[bot]"]);

// Tier-1 bots re-run on every commit, so a review of the *current* head proves the latest code
// was bug- and security-checked. We require all three before any merge.
const BUG_BOT_TITLES = [
  "Critical Bug Check",
  "Pre-Mortem Bug Finder",
  "Vulnerability Check",
];
const PLAN_TITLE = "Simple Safe-Fix Plan";
const PLAN_MARKER = /<!--\s*fix-plan\s+blocking=(\d+)/i;
const AUTOFIX_COMMIT = /\[autofix/i;

// Give the reviewers time to land after CI finishes before we judge "no blockers".
const SETTLE_MINUTES = 6;
// If a PR sits unresolved this long (e.g., a review bot hit a usage limit and never posted),
// stop waiting silently — first nudge the reviewers, then hand it to a human.
const STALE_MINUTES = 45;
// Hard stop so the autofix loop always terminates.
const MAX_ROUNDS = 3;
// How many times we'll dispatch autofix/rebase for the SAME head before escalating. Counts every
// dispatch ATTEMPT (success or failure), so a persistently failing dispatch still reaches the cap.
const MAX_FIX_DISPATCH = 3;
const MAX_REBASE_ROUNDS = 2;
// How many times we'll try to update a behind branch for the same head before escalating.
const MAX_UPDATE_ATTEMPTS = 3;
// How many times we'll re-run CI to re-fire the review bots for the same head.
const MAX_NUDGES = 2;

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
// earlier commit (it runs once per PR) is correctly treated as not-fresh after a push, while
// the per-commit bug bots and planner re-review each head.
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

// Required-check status for a commit, reading both the Checks API and the legacy Statuses API.
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

// ----- per-head state comment (one self-updating comment per PR) -------------------------

// The login the coordinator runs as (PIPELINE_PAT identity). Cached. Used so only the
// coordinator's OWN state comment is trusted — a collaborator cannot inject a `coord-state`
// marker to reset the retry budgets.
let SELF_LOGIN;
function selfLogin() {
  if (SELF_LOGIN === undefined) {
    SELF_LOGIN = ghJson(["/user"], {})?.login || null;
  }
  return SELF_LOGIN;
}

function findStateComment(prNumber) {
  const self = selfLogin();
  // Fail safe, not open: if we cannot verify our own identity, trust NO stored state — it would
  // be unauthenticated and therefore spoofable. Resetting the budgets is safer than honoring a
  // counter an attacker could have planted.
  if (!self) return { id: null, state: {} };
  const comments = ghJson(
    [`/repos/${REPO}/issues/${prNumber}/comments?per_page=100`, "--paginate"],
    [],
  );
  for (const c of comments) {
    // Anti-spoof: only trust the marker on a comment we authored.
    if (c.user?.login !== self) continue;
    const match = (c.body || "").match(
      new RegExp(`<!--\\s*${STATE_MARKER}\\s*(\\{[\\s\\S]*?\\})\\s*-->`),
    );
    if (match) {
      try {
        return { id: c.id, state: JSON.parse(match[1]) };
      } catch {
        return { id: c.id, state: {} };
      }
    }
  }
  return { id: null, state: {} };
}

function blankCounters(head) {
  return {
    head,
    fixAttempts: 0,
    rebaseAttempts: 0,
    updateAttempts: 0,
    nudges: 0,
    inflightFixAt: null,
    inflightRebaseAt: null,
  };
}

// Load counters for THIS head. Counters reset when the head changes; escalatedHead persists so
// reversibility can detect "head changed since we escalated".
function loadState(prNumber, head) {
  const { id, state } = findStateComment(prNumber);
  const escalatedHead = state.escalatedHead || null;
  if (state.head !== head) {
    return { id, ...blankCounters(head), escalatedHead };
  }
  return {
    id,
    head,
    fixAttempts: state.fixAttempts || 0,
    rebaseAttempts: state.rebaseAttempts || 0,
    updateAttempts: state.updateAttempts || 0,
    nudges: state.nudges || 0,
    inflightFixAt: state.inflightFixAt || null,
    inflightRebaseAt: state.inflightRebaseAt || null,
    escalatedHead,
  };
}

function saveState(prNumber, state) {
  const payload = {
    head: state.head,
    fixAttempts: state.fixAttempts || 0,
    rebaseAttempts: state.rebaseAttempts || 0,
    updateAttempts: state.updateAttempts || 0,
    nudges: state.nudges || 0,
    inflightFixAt: state.inflightFixAt || null,
    inflightRebaseAt: state.inflightRebaseAt || null,
    escalatedHead: state.escalatedHead || null,
  };
  const body =
    `<!-- ${STATE_MARKER} ${JSON.stringify(payload)} -->\n` +
    `<sub>🤖 merge coordinator state (auto-updated): head \`${String(state.head).slice(0, 9)}\`, ` +
    `fix ${payload.fixAttempts}/${MAX_FIX_DISPATCH}, rebase ${payload.rebaseAttempts}/${MAX_REBASE_ROUNDS}, ` +
    `nudges ${payload.nudges}/${MAX_NUDGES}.</sub>`;
  if (state.id) {
    gh([
      "api",
      `/repos/${REPO}/issues/comments/${state.id}`,
      "-X",
      "PATCH",
      "-f",
      `body=${body}`,
    ]);
  } else {
    const created = ghJson([
      `/repos/${REPO}/issues/${prNumber}/comments`,
      "-X",
      "POST",
      "-f",
      `body=${body}`,
    ]);
    state.id = created?.id || null;
  }
}

// ----- pure decision ---------------------------------------------------------------------

function r(action, reason) {
  return { action, reason };
}

// Pure: given a flat state snapshot, decide one action. No side effects, no I/O — unit-tested.
export function decide(s) {
  if (!s.candidate) return r("SKIP", "not an open develop PR");

  // Reversible escalation: a needs-human the coordinator set itself is re-checked every run.
  if (s.autoEscalated) {
    if (s.mergeReady) {
      return r("CLEAR_ESCALATION", "now merge-ready; resuming automation");
    }
    // Only treat the head as "changed" when we recorded the escalation head AND it differs. A
    // NULL escalatedHead means a guard/workflow escalated without recording one — we must NOT
    // clear (that would immediately un-park and loop); the executor adopts the current head so a
    // future push is detectable.
    if (s.escalatedHead && s.head !== s.escalatedHead) {
      return r(
        "CLEAR_ESCALATION",
        "new commit since auto-escalation; resuming automation",
      );
    }
    return r("SKIP", "auto-escalated; parked on this head");
  }
  // Human-set needs-human is a hard stop.
  if (s.humanParked) return r("SKIP", "needs-human (human-set)");

  // Merge-conflict / out-of-date handling (idea 1 + 2).
  if (s.mergeableState === "behind") {
    if (s.updateAttempts >= MAX_UPDATE_ATTEMPTS) {
      return r(
        "ESCALATE",
        `branch could not be updated after ${MAX_UPDATE_ATTEMPTS} attempts`,
      );
    }
    return r("UPDATE_BRANCH", "branch behind develop; updating");
  }
  if (s.mergeableState === "dirty") {
    // Size is decided by the rebase agent's precise post-merge conflicted-path count (the single
    // source of truth) — not a coarse changed_files heuristic here. We just cap the attempts.
    if (s.rebaseAttempts >= MAX_REBASE_ROUNDS) {
      return r(
        "ESCALATE",
        `conflict still present after ${MAX_REBASE_ROUNDS} auto-rebase attempts`,
      );
    }
    return r(
      "RESOLVE_CONFLICTS",
      "merge conflict with develop; dispatching rebase agent",
    );
  }

  // FIX: a concrete Safe-Fix Plan with blockers on this head.
  const planBlockingN = s.planBlocking || 0;
  const needsFix = s.ciAnyFailed || s.activeBlocker || planBlockingN > 0;
  if (needsFix && planBlockingN > 0) {
    if (s.rounds >= MAX_ROUNDS) {
      return r("ESCALATE", `autofix reached the ${MAX_ROUNDS}-round cap`);
    }
    if (s.fixAttempts >= MAX_FIX_DISPATCH) {
      return r(
        "ESCALATE",
        `autofix could not be dispatched after ${MAX_FIX_DISPATCH} attempts`,
      );
    }
    return r(
      "DISPATCH_FIX",
      `needs fix (${planBlockingN} blocking, round ${s.rounds + 1})`,
    );
  }

  // MERGE.
  if (s.mergeReady) return r("MERGE", "merge-ready");

  // STALE: nudge the reviewers before giving up; escalate (recoverably) only after the budget.
  if (s.minutesStuck >= STALE_MINUTES) {
    if (s.ciAllGreen && !s.bugBotsFresh && s.nudges < MAX_NUDGES) {
      return r(
        "NUDGE_REVIEWS",
        `bug-bot review missing on current head; re-running CI to re-fire reviewers (nudge ${s.nudges + 1}/${MAX_NUDGES})`,
      );
    }
    return r("ESCALATE", staleReason(s));
  }

  return r("WAIT", waitReason(s));
}

function staleReason(s) {
  if (!s.ciAllGreen)
    return s.ciAnyFailed
      ? "CI failing and no Safe-Fix Plan to act on"
      : "CI still pending";
  if (!s.bugBotsFresh)
    return "a Tier-1 review bot never posted on this head (nudges exhausted)";
  if (s.activeBlocker)
    return "a blocker is open with no Safe-Fix Plan to act on";
  return "no merge decision reached in time";
}

function waitReason(s) {
  if (!s.ciAllGreen)
    return s.ciAnyFailed
      ? "CI failing, waiting for a Safe-Fix Plan"
      : "CI pending";
  if (!s.bugBotsFresh) return "waiting for bug-bot review on current head";
  if (s.activeBlocker) return "blocker open, waiting for a Safe-Fix Plan";
  if (!s.settled) return "waiting for reviewers to settle";
  return "waiting";
}

// ----- side-effecting executors ----------------------------------------------------------

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

function updateBranch(prNumber) {
  return withRetry(() =>
    gh(["api", `/repos/${REPO}/pulls/${prNumber}/update-branch`, "-X", "PUT"]),
  );
}

function dispatchWorkflow(workflow, prNumber) {
  return withRetry(() =>
    gh([
      "workflow",
      "run",
      workflow,
      "--repo",
      REPO,
      "-f",
      `pr_number=${prNumber}`,
    ]),
  );
}

// Per-PR in-flight guard. We record a dispatch timestamp in this PR's own coord-state and treat
// a dispatch made within the TTL as "still running" so we don't queue a redundant second run (or
// double-count the attempt). This is scoped to the PR (the state comment is per-PR) — it does NOT
// block other PRs the way a repo-wide Actions query would. The per-PR concurrency group in
// autofix.yml / pr-rebase.yml still guarantees same-PR runs never execute concurrently.
const IN_FLIGHT_TTL_MIN = 20;
function recentlyDispatched(at) {
  return (
    typeof at === "string" &&
    (Date.now() - new Date(at).getTime()) / 60000 < IN_FLIGHT_TTL_MIN
  );
}

// Re-run the head's CI workflow runs so the "on CI completion" Cursor bots re-fire.
function nudgeReviewers(headSha) {
  const runs = ghJson(
    [
      `/repos/${REPO}/actions/runs?head_sha=${headSha}&per_page=50`,
      "--paginate",
    ],
    { workflow_runs: [] },
  );
  let rerun = 0;
  for (const run of runs.workflow_runs || []) {
    if (!CI_WORKFLOW_PATHS.includes(run.path)) continue;
    if (run.status !== "completed") continue;
    try {
      gh(["api", `/repos/${REPO}/actions/runs/${run.id}/rerun`, "-X", "POST"]);
      rerun += 1;
    } catch {
      /* a run may not be re-runnable; keep going */
    }
  }
  return rerun;
}

// Try a side effect a few times; transient GitHub/API blips should not trap a PR.
function withRetry(fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      fn();
      return true;
    } catch (error) {
      lastError = error;
      sleep(2000);
    }
  }
  console.log(
    `  retry exhausted: ${String(lastError?.stderr || lastError?.message || lastError).trim()}`,
  );
  return false;
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* GitHub Actions: a brief busy-wait between API retries */
  }
}

// Create the machine-owned label if the repo doesn't have it yet, so --add-label never 422s.
function ensureAutoLabel() {
  try {
    gh([
      "label",
      "create",
      AUTO_LABEL,
      "--repo",
      REPO,
      "--color",
      "FBCA04",
      "--description",
      "needs-human applied by the merge coordinator; auto-cleared when the blocker resolves",
      "--force",
    ]);
  } catch {
    /* label already exists or cannot be created; --add-label will surface a real problem */
  }
}

function escalate(prNumber, reason, headSha, state) {
  ensureAutoLabel();
  gh([
    "pr",
    "comment",
    String(prNumber),
    "--repo",
    REPO,
    "--body",
    `⚠️ Merge coordinator pausing automated handling: ${reason}. Labeling \`${SKIP_LABEL}\`. ` +
      `This is auto-recoverable — pushing a new commit (or the blocker clearing) un-parks it.`,
  ]);
  gh([
    "issue",
    "edit",
    String(prNumber),
    "--repo",
    REPO,
    "--add-label",
    `${SKIP_LABEL},${AUTO_LABEL}`,
  ]);
  state.escalatedHead = headSha;
  saveState(prNumber, state);
}

function clearEscalation(prNumber, state) {
  gh([
    "issue",
    "edit",
    String(prNumber),
    "--repo",
    REPO,
    "--remove-label",
    `${SKIP_LABEL},${AUTO_LABEL}`,
  ]);
  gh([
    "pr",
    "comment",
    String(prNumber),
    "--repo",
    REPO,
    "--body",
    "✅ Merge coordinator resuming automated handling — the earlier blocker is no longer present.",
  ]);
  state.escalatedHead = null;
  saveState(prNumber, state);
}

// ----- gather + run ----------------------------------------------------------------------

function gatherState(number) {
  const pr = ghJson([`/repos/${REPO}/pulls/${number}`], null);
  if (!pr || pr.state !== "open" || pr.draft || pr.base?.ref !== BASE) {
    return { candidate: false };
  }

  const issue = ghJson([`/repos/${REPO}/issues/${number}`], {});
  const headSha = pr.head?.sha;
  const headDate = headCommitDate(headSha);
  if (!headSha || !headDate) {
    return { candidate: false, reason: "no head" };
  }

  const fresh = freshTrustedReviews(number, headSha);
  const bugBotsFresh = BUG_BOT_TITLES.every((title) =>
    fresh.some((rv) => isTitled(rv.body, title)),
  );
  const activeBlocker = fresh.some((rv) => isBlocking(severityOf(rv.body)));
  const planReview = [...fresh]
    .reverse()
    .find((rv) => isTitled(rv.body, PLAN_TITLE));
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
  const minutesStuck = (Date.now() - settleAnchor) / 60000;

  const commits = ghJson(
    [`/repos/${REPO}/pulls/${number}/commits?per_page=100`, "--paginate"],
    [],
  );
  const rounds = commits.filter((c) =>
    AUTOFIX_COMMIT.test(c.commit?.message || ""),
  ).length;

  const planClear = planBlocking === null || planBlocking === 0;
  const mergeableState = pr.mergeable_state || null;
  // Only merge/clear when GitHub itself says the PR is actually mergeable. "behind"/"dirty" are
  // handled earlier; "blocked" (e.g. unresolved threads) and "unknown" must not arm a merge.
  const mergeableClean =
    mergeableState === "clean" || mergeableState === "unstable";
  const mergeReady =
    ci.allGreen &&
    bugBotsFresh &&
    !activeBlocker &&
    planClear &&
    settled &&
    mergeableClean;

  const state = loadState(number, headSha);

  return {
    candidate: true,
    head: headSha,
    mergeableState,
    autoEscalated: hasLabel(issue, SKIP_LABEL) && hasLabel(issue, AUTO_LABEL),
    humanParked: hasLabel(issue, SKIP_LABEL) && !hasLabel(issue, AUTO_LABEL),
    escalatedHead: state.escalatedHead,
    ciAllGreen: ci.allGreen,
    ciAnyFailed: ci.anyFailed,
    bugBotsFresh,
    activeBlocker,
    planBlocking,
    settled,
    minutesStuck,
    mergeReady,
    rounds,
    fixAttempts: state.fixAttempts,
    rebaseAttempts: state.rebaseAttempts,
    updateAttempts: state.updateAttempts,
    nudges: state.nudges,
    _state: state,
  };
}

function evaluatePr(number) {
  const s = gatherState(number);
  if (!s.candidate) {
    console.log(`#${number}: skip (not an open ${BASE} PR)`);
    return;
  }

  const { action, reason } = decide(s);
  const state = s._state;

  // Adopt the current head as the escalation head for a guard/workflow escalation that never
  // recorded one — so a future push is detectable and we don't immediately un-park (see decide()).
  if (s.autoEscalated && !s.escalatedHead && action !== "CLEAR_ESCALATION") {
    state.escalatedHead = s.head;
    saveState(number, state);
  }

  switch (action) {
    case "MERGE":
      console.log(`#${number}: merge-ready → auto-merge ${armMerge(number)}`);
      return;
    case "UPDATE_BRANCH": {
      const updated = updateBranch(number);
      if (!updated) {
        // Count failures so a permanently un-updatable branch reaches the escalation cap. A
        // SUCCESS changes the head, which resets these per-head counters next tick.
        state.updateAttempts += 1;
        saveState(number, state);
      }
      console.log(
        `#${number}: ${reason} → ${updated ? "updated" : `update failed (${state.updateAttempts}/${MAX_UPDATE_ATTEMPTS})`}`,
      );
      return;
    }
    case "RESOLVE_CONFLICTS":
      if (recentlyDispatched(state.inflightRebaseAt)) {
        console.log(`#${number}: rebase recently dispatched — waiting`);
      } else {
        // Count the ATTEMPT regardless of outcome so persistent dispatch failures reach the cap.
        state.rebaseAttempts += 1;
        const ok = dispatchWorkflow("pr-rebase.yml", number);
        if (ok) state.inflightRebaseAt = new Date().toISOString();
        saveState(number, state);
        console.log(
          `#${number}: ${reason} (attempt ${state.rebaseAttempts}/${MAX_REBASE_ROUNDS})${ok ? "" : " — dispatch failed, counted toward cap"}`,
        );
      }
      return;
    case "DISPATCH_FIX":
      if (recentlyDispatched(state.inflightFixAt)) {
        console.log(`#${number}: autofix recently dispatched — waiting`);
      } else {
        state.fixAttempts += 1;
        const ok = dispatchWorkflow("autofix.yml", number);
        if (ok) state.inflightFixAt = new Date().toISOString();
        saveState(number, state);
        console.log(
          `#${number}: ${reason} → dispatched (attempt ${state.fixAttempts}/${MAX_FIX_DISPATCH})${ok ? "" : " — dispatch failed, counted toward cap"}`,
        );
      }
      return;
    case "NUDGE_REVIEWS": {
      const rerun = nudgeReviewers(s.head);
      if (rerun > 0) {
        // Only a real re-fire counts against the budget (a no-op must not burn it).
        state.nudges += 1;
        saveState(number, state);
        console.log(`#${number}: ${reason} → re-ran ${rerun} CI run(s)`);
      } else {
        escalate(
          number,
          "CI is green but no re-runnable CI run was found to re-fire the reviewers",
          s.head,
          state,
        );
        console.log(
          `#${number}: nudge found nothing to re-run → ${SKIP_LABEL}`,
        );
      }
      return;
    }
    case "ESCALATE":
      escalate(number, reason, s.head, state);
      console.log(`#${number}: ${reason} → ${SKIP_LABEL}`);
      return;
    case "CLEAR_ESCALATION":
      clearEscalation(number, state);
      console.log(`#${number}: ${reason} → cleared ${SKIP_LABEL}`);
      return;
    default:
      console.log(`#${number}: ${reason}`);
  }
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

// Only run when invoked directly, so tests can import decide() without side effects.
const invokedDirectly =
  process.argv[1] && process.argv[1].endsWith("merge-coordinator.mjs");
if (invokedDirectly) {
  main();
}
