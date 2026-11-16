// The work item contract the other pack owners are changing (review-only
// route, two-list repairs, parked rounds, external merges, per-issue end
// states). The Console must read every new shape instead of reporting the
// work item as malformed, and must keep reading the legacy shapes.
import { describe, expect, it } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { harness } from "./fixtures/harness";
import {
  DESTRUCTIVE,
  REFUSAL_MESSAGES,
  actionKey,
  controlActionSchema,
  describeAction,
} from "../src/lib/factory";
import { deriveLanes, deriveSteps, plannedSteps } from "../src/lib/round";
import { controlArgs } from "../src/server/control";

import type { FixtureState } from "./fixtures/factory-fixture";

function edit(
  state: FixtureState,
  issue: number,
  change: (value: Record<string, unknown>) => Record<string, unknown>,
) {
  const name = `core/issues/${issue}`;
  state.set(name, change(state.value(name) ?? {}));
}

async function available(factory: ReturnType<typeof harness>["factory"]) {
  const snapshot = await factory.snapshot();
  if (
    snapshot.factory.state !== "available" ||
    snapshot.engine.state !== "available"
  )
    throw new Error("expected both sections available");
  return { factory: snapshot.factory.data, engine: snapshot.engine.data };
}

describe("review-only route (I1)", () => {
  it("reads a work item on the review route instead of reporting it malformed", async () => {
    const { factory, state } = harness();
    edit(state, 101, (value) => ({
      ...value,
      route: "review",
      run: { id: RUN.repair, startedAt: value.updatedAt, route: "review" },
    }));
    const { factory: data } = await available(factory);
    expect(data.malformed).toEqual([]);
    expect(data.issues.find((issue) => issue.issue === 101)).toMatchObject({
      route: "review",
      run: { route: "review" },
    });
  });

  it("plans freeze, both reviews, assess, adjudication, final and publish without scope, define or build", () => {
    const planned = plannedSteps("review");
    for (const step of [
      "claim",
      "freeze",
      "reviews",
      "assess",
      "adjudicate",
      "final",
      "publish",
      "record",
    ] as const)
      expect(planned.has(step)).toBe(true);
    for (const step of ["scope", "define", "build", "feedback"] as const)
      expect(planned.has(step)).toBe(false);
    const steps = deriveSteps("review", {
      run: {} as never,
      nodes: [
        { node_id: "claim", state: "completed" },
        { node_id: "scope", state: "skipped" },
        { node_id: "define", state: "skipped" },
        { node_id: "build", state: "skipped" },
        { node_id: "freeze", state: "running" },
      ],
      timings: {},
      intervals: { attempts: [], waits: [], gaps: [], truncated: false },
      events: [],
      observedAt: new Date().toISOString(),
    });
    expect(steps.find((step) => step.id === "build")).toMatchObject({
      planned: false,
      note: "Review only: the frozen candidate is reviewed again without a new build",
    });
  });

  it("shows a return to the reviewers when the previous round chose the review route", async () => {
    const { factory, state } = harness();
    edit(state, 101, (value) => ({
      ...value,
      route: "review",
      run: { id: RUN.repair, startedAt: value.updatedAt, route: "review" },
      history: [
        {
          round: 1,
          run: RUN.history101,
          route: "initial",
          outcome: "continue",
          next: "review",
          at: value.updatedAt,
          summary: "readiness: base integration changed the diff",
        },
      ],
    }));
    const { factory: data, engine } = await available(factory);
    const lane = deriveLanes(
      data.issues,
      engine.details,
      engine.detailErrors,
    ).find((entry) => entry.issue.issue === 101);
    expect(lane?.returnedFrom).toMatchObject({
      round: 1,
      to: "Micaiah and Luke (review only)",
    });
  });
});

describe("repair shape (I2)", () => {
  it("reads the two-list repair shape with its producing stage", async () => {
    const { factory, state } = harness();
    edit(state, 101, (value) => ({
      ...value,
      brief: {
        ...(value.brief as Record<string, unknown>),
        repair: {
          acceptance: ["[L1] the oracle misses the empty state"],
          implementation: ["[M1] widget label is not announced"],
          source: "after-assess",
        },
      },
    }));
    const { factory: data } = await available(factory);
    expect(data.malformed).toEqual([]);
    expect(data.issues.find((issue) => issue.issue === 101)?.repair).toEqual({
      acceptance: 1,
      implementation: 1,
      reviewOnly: false,
      source: "after-assess",
    });
    const detail = await factory.issue(101);
    expect(detail.item?.brief?.repair).toEqual({
      acceptance: ["[L1] the oracle misses the empty state"],
      implementation: ["[M1] widget label is not announced"],
      reviewOnly: false,
      source: "after-assess",
    });
  });

  it("normalizes the legacy {kind, items} shape and a review-only repair", async () => {
    const { factory, state } = harness();
    edit(state, 101, (value) => ({
      ...value,
      brief: {
        ...(value.brief as Record<string, unknown>),
        repair: { kind: "acceptance", items: ["[L2] wrong expected value"] },
      },
    }));
    edit(state, 102, (value) => ({
      ...value,
      brief: {
        ...(value.brief as Record<string, unknown>),
        repair: {
          acceptance: [],
          implementation: [],
          reviewOnly: true,
          source: "readiness",
        },
      },
    }));
    const legacy = await factory.issue(101);
    expect(legacy.item?.brief?.repair).toEqual({
      acceptance: ["[L2] wrong expected value"],
      implementation: [],
      reviewOnly: false,
      source: null,
    });
    const integration = await factory.issue(102);
    expect(integration.item?.brief?.repair).toMatchObject({
      reviewOnly: true,
      source: "readiness",
    });
    edit(state, 101, (value) => ({
      ...value,
      brief: {
        ...(value.brief as Record<string, unknown>),
        repair: { kind: "integrate-base", items: ["Merging conflicts"] },
      },
    }));
    expect((await factory.issue(101)).item?.brief?.repair).toEqual({
      acceptance: [],
      implementation: ["Merging conflicts"],
      reviewOnly: false,
      source: null,
    });
  });
});

describe("parked rounds (I4)", () => {
  it("shows which shared area keeps a parked issue waiting and who holds it", async () => {
    const { factory, state } = harness();
    edit(state, 107, (value) => ({
      ...value,
      control: "run",
      controlReason: null,
      status: "waiting",
      route: "initial",
      parked: {
        areas: ["supabase/migrations"],
        holders: { "supabase/migrations": 102 },
        at: value.updatedAt,
      },
    }));
    const { factory: data, engine } = await available(factory);
    expect(data.malformed).toEqual([]);
    const summary = data.issues.find((issue) => issue.issue === 107);
    expect(summary?.parked).toEqual({
      areas: ["supabase/migrations"],
      holders: { "supabase/migrations": 102 },
      at: expect.any(String),
    });
    const lane = deriveLanes(
      data.issues,
      engine.details,
      engine.detailErrors,
    ).find((entry) => entry.issue.issue === 107);
    expect(lane?.waiting).toBe(
      "Parked: supabase/migrations is reserved by #102. It starts when the area is released.",
    );
  });
});

describe("merges outside the factory (I3)", () => {
  it("marks a MERGED issue whose assignment ended at PR ready as merged outside the factory", async () => {
    const { factory, state } = harness();
    edit(state, 103, (value) => ({
      ...value,
      status: "MERGED",
      pr: {
        ...(value.pr as Record<string, unknown>),
        mergedAt: value.updatedAt,
        mergeCommit: "a".repeat(40),
      },
    }));
    const { factory: data } = await available(factory);
    expect(data.issues.find((issue) => issue.issue === 103)).toMatchObject({
      status: "MERGED",
      mergedOutside: true,
    });
    expect(data.issues.find((issue) => issue.issue === 105)).toMatchObject({
      status: "MERGED",
      mergedOutside: true,
    });
    edit(state, 105, (value) => ({
      ...value,
      assignment: {
        ...(value.assignment as Record<string, unknown>),
        endState: "MERGED",
      },
      pr: { ...(value.pr as Record<string, unknown>), mergedBy: "factory" },
    }));
    const again = await available(factory);
    expect(
      again.factory.issues.find((issue) => issue.issue === 105)?.mergedOutside,
    ).toBe(false);
  });

  it("trusts the round's external record when the PR does not say who merged", async () => {
    const { factory, state } = harness();
    edit(state, 105, (value) => ({
      ...value,
      assignment: {
        ...(value.assignment as Record<string, unknown>),
        endState: "MERGED",
      },
      pr: { ...(value.pr as Record<string, unknown>), mergedBy: null },
    }));
    const { factory: data } = await available(factory);
    expect(
      data.issues.find((issue) => issue.issue === 105)?.mergedOutside,
    ).toBe(true);
    edit(state, 105, (value) => ({
      ...value,
      history: (value.history as Record<string, unknown>[]).map(
        ({ external: _, ...entry }) => entry,
      ),
    }));
    const unknown = await available(factory);
    expect(
      unknown.factory.issues.find((issue) => issue.issue === 105)
        ?.mergedOutside,
    ).toBeNull();
  });
});

describe("protected-path authorization (I11)", () => {
  it("shows which protected paths the scope lets an issue reach", async () => {
    const { factory, state } = harness();
    state.set("core/scope", {
      ...(state.value("core/scope") ?? {}),
      allowProtected: {
        "101": true,
        "102": ["package.json", ".github/**"],
        "103": "everything",
      },
    });
    expect((await factory.issue(101)).allowProtected).toBe(true);
    expect((await factory.issue(102)).allowProtected).toEqual([
      "package.json",
      ".github/**",
    ]);
    // A malformed grant is shown as no grant, never as a wider one.
    expect((await factory.issue(103)).allowProtected).toBeNull();
    expect((await factory.issue(104)).allowProtected).toBeNull();
    const snapshot = await factory.snapshot();
    expect(snapshot.factory.state).toBe("available");
  });
});

describe("per-issue end states", () => {
  it("shows a queued issue's own end state from the scope", async () => {
    const { factory, state } = harness();
    state.set("core/scope", {
      ...(state.value("core/scope") ?? {}),
      endStates: { "106": "MERGED" },
    });
    const { factory: data } = await available(factory);
    expect(data.issues.find((issue) => issue.issue === 106)?.endState).toBe(
      "MERGED",
    );
  });
});

// Wave 1b: the lifecycle owner's work item fields and the readiness owner's
// PR and feedback fields. The Console shows what an operator acts on and
// strips the rest deliberately.
const DIGEST = (seed: string) => seed.repeat(64).slice(0, 64);

describe("lifecycle facts", () => {
  it("reads the blocker's route, round budgets, the last refused claim and request notes", async () => {
    const { factory, state } = harness();
    edit(state, 104, (value) => ({
      ...value,
      workRounds: 3,
      feedbackRounds: 1,
      blocker: {
        ...(value.blocker as Record<string, unknown>),
        code: "round-limit",
        route: "repair",
      },
      lastRefusal: {
        run: RUN.blocked104,
        code: "policy-changed",
        at: value.updatedAt,
      },
      requests: [
        {
          id: "cr-fixtureretry-0000000000000000-0000000000000000",
          action: "retry",
          by: "conrad",
          at: value.updatedAt,
          policy: { from: DIGEST("c"), to: DIGEST("1") },
          profile: { from: DIGEST("a"), to: DIGEST("2") },
        },
      ],
    }));
    const { factory: data } = await available(factory);
    expect(data.malformed).toEqual([]);
    expect(
      data.issues.find((issue) => issue.issue === 104)?.blocker,
    ).toMatchObject({ code: "round-limit", route: "repair" });
    const detail = await factory.issue(104);
    expect(detail.item).toMatchObject({
      workRounds: 3,
      feedbackRounds: 1,
      blocker: { code: "round-limit", route: "repair" },
      lastRefusal: { run: RUN.blocked104, code: "policy-changed" },
    });
    expect(detail.item?.requests[0]).toMatchObject({
      action: "retry",
      policy: { from: DIGEST("c"), to: DIGEST("1") },
      profileRebound: true,
    });
    // Profile digests stay on the server, as everywhere else.
    expect(JSON.stringify(detail)).not.toContain(DIGEST("2"));
    expect(JSON.stringify(detail)).not.toContain(DIGEST("a"));
  });

  it("defaults the budgets of an older work item and drops a malformed note instead of the item", async () => {
    const { factory, state } = harness();
    // A work item written before the budgets and the refusal marker existed.
    edit(state, 107, ({ workRounds: _, lastRefusal: __, ...value }) => ({
      ...value,
      requests: [
        {
          id: "cr-fixturehold-0000000000000000-0000000000000000",
          action: "release",
          by: "conrad",
          at: value.updatedAt,
          policy: { from: 7 },
        },
      ],
    }));
    const detail = await factory.issue(107);
    expect(detail.item).toMatchObject({
      workRounds: 0,
      lastRefusal: null,
    });
    expect(detail.item?.requests[0]).toMatchObject({
      action: "release",
      policy: null,
      profileRebound: false,
    });
  });

  it("reads parked, reconciled and externally merged rounds in the history", async () => {
    const { factory, state } = harness();
    edit(state, 105, (value) => ({
      ...value,
      history: [
        {
          round: 1,
          run: RUN.history101,
          route: "initial",
          outcome: "parked",
          next: "initial",
          at: value.updatedAt,
          summary: "after-scope: fixture-area is reserved by #102",
        },
        {
          round: 2,
          run: RUN.blocked104,
          route: "initial",
          outcome: "reconciled",
          next: "initial",
          at: value.updatedAt,
          summary: `Run ${RUN.blocked104} ended (cancelled) without recording its round`,
        },
        {
          round: 3,
          run: RUN.merged105,
          route: "feedback",
          outcome: "MERGED",
          next: null,
          at: value.updatedAt,
          external: true,
          summary: "Merged outside the factory. PR #9105 merged",
        },
      ],
    }));
    const detail = await factory.issue(105);
    expect(detail.item?.history.map((entry) => entry.outcome)).toEqual([
      "parked",
      "reconciled",
      "MERGED",
    ]);
    expect(detail.item?.history.at(-1)?.external).toBe(true);
    expect(detail.item?.history[0]?.external).toBe(false);
    const { factory: data } = await available(factory);
    expect(
      data.issues.find((issue) => issue.issue === 105)?.history.at(-1)
        ?.external,
    ).toBe(true);
  });
});

describe("readiness facts", () => {
  it("shows a pending base integration, the factory's merge request, who merged and the closeout", async () => {
    const { factory, state } = harness();
    edit(state, 107, (value) => ({
      ...value,
      pr: {
        ...(value.pr as Record<string, unknown>),
        pending: {
          head: "a".repeat(40),
          base: "b".repeat(40),
          from: "9".repeat(40),
          carried: true,
          at: value.updatedAt,
        },
      },
    }));
    edit(state, 105, (value) => ({
      ...value,
      assignment: {
        ...(value.assignment as Record<string, unknown>),
        endState: "MERGED",
      },
      pr: {
        ...(value.pr as Record<string, unknown>),
        mergeRequest: {
          head: "7".repeat(40),
          at: value.updatedAt,
          run: RUN.merged105,
        },
        mergedBy: "factory",
        onTarget: true,
        issueClosed: true,
      },
    }));
    const waiting = await factory.issue(107);
    expect(waiting.item?.pr?.pending).toEqual({
      head: "a".repeat(40),
      base: "b".repeat(40),
      from: "9".repeat(40),
      carried: true,
      at: expect.any(String),
    });
    const merged = await factory.issue(105);
    expect(merged.item?.pr).toMatchObject({
      mergedBy: "factory",
      onTarget: true,
      issueClosed: true,
      mergeRequest: { head: "7".repeat(40), run: RUN.merged105 },
    });
    // The PR's GraphQL node id is not an operator fact.
    expect(JSON.stringify(merged)).not.toContain("nodeId");
  });

  it("shows fix-pending and fixed dispositions and strips GitHub comment identities", async () => {
    const { factory, state } = harness();
    state.set("core/issues/103/feedback", {
      v: 1,
      dispositions: {
        "thread-1": {
          action: "fix-implementation",
          reason: "Reviewer found a missing label",
          head: "6".repeat(40),
          kind: "review-thread",
          lastComment: "PRRC_fixture_comment_identity",
          updatedAt: "2026-11-11T00:00:00.000Z",
          status: "fixed",
          fixedIn: "6".repeat(40),
          resolvedAt: "2026-11-11T01:00:00.000Z",
          at: "2026-11-11T00:30:00.000Z",
          run: RUN.published103,
        },
        "comment-2": {
          action: "fix-acceptance",
          reason: "The oracle misses the empty state",
          head: "6".repeat(40),
          kind: "comment",
          status: "fix-pending",
          at: "2026-11-11T00:30:00.000Z",
          run: RUN.published103,
        },
        "check-3": {
          action: "rerun-flake",
          reason: "Known flaky runner",
          head: "6".repeat(40),
          kind: "failed-check",
          status: "something-new",
          at: "2026-11-11T00:30:00.000Z",
          run: RUN.published103,
        },
      },
    });
    const detail = await factory.issue(103);
    expect(detail.feedback?.dispositions["thread-1"]).toEqual({
      action: "fix-implementation",
      reason: "Reviewer found a missing label",
      head: "6".repeat(40),
      kind: "review-thread",
      status: "fixed",
      fixedIn: "6".repeat(40),
      resolvedAt: "2026-11-11T01:00:00.000Z",
      at: "2026-11-11T00:30:00.000Z",
      run: RUN.published103,
    });
    expect(detail.feedback?.dispositions["comment-2"]).toMatchObject({
      kind: "comment",
      status: "fix-pending",
    });
    // An unknown status is shown as not recorded, never as a fix state.
    expect(detail.feedback?.dispositions["check-3"]?.status).toBeNull();
    expect(JSON.stringify(detail)).not.toContain("PRRC_fixture");
  });
});

describe("reconcile control", () => {
  it("accepts reconcile as an issue action with the exact control.mjs argv", () => {
    const action = controlActionSchema.parse({
      kind: "issue",
      issue: 104,
      action: "reconcile",
    });
    expect(describeAction(action)).toBe("Reconcile issue #104");
    expect(DESTRUCTIVE.has(actionKey(action))).toBe(false);
    expect(
      controlArgs(
        action,
        "cr-fixture00-0000000000000000-0000000000000000",
        "conrad",
      ),
    ).toEqual([
      "issue",
      "104",
      "reconcile",
      "--request",
      "cr-fixture00-0000000000000000-0000000000000000",
      "--by",
      "conrad",
    ]);
  });

  // The pack's explicit policy transition (`issue <n> adopt-policy`).
  it("accepts adopt-policy as an issue action with the exact control.mjs argv", () => {
    const action = controlActionSchema.parse({
      kind: "issue",
      issue: 104,
      action: "adopt-policy",
      reason: "release 1e7d fixes final acceptance",
    });
    expect(describeAction(action)).toBe(
      "Move issue #104 to the installed release",
    );
    expect(
      controlArgs(
        action,
        "cr-fixture00-0000000000000000-0000000000000000",
        "conrad",
      ),
    ).toEqual([
      "issue",
      "104",
      "adopt-policy",
      "--request",
      "cr-fixture00-0000000000000000-0000000000000000",
      "--by",
      "conrad",
      "--reason",
      "release 1e7d fixes final acceptance",
    ]);
  });

  // The pack's way out of a provider-fault hold (`issue <n> recover-native`).
  it("accepts recover-native as a confirmed issue action with the exact control.mjs argv", () => {
    const action = controlActionSchema.parse({
      kind: "issue",
      issue: 104,
      action: "recover-native",
      reason: "sign-in renewed",
    });
    expect(describeAction(action)).toBe(
      "Clear the provider-fault hold on issue #104",
    );
    // It ends a paused or failed run, so the operator confirms it first.
    expect(DESTRUCTIVE.has(actionKey(action))).toBe(true);
    expect(
      controlArgs(
        action,
        "cr-fixture00-0000000000000000-0000000000000000",
        "conrad",
      ),
    ).toEqual([
      "issue",
      "104",
      "recover-native",
      "--request",
      "cr-fixture00-0000000000000000-0000000000000000",
      "--by",
      "conrad",
      "--reason",
      "sign-in renewed",
    ]);
  });

  it("explains what stopped a provider-fault recovery and names the control that clears the hold", () => {
    for (const code of [
      "no-native-hold",
      "effects-unreconciled",
      "containers-unconfirmed",
      "run-not-ended",
    ])
      expect(REFUSAL_MESSAGES[code], code).toBeTruthy();
    expect(REFUSAL_MESSAGES["native-fault-held"]).toMatch(
      /Clear the provider-fault hold/,
    );
    expect(REFUSAL_MESSAGES["native-fault-held"]).not.toMatch(/unavailable/);
  });

  it("explains the policy refusals without promising what a control cannot do", () => {
    for (const code of ["policy-current", "not-adoptable"])
      expect(REFUSAL_MESSAGES[code], code).toBeTruthy();
    // Retry never re-binds: the transition is its own control.
    expect(REFUSAL_MESSAGES["policy-changed"]).not.toMatch(/retry re-binds/);
    for (const code of ["policy-changed", "policy-transition-required"])
      expect(REFUSAL_MESSAGES[code], code).toMatch(
        /Move the issue to the installed release/,
      );
  });

  it("explains every refusal the pack's reconcile and claim can record", () => {
    for (const code of [
      "not-active",
      "lease-live",
      "run-not-terminal",
      "run-changed",
      "run-unconfirmed",
      "unreconciled-run",
      "lease-held",
      "terminal",
      "no-route",
      "policy-changed",
      "assignment-mismatch",
    ])
      expect(REFUSAL_MESSAGES[code], code).toBeTruthy();
  });

  it("refuses while the round's lease is live and settles a run that ended without recording", async () => {
    const { factory, ids, state } = harness();
    const live = await factory.execute(
      { kind: "issue", issue: 101, action: "reconcile" },
      ids.mint(),
    );
    expect(live).toMatchObject({ outcome: "refused", code: "lease-live" });
    const stored = state.docs.get("core/issues/101");
    if (stored) stored.lease = { runId: RUN.repair, live: false };
    const settled = await factory.execute(
      { kind: "issue", issue: 101, action: "reconcile" },
      ids.mint(),
    );
    expect(settled).toMatchObject({
      outcome: "applied",
      observed: {
        summary: "#101 control run · status waiting · route repair",
        recorded: true,
      },
    });
    const detail = await factory.issue(101);
    expect(detail.item?.history.at(-1)).toMatchObject({
      outcome: "reconciled",
      next: "repair",
    });
    const terminal = await factory.execute(
      { kind: "issue", issue: 103, action: "reconcile" },
      ids.mint(),
    );
    expect(terminal).toMatchObject({ outcome: "refused", code: "not-active" });
  });
});
