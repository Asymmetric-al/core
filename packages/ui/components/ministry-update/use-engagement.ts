"use client";

/**
 * Ministry Update engagement — shared optimistic hook.
 *
 * State for each update lives in a module-level store keyed by `updateId`,
 * so every `useEngagement`/`ReactionBar` instance rendering the same update
 * shares one optimistic state and stays consistent. The store needs no
 * provider, which also keeps read-only rendering provider-free (the module
 * uses react-query only inside the comments dialog).
 *
 * Persistence guarantees (see `engagement-engine.ts` for the pure reducer):
 * - at most one HTTP op in flight per `(updateId, kind)`; rapid toggles only
 *   flip the desired state and at most ONE follow-up op is sent on settle,
 *   iff desired still differs from confirmed (I2);
 * - failed toggles roll back `mine` + count atomically and never throw (I7);
 * - a fresh `update` prop is a baseline, not a controlled value: it
 *   reconciles per-kind only while that kind has no pending op (I6).
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { toast } from "sonner";

import {
  createEngineState,
  deriveEngagementView,
  engagementEngineReducer,
  nextReactionOp,
} from "./engagement-engine";
import { httpEngagementTransport } from "./engagement-transport";
import { toEngagementSnapshot } from "./normalize";

import type {
  EngagementEngineEvent,
  EngagementEngineState,
  EngagementView,
} from "./engagement-engine";
import type { EngagementTransport } from "./engagement-transport";
import type {
  EngagementSnapshot,
  MinistryUpdateSnapshotInput,
  ReactionKind,
} from "./normalize";

/** Context passed to {@link UseEngagementOptions.onError}. */
export interface EngagementErrorContext {
  /** The update whose reaction failed to persist. */
  updateId: string;
  /** The reaction kind that failed. */
  kind: ReactionKind;
}

/** Options for {@link useEngagement}. */
export interface UseEngagementOptions {
  /**
   * Persistence seam. Defaults to {@link httpEngagementTransport}; pass a
   * memory transport in tests/stories. When several instances share one
   * update, the transport of the most recent `toggle()` caller is used for
   * that operation and its coalesced follow-up.
   */
  transport?: EngagementTransport;
  /** Called whenever the shared snapshot for this update changes. */
  onChange?: (snapshot: EngagementSnapshot) => void;
  /**
   * Called when persisting a toggle fails (after the automatic rollback).
   * Replaces the default behavior of showing a single sonner error toast.
   */
  onError?: (error: unknown, context: EngagementErrorContext) => void;
}

/** Result of {@link useEngagement}. */
export interface UseEngagementResult {
  /** Canonical, optimistic engagement snapshot (shared per update). */
  snapshot: EngagementSnapshot;
  /**
   * Toggle a reaction optimistically and persist it via the transport.
   * Never throws; failures roll back and are reported via `onError` (or a
   * sonner toast by default).
   */
  toggle(kind: ReactionKind): void;
  /** True while `kind` has an op in flight or an unconfirmed desire. */
  isPending(kind: ReactionKind): boolean;
}

interface EntryCallbacks {
  onError?: (error: unknown, context: EngagementErrorContext) => void;
}

interface StoreEntry {
  state: EngagementEngineState;
  view: EngagementView;
  baselineFingerprint: string;
  listeners: Set<() => void>;
  /** Transport captured from the most recent toggle() caller. */
  transport: EngagementTransport;
  /** Error callback captured from the most recent toggle() caller. */
  callbacks: EntryCallbacks;
}

const engagementStore = new Map<string, StoreEntry>();

function fingerprintOf(baseline: EngagementSnapshot): string {
  return JSON.stringify(baseline);
}

function hasInFlightOp(state: EngagementEngineState): boolean {
  return (
    state.kinds.love.inFlight !== null ||
    state.kinds.prayer.inFlight !== null ||
    state.kinds.fire.inFlight !== null
  );
}

/** Drop an entry once nothing renders it and no op can still settle into it. */
function maybeEvict(updateId: string, entry: StoreEntry): void {
  if (entry.listeners.size > 0 || hasInFlightOp(entry.state)) {
    return;
  }
  if (engagementStore.get(updateId) === entry) {
    engagementStore.delete(updateId);
  }
}

function dispatchEvent(
  updateId: string,
  entry: StoreEntry,
  event: EngagementEngineEvent,
): void {
  const next = engagementEngineReducer(entry.state, event);
  if (next !== entry.state) {
    entry.state = next;
    const view = deriveEngagementView(next, entry.view);
    if (view !== entry.view) {
      entry.view = view;
      for (const listener of [...entry.listeners]) {
        listener();
      }
    }
  }
  maybeEvict(updateId, entry);
}

function ensureEntry(
  updateId: string,
  baseline: EngagementSnapshot,
): StoreEntry {
  let entry = engagementStore.get(updateId);
  if (!entry) {
    const state = createEngineState(baseline);
    entry = {
      state,
      view: deriveEngagementView(state),
      baselineFingerprint: fingerprintOf(baseline),
      listeners: new Set(),
      transport: httpEngagementTransport,
      callbacks: {},
    };
    engagementStore.set(updateId, entry);
  }
  return entry;
}

/** Reconcile a fresh baseline (invariant I6); no-ops on unchanged baselines. */
function receiveBaseline(updateId: string, baseline: EngagementSnapshot): void {
  const entry = engagementStore.get(updateId);
  if (!entry) {
    return;
  }
  const fingerprint = fingerprintOf(baseline);
  if (entry.baselineFingerprint === fingerprint) {
    return;
  }
  entry.baselineFingerprint = fingerprint;
  dispatchEvent(updateId, entry, { type: "baselineReceived", baseline });
}

function reportError(
  entry: StoreEntry,
  updateId: string,
  kind: ReactionKind,
  error: unknown,
): void {
  // toggle() must never throw (I7), including through callbacks.
  try {
    const { onError } = entry.callbacks;
    if (onError) {
      onError(error, { updateId, kind });
    } else {
      toast.error("Couldn't save your reaction. Please try again.");
    }
  } catch {
    // Swallow callback failures; the rollback already happened.
  }
}

function launchIfNeeded(
  updateId: string,
  entry: StoreEntry,
  kind: ReactionKind,
): void {
  const op = nextReactionOp(entry.state.kinds[kind]);
  if (op === null) {
    return;
  }
  dispatchEvent(updateId, entry, {
    type: "operationStarted",
    kind,
    active: op.active,
  });
  void runReactionOp(updateId, entry, kind, op.active);
}

async function runReactionOp(
  updateId: string,
  entry: StoreEntry,
  kind: ReactionKind,
  active: boolean,
): Promise<void> {
  let applied: boolean;
  try {
    const result = await entry.transport.setReaction(updateId, kind, active);
    applied = result.applied;
  } catch (error) {
    dispatchEvent(updateId, entry, { type: "operationFailed", kind });
    reportError(entry, updateId, kind, error);
    return;
  }
  dispatchEvent(updateId, entry, {
    type: "operationSucceeded",
    kind,
    active,
    applied,
  });
  // Coalescing (I2): at most ONE follow-up per settle, and only when the
  // desired state still differs from what the server just confirmed.
  launchIfNeeded(updateId, entry, kind);
}

/**
 * Module-internal: bump the shared comment count after a locally-added
 * comment so every bar for this update reflects it immediately. The next
 * fresh baseline wins if it disagrees.
 */
export function recordLocalComment(updateId: string): void {
  const entry = engagementStore.get(updateId);
  if (!entry) {
    return;
  }
  dispatchEvent(updateId, entry, { type: "commentAdded" });
}

/**
 * Shared optimistic engagement state for one Ministry Update.
 *
 * `update` accepts any wire dialect (see
 * {@link MinistryUpdateSnapshotInput}) and acts as a *baseline*: the store
 * seeds from it on first use and reconciles per-kind whenever a fresh
 * baseline arrives, skipping kinds with a pending op (I6). All instances for
 * the same `updateId` share one snapshot. Works without any provider.
 */
export function useEngagement(
  update: MinistryUpdateSnapshotInput,
  options: UseEngagementOptions = {},
): UseEngagementResult {
  const { transport = httpEngagementTransport, onChange, onError } = options;

  const baseline = toEngagementSnapshot(update);
  const updateId = baseline.updateId;

  const baselineRef = useRef(baseline);
  baselineRef.current = baseline;
  const transportRef = useRef(transport);
  transportRef.current = transport;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const subscribe = useCallback(
    (notify: () => void) => {
      const entry = ensureEntry(updateId, baselineRef.current);
      entry.listeners.add(notify);
      return () => {
        entry.listeners.delete(notify);
        maybeEvict(updateId, entry);
      };
    },
    [updateId],
  );

  const getView = useCallback(
    () => ensureEntry(updateId, baselineRef.current).view,
    [updateId],
  );

  // Server rendering never touches the shared store; each render pass gets
  // a stable detached view derived from the baseline props.
  const serverViewRef = useRef<EngagementView | null>(null);
  const getServerView = useCallback(() => {
    serverViewRef.current ??= deriveEngagementView(
      createEngineState(baselineRef.current),
    );
    return serverViewRef.current;
  }, []);

  const view = useSyncExternalStore(subscribe, getView, getServerView);

  // Baseline reconciliation (I6). Runs every commit; internally deduped by
  // fingerprint so unchanged baselines are free.
  useEffect(() => {
    receiveBaseline(updateId, baselineRef.current);
  });

  // Notify onChange for real snapshot changes only (skips the first render;
  // derived views keep object identity for unchanged snapshots).
  const lastSnapshotRef = useRef(view.snapshot);
  useEffect(() => {
    if (lastSnapshotRef.current !== view.snapshot) {
      lastSnapshotRef.current = view.snapshot;
      onChangeRef.current?.(view.snapshot);
    }
  }, [view.snapshot]);

  const toggle = useCallback(
    (kind: ReactionKind) => {
      const entry = ensureEntry(updateId, baselineRef.current);
      entry.transport = transportRef.current;
      entry.callbacks = { onError: onErrorRef.current };
      dispatchEvent(updateId, entry, { type: "toggle", kind });
      launchIfNeeded(updateId, entry, kind);
    },
    [updateId],
  );

  const isPending = useCallback(
    (kind: ReactionKind) => view.pending[kind],
    [view],
  );

  return { snapshot: view.snapshot, toggle, isPending };
}
