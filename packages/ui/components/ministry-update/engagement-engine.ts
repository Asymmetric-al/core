/**
 * Ministry Update engagement — pure optimistic state engine.
 *
 * The reducer here is deliberately free of React, timers, and I/O so every
 * invariant (optimistic toggle, atomic rollback, coalescing, baseline
 * reconciliation, non-negative counts) can be unit-tested directly.
 *
 * These exports are module internals: they are consumed by
 * `use-engagement.ts` and by unit tests via a direct file import, and are
 * intentionally NOT re-exported from the module's `index.ts`.
 *
 * Model per reaction kind:
 * - `confirmedCount`/`confirmedMine` — the last server-consistent pair.
 * - `desiredMine` — what the viewer currently wants (the optimistic value).
 * - `inFlight` — the single HTTP operation currently running, if any.
 *
 * The displayed state is always derived: `mine = desiredMine` and
 * `count = clamp(confirmedCount + delta)` where `delta` is `+1`/`-1` only
 * while `desiredMine` differs from `confirmedMine`. Because both displayed
 * values derive from the same fields, rollback (reverting `desiredMine` to
 * `confirmedMine`) is atomic by construction.
 */

import { REACTION_KINDS } from "./normalize";

import type {
  EngagementSnapshot,
  ReactionKind,
  ReactionState,
} from "./normalize";

/** Engine state for one reaction kind. */
export interface KindEngineState {
  /** Reaction count consistent with `confirmedMine`. */
  confirmedCount: number;
  /** Last server-confirmed viewer participation. */
  confirmedMine: boolean;
  /** The viewer's desired (optimistic) participation. */
  desiredMine: boolean;
  /** The HTTP operation currently in flight for this kind, if any. */
  inFlight: { active: boolean } | null;
}

/** Engine state for one Ministry Update. */
export interface EngagementEngineState {
  updateId: string;
  kinds: Record<ReactionKind, KindEngineState>;
  commentCount: number;
}

/** Events the pure reducer understands. */
export type EngagementEngineEvent =
  | { type: "toggle"; kind: ReactionKind }
  | { type: "operationStarted"; kind: ReactionKind; active: boolean }
  | {
      type: "operationSucceeded";
      kind: ReactionKind;
      active: boolean;
      /**
       * Server `applied` flag. `false` means the server was already in the
       * desired state; per the module contract the optimistic value is kept,
       * so the arithmetic is identical either way — the flag is carried for
       * traceability.
       */
      applied: boolean;
    }
  | { type: "operationFailed"; kind: ReactionKind }
  | { type: "baselineReceived"; baseline: EngagementSnapshot }
  | { type: "commentAdded" };

/** Derived, render-ready view of the engine state. */
export interface EngagementView {
  snapshot: EngagementSnapshot;
  pending: Record<ReactionKind, boolean>;
}

function clampCount(value: number): number {
  return Math.max(0, value);
}

function kindFromBaseline(state: ReactionState): KindEngineState {
  return {
    confirmedCount: clampCount(state.count),
    confirmedMine: state.mine,
    desiredMine: state.mine,
    inFlight: null,
  };
}

/** Seed a fresh engine state from a normalized baseline snapshot. */
export function createEngineState(
  baseline: EngagementSnapshot,
): EngagementEngineState {
  return {
    updateId: baseline.updateId,
    kinds: {
      love: kindFromBaseline(baseline.love),
      prayer: kindFromBaseline(baseline.prayer),
      fire: kindFromBaseline(baseline.fire),
    },
    commentCount: clampCount(baseline.commentCount),
  };
}

/** True while an op is running or a desire is still unconfirmed. */
export function isKindPending(kind: KindEngineState): boolean {
  return kind.inFlight !== null || kind.desiredMine !== kind.confirmedMine;
}

/**
 * The single operation that should be launched next for a kind, if any.
 * Returns `null` while an op is in flight (at most one per kind) or when the
 * desired state is already confirmed. This is what coalesces rapid toggles:
 * desire flips freely, but a follow-up op is emitted only on settle, and
 * only when desire still differs from the confirmed state.
 */
export function nextReactionOp(
  kind: KindEngineState,
): { active: boolean } | null {
  if (kind.inFlight !== null) {
    return null;
  }
  if (kind.desiredMine === kind.confirmedMine) {
    return null;
  }
  return { active: kind.desiredMine };
}

/** Displayed reaction state, derived from confirmed + desired. */
export function deriveReactionState(kind: KindEngineState): ReactionState {
  let delta = 0;
  if (kind.desiredMine !== kind.confirmedMine) {
    delta = kind.desiredMine ? 1 : -1;
  }
  return {
    count: clampCount(kind.confirmedCount + delta),
    mine: kind.desiredMine,
  };
}

/** Derive the public snapshot from the engine state. */
export function deriveEngagementSnapshot(
  state: EngagementEngineState,
): EngagementSnapshot {
  return {
    updateId: state.updateId,
    love: deriveReactionState(state.kinds.love),
    prayer: deriveReactionState(state.kinds.prayer),
    fire: deriveReactionState(state.kinds.fire),
    commentCount: state.commentCount,
  };
}

function reactionStatesEqual(a: ReactionState, b: ReactionState): boolean {
  return a.count === b.count && a.mine === b.mine;
}

function snapshotsEqual(a: EngagementSnapshot, b: EngagementSnapshot): boolean {
  return (
    a.updateId === b.updateId &&
    a.commentCount === b.commentCount &&
    reactionStatesEqual(a.love, b.love) &&
    reactionStatesEqual(a.prayer, b.prayer) &&
    reactionStatesEqual(a.fire, b.fire)
  );
}

/**
 * Derive the render-ready view. When `previous` is given, unchanged parts
 * keep their previous object identity so subscribers can rely on reference
 * equality (e.g. `onChange` fires only for real snapshot changes).
 */
export function deriveEngagementView(
  state: EngagementEngineState,
  previous?: EngagementView,
): EngagementView {
  let snapshot = deriveEngagementSnapshot(state);
  if (previous && snapshotsEqual(snapshot, previous.snapshot)) {
    snapshot = previous.snapshot;
  }

  let pending: Record<ReactionKind, boolean> = {
    love: isKindPending(state.kinds.love),
    prayer: isKindPending(state.kinds.prayer),
    fire: isKindPending(state.kinds.fire),
  };
  if (
    previous &&
    REACTION_KINDS.every((kind) => pending[kind] === previous.pending[kind])
  ) {
    pending = previous.pending;
  }

  if (
    previous &&
    snapshot === previous.snapshot &&
    pending === previous.pending
  ) {
    return previous;
  }
  return { snapshot, pending };
}

function withKind(
  state: EngagementEngineState,
  kind: ReactionKind,
  next: KindEngineState,
): EngagementEngineState {
  return {
    ...state,
    kinds: { ...state.kinds, [kind]: next },
  };
}

function reduceBaseline(
  state: EngagementEngineState,
  baseline: EngagementSnapshot,
): EngagementEngineState {
  let changed = false;
  const kinds = { ...state.kinds };

  for (const kind of REACTION_KINDS) {
    const current = kinds[kind];
    if (isKindPending(current)) {
      // A pending op (or unconfirmed desire) owns this kind; the stale
      // baseline must not clobber the optimistic value (invariant I6).
      continue;
    }
    const incoming = kindFromBaseline(baseline[kind]);
    if (
      incoming.confirmedCount !== current.confirmedCount ||
      incoming.confirmedMine !== current.confirmedMine
    ) {
      kinds[kind] = incoming;
      changed = true;
    }
  }

  const commentCount = clampCount(baseline.commentCount);
  if (commentCount !== state.commentCount) {
    changed = true;
  }

  if (!changed) {
    return state;
  }
  return { ...state, kinds, commentCount };
}

/**
 * Pure engagement reducer. Returns the same reference when an event is a
 * no-op so callers can skip notifications cheaply.
 */
export function engagementEngineReducer(
  state: EngagementEngineState,
  event: EngagementEngineEvent,
): EngagementEngineState {
  switch (event.type) {
    case "toggle": {
      const kind = state.kinds[event.kind];
      return withKind(state, event.kind, {
        ...kind,
        desiredMine: !kind.desiredMine,
      });
    }

    case "operationStarted": {
      const kind = state.kinds[event.kind];
      if (kind.inFlight !== null) {
        // At most one HTTP op per (updateId, kind) — invariant I2.
        return state;
      }
      return withKind(state, event.kind, {
        ...kind,
        inFlight: { active: event.active },
      });
    }

    case "operationSucceeded": {
      const kind = state.kinds[event.kind];
      if (kind.inFlight === null) {
        return state;
      }
      // `applied: false` means "already in the desired state" — the
      // optimistic value is kept either way, so both outcomes promote the
      // optimistic delta into the confirmed pair.
      let delta = 0;
      if (event.active !== kind.confirmedMine) {
        delta = event.active ? 1 : -1;
      }
      return withKind(state, event.kind, {
        ...kind,
        inFlight: null,
        confirmedMine: event.active,
        confirmedCount: clampCount(kind.confirmedCount + delta),
      });
    }

    case "operationFailed": {
      const kind = state.kinds[event.kind];
      if (kind.inFlight === null) {
        return state;
      }
      // Atomic rollback: displayed mine and count both derive from the
      // confirmed pair once desire is reset (invariant I7).
      return withKind(state, event.kind, {
        ...kind,
        inFlight: null,
        desiredMine: kind.confirmedMine,
      });
    }

    case "baselineReceived":
      return reduceBaseline(state, event.baseline);

    case "commentAdded":
      return { ...state, commentCount: state.commentCount + 1 };

    default:
      return state;
  }
}
