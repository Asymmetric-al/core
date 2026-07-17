/** @vitest-environment jsdom */

/**
 * Ministry Update engagement module tests.
 *
 * Invariant coverage map:
 * - I1 (counts never negative)          → normalize + engine suites
 * - I2 (single in-flight op, coalesce)  → hook coalescing suite
 * - I3 (readOnly: no network/provider)  → ReactionBar readOnly suite
 * - I5 (normalize total/pure precedence)→ normalize suite
 * - I6 (baseline reconciliation)        → engine + hook baseline suites
 * - I7 (atomic rollback, never throws)  → engine + hook failure suites
 * - applied:false keeps optimistic      → engine + hook suites
 *
 * All transport doubles are injected (DI); no vi.mock of package internals.
 */

import {
  EngagementError,
  ReactionBar,
  createMemoryEngagementTransport,
  toEngagementSnapshot,
  useEngagement,
} from "@asym/ui/components/ministry-update";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  createEngineState,
  deriveEngagementSnapshot,
  deriveEngagementView,
  engagementEngineReducer,
  isKindPending,
} from "../../../../packages/ui/components/ministry-update/engagement-engine";

import type {
  EngagementTransport,
  ReactionKind,
} from "@asym/ui/components/ministry-update";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
  Toaster: () => null,
}));

beforeAll(() => {
  if (typeof window.matchMedia !== "function") {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

afterEach(() => {
  cleanup();
});

/** Unique update ids so tests never share module-store state. */
let updateSequence = 0;
function nextUpdateId(): string {
  updateSequence += 1;
  return `update-${updateSequence}`;
}

/**
 * Wrap a transport so setReaction promises resolve only when released.
 * Gives tests exact control over in-flight windows for coalescing checks.
 */
function gateSetReaction(inner: EngagementTransport) {
  let queued: Array<() => void> = [];
  let started = 0;
  const transport: EngagementTransport = {
    setReaction(updateId, kind, active, signal) {
      started += 1;
      return new Promise((resolve, reject) => {
        queued.push(() => {
          inner
            .setReaction(updateId, kind, active, signal)
            .then(resolve, reject);
        });
      });
    },
    listComments: (updateId, signal) => inner.listComments(updateId, signal),
    addComment: (updateId, content) => inner.addComment(updateId, content),
  };
  return {
    transport,
    startedCount: () => started,
    async release() {
      const batch = queued;
      queued = [];
      for (const run of batch) {
        run();
      }
      // Let the inner promise chain and hook settle logic flush.
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
    },
  };
}

describe("toEngagementSnapshot (I5, I1)", () => {
  it("maps the canonical dialect", () => {
    expect(
      toEngagementSnapshot({
        id: "post-1",
        like_count: 3,
        prayer_count: 4,
        fires_count: 5,
        comment_count: 6,
        user_liked: true,
        user_prayed: false,
        user_fired: true,
      }),
    ).toEqual({
      updateId: "post-1",
      love: { count: 3, mine: true },
      prayer: { count: 4, mine: false },
      fire: { count: 5, mine: true },
      commentCount: 6,
    });
  });

  it("applies precedence canonical -> worker -> donor", () => {
    const snapshot = toEngagementSnapshot({
      id: 1,
      like_count: 10,
      likes_count: 20,
      likes: 30,
      prayers_count: 21,
      prayers: 31,
      liked: true,
      user_liked: false,
    });
    expect(snapshot.updateId).toBe("1");
    expect(snapshot.love.count).toBe(10);
    expect(snapshot.prayer.count).toBe(21);
    expect(snapshot.love.count).not.toBe(30);
    // Explicit canonical false beats donor true.
    expect(snapshot.love.mine).toBe(false);
  });

  it("falls through to the donor dialect and inline comments", () => {
    const snapshot = toEngagementSnapshot({
      id: "d",
      likes: 7,
      prayers: 8,
      liked: true,
      prayed: true,
      comments: [{}, {}, {}],
    });
    expect(snapshot.love).toEqual({ count: 7, mine: true });
    expect(snapshot.prayer).toEqual({ count: 8, mine: true });
    expect(snapshot.fire).toEqual({ count: 0, mine: false });
    expect(snapshot.commentCount).toBe(3);
  });

  it("prefers comment_count over inline comment length", () => {
    const snapshot = toEngagementSnapshot({
      id: "c",
      comment_count: 9,
      comments: [{}],
    });
    expect(snapshot.commentCount).toBe(9);
  });

  it("is total: missing fields, negatives, and junk never throw (I1)", () => {
    expect(toEngagementSnapshot({ id: 42 })).toEqual({
      updateId: "42",
      love: { count: 0, mine: false },
      prayer: { count: 0, mine: false },
      fire: { count: 0, mine: false },
      commentCount: 0,
    });

    const clamped = toEngagementSnapshot({
      id: "x",
      like_count: -5,
      prayer_count: 2.9,
      fires_count: Number.NaN,
      comment_count: Number.POSITIVE_INFINITY,
      comments: null,
    });
    expect(clamped.love.count).toBe(0);
    expect(clamped.prayer.count).toBe(2);
    expect(clamped.fire.count).toBe(0);
    expect(clamped.commentCount).toBe(0);
  });

  it("skips non-finite counts in the precedence chain", () => {
    const snapshot = toEngagementSnapshot({
      id: "nf",
      like_count: Number.NaN,
      likes_count: 7,
    });
    expect(snapshot.love.count).toBe(7);
  });
});

describe("createMemoryEngagementTransport", () => {
  it("records every call with method and args", async () => {
    const transport = createMemoryEngagementTransport();
    await transport.setReaction("u1", "love", true);
    await transport.listComments("u1");
    await transport.addComment("u1", "hello");

    expect(transport.calls.map((call) => call.method)).toEqual([
      "setReaction",
      "listComments",
      "addComment",
    ]);
    expect(transport.calls[0]?.args.slice(0, 3)).toEqual(["u1", "love", true]);
    expect(transport.calls[2]?.args).toEqual(["u1", "hello"]);
  });

  it("reports applied:false when already in the desired state", async () => {
    const transport = createMemoryEngagementTransport({
      u1: { love: { count: 2, mine: false } },
    });
    await expect(transport.setReaction("u1", "love", true)).resolves.toEqual({
      applied: true,
    });
    await expect(transport.setReaction("u1", "love", true)).resolves.toEqual({
      applied: false,
    });
    await expect(transport.setReaction("u1", "love", false)).resolves.toEqual({
      applied: true,
    });
  });

  it("fails exactly one next call per failNext, FIFO", async () => {
    const transport = createMemoryEngagementTransport();
    transport.failNext();
    transport.failNext(new EngagementError("not_found", "gone"));

    await expect(
      transport.setReaction("u1", "fire", true),
    ).rejects.toMatchObject({
      name: "EngagementError",
      code: "unavailable",
      retryable: true,
    });
    await expect(transport.listComments("u1")).rejects.toMatchObject({
      code: "not_found",
    });
    await expect(transport.setReaction("u1", "fire", true)).resolves.toEqual({
      applied: true,
    });
  });

  it("appends comments and returns them from listComments", async () => {
    const transport = createMemoryEngagementTransport({
      u1: {
        comments: [
          {
            id: "seed-1",
            content: "seeded",
            created_at: "2026-01-01T00:00:00.000Z",
            user: {
              id: "a",
              first_name: "Ann",
              last_name: "B",
              avatar_url: null,
            },
          },
        ],
      },
    });
    await expect(transport.addComment("u1", "fresh")).resolves.toEqual({
      persisted: true,
    });
    const comments = await transport.listComments("u1");
    expect(comments.map((comment) => comment.content)).toEqual([
      "seeded",
      "fresh",
    ]);
  });
});

describe("engagement engine (internal reducer)", () => {
  const baseline = {
    updateId: "e1",
    love: { count: 2, mine: false },
    prayer: { count: 5, mine: true },
    fire: { count: 0, mine: false },
    commentCount: 1,
  };

  it("toggle is optimistic: count and mine move together", () => {
    let state = createEngineState(baseline);
    state = engagementEngineReducer(state, { type: "toggle", kind: "love" });
    const derived = deriveEngagementSnapshot(state);
    expect(derived.love).toEqual({ count: 3, mine: true });
    expect(isKindPending(state.kinds.love)).toBe(true);
  });

  it("never derives a negative count (I1)", () => {
    let state = createEngineState({
      ...baseline,
      fire: { count: 0, mine: true },
    });
    state = engagementEngineReducer(state, { type: "toggle", kind: "fire" });
    expect(deriveEngagementSnapshot(state).fire.count).toBe(0);
  });

  it("rolls back mine and count atomically on failure (I7)", () => {
    let state = createEngineState(baseline);
    state = engagementEngineReducer(state, { type: "toggle", kind: "love" });
    state = engagementEngineReducer(state, {
      type: "operationStarted",
      kind: "love",
      active: true,
    });
    state = engagementEngineReducer(state, {
      type: "operationFailed",
      kind: "love",
    });
    expect(deriveEngagementSnapshot(state).love).toEqual(baseline.love);
    expect(isKindPending(state.kinds.love)).toBe(false);
  });

  it("keeps the optimistic value on applied:false", () => {
    let state = createEngineState(baseline);
    state = engagementEngineReducer(state, { type: "toggle", kind: "love" });
    state = engagementEngineReducer(state, {
      type: "operationStarted",
      kind: "love",
      active: true,
    });
    state = engagementEngineReducer(state, {
      type: "operationSucceeded",
      kind: "love",
      active: true,
      applied: false,
    });
    expect(deriveEngagementSnapshot(state).love).toEqual({
      count: 3,
      mine: true,
    });
    expect(isKindPending(state.kinds.love)).toBe(false);
  });

  it("ignores a second operationStarted while one is in flight (I2)", () => {
    let state = createEngineState(baseline);
    state = engagementEngineReducer(state, { type: "toggle", kind: "love" });
    state = engagementEngineReducer(state, {
      type: "operationStarted",
      kind: "love",
      active: true,
    });
    const again = engagementEngineReducer(state, {
      type: "operationStarted",
      kind: "love",
      active: false,
    });
    expect(again).toBe(state);
  });

  it("reconciles baselines per-kind, skipping pending kinds (I6)", () => {
    let state = createEngineState(baseline);
    state = engagementEngineReducer(state, { type: "toggle", kind: "love" });
    state = engagementEngineReducer(state, {
      type: "operationStarted",
      kind: "love",
      active: true,
    });

    state = engagementEngineReducer(state, {
      type: "baselineReceived",
      baseline: {
        updateId: "e1",
        love: { count: 100, mine: false },
        prayer: { count: 9, mine: false },
        fire: { count: 4, mine: true },
        commentCount: 7,
      },
    });

    const derived = deriveEngagementSnapshot(state);
    // Pending love keeps its optimistic value.
    expect(derived.love).toEqual({ count: 3, mine: true });
    // Idle kinds adopt the fresh baseline.
    expect(derived.prayer).toEqual({ count: 9, mine: false });
    expect(derived.fire).toEqual({ count: 4, mine: true });
    expect(derived.commentCount).toBe(7);
  });

  it("keeps view object identity when nothing changed", () => {
    const state = createEngineState(baseline);
    const view = deriveEngagementView(state);
    expect(deriveEngagementView(state, view)).toBe(view);
  });
});

describe("useEngagement", () => {
  it("applies an optimistic toggle and persists once", async () => {
    const id = nextUpdateId();
    const transport = createMemoryEngagementTransport();
    const { result } = renderHook(() =>
      useEngagement({ id, like_count: 2 }, { transport }),
    );

    expect(result.current.snapshot.love).toEqual({ count: 2, mine: false });

    act(() => {
      result.current.toggle("love");
    });
    expect(result.current.snapshot.love).toEqual({ count: 3, mine: true });

    await waitFor(() => expect(result.current.isPending("love")).toBe(false));
    expect(result.current.snapshot.love).toEqual({ count: 3, mine: true });

    const reactionCalls = transport.calls.filter(
      (call) => call.method === "setReaction",
    );
    expect(reactionCalls).toHaveLength(1);
    expect(reactionCalls[0]?.args.slice(0, 3)).toEqual([id, "love", true]);
  });

  it("rolls back atomically on failure and reports via custom onError (I7)", async () => {
    const id = nextUpdateId();
    const transport = createMemoryEngagementTransport();
    transport.failNext();
    const onError = vi.fn();
    vi.mocked(toast.error).mockClear();

    const { result } = renderHook(() =>
      useEngagement({ id, like_count: 2 }, { transport, onError }),
    );

    act(() => {
      result.current.toggle("love");
    });
    expect(result.current.snapshot.love).toEqual({ count: 3, mine: true });

    await waitFor(() => expect(result.current.isPending("love")).toBe(false));
    expect(result.current.snapshot.love).toEqual({ count: 2, mine: false });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "unavailable" }),
      { updateId: id, kind: "love" },
    );
    // Custom onError replaces the default toast.
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows one sonner toast by default when a toggle fails (I7)", async () => {
    const id = nextUpdateId();
    const transport = createMemoryEngagementTransport();
    transport.failNext();
    vi.mocked(toast.error).mockClear();

    const { result } = renderHook(() =>
      useEngagement({ id, like_count: 1 }, { transport }),
    );

    act(() => {
      result.current.toggle("love");
    });
    await waitFor(() => expect(result.current.isPending("love")).toBe(false));

    expect(result.current.snapshot.love).toEqual({ count: 1, mine: false });
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("coalesces rapid toggles: one op in flight, <=1 follow-up (I2)", async () => {
    const id = nextUpdateId();
    const inner = createMemoryEngagementTransport();
    const gate = gateSetReaction(inner);

    const { result } = renderHook(() =>
      useEngagement({ id, like_count: 4 }, { transport: gate.transport }),
    );

    act(() => {
      result.current.toggle("love");
      result.current.toggle("love");
    });

    // Desire is back to the baseline; only ONE op has been started (I2).
    expect(result.current.snapshot.love).toEqual({ count: 4, mine: false });
    expect(gate.startedCount()).toBe(1);

    await gate.release(); // settles op 1 (POST), launches the single follow-up
    await gate.release(); // settles op 2 (DELETE)

    await waitFor(() => expect(result.current.isPending("love")).toBe(false));
    expect(result.current.snapshot.love).toEqual({ count: 4, mine: false });

    const reactionCalls = inner.calls.filter(
      (call) => call.method === "setReaction",
    );
    expect(reactionCalls.length).toBeLessThanOrEqual(2);
    expect(reactionCalls.map((call) => call.args[2])).toEqual([true, false]);
  });

  it("keeps the optimistic value when the server answers applied:false", async () => {
    const id = nextUpdateId();
    const calls: unknown[][] = [];
    const alreadyApplied: EngagementTransport = {
      async setReaction(...args) {
        calls.push([...args]);
        return { applied: false };
      },
      async listComments() {
        return [];
      },
      async addComment() {
        return { persisted: false };
      },
    };

    const { result } = renderHook(() =>
      useEngagement({ id, like_count: 2 }, { transport: alreadyApplied }),
    );

    act(() => {
      result.current.toggle("love");
    });
    await waitFor(() => expect(result.current.isPending("love")).toBe(false));

    expect(result.current.snapshot.love).toEqual({ count: 3, mine: true });
    expect(calls).toHaveLength(1);
  });

  it("reconciles fresh baselines per-kind, skipping pending kinds (I6)", async () => {
    const id = nextUpdateId();
    const inner = createMemoryEngagementTransport();
    const gate = gateSetReaction(inner);

    const { result, rerender } = renderHook(
      ({ update }) => useEngagement(update, { transport: gate.transport }),
      {
        initialProps: {
          update: { id, like_count: 1, prayer_count: 2 },
        },
      },
    );

    // Idle: fresh baseline is adopted wholesale.
    rerender({ update: { id, like_count: 5, prayer_count: 2 } });
    await waitFor(() =>
      expect(result.current.snapshot.love).toEqual({ count: 5, mine: false }),
    );

    // Pending love: only the idle kinds adopt the next baseline.
    act(() => {
      result.current.toggle("love");
    });
    expect(result.current.snapshot.love).toEqual({ count: 6, mine: true });

    rerender({ update: { id, like_count: 50, prayer_count: 7 } });
    await waitFor(() =>
      expect(result.current.snapshot.prayer).toEqual({ count: 7, mine: false }),
    );
    expect(result.current.snapshot.love).toEqual({ count: 6, mine: true });

    // After settle, the next fresh baseline reclaims love too.
    await gate.release();
    await waitFor(() => expect(result.current.isPending("love")).toBe(false));

    rerender({
      update: { id, like_count: 50, prayer_count: 7, user_liked: true },
    });
    await waitFor(() =>
      expect(result.current.snapshot.love).toEqual({ count: 50, mine: true }),
    );
  });

  it("shares one optimistic state across instances of the same update", async () => {
    const id = nextUpdateId();
    const transport = createMemoryEngagementTransport();

    const first = renderHook(() =>
      useEngagement({ id, like_count: 1 }, { transport }),
    );
    const second = renderHook(() =>
      useEngagement({ id, like_count: 1 }, { transport }),
    );

    act(() => {
      first.result.current.toggle("love");
    });

    expect(second.result.current.snapshot.love).toEqual({
      count: 2,
      mine: true,
    });
    await waitFor(() =>
      expect(first.result.current.isPending("love")).toBe(false),
    );
    first.unmount();
    second.unmount();
  });

  it("notifies onChange with the new snapshot", async () => {
    const id = nextUpdateId();
    const transport = createMemoryEngagementTransport();
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useEngagement({ id, like_count: 0 }, { transport, onChange }),
    );

    act(() => {
      result.current.toggle("prayer");
    });
    await waitFor(() => expect(result.current.isPending("prayer")).toBe(false));

    expect(onChange).toHaveBeenCalled();
    const lastSnapshot = onChange.mock.calls.at(-1)?.[0];
    expect(lastSnapshot.prayer).toEqual({ count: 1, mine: true });
  });
});

describe("ReactionBar readOnly (I3)", () => {
  it("renders static accessible text without a provider and with zero network", () => {
    const transport = createMemoryEngagementTransport();
    // No QueryClientProvider anywhere in this tree.
    render(
      <ReactionBar
        update={{
          id: nextUpdateId(),
          like_count: 3,
          prayer_count: 4,
          fires_count: 5,
          comment_count: 6,
          user_liked: true,
        }}
        readOnly
        transport={transport}
      />,
    );

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("6")).toBeTruthy();
    expect(screen.getByText("loves")).toBeTruthy();
    expect(screen.getByText("comments")).toBeTruthy();
    expect(transport.calls).toHaveLength(0);
  });

  it("hides the comment stat when comments are hidden", () => {
    render(
      <ReactionBar
        update={{ id: nextUpdateId(), comment_count: 9 }}
        readOnly
        comments="hidden"
        transport={createMemoryEngagementTransport()}
      />,
    );
    expect(screen.queryByText("comments")).toBeNull();
  });
});

describe("ReactionBar interactive", () => {
  const kinds: ReactionKind[] = ["love", "prayer", "fire"];

  it("renders toggle buttons and persists a click through the transport", async () => {
    const id = nextUpdateId();
    const transport = createMemoryEngagementTransport();

    render(
      <ReactionBar
        update={{ id, like_count: 2, prayer_count: 0, fires_count: 0 }}
        transport={transport}
      />,
    );

    for (const kind of kinds) {
      expect(
        screen.getByRole("button", {
          name: new RegExp(
            kind === "love" ? "love" : kind === "prayer" ? "pray" : "fire",
            "i",
          ),
        }),
      ).toBeTruthy();
    }

    const loveButton = screen.getByRole("button", { name: /love/i });
    expect(loveButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(loveButton);
    expect(loveButton.getAttribute("aria-pressed")).toBe("true");

    await waitFor(() => {
      const reactionCalls = transport.calls.filter(
        (call) => call.method === "setReaction",
      );
      expect(reactionCalls).toHaveLength(1);
      expect(reactionCalls[0]?.args.slice(0, 3)).toEqual([id, "love", true]);
    });
  });

  it("delegates the comment affordance to the caller with {onOpen}", () => {
    const id = nextUpdateId();
    const onOpen = vi.fn();

    render(
      <ReactionBar
        update={{ id, comment_count: 4 }}
        comments={{ onOpen }}
        transport={createMemoryEngagementTransport()}
        appearance="quiet"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /comments/i }));
    expect(onOpen).toHaveBeenCalledWith(id);
  });

  it("removes the comment affordance when hidden", () => {
    render(
      <ReactionBar
        update={{ id: nextUpdateId() }}
        comments="hidden"
        transport={createMemoryEngagementTransport()}
      />,
    );
    expect(screen.queryByRole("button", { name: /comments/i })).toBeNull();
  });

  it("reflects seeded viewer state in the quiet appearance", () => {
    render(
      <ReactionBar
        update={{ id: nextUpdateId(), like_count: 3, user_liked: true }}
        appearance="quiet"
        transport={createMemoryEngagementTransport()}
      />,
    );
    const loveButton = screen.getByRole("button", { name: /love/i });
    expect(loveButton.getAttribute("aria-pressed")).toBe("true");
  });
});
