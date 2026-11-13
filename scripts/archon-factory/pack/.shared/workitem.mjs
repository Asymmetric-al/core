// Durable work item for one authorized issue, stored as an Archon state
// document (`core/issues/<n>`). Three facts stay distinct:
//   - the assignment (owner/profile, scope and policy revisions, end state),
//   - the execution lease, held by exactly one live round run,
//   - the operator control (run / hold / stop), which only operators change.
// Every function here is pure; callers perform the conditional write.
import { hasUnconfirmedCleanup } from "./cleanup-state.mjs";
import { DEFAULT_LIMITS } from "./config.mjs";
import { nativeFaultRequiresHold } from "./native-faults.mjs";

export const ROUTES = [
  "initial",
  "repair",
  "oracle",
  "review",
  "feedback",
  "deliver",
];
export const TERMINAL = new Set(["PR_READY", "MERGED", "BLOCKED", "stopped"]);
const STATUSES = new Set(["pending", "active", "waiting", ...TERMINAL]);
const END_STATES = new Set(["PR_READY", "MERGED"]);
// Routes that only poll the published PR; they are bounded by
// maxFeedbackRounds, every other route by maxRounds.
const POLLING = new Set(["feedback", "deliver"]);
const ENDED_RUNS = new Set(["completed", "cancelled"]);
const HISTORY = 12;
const REQUESTS = 20;
const digest = /^[a-f0-9]{64}$/;
const ident = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export class Refusal extends Error {
  constructor(code, detail) {
    super(`${code}${detail ? `: ${detail}` : ""}`);
    this.name = "Refusal";
    this.code = code;
  }
}

export const issueDocument = (issue) => `core/issues/${issue}`;
const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const clip = (value, size = 600) =>
  typeof value === "string" ? value.slice(0, size) : null;

export function hasNativeFaultHold(value) {
  return (
    record(value) &&
    Object.hasOwn(value, "nativeFaults") &&
    (nativeFaultRequiresHold(value.nativeFaults) ||
      !value.run?.id ||
      value.nativeFaults?.runId !== value.run.id)
  );
}

export function validWorkItem(value) {
  return (
    record(value) &&
    value.v === 1 &&
    Number.isSafeInteger(value.issue) &&
    value.issue > 0 &&
    record(value.assignment) &&
    ident.test(value.assignment.id ?? "") &&
    typeof value.assignment.owner === "string" &&
    digest.test(value.assignment.profileDigest ?? "") &&
    digest.test(value.assignment.scopeRevision ?? "") &&
    digest.test(value.assignment.policyRevision ?? "") &&
    END_STATES.has(value.assignment.endState) &&
    ["run", "hold", "stop"].includes(value.control) &&
    STATUSES.has(value.status) &&
    Number.isSafeInteger(value.round) &&
    value.round >= 0 &&
    (value.route === null || ROUTES.includes(value.route)) &&
    Array.isArray(value.history) &&
    Array.isArray(value.areas)
  );
}

// The lane for a newly admitted issue: the lowest one no live issue holds.
// With every lane held it shares the first, which only queues.
export function freeLane(heldLanes, lanes) {
  const count = Number.isSafeInteger(lanes) && lanes > 0 ? lanes : 1;
  const held = new Set(heldLanes);
  for (let lane = 1; lane <= count; lane += 1) if (!held.has(lane)) return lane;
  return 1;
}

export function createAssignment({
  issue,
  assignmentId,
  owner,
  profileDigest,
  scopeRevision,
  policyRevision,
  endState,
  areas = [],
  reason,
  by,
  now,
  lane,
}) {
  const value = {
    v: 1,
    issue,
    // The delivery lane this issue's rounds run on (webhook.mjs).
    ...(Number.isSafeInteger(lane) && lane > 0 ? { lane } : {}),
    assignment: {
      id: assignmentId,
      owner,
      profileDigest,
      scopeRevision,
      policyRevision,
      endState,
      assignedAt: now,
      assignedBy: by,
      reason: clip(reason, 1200),
    },
    control: "run",
    controlReason: null,
    status: "pending",
    route: "initial",
    round: 0,
    run: null,
    branch: null,
    base: null,
    head: null,
    acceptance: null,
    reviews: null,
    final: null,
    pr: null,
    brief: null,
    blocker: null,
    workRounds: 0,
    feedbackRounds: 0,
    repeats: {},
    parked: null,
    areas: [...new Set(areas)].sort(),
    history: [],
    requests: [],
    updatedAt: now,
  };
  if (!validWorkItem(value)) throw new Refusal("invalid-assignment");
  return value;
}

function current(document) {
  if (!record(document) || !Number.isSafeInteger(document.revision))
    throw new Refusal("invalid-observation");
  if (document.value === null || document.value === undefined)
    throw new Refusal("no-assignment");
  if (!validWorkItem(document.value)) throw new Refusal("malformed-work-item");
  return document.value;
}

// The dispatch key of the round that starts next. Archon's webhook dedup is
// durable, so the key carries the work item's revision: any write to the item
// (a finish, a refused claim's marker, an operator control) gives the next
// start a new key, and replaying an unchanged item's start stays a no-op.
export function deliveryKey(value, revision) {
  if (!Number.isSafeInteger(revision) || revision < 0)
    throw new Refusal("invalid-revision", String(revision));
  if (
    !ident.test(value?.assignment?.id ?? "") ||
    !Number.isSafeInteger(value.round)
  )
    throw new Refusal("malformed-work-item");
  return `${value.assignment.id}:r${value.round + 1}:v${revision}`;
}

// A round run takes the issue lease. A failed run that resumes keeps its own
// lease; nobody can take a lease another live run holds.
export function planClaim(
  document,
  { runId, assignmentId, policyRevision, now },
) {
  const value = current(document);
  if (hasUnconfirmedCleanup(value)) throw new Refusal("cleanup-unconfirmed");
  if (hasNativeFaultHold(value)) throw new Refusal("native-fault-held");
  if (!ident.test(runId ?? "")) throw new Refusal("invalid-run");
  if (value.assignment.id !== assignmentId)
    throw new Refusal("assignment-mismatch");
  const lease = document.lease;
  const resuming =
    value.status === "active" &&
    value.run?.id === runId &&
    lease?.runId === runId;
  if (lease?.live && lease.runId !== runId)
    throw new Refusal("lease-held", lease.runId);
  if (value.control === "stop") throw new Refusal("stopped");
  if (value.control === "hold") throw new Refusal("held");
  if (!resuming) {
    if (TERMINAL.has(value.status)) throw new Refusal("terminal", value.status);
    if (value.status === "active")
      throw new Refusal("unreconciled-run", value.run?.id);
    if (!value.route) throw new Refusal("no-route");
  }
  if (value.assignment.policyRevision !== policyRevision)
    throw new Refusal("policy-changed");
  const next = structuredClone(value);
  if (!resuming) {
    next.round += 1;
    // The head the round starts from tells record whether it made progress.
    next.run = {
      id: runId,
      startedAt: now,
      route: value.route,
      head: value.head ?? null,
    };
    next.status = "active";
    next.parked = null;
  }
  next.updatedAt = now;
  return {
    name: issueDocument(value.issue),
    ifRevision: document.revision,
    value: next,
    lease: "take",
    resuming,
  };
}

// A round whose claim refused never took the lease. For an idle item it
// records a marker, so the item's revision (and with it the next dispatch key)
// changes; a release the installed policy no longer matches is BLOCKED pending
// an explicit transition. Anything another run or an operator owns is left alone.
export function planClaimRefusal(
  document,
  { runId, assignmentId, code, detail, now },
) {
  const value = current(document);
  if (
    document.lease?.live ||
    !["pending", "waiting"].includes(value.status) ||
    value.control !== "run" ||
    value.assignment.id !== assignmentId
  )
    return { noop: true, value };
  const next = structuredClone(value);
  if (code === "policy-changed") {
    const route = value.route ?? lastRoute(value) ?? "initial";
    next.status = "BLOCKED";
    next.route = null;
    next.blocker = {
      code: "policy-changed",
      detail: clip(detail, 1200),
      recovery:
        "The installed factory release changed; the retained assignment requires an explicit policy transition (issue <n> adopt-policy, then retry), not retry, reopen or release alone",
      route,
      at: now,
    };
    next.history = [
      ...next.history,
      {
        round: value.round,
        run: clip(runId, 128),
        route,
        outcome: "BLOCKED",
        next: null,
        at: now,
        summary: clip(detail, 500),
      },
    ].slice(-HISTORY);
  }
  next.lastRefusal = { run: clip(runId, 128), code: clip(code, 80), at: now };
  next.updatedAt = now;
  return {
    name: issueDocument(value.issue),
    ifRevision: document.revision,
    value: next,
    lease: undefined,
  };
}

const CHECKPOINT_FIELDS = new Set([
  "branch",
  "base",
  "head",
  "acceptance",
  "reviews",
  "final",
  "pr",
  "brief",
]);

export function planCheckpoint(document, { runId, fields, now }) {
  const value = current(document);
  if (value.run?.id !== runId || document.lease?.runId !== runId)
    throw new Refusal("not-owner");
  const next = structuredClone(value);
  for (const [key, field] of Object.entries(fields ?? {})) {
    if (!CHECKPOINT_FIELDS.has(key))
      throw new Refusal("field-not-allowed", key);
    next[key] = field;
  }
  next.updatedAt = now;
  return {
    name: issueDocument(value.issue),
    ifRevision: document.revision,
    value: next,
    lease: undefined,
  };
}

const OUTCOMES = new Set([
  "continue",
  "PR_READY",
  "MERGED",
  "BLOCKED",
  "held",
  "parked",
  "stopped",
]);

const validParked = (parked) =>
  record(parked) &&
  Array.isArray(parked.areas) &&
  parked.areas.length > 0 &&
  parked.areas.every((area) => typeof area === "string" && area.length > 0) &&
  record(parked.holders);

// Settles the run recorded on `value` into `next`: status, route, budgets,
// the consecutive no-progress streak, blocker and one history entry.
function settle(
  value,
  next,
  {
    runId,
    now,
    outcome,
    route,
    blocker,
    summary,
    fingerprint,
    external,
    parked,
    limits,
  },
) {
  const budget = { ...DEFAULT_LIMITS, ...(limits ?? {}) };
  const ran = value.run.route;
  let final = outcome;
  let finalBlocker = blocker ?? null;
  let resume = ran;
  if (outcome === "continue" || outcome === "reconciled") {
    resume = route;
    // Only consecutive repeats without a new head count as no progress.
    const startHead = Object.hasOwn(value.run, "head")
      ? value.run.head
      : value.head;
    if (fingerprint) {
      const streak =
        next.head === startHead ? (value.repeats?.[fingerprint] ?? 0) : 0;
      const seen = streak + 1;
      next.repeats = { [fingerprint]: seen };
      if (seen > budget.noProgressRepeats) {
        final = "BLOCKED";
        finalBlocker = {
          code: "no-progress",
          detail: `The same ${route} problem repeated ${seen} times without new progress.`,
          route,
        };
      }
    } else next.repeats = {};
  }
  if (final === "continue") {
    if (POLLING.has(route)) {
      next.feedbackRounds = (value.feedbackRounds ?? 0) + 1;
      if (next.feedbackRounds > budget.maxFeedbackRounds) {
        final = "BLOCKED";
        finalBlocker = {
          code: "feedback-limit",
          detail: `Waited ${budget.maxFeedbackRounds} feedback rounds without a delivery decision`,
          recovery:
            "Check the pull request's checks and reviews, then retry to wait again",
          route,
        };
      }
    } else {
      next.workRounds = (value.workRounds ?? 0) + 1;
      if (next.workRounds >= budget.maxRounds) {
        final = "BLOCKED";
        finalBlocker = {
          code: "round-limit",
          detail: `Reached ${budget.maxRounds} work rounds without delivery`,
          recovery:
            "Review the history, clarify the scope if needed, then retry",
          route,
        };
      }
    }
  }
  const blocked = final === "BLOCKED";
  next.blocker = blocked
    ? {
        code: clip(finalBlocker?.code, 80) ?? "blocked",
        detail: clip(finalBlocker?.detail, 1200),
        recovery: clip(finalBlocker?.recovery, 600),
        route: ROUTES.includes(finalBlocker?.route) ? finalBlocker.route : ran,
        at: now,
      }
    : null;
  let status = ["continue", "reconciled", "held", "parked"].includes(final)
    ? "waiting"
    : final;
  let nextRoute = status === "waiting" || status === "stopped" ? resume : null;
  // A per-issue stop that landed while the round ran settles it as stopped,
  // keeping the route reopen resumes. A merge stays a merge.
  if (value.control === "stop" && status !== "MERGED" && status !== "stopped") {
    if (blocked) nextRoute = next.blocker.route;
    status = "stopped";
    final = "stopped";
  }
  next.parked =
    final === "parked"
      ? {
          areas: [...new Set(parked.areas)].sort(),
          holders: { ...parked.holders },
          at: now,
        }
      : null;
  next.status = status;
  next.route = nextRoute;
  const mergedOutside = final === "MERGED" && external === true;
  next.history = [
    ...next.history,
    {
      round: value.round,
      run: runId,
      route: ran,
      outcome: final,
      next: nextRoute,
      at: now,
      ...(mergedOutside ? { external: true } : {}),
      summary: mergedOutside
        ? clip(
            `Merged outside the factory.${summary ? ` ${summary}` : ""}`,
            500,
          )
        : clip(summary, 500),
    },
  ].slice(-HISTORY);
  next.run = null;
  next.updatedAt = now;
  return final;
}

// The round run records how its round ended and releases its lease. A merge
// the factory did not perform (`external`) is recorded as a fact for any end
// state; a factory merge still needs an assignment that authorizes it.
export function planFinish(
  document,
  {
    runId,
    now,
    outcome,
    route = null,
    brief,
    blocker,
    summary,
    fields,
    fingerprint,
    external = false,
    parked,
    limits,
  },
) {
  const value = current(document);
  if (hasNativeFaultHold(value)) throw new Refusal("native-fault-held");
  if (value.run?.id !== runId || document.lease?.runId !== runId)
    throw new Refusal("not-owner");
  if (!OUTCOMES.has(outcome)) throw new Refusal("invalid-outcome", outcome);
  if (outcome === "continue" && !ROUTES.includes(route))
    throw new Refusal("route-required");
  if (
    outcome === "MERGED" &&
    value.assignment.endState !== "MERGED" &&
    external !== true
  )
    throw new Refusal("merge-not-authorized");
  if (outcome === "parked" && !validParked(parked))
    throw new Refusal("invalid-parked");
  const next = structuredClone(value);
  for (const [key, field] of Object.entries(fields ?? {})) {
    if (!CHECKPOINT_FIELDS.has(key))
      throw new Refusal("field-not-allowed", key);
    next[key] = field;
  }
  if (brief !== undefined) next.brief = brief;
  const final = settle(value, next, {
    runId,
    now,
    outcome,
    route,
    blocker,
    summary,
    fingerprint,
    external,
    parked,
    limits,
  });
  return {
    name: issueDocument(value.issue),
    ifRevision: document.revision,
    value: next,
    lease: "release",
    outcome: final,
  };
}

// An item left active by a run that ended without recording its round
// (cancelled, or record failed) waits again on the run's route. It never
// touches a live lease: a paused or failed run keeps its lease and can resume.
// Evidence that the run ended is the engine's terminal status for that run,
// or else the engine's own record that the run's lease ended.
// The route after a run that ended without recording its round follows the
// progress that run checkpointed, as record does after a failed node. A
// candidate it committed only needs its reviews; restarting the round would
// give the implementer nothing to change. Acceptance it defined and did not
// commit goes to the implementer: freeze commits the tests Ezra recorded,
// whichever run recorded them. Anything earlier runs the round again.
function interruptedRoute(value) {
  const { run } = value;
  if (POLLING.has(run.route) || run.route === "review") return run.route;
  if (!Object.hasOwn(run, "head")) return run.route;
  if ((value.head ?? null) !== run.head) return "review";
  if (value.acceptance?.run === run.id) return "repair";
  return run.route;
}

export function planReconcile(document, { now, runStatus, limits }) {
  const value = current(document);
  if (hasUnconfirmedCleanup(value)) throw new Refusal("cleanup-unconfirmed");
  if (hasNativeFaultHold(value)) throw new Refusal("native-fault-held");
  if (value.status !== "active" || !value.run)
    throw new Refusal("not-active", value.status);
  const lease = document.lease;
  if (lease?.live) throw new Refusal("lease-live", lease.runId);
  let ended;
  if (runStatus) {
    if (runStatus.id !== value.run.id)
      throw new Refusal("run-changed", runStatus.id);
    if (!ENDED_RUNS.has(runStatus.status))
      throw new Refusal("run-not-terminal", runStatus.status);
    ended = runStatus.status;
  } else if (lease && lease.runId === value.run.id) ended = "lease ended";
  else throw new Refusal("run-unconfirmed");
  const next = structuredClone(value);
  const final = settle(value, next, {
    runId: value.run.id,
    now,
    outcome: "reconciled",
    route: interruptedRoute(value),
    fingerprint: "unfinished-run",
    limits,
    summary: `Run ${value.run.id} ended (${ended}) without recording its round`,
  });
  return {
    name: issueDocument(value.issue),
    ifRevision: document.revision,
    value: next,
    lease: undefined,
    outcome: final,
  };
}

// A pull request the factory reported ready and somebody else merged. The
// factory does not follow a ready pull request for anything else; this one
// fact ends the item, so its status is true and its workspace can be pruned.
// It is an observation, not an action: it needs no run and no policy match,
// and it is refused for anything but a settled PR_READY item without holds.
export function planObservedMerge(document, { pr, targetBranch, by, now }) {
  const value = current(document);
  if (hasUnconfirmedCleanup(value)) throw new Refusal("cleanup-unconfirmed");
  if (hasNativeFaultHold(value)) throw new Refusal("native-fault-held");
  if (value.status !== "PR_READY" || value.run)
    throw new Refusal("not-ready", value.status);
  if (!Number.isSafeInteger(value.pr?.number) || pr?.number !== value.pr.number)
    throw new Refusal("pr-changed");
  if (
    pr.merged !== true ||
    !/^[0-9a-f]{40}$/.test(pr.merge_commit_sha ?? "") ||
    pr.base?.ref !== targetBranch
  )
    throw new Refusal("not-merged");
  const next = structuredClone(value);
  next.status = "MERGED";
  next.route = null;
  next.blocker = null;
  next.pr = {
    ...value.pr,
    mergedAt: clip(pr.merged_at, 64),
    mergeCommit: pr.merge_commit_sha,
    mergedBy: "external",
  };
  next.history = [
    ...next.history,
    {
      round: value.round,
      run: clip(by, 200),
      route: null,
      outcome: "MERGED",
      next: null,
      at: now,
      external: true,
      summary: clip(
        `Merged outside the factory by ${pr.merged_by?.login ?? "an unnamed account"} at ${pr.merged_at}; seen by the intake pass.`,
        500,
      ),
    },
  ].slice(-HISTORY);
  next.updatedAt = now;
  return {
    name: issueDocument(value.issue),
    ifRevision: document.revision,
    value: next,
    lease: undefined,
    outcome: "MERGED",
  };
}

const RECOVERY_CONTROLS = new Set(["retry", "reopen", "release"]);
// The explicit policy transition: the one control that moves a retained
// assignment to the installed release. It is refused under the same holds and
// identity checks as the recovery controls, only for a settled item no run
// owns (BLOCKED or stopped), and it starts nothing. Reviews and final
// acceptance were earned under the old release, so they are dropped and a
// recorded candidate is reviewed again before it is published or merged.
const TRANSITION = "adopt-policy";
const TRANSITIONS = 16;
const GUARDED = (action) =>
  RECOVERY_CONTROLS.has(action) || action === TRANSITION;

// Operator controls. They never touch the lease: a held issue's live round
// finishes its current permitted step and the next claim refuses. retry,
// reopen and release require the assignment's original installed policy.
export function planControl(
  document,
  {
    action,
    reason,
    by,
    now,
    requestId,
    runStatus,
    limits,
    installed,
    // adopt-policy only: the profile digest verified for the installed release
    // after the retained one was proven against the previous release's record.
    identity,
  },
) {
  const value = current(document);
  if (GUARDED(action) && hasUnconfirmedCleanup(value))
    throw new Refusal("cleanup-unconfirmed");
  if ((GUARDED(action) || action === "reconcile") && hasNativeFaultHold(value))
    throw new Refusal("native-fault-held");
  if (!ident.test(requestId ?? "")) throw new Refusal("request-id-required");
  if (value.requests.some((request) => request.id === requestId))
    return { noop: true, value };
  if (
    RECOVERY_CONTROLS.has(action) &&
    digest.test(installed?.profileDigest ?? "") &&
    installed.profileDigest !== value.assignment.profileDigest
  )
    throw new Refusal("identity-drift");
  if (GUARDED(action)) {
    if (
      typeof installed?.policyRevision !== "string" ||
      !digest.test(installed.policyRevision)
    )
      throw new Refusal(
        "policy-unavailable",
        "Cannot verify the installed policy; retained assignment unchanged",
      );
    const same = installed.policyRevision === value.assignment.policyRevision;
    if (action === TRANSITION && same)
      throw new Refusal(
        "policy-current",
        "The assignment is already bound to the installed release",
      );
    if (action !== TRANSITION && !same)
      throw new Refusal(
        "policy-transition-required",
        "Installed policy differs from the retained assignment; an explicit transition (issue <n> adopt-policy) is required, not retry, reopen or release",
      );
  }
  let next = structuredClone(value);
  let transition = null;
  if (action === "hold") {
    if (value.control === "stop") throw new Refusal("stopped");
    next.control = "hold";
  } else if (action === "release") {
    if (value.control !== "hold") throw new Refusal("not-held");
    next.control = "run";
  } else if (action === "stop") {
    next.control = "stop";
    const lease = document.lease;
    if (value.status === "active") {
      // A run that ended without recording no longer owns the item.
      if (
        value.run &&
        lease?.runId === value.run.id &&
        lease.live === false &&
        !hasNativeFaultHold(value)
      ) {
        next.status = "stopped";
        next.route = interruptedRoute(value);
        next.run = null;
        next.history = [
          ...next.history,
          {
            round: value.round,
            run: value.run.id,
            route: value.run.route,
            outcome: "stopped",
            next: next.route,
            at: now,
            summary: `Run ${value.run.id} ended without recording its round; stopped by ${clip(by, 80)}`,
          },
        ].slice(-HISTORY);
      }
      // A merged issue stays MERGED; stopping it only prevents further rounds.
    } else if (value.status !== "MERGED") next.status = "stopped";
  } else if (action === "retry") {
    if (value.control !== "run")
      throw new Refusal("not-running", value.control);
    if (value.status !== "BLOCKED")
      throw new Refusal("not-blocked", value.status);
    next.status = "pending";
    next.route = value.blocker?.route ?? lastRoute(value) ?? "initial";
    resetBudgets(next);
  } else if (action === "reopen") {
    // Reopen is the one explicit way out of a durable stop; a hold stays a hold.
    if (value.control === "hold")
      throw new Refusal("not-running", value.control);
    if (!["PR_READY", "stopped"].includes(value.status))
      throw new Refusal("not-reopenable", value.status);
    next.control = "run";
    next.status = "pending";
    next.route =
      value.route ??
      value.blocker?.route ??
      (value.pr ? "feedback" : (lastRoute(value) ?? "initial"));
    resetBudgets(next);
  } else if (action === "reconcile") {
    if (value.status === "active")
      next = planReconcile(document, { now, runStatus, limits }).value;
    else if (!["pending", "waiting"].includes(value.status))
      throw new Refusal("not-active", value.status);
    // An idle item's recorded request alone moves its revision, which re-arms
    // its dispatch key.
  } else if (action === TRANSITION) {
    if (document.lease?.live)
      throw new Refusal("lease-held", document.lease.runId);
    if (value.status === "active" || value.run)
      throw new Refusal("unreconciled-run", value.run?.id);
    if (!["BLOCKED", "stopped"].includes(value.status))
      throw new Refusal("not-adoptable", value.status);
    // The profile digest binds the release, so it moves with it, and only to
    // a digest the caller verified for this account.
    if (!digest.test(identity?.profileDigest ?? ""))
      throw new Refusal("identity-proof-unavailable");
    transition = {
      from: value.assignment.policyRevision,
      to: installed.policyRevision,
      profile: {
        from: value.assignment.profileDigest,
        to: identity.profileDigest,
      },
    };
    // The predecessor binding is kept on the assignment, not overwritten.
    next.assignment = {
      ...value.assignment,
      policyRevision: transition.to,
      profileDigest: identity.profileDigest,
      transitions: [
        ...(Array.isArray(value.assignment.transitions)
          ? value.assignment.transitions
          : []),
        { ...transition, request: requestId, by: clip(by, 80), at: now },
      ].slice(-TRANSITIONS),
    };
    next.reviews = null;
    next.final = null;
    if (value.head) {
      if (value.status === "BLOCKED")
        next.blocker = { ...value.blocker, route: "review" };
      else next.route = "review";
    }
  } else throw new Refusal("unknown-action", action);
  next.controlReason = clip(reason, 600);
  next.requests = [
    ...next.requests,
    {
      id: requestId,
      action,
      by: clip(by, 80),
      at: now,
      ...(transition
        ? {
            policy: { from: transition.from, to: transition.to },
            profile: transition.profile,
          }
        : {}),
    },
  ].slice(-REQUESTS);
  next.updatedAt = now;
  return {
    name: issueDocument(value.issue),
    ifRevision: document.revision,
    value: next,
    lease: undefined,
  };
}

function resetBudgets(next) {
  next.blocker = null;
  next.repeats = {};
  next.workRounds = 0;
  next.feedbackRounds = 0;
  next.parked = null;
}

function lastRoute(value) {
  for (let index = value.history.length - 1; index >= 0; index -= 1)
    if (ROUTES.includes(value.history[index].route))
      return value.history[index].route;
  return null;
}

// The intake sweep's decision for one observed work item: start its next
// round under the item's dispatch key, reconcile a run that ended without
// recording, or leave it alone. Reconciling is bookkeeping and happens even
// while the factory is stopped.
export function planSweep(document, { factory, reservations = {} } = {}) {
  const value = document?.value;
  if (!validWorkItem(value) || !Number.isSafeInteger(document.revision))
    return { action: "skip", reason: "malformed" };
  if (hasUnconfirmedCleanup(value))
    return { action: "skip", reason: "cleanup-unconfirmed" };
  if (hasNativeFaultHold(value))
    return { action: "skip", reason: "native-fault-held" };
  const lease = document.lease;
  if (value.status === "active") {
    if (lease?.live) return { action: "skip", reason: "live" };
    if (!value.run?.id) return { action: "skip", reason: "no-run" };
    return { action: "reconcile", runId: value.run.id };
  }
  if (!["pending", "waiting"].includes(value.status))
    return { action: "skip", reason: value.status };
  if (value.control !== "run") return { action: "skip", reason: value.control };
  if (lease?.live) return { action: "skip", reason: "live" };
  const permitted = factoryPermitsRound(factory);
  if (!permitted.ok) return { action: "skip", reason: permitted.code };
  if (!value.route) return { action: "skip", reason: "no-route" };
  const held = heldElsewhere(
    value.parked?.areas ?? [],
    reservations,
    value.issue,
  );
  if (held.length) return { action: "skip", reason: "parked", areas: held };
  return { action: "fire", deliveryId: deliveryKey(value, document.revision) };
}

// Shared-area reservations live in `core/reservations` as
// { v: 1, areas: { [area]: issueNumber } }.
export const RESERVATIONS = "core/reservations";

export function heldElsewhere(areas, reservations, issue) {
  const held = record(reservations) ? reservations : {};
  return [...new Set(areas ?? [])]
    .filter(
      (area) =>
        Object.hasOwn(held, area) && Number(held[area]) !== Number(issue),
    )
    .sort();
}

export function planRelease(document, issue) {
  const areas = { ...(document?.value?.areas ?? {}) };
  let changed = false;
  for (const [area, holder] of Object.entries(areas))
    if (Number(holder) === Number(issue)) {
      delete areas[area];
      changed = true;
    }
  if (!changed) return { noop: true };
  return {
    name: RESERVATIONS,
    ifRevision: document.revision,
    value: { v: 1, areas },
    lease: undefined,
  };
}

// Factory-wide controls live in `core/factory`.
export function factoryDefaults(now) {
  return {
    v: 1,
    intake: "paused",
    mode: "run",
    mergeHold: false,
    reason: "Installed; no scope admitted yet.",
    updatedAt: now,
    updatedBy: "installer",
    requests: [],
  };
}

export function planFactoryControl(
  document,
  { action, reason, by, now, requestId },
) {
  const value =
    document.value && document.value.v === 1
      ? document.value
      : factoryDefaults(now);
  if (!ident.test(requestId ?? "")) throw new Refusal("request-id-required");
  if ((value.requests ?? []).some((request) => request.id === requestId))
    return { noop: true, value };
  const next = structuredClone(value);
  const actions = {
    "pause-intake": () => (next.intake = "paused"),
    "resume-intake": () => {
      if (value.mode === "stop") throw new Refusal("factory-stopped");
      next.intake = "open";
    },
    drain: () => {
      next.intake = "paused";
      next.mode = "drain";
    },
    stop: () => {
      next.intake = "paused";
      next.mode = "stop";
    },
    resume: () => (next.mode = "run"),
    "hold-merge": () => (next.mergeHold = true),
    "release-merge": () => (next.mergeHold = false),
  };
  if (!actions[action]) throw new Refusal("unknown-action", action);
  actions[action]();
  next.reason = clip(reason, 600);
  next.updatedAt = now;
  next.updatedBy = clip(by, 80);
  next.requests = [
    ...(next.requests ?? []),
    { id: requestId, action, by: clip(by, 80), at: now },
  ].slice(-REQUESTS);
  return {
    name: "core/factory",
    ifRevision: document.revision,
    value: next,
    lease: undefined,
  };
}

// A round may continue only if the factory itself permits it. Drain lets
// already admitted lineages proceed; stop and a per-issue hold do not.
export function factoryPermitsRound(factory) {
  if (!factory || factory.v !== 1)
    return { ok: false, code: "factory-unconfigured" };
  if (factory.mode === "stop") return { ok: false, code: "factory-stopped" };
  if (!["run", "drain"].includes(factory.mode))
    return { ok: false, code: "factory-mode-unknown" };
  return { ok: true };
}

export function factoryPermitsIntake(factory) {
  if (!factory || factory.v !== 1)
    return { ok: false, code: "factory-unconfigured" };
  if (factory.mode !== "run")
    return { ok: false, code: `factory-${factory.mode}` };
  if (factory.intake !== "open") return { ok: false, code: "intake-paused" };
  return { ok: true };
}
