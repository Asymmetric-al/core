// Durable lifecycle timing. Every duration comes from server timestamps: the
// engine's run and node events and the work item's own records. The browser
// clock only extends intervals that are still open, so a refresh, sleep or
// reconnect recomputes the same closed totals. Spans are merged before they
// are measured, so parallel reviews and overlapping executor time count once.
import { NODE_ROLES } from "./round";

export type Span = { start: number; end: number };

function time(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Merge overlapping spans; zero-length and malformed spans are dropped. */
export function union(spans: readonly Span[]): Span[] {
  const sorted = spans
    .filter(
      (span) =>
        Number.isFinite(span.start) &&
        Number.isFinite(span.end) &&
        span.end > span.start,
    )
    .map((span) => ({ ...span }))
    .sort((left, right) => left.start - right.start);
  const merged: Span[] = [];
  for (const span of sorted) {
    const last = merged.at(-1);
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push(span);
  }
  return merged;
}

export function measure(spans: readonly Span[]) {
  return union(spans).reduce((total, span) => total + span.end - span.start, 0);
}

export function intersect(
  left: readonly Span[],
  right: readonly Span[],
): Span[] {
  const a = union(left);
  const b = union(right);
  const result: Span[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const start = Math.max(a[i].start, b[j].start);
    const end = Math.min(a[i].end, b[j].end);
    if (end > start) result.push({ start, end });
    if (a[i].end < b[j].end) i += 1;
    else j += 1;
  }
  return result;
}

export function subtract(base: readonly Span[], cut: readonly Span[]): Span[] {
  const cuts = union(cut);
  const result: Span[] = [];
  for (const span of union(base)) {
    let start = span.start;
    for (const piece of cuts) {
      if (piece.end <= start || piece.start >= span.end) continue;
      if (piece.start > start) result.push({ start, end: piece.start });
      start = Math.max(start, piece.end);
      if (start >= span.end) break;
    }
    if (start < span.end) result.push({ start, end: span.end });
  }
  return result;
}

// ---------------------------------------------------------------------------
// One run: node attempts, waits and uncertain gaps from lifecycle events.
// ---------------------------------------------------------------------------

export type NodeAttempt = {
  node: string;
  start: string;
  end: string | null;
  outcome: string;
};
export type RunWait = { kind: string; start: string; end: string | null };
export type UncertainGap = { start: string; end: string; reason: string };
export type RunIntervals = {
  attempts: NodeAttempt[];
  waits: RunWait[];
  gaps: UncertainGap[];
  /** True when the run had more records than the Console keeps. */
  truncated: boolean;
};

type LifecycleEvent = {
  event_type: string;
  step_name: string | null;
  created_at: string;
};

const CLOSES_NODE: Record<string, string> = {
  node_completed: "completed",
  node_failed: "failed",
  node_skipped: "skipped",
  node_skipped_prior_success: "skipped",
};
const OPENS_WAIT: Record<string, string> = {
  wait_started: "wait",
  approval_requested: "approval",
  quota_resume_scheduled: "quota",
};
const CLOSES_WAIT: Record<string, string> = {
  wait_completed: "wait",
  wait_expired: "wait",
  wait_answered: "wait",
  wait_signaled: "wait",
  approval_received: "approval",
  quota_resume_triggered: "quota",
  quota_resume_exhausted: "quota",
  quota_resume_skipped: "quota",
};
const ENDS_RUN = new Set(["workflow_completed", "workflow_cancelled"]);
const RECORD_LIMIT = 400;

export const RESUMED_UNKNOWN =
  "The engine resumed a run it had not recorded as stopped (for example after a restart); what ran in between is not known.";

/**
 * Rebuild every node attempt (retries included), wait and uncertain gap of
 * one run from its lifecycle events. A resume after a recorded failure is a
 * wait; a resume of a run that was never recorded as stopped (an engine
 * restart) leaves a gap whose content is unknown, never counted as running.
 */
export function runIntervals(
  events: readonly LifecycleEvent[],
  run: { status: string; completedAt: string | null },
): RunIntervals {
  const ordered = events
    .map((event, index) => ({ event, index, at: time(event.created_at) }))
    .filter((entry) => entry.at !== null)
    .sort((left, right) => left.at! - right.at! || left.index - right.index);
  const attempts: NodeAttempt[] = [];
  const waits: RunWait[] = [];
  const gaps: UncertainGap[] = [];
  const open = new Map<string, NodeAttempt>();
  const suspended = new Map<string, RunWait>();
  let failed: RunWait | null = null;
  let last: string | null = null;

  const closeSuspensions = (stamp: string) => {
    for (const wait of suspended.values()) wait.end = stamp;
    suspended.clear();
  };
  const closeEverything = (stamp: string) => {
    for (const attempt of open.values()) attempt.end = stamp;
    open.clear();
    for (const wait of waits) if (wait.end === null) wait.end = stamp;
    suspended.clear();
    failed = null;
  };

  for (const { event } of ordered) {
    const type = event.event_type;
    const step = event.step_name;
    const stamp = event.created_at;
    if (type === "workflow_resumed") {
      if (failed) {
        failed.end = stamp;
        failed = null;
      } else if (last && time(last)! < time(stamp)!) {
        gaps.push({ start: last, end: stamp, reason: RESUMED_UNKNOWN });
        for (const attempt of open.values()) {
          attempt.end = last;
          attempt.outcome = "interrupted";
        }
        open.clear();
      }
      closeSuspensions(stamp);
    } else if (type === "workflow_unpaused") {
      closeSuspensions(stamp);
      for (const wait of waits)
        if (wait.end === null && wait.kind !== "failed") wait.end = stamp;
    } else if (type === "workflow_failed") {
      for (const attempt of open.values()) {
        attempt.end = stamp;
        attempt.outcome = "failed";
      }
      open.clear();
      if (!failed) {
        failed = { kind: "failed", start: stamp, end: null };
        waits.push(failed);
      }
    } else if (ENDS_RUN.has(type)) {
      closeEverything(stamp);
    } else if (type === "node_started" && step) {
      const previous = open.get(step);
      if (previous) {
        previous.end = stamp;
        previous.outcome = "interrupted";
      }
      const pause = suspended.get(step);
      if (pause) {
        pause.end = stamp;
        suspended.delete(step);
      }
      const attempt = {
        node: step,
        start: stamp,
        end: null,
        outcome: "running",
      };
      attempts.push(attempt);
      open.set(step, attempt);
    } else if (CLOSES_NODE[type] && step) {
      const attempt = open.get(step);
      if (attempt) {
        attempt.end = stamp;
        attempt.outcome = CLOSES_NODE[type];
        open.delete(step);
      }
      const pause = suspended.get(step);
      if (pause) {
        pause.end = stamp;
        suspended.delete(step);
      }
    } else if (type === "node_suspended" && step) {
      const attempt = open.get(step);
      if (attempt) {
        attempt.end = stamp;
        attempt.outcome = "suspended";
        open.delete(step);
      }
      if (!suspended.has(step)) {
        const wait = { kind: "suspended", start: stamp, end: null };
        waits.push(wait);
        suspended.set(step, wait);
      }
    } else if (OPENS_WAIT[type]) {
      waits.push({ kind: OPENS_WAIT[type], start: stamp, end: null });
    } else if (CLOSES_WAIT[type]) {
      const kind = CLOSES_WAIT[type];
      const wait = [...waits]
        .reverse()
        .find((entry) => entry.end === null && entry.kind === kind);
      if (wait) wait.end = stamp;
    }
    last = stamp;
  }
  const terminal = ["completed", "failed", "cancelled"].includes(run.status);
  if (terminal && run.completedAt) {
    for (const attempt of open.values()) attempt.end = run.completedAt;
    for (const wait of waits)
      if (wait.end === null && !(run.status === "failed" && wait === failed))
        wait.end = run.completedAt;
  }
  if (
    run.status === "paused" &&
    last &&
    !waits.some((wait) => wait.end === null)
  )
    waits.push({ kind: "paused", start: last, end: null });
  const truncated =
    attempts.length > RECORD_LIMIT ||
    waits.length > RECORD_LIMIT ||
    gaps.length > RECORD_LIMIT;
  return {
    attempts: attempts.slice(-RECORD_LIMIT),
    waits: waits.slice(-RECORD_LIMIT),
    gaps: gaps.slice(-RECORD_LIMIT),
    truncated,
  };
}

// ---------------------------------------------------------------------------
// One issue: wall time, this attempt, running vs waiting, checks, roles.
// ---------------------------------------------------------------------------

/** One delivery round of an issue, with the engine's records when read. */
export type RoundTrace = {
  round: number | null;
  run: string;
  route: string | null;
  startedAt: string | null;
  /** Null while the round is still open. */
  endedAt: string | null;
  status: string | null;
  intervals: RunIntervals | null;
  /** Why the engine's records for this round are missing. */
  error: string | null;
};

export type RoleTotal = { role: string; ms: number; attempts: number };

export type AttemptState =
  "running" | "waiting" | "between steps" | "finished" | "not observed";

export type IssueTiming = {
  wall: {
    ms: number | null;
    startedAt: string | null;
    endedAt: string | null;
    open: boolean;
  };
  attempt: {
    round: number | null;
    run: string;
    route: string | null;
    startedAt: string | null;
    endedAt: string | null;
    open: boolean;
    ms: number | null;
    state: AttemptState;
    /** The role(s) running, or the kind of wait. */
    detail: string | null;
    runningMs: number | null;
    waitingMs: number | null;
    localChecksMs: number | null;
    roles: RoleTotal[];
  } | null;
  running: { ms: number; complete: boolean };
  waiting: {
    ms: number | null;
    betweenRoundsMs: number | null;
    inRoundMs: number;
    reason: string | null;
  };
  uncertain: { ms: number; spans: UncertainGap[] };
  checks: {
    localMs: number | null;
    githubWaitMs: number | null;
    reason: string | null;
  };
  roles: RoleTotal[];
  rounds: {
    round: number | null;
    run: string;
    route: string | null;
    startedAt: string | null;
    endedAt: string | null;
    open: boolean;
    ms: number | null;
    error: string | null;
  }[];
  coverage: { rounds: number; observed: number; missing: number[] };
};

const ROLE_ORDER = [
  "Samson",
  "Ezra",
  "Bezalel",
  "Micaiah",
  "Luke",
  "Agabus",
  "Trusted scripts",
];
/** Trusted nodes that run Core's hooked commit and pre-push in the executor. */
const LOCAL_CHECK_NODES = new Set(["freeze", "publish"]);
const WAIT_NODES = new Set(["cooldown"]);

function roleOf(node: string) {
  const role = NODE_ROLES[node];
  return !role || role === "Trusted script" ? "Trusted scripts" : role;
}

function roleTotals(attempts: { node: string; span: Span }[]): RoleTotal[] {
  const byRole = new Map<string, { spans: Span[]; attempts: number }>();
  for (const { node, span } of attempts) {
    if (WAIT_NODES.has(node)) continue;
    const role = roleOf(node);
    const entry = byRole.get(role) ?? { spans: [], attempts: 0 };
    entry.spans.push(span);
    entry.attempts += 1;
    byRole.set(role, entry);
  }
  return [...byRole.entries()]
    .map(([role, entry]) => ({
      role,
      ms: measure(entry.spans),
      attempts: entry.attempts,
    }))
    .sort(
      (left, right) =>
        ROLE_ORDER.indexOf(left.role) - ROLE_ORDER.indexOf(right.role),
    );
}

type RoundSpans = {
  trace: RoundTrace;
  span: Span | null;
  attempts: { node: string; span: Span; open: boolean }[];
  waits: { kind: string; span: Span; open: boolean }[];
  gaps: Span[];
};

function spansOf(trace: RoundTrace, now: number): RoundSpans {
  const start = time(trace.startedAt);
  const end = trace.endedAt === null ? now : time(trace.endedAt);
  const roundEnd = end ?? now;
  const span =
    start !== null && end !== null
      ? { start, end: Math.max(start, end) }
      : null;
  const close = (value: string | null) =>
    value === null ? roundEnd : (time(value) ?? roundEnd);
  const attempts = (trace.intervals?.attempts ?? []).flatMap((attempt) => {
    const from = time(attempt.start);
    return from === null
      ? []
      : [
          {
            node: attempt.node,
            span: { start: from, end: close(attempt.end) },
            open: attempt.end === null,
          },
        ];
  });
  const waits = (trace.intervals?.waits ?? []).flatMap((wait) => {
    const from = time(wait.start);
    return from === null
      ? []
      : [
          {
            kind: wait.kind,
            span: { start: from, end: close(wait.end) },
            open: wait.end === null,
          },
        ];
  });
  for (const attempt of attempts)
    if (WAIT_NODES.has(attempt.node))
      waits.push({
        kind: attempt.node,
        span: attempt.span,
        open: attempt.open,
      });
  const gaps = (trace.intervals?.gaps ?? []).flatMap((gap) => {
    const from = time(gap.start);
    const to = time(gap.end);
    return from === null || to === null ? [] : [{ start: from, end: to }];
  });
  return { trace, span, attempts, waits, gaps };
}

function listRounds(rounds: number[]) {
  return rounds.length === 1
    ? `Round ${rounds[0]} has`
    : `Rounds ${rounds.join(", ")} have`;
}

function attemptOf(entry: RoundSpans | undefined): IssueTiming["attempt"] {
  if (!entry) return null;
  const { trace, span } = entry;
  const open = trace.endedAt === null;
  const waits = union(entry.waits.map((wait) => wait.span));
  const gaps = union(entry.gaps);
  const inside = span ? [span] : [];
  const running = span ? measure(subtract(inside, [...waits, ...gaps])) : null;
  const waiting = span
    ? measure(subtract(intersect(waits, inside), gaps))
    : null;
  let state: AttemptState = "finished";
  let detail: string | null = null;
  if (open) {
    const runningNodes = entry.attempts.filter(
      (attempt) => attempt.open && !WAIT_NODES.has(attempt.node),
    );
    const openWait = entry.waits.find((wait) => wait.open);
    if (!trace.intervals) state = "not observed";
    else if (runningNodes.length) {
      state = "running";
      detail = [...new Set(runningNodes.map((node) => roleOf(node.node)))].join(
        " and ",
      );
    } else if (openWait) {
      state = "waiting";
      detail = openWait.kind;
    } else state = "between steps";
  }
  return {
    round: trace.round,
    run: trace.run,
    route: trace.route,
    startedAt: trace.startedAt,
    endedAt: trace.endedAt,
    open,
    ms: span ? span.end - span.start : null,
    state,
    detail,
    runningMs: running,
    waitingMs: waiting,
    localChecksMs: trace.intervals
      ? measure(
          entry.attempts
            .filter((attempt) => LOCAL_CHECK_NODES.has(attempt.node))
            .map((attempt) => attempt.span),
        )
      : null,
    roles: roleTotals(entry.attempts),
  };
}

/**
 * Timing for one issue from its rounds. Wall time runs from admission to the
 * terminal record (or now). Running is time inside a round that is not a
 * known wait or an uncertain gap; waiting is the rest of the wall time, split
 * into waits between rounds and waits inside a round. Per-role totals merge
 * each role's own attempts and are never added together.
 */
export function issueTiming({
  assignedAt,
  finishedAt,
  rounds,
  now,
}: {
  assignedAt: string | null;
  finishedAt: string | null;
  rounds: readonly RoundTrace[];
  now: number;
}): IssueTiming {
  const entries = rounds.map((trace) => spansOf(trace, now));
  const starts = entries.flatMap((entry) =>
    entry.span ? [entry.span.start] : [],
  );
  const wallStart =
    time(assignedAt) ?? (starts.length ? Math.min(...starts) : null);
  const wallEnd = finishedAt ? time(finishedAt) : now;
  const wall =
    wallStart !== null && wallEnd !== null && wallEnd >= wallStart
      ? { start: wallStart, end: wallEnd }
      : null;
  const missing = entries
    .filter((entry) => !entry.span)
    .map((entry) => entry.trace.round ?? 0);
  const roundSpans = union(
    entries.flatMap((entry) => (entry.span ? [entry.span] : [])),
  );
  const waitSpans = union(
    entries.flatMap((entry) => entry.waits.map((wait) => wait.span)),
  );
  const gapSpans = union(entries.flatMap((entry) => entry.gaps));
  const inRounds = wall ? intersect(roundSpans, [wall]) : roundSpans;
  const running = measure(subtract(inRounds, [...waitSpans, ...gapSpans]));
  const inRoundWait = measure(
    subtract(intersect(waitSpans, inRounds), gapSpans),
  );
  const uncertain = measure(wall ? intersect(gapSpans, [wall]) : gapSpans);
  const between =
    wall && !missing.length ? measure(subtract([wall], roundSpans)) : null;
  const observedRounds = entries.filter((entry) => entry.trace.intervals);

  let githubWait = 0;
  let githubIncomplete = false;
  entries.forEach((entry, index) => {
    if (index === 0 || entry.trace.route !== "feedback") return;
    const previous = entries[index - 1];
    if (!entry.span || !previous.span) githubIncomplete = true;
    else githubWait += Math.max(0, entry.span.start - previous.span.end);
  });

  const current =
    [...entries]
      .filter((entry) => entry.trace.endedAt === null && entry.span)
      .sort((left, right) => right.span!.start - left.span!.start)[0] ??
    entries.at(-1);

  return {
    wall: {
      ms: wall ? wall.end - wall.start : null,
      startedAt: wall ? new Date(wall.start).toISOString() : null,
      endedAt: finishedAt && wall ? new Date(wall.end).toISOString() : null,
      open: !finishedAt,
    },
    attempt: attemptOf(current),
    running: { ms: running, complete: missing.length === 0 },
    waiting: {
      ms: between === null ? null : between + inRoundWait,
      betweenRoundsMs: between,
      inRoundMs: inRoundWait,
      reason: missing.length
        ? `${listRounds(missing)} no recorded start, so waiting time cannot be measured.`
        : wall
          ? null
          : "The issue's admission time is not recorded.",
    },
    uncertain: {
      ms: uncertain,
      spans: entries.flatMap((entry) => entry.trace.intervals?.gaps ?? []),
    },
    checks: {
      localMs: observedRounds.length
        ? measure(
            observedRounds.flatMap((entry) =>
              entry.attempts
                .filter((attempt) => LOCAL_CHECK_NODES.has(attempt.node))
                .map((attempt) => attempt.span),
            ),
          )
        : null,
      githubWaitMs: githubIncomplete ? null : githubWait,
      reason: !observedRounds.length
        ? "No engine records were read for this issue's rounds."
        : githubIncomplete
          ? "A feedback round or the round before it has no recorded start or end."
          : null,
    },
    roles: roleTotals(entries.flatMap((entry) => entry.attempts)),
    rounds: entries.map((entry) => ({
      round: entry.trace.round,
      run: entry.trace.run,
      route: entry.trace.route,
      startedAt: entry.trace.startedAt,
      endedAt: entry.trace.endedAt,
      open: entry.trace.endedAt === null,
      ms: entry.span ? entry.span.end - entry.span.start : null,
      error: entry.trace.error,
    })),
    coverage: {
      rounds: entries.length,
      observed: entries.length - missing.length,
      missing,
    },
  };
}

const TERMINAL = new Set(["PR_READY", "MERGED", "BLOCKED", "stopped"]);

/** When a terminal issue reached its outcome, from its durable records. */
export function finishedAt(item: {
  status: string;
  history: readonly { outcome: string; at: string }[];
  updatedAt: string | null;
}): string | null {
  if (!TERMINAL.has(item.status)) return null;
  const record = [...item.history]
    .reverse()
    .find((entry) => entry.outcome === item.status);
  return record?.at ?? item.updatedAt ?? null;
}
