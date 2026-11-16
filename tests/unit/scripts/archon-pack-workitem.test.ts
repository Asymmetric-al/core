import { describe, expect, it } from "vitest";

import {
  ROUTES,
  Refusal,
  TERMINAL,
  createAssignment,
  factoryDefaults,
  factoryPermitsIntake,
  factoryPermitsRound,
  planCheckpoint,
  planClaim,
  planControl,
  planFactoryControl,
  planFinish,
  validWorkItem,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

// The work item is pure: every plan is computed from an observed Archon state
// document `{ name, revision, value, lease }`. These helpers stand in for the
// Archon store by turning a plan's value back into the next observation.

type Lease = { runId: string; live: boolean } | null;
type Doc = {
  name: string;
  revision: unknown;
  value: Record<string, unknown> | null | undefined;
  lease: Lease;
};
type Args = Record<string, unknown>;

const ASSIGNED_AT = "2026-11-11T09:00:00.000Z";
const LATER = "2026-11-11T10:00:00.000Z";
const ASSIGNMENT = "a42-0123456789ab";
const POLICY = "c".repeat(64);

function assign(overrides: Args = {}) {
  return createAssignment({
    issue: 42,
    assignmentId: ASSIGNMENT,
    owner: "conrad",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: POLICY,
    endState: "PR_READY",
    areas: ["packages/api", "apps/admin"],
    reason: "Highest-ranked eligible issue",
    by: "selector:run-0",
    now: ASSIGNED_AT,
    ...overrides,
  });
}

function observed(
  value: Record<string, unknown> | null | undefined,
  revision: unknown = 1,
  lease: Lease = null,
): Doc {
  return { name: "core/issues/42", revision, value, lease };
}

const claimArgs = (runId: string, extra: Args = {}) => ({
  runId,
  assignmentId: ASSIGNMENT,
  policyRevision: POLICY,
  now: LATER,
  ...extra,
});

// Claims a waiting/pending item for runId; returns the document as Archon
// reports it after the write: the run holds a live lease.
function claimed(document: Doc = observed(assign()), runId = "run-1"): Doc {
  const plan = planClaim(document, claimArgs(runId));
  return observed(plan.value, (document.revision as number) + 1, {
    runId,
    live: true,
  });
}

// Finishes the round runId holds; the lease is released (no longer live).
function finished(document: Doc, runId: string, args: Args): Doc {
  const plan = planFinish(document, { runId, now: LATER, ...args });
  return observed(plan.value, (document.revision as number) + 1, {
    runId,
    live: false,
  });
}

// One complete round: claim, then finish.
function cycle(document: Doc, runId: string, finish: Args): Doc {
  return finished(claimed(document, runId), runId, finish);
}

function control(document: Doc, action: string, requestId: string) {
  return planControl(document, {
    action,
    requestId,
    reason: `operator ${action}`,
    by: "conrad",
    now: LATER,
    installed: { policyRevision: POLICY },
  });
}

// Applies a control and returns the next observed document.
function controlled(document: Doc, action: string, requestId: string): Doc {
  const plan = control(document, action, requestId);
  return observed(
    plan.value,
    (document.revision as number) + 1,
    document.lease,
  );
}

function refusal(action: () => unknown): { code: string; message: string } {
  try {
    action();
  } catch (error) {
    if (error instanceof Refusal)
      return {
        code: (error as unknown as { code: string }).code,
        message: (error as Error).message,
      };
    throw error;
  }
  throw new Error("Expected a Refusal, but the plan succeeded");
}

const codeOf = (action: () => unknown) => refusal(action).code;

describe("constants and Refusal", () => {
  // I1 adds the review-only route.
  it("names exactly the six delivery routes", () => {
    expect(ROUTES).toEqual([
      "initial",
      "repair",
      "oracle",
      "review",
      "feedback",
      "deliver",
    ]);
  });

  it("treats PR_READY, MERGED, BLOCKED and stopped as terminal", () => {
    expect([...TERMINAL].sort()).toEqual([
      "BLOCKED",
      "MERGED",
      "PR_READY",
      "stopped",
    ]);
  });

  it("carries its code and joins the detail into the message", () => {
    const error = new Refusal("lease-held", "run-9");
    expect({
      isError: error instanceof Error,
      name: error.name,
      code: error.code,
      message: error.message,
    }).toEqual({
      isError: true,
      name: "Refusal",
      code: "lease-held",
      message: "lease-held: run-9",
    });
  });

  it("uses the bare code as the message when there is no detail", () => {
    expect(new Refusal("held").message).toBe("held");
  });
});

describe("createAssignment", () => {
  it("records the assignment and starts a pending, running, initial item at round 0", () => {
    expect(assign()).toEqual({
      v: 1,
      issue: 42,
      assignment: {
        id: ASSIGNMENT,
        owner: "conrad",
        profileDigest: "a".repeat(64),
        scopeRevision: "b".repeat(64),
        policyRevision: POLICY,
        endState: "PR_READY",
        assignedAt: ASSIGNED_AT,
        assignedBy: "selector:run-0",
        reason: "Highest-ranked eligible issue",
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
      areas: ["apps/admin", "packages/api"],
      history: [],
      requests: [],
      updatedAt: ASSIGNED_AT,
    });
  });

  it("deduplicates and sorts reserved areas", () => {
    expect(assign({ areas: ["z", "a", "z", "m"] }).areas).toEqual([
      "a",
      "m",
      "z",
    ]);
  });

  it("clips the assignment reason to 1200 characters", () => {
    expect(assign({ reason: "r".repeat(1500) }).assignment.reason).toHaveLength(
      1200,
    );
  });

  it("stores a missing reason as null", () => {
    expect(assign({ reason: undefined }).assignment.reason).toBeNull();
  });

  it("accepts MERGED as an end state", () => {
    expect(assign({ endState: "MERGED" }).assignment.endState).toBe("MERGED");
  });

  it("accepts an assignment id of exactly 128 characters", () => {
    expect(assign({ assignmentId: "a".repeat(128) }).assignment.id).toBe(
      "a".repeat(128),
    );
  });

  it.each([
    ["a non-hex profile digest", { profileDigest: "z".repeat(64) }],
    ["a short scope revision", { scopeRevision: "b".repeat(63) }],
    ["an uppercase policy revision", { policyRevision: "C".repeat(64) }],
    ["an unknown end state", { endState: "DEPLOYED" }],
    ["a zero issue", { issue: 0 }],
    ["a fractional issue", { issue: 4.2 }],
    ["an assignment id starting with punctuation", { assignmentId: "-a42" }],
    ["an assignment id of 129 characters", { assignmentId: "a".repeat(129) }],
    ["a missing assignment id", { assignmentId: undefined }],
    ["a non-string owner", { owner: 7 }],
  ])("refuses %s as an invalid assignment", (_label, overrides) => {
    expect(codeOf(() => assign(overrides))).toBe("invalid-assignment");
  });
});

describe("validWorkItem", () => {
  it("accepts a freshly created work item", () => {
    expect(validWorkItem(assign())).toBe(true);
  });

  it("accepts a work item whose route is null", () => {
    expect(validWorkItem({ ...assign(), route: null })).toBe(true);
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["a string", "core/issues/42"],
  ])("rejects %s", (_label, value) => {
    expect(validWorkItem(value)).toBe(false);
  });

  it.each([
    ["another schema version", { v: 2 }],
    ["a negative issue", { issue: -1 }],
    ["a missing assignment", { assignment: null }],
    ["an unknown control", { control: "pause" }],
    ["an unknown status", { status: "running" }],
    ["a negative round", { round: -1 }],
    ["a fractional round", { round: 1.5 }],
    ["an unknown route", { route: "deploy" }],
    ["a non-array history", { history: {} }],
    ["missing areas", { areas: undefined }],
  ])("rejects a work item with %s", (_label, overrides) => {
    expect(validWorkItem({ ...assign(), ...overrides })).toBe(false);
  });
});

describe("observing the work item document", () => {
  it("refuses an observation without an integer revision", () => {
    expect(
      codeOf(() => planClaim(observed(assign(), "1"), claimArgs("run-1"))),
    ).toBe("invalid-observation");
  });

  it("refuses an observation that is not a document", () => {
    expect(
      codeOf(() => planClaim(null as unknown as Doc, claimArgs("run-1"))),
    ).toBe("invalid-observation");
  });

  it.each([null, undefined])(
    "refuses an issue whose recorded value is %j as having no assignment",
    (value) => {
      expect(
        codeOf(() => planClaim(observed(value, 0), claimArgs("run-1"))),
      ).toBe("no-assignment");
    },
  );

  it("refuses a malformed work item", () => {
    expect(
      codeOf(() =>
        planClaim(observed({ v: 1, issue: 42 }), claimArgs("run-1")),
      ),
    ).toBe("malformed-work-item");
  });
});

describe("planClaim", () => {
  it("takes the lease for a fresh round: round 1, active, run recorded on the item's route", () => {
    const plan = planClaim(observed(assign(), 4), claimArgs("run-1"));
    expect({
      name: plan.name,
      ifRevision: plan.ifRevision,
      lease: plan.lease,
      resuming: plan.resuming,
      status: plan.value.status,
      round: plan.value.round,
      run: plan.value.run,
      updatedAt: plan.value.updatedAt,
    }).toEqual({
      name: "core/issues/42",
      ifRevision: 4,
      lease: "take",
      resuming: false,
      status: "active",
      round: 1,
      run: { id: "run-1", startedAt: LATER, route: "initial", head: null },
      updatedAt: LATER,
    });
  });

  it("does not modify the observed document", () => {
    const value = assign();
    planClaim(observed(value), claimArgs("run-1"));
    expect({
      status: value.status,
      round: value.round,
      run: value.run,
    }).toEqual({
      status: "pending",
      round: 0,
      run: null,
    });
  });

  it("refuses a lease another live run holds, naming the holder", () => {
    const document = observed(assign(), 3, { runId: "run-other", live: true });
    expect(refusal(() => planClaim(document, claimArgs("run-1")))).toEqual({
      code: "lease-held",
      message: "lease-held: run-other",
    });
  });

  it("takes over a lease a finished run no longer holds live", () => {
    const waiting = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "repair",
    });
    const plan = planClaim(waiting, claimArgs("run-2"));
    expect({ round: plan.value.round, run: plan.value.run }).toEqual({
      round: 2,
      run: { id: "run-2", startedAt: LATER, route: "repair", head: null },
    });
  });

  it("refuses an item an operator holds", () => {
    const held = controlled(observed(assign()), "hold", "req-hold-0001");
    expect(codeOf(() => planClaim(held, claimArgs("run-1")))).toBe("held");
  });

  it("refuses an item an operator stopped", () => {
    const stopped = controlled(observed(assign()), "stop", "req-stop-0001");
    expect(codeOf(() => planClaim(stopped, claimArgs("run-1")))).toBe(
      "stopped",
    );
  });

  it.each(["PR_READY", "MERGED", "BLOCKED", "stopped"])(
    "refuses a %s item as terminal",
    (status) => {
      const document = observed({ ...assign(), status });
      expect(refusal(() => planClaim(document, claimArgs("run-1")))).toEqual({
        code: "terminal",
        message: `terminal: ${status}`,
      });
    },
  );

  it("refuses an item still active under another run whose lease lapsed", () => {
    const active = claimed(observed(assign()), "run-1");
    const lapsed = { ...active, lease: { runId: "run-1", live: false } };
    expect(refusal(() => planClaim(lapsed, claimArgs("run-2")))).toEqual({
      code: "unreconciled-run",
      message: "unreconciled-run: run-1",
    });
  });

  it("refuses an item with no next route", () => {
    expect(
      codeOf(() =>
        planClaim(observed({ ...assign(), route: null }), claimArgs("run-1")),
      ),
    ).toBe("no-route");
  });

  it("refuses when the installed policy revision changed since assignment", () => {
    const args = claimArgs("run-1", { policyRevision: "d".repeat(64) });
    expect(codeOf(() => planClaim(observed(assign()), args))).toBe(
      "policy-changed",
    );
  });

  it("refuses a claim for another assignment", () => {
    const args = claimArgs("run-1", { assignmentId: "a42-ffffffffffff" });
    expect(codeOf(() => planClaim(observed(assign()), args))).toBe(
      "assignment-mismatch",
    );
  });

  it.each([undefined, "", "-run", "run 1"])(
    "refuses the run id %j",
    (runId) => {
      expect(
        codeOf(() => planClaim(observed(assign()), claimArgs(runId as string))),
      ).toBe("invalid-run");
    },
  );

  it("lets the same run resume with its own lease, keeping round and run", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planClaim(
      active,
      claimArgs("run-1", { now: "2026-11-11T12:00:00.000Z" }),
    );
    expect({
      resuming: plan.resuming,
      lease: plan.lease,
      round: plan.value.round,
      run: plan.value.run,
      status: plan.value.status,
      updatedAt: plan.value.updatedAt,
    }).toEqual({
      resuming: true,
      lease: "take",
      round: 1,
      run: { id: "run-1", startedAt: LATER, route: "initial", head: null },
      status: "active",
      updatedAt: "2026-11-11T12:00:00.000Z",
    });
  });

  it("lets a failed run resume after its own lease lapsed, keeping its round", () => {
    const active = claimed(observed(assign()), "run-1");
    const lapsed = { ...active, lease: { runId: "run-1", live: false } };
    const plan = planClaim(lapsed, claimArgs("run-1"));
    expect({
      resuming: plan.resuming,
      lease: plan.lease,
      round: plan.value.round,
    }).toEqual({ resuming: true, lease: "take", round: 1 });
  });

  it("does not resume a run whose lease record names another run", () => {
    const active = claimed(observed(assign()), "run-1");
    const foreign = { ...active, lease: { runId: "run-other", live: false } };
    expect(codeOf(() => planClaim(foreign, claimArgs("run-1")))).toBe(
      "unreconciled-run",
    );
  });

  it("does not resume a run the item does not record, even when the lease names it", () => {
    const active = claimed(observed(assign()), "run-1");
    const misattributed = { ...active, lease: { runId: "run-2", live: true } };
    expect(refusal(() => planClaim(misattributed, claimArgs("run-2")))).toEqual(
      {
        code: "unreconciled-run",
        message: "unreconciled-run: run-1",
      },
    );
  });

  it.each([
    ["hold", "held"],
    ["stop", "stopped"],
  ])("refuses to resume its own round after an operator %s", (action, code) => {
    const active = claimed(observed(assign()), "run-1");
    const controlledActive = controlled(active, action, `req-${action}-0001`);
    expect(codeOf(() => planClaim(controlledActive, claimArgs("run-1")))).toBe(
      code,
    );
  });

  it("refuses to resume its own round when the installed policy changed", () => {
    const active = claimed(observed(assign()), "run-1");
    const args = claimArgs("run-1", { policyRevision: "d".repeat(64) });
    expect(codeOf(() => planClaim(active, args))).toBe("policy-changed");
  });

  it("names the live lease holder ahead of an operator stop", () => {
    const active = claimed(observed(assign()), "run-1");
    const stopped = controlled(active, "stop", "req-stop-0001");
    expect(refusal(() => planClaim(stopped, claimArgs("run-2")))).toEqual({
      code: "lease-held",
      message: "lease-held: run-1",
    });
  });
});

describe("planCheckpoint", () => {
  it("lets the lease owner write allowed fields without touching the lease", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planCheckpoint(active, {
      runId: "run-1",
      fields: { branch: "factory/42-work", base: "f".repeat(40) },
      now: "2026-11-11T10:05:00.000Z",
    });
    expect({
      name: plan.name,
      ifRevision: plan.ifRevision,
      lease: plan.lease,
      branch: plan.value.branch,
      base: plan.value.base,
      head: plan.value.head,
      status: plan.value.status,
      updatedAt: plan.value.updatedAt,
    }).toEqual({
      name: "core/issues/42",
      ifRevision: 2,
      lease: undefined,
      branch: "factory/42-work",
      base: "f".repeat(40),
      head: null,
      status: "active",
      updatedAt: "2026-11-11T10:05:00.000Z",
    });
  });

  it("replaces a field's whole value rather than deep-merging it", () => {
    let document = claimed(observed(assign()), "run-1");
    const first = planCheckpoint(document, {
      runId: "run-1",
      fields: { pr: { number: 7, url: "https://example.test/pull/7" } },
      now: LATER,
    });
    document = observed(first.value, 3, document.lease);
    const second = planCheckpoint(document, {
      runId: "run-1",
      fields: { pr: { number: 7, head: "e".repeat(40) } },
      now: LATER,
    });
    expect(second.value.pr).toEqual({ number: 7, head: "e".repeat(40) });
  });

  it("treats a checkpoint without fields as a touch of updatedAt only", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planCheckpoint(active, {
      runId: "run-1",
      now: "2026-11-11T10:05:00.000Z",
    });
    expect(plan.value).toEqual({
      ...active.value,
      updatedAt: "2026-11-11T10:05:00.000Z",
    });
  });

  it("clears fields set to null", () => {
    let document = claimed(observed(assign()), "run-1");
    const first = planCheckpoint(document, {
      runId: "run-1",
      fields: { reviews: { micaiah: "pass" } },
      now: LATER,
    });
    document = observed(first.value, 3, document.lease);
    const second = planCheckpoint(document, {
      runId: "run-1",
      fields: { reviews: null },
      now: LATER,
    });
    expect(second.value.reviews).toBeNull();
  });

  it("refuses a run that is not the item's current run", () => {
    const active = claimed(observed(assign()), "run-1");
    expect(
      codeOf(() =>
        planCheckpoint(active, { runId: "run-2", fields: {}, now: LATER }),
      ),
    ).toBe("not-owner");
  });

  it("refuses the item's run when the lease belongs to another run", () => {
    const active = claimed(observed(assign()), "run-1");
    const stolen = { ...active, lease: { runId: "run-2", live: true } };
    expect(
      codeOf(() =>
        planCheckpoint(stolen, { runId: "run-1", fields: {}, now: LATER }),
      ),
    ).toBe("not-owner");
  });

  it("refuses a checkpoint when no run holds the item", () => {
    expect(
      codeOf(() =>
        planCheckpoint(observed(assign()), {
          runId: "run-1",
          fields: {},
          now: LATER,
        }),
      ),
    ).toBe("not-owner");
  });

  it.each(["status", "control", "round", "assignment", "history"])(
    "refuses to checkpoint the protected field %s",
    (field) => {
      const active = claimed(observed(assign()), "run-1");
      expect(
        refusal(() =>
          planCheckpoint(active, {
            runId: "run-1",
            fields: { [field]: "x" },
            now: LATER,
          }),
        ),
      ).toEqual({
        code: "field-not-allowed",
        message: `field-not-allowed: ${field}`,
      });
    },
  );
});

describe("planFinish", () => {
  const finishArgs = (args: Args) => ({ runId: "run-1", now: LATER, ...args });

  it("refuses a run that is not the item's current run", () => {
    const active = claimed(observed(assign()), "run-1");
    expect(
      codeOf(() =>
        planFinish(active, {
          ...finishArgs({ outcome: "PR_READY" }),
          runId: "run-2",
        }),
      ),
    ).toBe("not-owner");
  });

  it("refuses the item's run when the lease belongs to another run", () => {
    const active = claimed(observed(assign()), "run-1");
    const stolen = { ...active, lease: { runId: "run-2", live: true } };
    expect(
      codeOf(() => planFinish(stolen, finishArgs({ outcome: "PR_READY" }))),
    ).toBe("not-owner");
  });

  it("releases the lease and clears the run", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(active, finishArgs({ outcome: "PR_READY" }));
    expect({
      name: plan.name,
      ifRevision: plan.ifRevision,
      lease: plan.lease,
      run: plan.value.run,
    }).toEqual({
      name: "core/issues/42",
      ifRevision: 2,
      lease: "release",
      run: null,
    });
  });

  it("continues on the requested route as a waiting item", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(
      active,
      finishArgs({ outcome: "continue", route: "repair" }),
    );
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
      blocker: plan.value.blocker,
    }).toEqual({
      outcome: "continue",
      status: "waiting",
      route: "repair",
      blocker: null,
    });
  });

  it.each([null, undefined, "deploy"])(
    "refuses to continue on the route %j",
    (route) => {
      const active = claimed(observed(assign()), "run-1");
      expect(
        codeOf(() =>
          planFinish(active, finishArgs({ outcome: "continue", route })),
        ),
      ).toBe("route-required");
    },
  );

  it("refuses an unknown outcome", () => {
    const active = claimed(observed(assign()), "run-1");
    expect(
      refusal(() => planFinish(active, finishArgs({ outcome: "WAIT" }))),
    ).toEqual({
      code: "invalid-outcome",
      message: "invalid-outcome: WAIT",
    });
  });

  it("refuses MERGED when the assignment only authorizes PR_READY", () => {
    const active = claimed(observed(assign({ endState: "PR_READY" })), "run-1");
    expect(
      codeOf(() => planFinish(active, finishArgs({ outcome: "MERGED" }))),
    ).toBe("merge-not-authorized");
  });

  it("records MERGED when the assignment authorizes merging", () => {
    const active = claimed(observed(assign({ endState: "MERGED" })), "run-1");
    const plan = planFinish(active, finishArgs({ outcome: "MERGED" }));
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
    }).toEqual({ outcome: "MERGED", status: "MERGED", route: null });
  });

  it("records PR_READY with no next route", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(active, finishArgs({ outcome: "PR_READY" }));
    expect({ status: plan.value.status, route: plan.value.route }).toEqual({
      status: "PR_READY",
      route: null,
    });
  });

  it("parks a held round as waiting on the route it was running", () => {
    const repairing = claimed(
      cycle(observed(assign()), "run-0", {
        outcome: "continue",
        route: "repair",
      }),
      "run-1",
    );
    const plan = planFinish(repairing, finishArgs({ outcome: "held" }));
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
    }).toEqual({ outcome: "held", status: "waiting", route: "repair" });
  });

  // wiring-bugs#9: a stopped item keeps the route reopen resumes.
  it("records a stopped round as stopped, keeping the route it ran for reopen", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(active, finishArgs({ outcome: "stopped" }));
    expect({ status: plan.value.status, route: plan.value.route }).toEqual({
      status: "stopped",
      route: "initial",
    });
  });

  it("records the blocker of a BLOCKED round with clipped text and the finish time", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(
      active,
      finishArgs({
        outcome: "BLOCKED",
        blocker: {
          code: "k".repeat(100),
          detail: "d".repeat(1300),
          recovery: "r".repeat(700),
        },
      }),
    );
    expect(plan.value.blocker).toEqual({
      code: "k".repeat(80),
      detail: "d".repeat(1200),
      recovery: "r".repeat(600),
      route: "initial",
      at: LATER,
    });
  });

  it("records a generic blocker when a BLOCKED round names none", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(active, finishArgs({ outcome: "BLOCKED" }));
    expect(plan.value.blocker).toEqual({
      code: "blocked",
      detail: null,
      recovery: null,
      route: "initial",
      at: LATER,
    });
  });

  it("drops the blocker argument unless the round is BLOCKED", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(
      active,
      finishArgs({ outcome: "PR_READY", blocker: { code: "ignored" } }),
    );
    expect(plan.value.blocker).toBeNull();
  });

  it("appends one history entry describing the round", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(
      active,
      finishArgs({
        outcome: "continue",
        route: "feedback",
        summary: "s".repeat(600),
      }),
    );
    expect(plan.value.history).toEqual([
      {
        round: 1,
        run: "run-1",
        route: "initial",
        outcome: "continue",
        next: "feedback",
        at: LATER,
        summary: "s".repeat(500),
      },
    ]);
  });

  it("keeps only the last 12 rounds of history, dropping the oldest", () => {
    let document = observed(assign());
    for (let round = 1; round <= 13; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: "repair",
        limits: { maxRounds: 99 },
      });
    expect(
      (document.value!.history as { round: number }[]).map(
        (entry) => entry.round,
      ),
    ).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it("keeps continuing while a no-progress fingerprint has repeated only twice", () => {
    const repeat = {
      outcome: "continue",
      route: "repair",
      fingerprint: "fp-tests",
    };
    const once = cycle(observed(assign()), "run-1", repeat);
    const active = claimed(once, "run-2");
    const plan = planFinish(active, { ...repeat, runId: "run-2", now: LATER });
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      repeats: plan.value.repeats,
    }).toEqual({
      outcome: "continue",
      status: "waiting",
      repeats: { "fp-tests": 2 },
    });
  });

  it("blocks with a no-progress blocker the third time the same fingerprint repeats", () => {
    const repeat = {
      outcome: "continue",
      route: "repair",
      fingerprint: "fp-tests",
    };
    const twice = cycle(
      cycle(observed(assign()), "run-1", repeat),
      "run-2",
      repeat,
    );
    const active = claimed(twice, "run-3");
    const plan = planFinish(active, { ...repeat, runId: "run-3", now: LATER });
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
      blocker: plan.value.blocker,
      lastHistory: (plan.value.history as unknown[]).at(-1),
    }).toEqual({
      outcome: "BLOCKED",
      status: "BLOCKED",
      route: null,
      blocker: {
        code: "no-progress",
        detail:
          "The same repair problem repeated 3 times without new progress.",
        recovery: null,
        route: "repair",
        at: LATER,
      },
      lastHistory: {
        round: 3,
        run: "run-3",
        route: "repair",
        outcome: "BLOCKED",
        next: null,
        at: LATER,
        summary: null,
      },
    });
  });

  it("keeps the round's own blocker when a round that does not continue carries a repeated fingerprint", () => {
    const repeat = {
      outcome: "continue",
      route: "repair",
      fingerprint: "fp-tests",
    };
    const twice = cycle(
      cycle(observed(assign()), "run-1", repeat),
      "run-2",
      repeat,
    );
    const active = claimed(twice, "run-3");
    const plan = planFinish(active, {
      runId: "run-3",
      now: LATER,
      outcome: "BLOCKED",
      blocker: { code: "round-limit", detail: "Reached 3 rounds" },
      fingerprint: "fp-tests",
    });
    expect({
      blocker: plan.value.blocker,
      repeats: plan.value.repeats,
    }).toEqual({
      blocker: {
        code: "round-limit",
        detail: "Reached 3 rounds",
        recovery: null,
        route: "repair",
        at: LATER,
      },
      repeats: { "fp-tests": 2 },
    });
  });

  // lease-control#10: a different problem restarts the streak, so only
  // consecutive repeats of one fingerprint count.
  it("keeps only the current streak of one no-progress fingerprint", () => {
    let document = observed(assign());
    for (const [index, fingerprint] of [
      "fp-a",
      "fp-b",
      "fp-a",
      "fp-b",
    ].entries())
      document = cycle(document, `run-${index + 1}`, {
        outcome: "continue",
        route: "repair",
        fingerprint,
      });
    expect({
      status: document.value!.status,
      repeats: document.value!.repeats,
    }).toEqual({
      status: "waiting",
      repeats: { "fp-b": 1 },
    });
  });

  it("does not count rounds that end without a fingerprint", () => {
    let document = observed(assign());
    for (let round = 1; round <= 3; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: "repair",
      });
    expect({
      status: document.value!.status,
      repeats: document.value!.repeats,
    }).toEqual({
      status: "waiting",
      repeats: {},
    });
  });

  it("counts a continuation into feedback as a feedback round", () => {
    let document = observed(assign());
    document = cycle(document, "run-1", {
      outcome: "continue",
      route: "feedback",
    });
    document = cycle(document, "run-2", {
      outcome: "continue",
      route: "repair",
    });
    document = cycle(document, "run-3", {
      outcome: "continue",
      route: "feedback",
    });
    expect(document.value!.feedbackRounds).toBe(2);
  });

  it("writes allowed fields with the finish", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = planFinish(
      active,
      finishArgs({ outcome: "PR_READY", fields: { pr: { number: 7 } } }),
    );
    expect(plan.value.pr).toEqual({ number: 7 });
  });

  it("refuses to finish with a protected field", () => {
    const active = claimed(observed(assign()), "run-1");
    expect(
      codeOf(() =>
        planFinish(
          active,
          finishArgs({ outcome: "PR_READY", fields: { control: "run" } }),
        ),
      ),
    ).toBe("field-not-allowed");
  });

  it("replaces the brief when one is given", () => {
    const active = claimed(
      observed({ ...assign(), brief: { goal: "old" } }),
      "run-1",
    );
    const plan = planFinish(
      active,
      finishArgs({
        outcome: "continue",
        route: "repair",
        brief: { goal: "new" },
      }),
    );
    expect(plan.value.brief).toEqual({ goal: "new" });
  });

  it("keeps the brief when none is given", () => {
    const active = claimed(
      observed({ ...assign(), brief: { goal: "old" } }),
      "run-1",
    );
    const plan = planFinish(
      active,
      finishArgs({ outcome: "continue", route: "repair" }),
    );
    expect(plan.value.brief).toEqual({ goal: "old" });
  });
});

describe("planControl", () => {
  it.each([undefined, "", "-req-0001", "req 0001", "r".repeat(129)])(
    "refuses the request id %j",
    (requestId) => {
      expect(
        codeOf(() =>
          planControl(observed(assign()), {
            action: "hold",
            requestId,
            by: "conrad",
            now: LATER,
          }),
        ),
      ).toBe("request-id-required");
    },
  );

  it("clips the control reason to 600 and the requester to 80 characters", () => {
    const plan = planControl(observed(assign()), {
      action: "hold",
      requestId: "req-hold-0001",
      reason: "r".repeat(700),
      by: "b".repeat(100),
      now: LATER,
    });
    expect({
      controlReason: plan.value.controlReason,
      by: (plan.value.requests as { by: string }[])[0].by,
    }).toEqual({ controlReason: "r".repeat(600), by: "b".repeat(80) });
  });

  it("holds an item and records the request without touching the lease", () => {
    const plan = control(observed(assign(), 5), "hold", "req-hold-0001");
    expect({
      name: plan.name,
      ifRevision: plan.ifRevision,
      lease: plan.lease,
      control: plan.value.control,
      controlReason: plan.value.controlReason,
      requests: plan.value.requests,
      updatedAt: plan.value.updatedAt,
    }).toEqual({
      name: "core/issues/42",
      ifRevision: 5,
      lease: undefined,
      control: "hold",
      controlReason: "operator hold",
      requests: [
        { id: "req-hold-0001", action: "hold", by: "conrad", at: LATER },
      ],
      updatedAt: LATER,
    });
  });

  it("treats a replayed request id as a no-op returning the stored item", () => {
    const held = controlled(observed(assign()), "hold", "req-hold-0001");
    expect(control(held, "hold", "req-hold-0001")).toEqual({
      noop: true,
      value: held.value,
    });
  });

  it("treats a replayed request id as a no-op even when the action differs", () => {
    const held = controlled(observed(assign()), "hold", "req-hold-0001");
    expect(control(held, "release", "req-hold-0001")).toEqual({
      noop: true,
      value: held.value,
    });
  });

  it("treats a replay of an older, superseded request as a no-op", () => {
    const held = controlled(observed(assign()), "hold", "req-hold-0001");
    const released = controlled(held, "release", "req-release-0001");
    expect(control(released, "hold", "req-hold-0001")).toEqual({
      noop: true,
      value: released.value,
    });
  });

  it("keeps only the last 20 control requests", () => {
    let document = observed(assign());
    for (let index = 1; index <= 21; index += 1)
      document = controlled(
        document,
        "hold",
        `req-${String(index).padStart(4, "0")}`,
      );
    const ids = (document.value!.requests as { id: string }[]).map(
      (request) => request.id,
    );
    expect({ length: ids.length, first: ids[0], last: ids.at(-1) }).toEqual({
      length: 20,
      first: "req-0002",
      last: "req-0021",
    });
  });

  it("releases a held item back to run", () => {
    const held = controlled(observed(assign()), "hold", "req-hold-0001");
    expect(control(held, "release", "req-release-0001").value.control).toBe(
      "run",
    );
  });

  it("refuses to release an item that is not held", () => {
    expect(
      codeOf(() => control(observed(assign()), "release", "req-release-0001")),
    ).toBe("not-held");
  });

  it("stops an idle item outright", () => {
    const plan = control(observed(assign()), "stop", "req-stop-0001");
    expect({ control: plan.value.control, status: plan.value.status }).toEqual({
      control: "stop",
      status: "stopped",
    });
  });

  it("stops an item with a live round without abandoning the round", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = control(active, "stop", "req-stop-0001");
    expect({
      control: plan.value.control,
      status: plan.value.status,
      run: plan.value.run,
      lease: plan.lease,
    }).toEqual({
      control: "stop",
      status: "active",
      run: { id: "run-1", startedAt: LATER, route: "initial", head: null },
      lease: undefined,
    });
  });

  it("keeps a stop sticky against hold", () => {
    const stopped = controlled(observed(assign()), "stop", "req-stop-0001");
    expect(codeOf(() => control(stopped, "hold", "req-hold-0001"))).toBe(
      "stopped",
    );
  });

  it("keeps a stop issued during a live round sticky against hold", () => {
    const active = claimed(observed(assign()), "run-1");
    const stopped = controlled(active, "stop", "req-stop-0001");
    expect(codeOf(() => control(stopped, "hold", "req-hold-0001"))).toBe(
      "stopped",
    );
  });

  it("keeps a stop sticky against release", () => {
    const stopped = controlled(observed(assign()), "stop", "req-stop-0001");
    expect(codeOf(() => control(stopped, "release", "req-release-0001"))).toBe(
      "not-held",
    );
  });

  it("keeps a stop sticky against retry", () => {
    const stopped = controlled(observed(assign()), "stop", "req-stop-0001");
    expect(refusal(() => control(stopped, "retry", "req-retry-0001"))).toEqual({
      code: "not-running",
      message: "not-running: stop",
    });
  });

  it("reopens an operator-stopped item as a pending, running item", () => {
    const stopped = controlled(observed(assign()), "stop", "req-stop-0001");
    const plan = control(stopped, "reopen", "req-reopen-0001");
    expect({
      control: plan.value.control,
      status: plan.value.status,
      route: plan.value.route,
    }).toEqual({ control: "run", status: "pending", route: "initial" });
  });

  it("lets a reopened, previously stopped item be claimed again", () => {
    const stopped = controlled(observed(assign()), "stop", "req-stop-0001");
    const reopened = controlled(stopped, "reopen", "req-reopen-0001");
    const plan = planClaim(reopened, claimArgs("run-1"));
    expect({ status: plan.value.status, round: plan.value.round }).toEqual({
      status: "active",
      round: 1,
    });
  });

  it("reopens an item stopped during a live round once that round recorded its stop", () => {
    const active = claimed(observed(assign()), "run-1");
    const stopping = controlled(active, "stop", "req-stop-0001");
    const stopped = finished(stopping, "run-1", { outcome: "stopped" });
    const plan = control(stopped, "reopen", "req-reopen-0001");
    expect({ control: plan.value.control, status: plan.value.status }).toEqual({
      control: "run",
      status: "pending",
    });
  });

  it("reopens a round-stopped item that was never operator-stopped", () => {
    const stopped = cycle(observed(assign()), "run-1", { outcome: "stopped" });
    const plan = control(stopped, "reopen", "req-reopen-0001");
    expect({ control: plan.value.control, status: plan.value.status }).toEqual({
      control: "run",
      status: "pending",
    });
  });

  it("reopens a PR_READY item with a pull request into feedback", () => {
    const ready = cycle(observed(assign()), "run-1", {
      outcome: "PR_READY",
      fields: { pr: { number: 7 } },
    });
    const plan = control(ready, "reopen", "req-reopen-0001");
    expect({ status: plan.value.status, route: plan.value.route }).toEqual({
      status: "pending",
      route: "feedback",
    });
  });

  it("refuses to reopen a held item", () => {
    const stopped = cycle(observed(assign()), "run-1", { outcome: "stopped" });
    const held = controlled(stopped, "hold", "req-hold-0001");
    expect(refusal(() => control(held, "reopen", "req-reopen-0001"))).toEqual({
      code: "not-running",
      message: "not-running: hold",
    });
  });

  it.each(["BLOCKED", "MERGED", "pending"])(
    "refuses to reopen a %s item",
    (status) => {
      const document = observed({ ...assign({ endState: "MERGED" }), status });
      expect(
        refusal(() => control(document, "reopen", "req-reopen-0001")),
      ).toEqual({
        code: "not-reopenable",
        message: `not-reopenable: ${status}`,
      });
    },
  );

  it("refuses to reopen an item whose round is still live", () => {
    const active = claimed(observed(assign()), "run-1");
    const stopped = controlled(active, "stop", "req-stop-0001");
    expect(codeOf(() => control(stopped, "reopen", "req-reopen-0001"))).toBe(
      "not-reopenable",
    );
  });

  it("retries a blocked item on its last route with the blocker and repeat counts cleared", () => {
    const repeat = {
      outcome: "continue",
      route: "repair",
      fingerprint: "fp-tests",
    };
    let document = cycle(observed(assign()), "run-1", repeat);
    document = cycle(document, "run-2", repeat);
    document = cycle(document, "run-3", {
      outcome: "BLOCKED",
      blocker: { code: "ci" },
    });
    const plan = control(document, "retry", "req-retry-0001");
    expect({
      status: plan.value.status,
      route: plan.value.route,
      blocker: plan.value.blocker,
      repeats: plan.value.repeats,
    }).toEqual({
      status: "pending",
      route: "repair",
      blocker: null,
      repeats: {},
    });
  });

  it("retries on the route that blocked, even when no round chose it as its next route", () => {
    const ready = cycle(observed(assign()), "run-1", {
      outcome: "PR_READY",
      fields: { pr: { number: 7 } },
    });
    const reopened = controlled(ready, "reopen", "req-reopen-0001");
    const blocked = cycle(reopened, "run-2", { outcome: "BLOCKED" });
    expect(control(blocked, "retry", "req-retry-0001").value.route).toBe(
      "feedback",
    );
  });

  it("retries a blocked item with no history on the initial route", () => {
    const document = observed({ ...assign(), status: "BLOCKED", route: null });
    expect(control(document, "retry", "req-retry-0001").value.route).toBe(
      "initial",
    );
  });

  it("refuses to retry an item that is not blocked", () => {
    expect(
      refusal(() => control(observed(assign()), "retry", "req-retry-0001")),
    ).toEqual({
      code: "not-blocked",
      message: "not-blocked: pending",
    });
  });

  it("refuses to retry a held item", () => {
    const blocked = cycle(observed(assign()), "run-1", { outcome: "BLOCKED" });
    const held = controlled(blocked, "hold", "req-hold-0001");
    expect(codeOf(() => control(held, "retry", "req-retry-0001"))).toBe(
      "not-running",
    );
  });

  it("refuses an unknown action", () => {
    expect(
      refusal(() => control(observed(assign()), "pause", "req-pause-0001")),
    ).toEqual({
      code: "unknown-action",
      message: "unknown-action: pause",
    });
  });
});

describe("factoryDefaults", () => {
  it("installs a running factory with intake paused and no merge hold", () => {
    expect(factoryDefaults(LATER)).toEqual({
      v: 1,
      intake: "paused",
      mode: "run",
      mergeHold: false,
      reason: "Installed; no scope admitted yet.",
      updatedAt: LATER,
      updatedBy: "installer",
      requests: [],
    });
  });
});

describe("planFactoryControl", () => {
  const factoryDoc = (value: Record<string, unknown> | null, revision = 1) => ({
    name: "core/factory",
    revision,
    value,
  });
  const factory = (overrides: Args = {}) => ({
    ...factoryDefaults(ASSIGNED_AT),
    ...overrides,
  });
  const act = (
    document: ReturnType<typeof factoryDoc>,
    action: string,
    requestId = "req-f-0001",
  ) =>
    planFactoryControl(document, {
      action,
      requestId,
      reason: `operator ${action}`,
      by: "conrad",
      now: LATER,
    });

  it("starts from the installed defaults when the factory document is missing", () => {
    const plan = act(factoryDoc(null, 0), "hold-merge");
    expect(plan).toEqual({
      name: "core/factory",
      ifRevision: 0,
      lease: undefined,
      value: {
        v: 1,
        intake: "paused",
        mode: "run",
        mergeHold: true,
        reason: "operator hold-merge",
        updatedAt: LATER,
        updatedBy: "conrad",
        requests: [
          { id: "req-f-0001", action: "hold-merge", by: "conrad", at: LATER },
        ],
      },
    });
  });

  it("replaces a factory document of another schema version with the defaults", () => {
    const plan = act(
      factoryDoc({ v: 2, mode: "stop", intake: "open" }),
      "release-merge",
    );
    expect({
      v: plan.value.v,
      mode: plan.value.mode,
      intake: plan.value.intake,
    }).toEqual({
      v: 1,
      mode: "run",
      intake: "paused",
    });
  });

  it("requires a request id", () => {
    expect(
      codeOf(() =>
        planFactoryControl(factoryDoc(factory()), {
          action: "drain",
          by: "conrad",
          now: LATER,
        }),
      ),
    ).toBe("request-id-required");
  });

  it("treats a replayed request id as a no-op returning the stored factory", () => {
    const stored = factory({
      requests: [{ id: "req-f-0001", action: "drain" }],
    });
    expect(act(factoryDoc(stored), "stop", "req-f-0001")).toEqual({
      noop: true,
      value: stored,
    });
  });

  it("treats a replay of an older, superseded factory request as a no-op", () => {
    const stored = factory({
      mode: "run",
      requests: [
        { id: "req-f-0001", action: "drain" },
        { id: "req-f-0002", action: "resume" },
      ],
    });
    expect(act(factoryDoc(stored), "drain", "req-f-0001")).toEqual({
      noop: true,
      value: stored,
    });
  });

  it("refuses an unknown action", () => {
    expect(refusal(() => act(factoryDoc(factory()), "explode"))).toEqual({
      code: "unknown-action",
      message: "unknown-action: explode",
    });
  });

  it("pauses intake", () => {
    expect(
      act(factoryDoc(factory({ intake: "open" })), "pause-intake").value.intake,
    ).toBe("paused");
  });

  it("opens intake", () => {
    expect(act(factoryDoc(factory()), "resume-intake").value.intake).toBe(
      "open",
    );
  });

  it("refuses to open intake while the factory is stopped", () => {
    expect(
      codeOf(() => act(factoryDoc(factory({ mode: "stop" })), "resume-intake")),
    ).toBe("factory-stopped");
  });

  it("drains: pauses intake and lets admitted work finish", () => {
    const plan = act(factoryDoc(factory({ intake: "open" })), "drain");
    expect({ intake: plan.value.intake, mode: plan.value.mode }).toEqual({
      intake: "paused",
      mode: "drain",
    });
  });

  it("stops: pauses intake and stops rounds", () => {
    const plan = act(factoryDoc(factory({ intake: "open" })), "stop");
    expect({ intake: plan.value.intake, mode: plan.value.mode }).toEqual({
      intake: "paused",
      mode: "stop",
    });
  });

  it("resumes rounds without reopening intake", () => {
    const plan = act(
      factoryDoc(factory({ mode: "stop", intake: "paused" })),
      "resume",
    );
    expect({ intake: plan.value.intake, mode: plan.value.mode }).toEqual({
      intake: "paused",
      mode: "run",
    });
  });

  it("holds merges", () => {
    expect(act(factoryDoc(factory()), "hold-merge").value.mergeHold).toBe(true);
  });

  it("releases a merge hold", () => {
    expect(
      act(factoryDoc(factory({ mergeHold: true })), "release-merge").value
        .mergeHold,
    ).toBe(false);
  });

  it("clips the reason to 600 and the operator to 80 characters", () => {
    const plan = planFactoryControl(factoryDoc(factory()), {
      action: "drain",
      requestId: "req-f-0001",
      reason: "r".repeat(700),
      by: "b".repeat(100),
      now: LATER,
    });
    expect({
      reason: plan.value.reason,
      updatedBy: plan.value.updatedBy,
      requestBy: (plan.value.requests as { by: string }[])[0].by,
    }).toEqual({
      reason: "r".repeat(600),
      updatedBy: "b".repeat(80),
      requestBy: "b".repeat(80),
    });
  });

  it("keeps only the last 20 factory requests", () => {
    const requests = Array.from({ length: 20 }, (_, index) => ({
      id: `req-old-${index + 1}`,
      action: "hold-merge",
    }));
    const plan = act(
      factoryDoc(factory({ requests })),
      "release-merge",
      "req-new-0001",
    );
    const ids = (plan.value.requests as { id: string }[]).map(
      (request) => request.id,
    );
    expect({ length: ids.length, first: ids[0], last: ids.at(-1) }).toEqual({
      length: 20,
      first: "req-old-2",
      last: "req-new-0001",
    });
  });
});

describe("factoryPermitsRound", () => {
  it.each([
    ["a missing factory", null, { ok: false, code: "factory-unconfigured" }],
    [
      "another schema version",
      { v: 2, mode: "run" },
      { ok: false, code: "factory-unconfigured" },
    ],
    [
      "a running factory",
      { v: 1, mode: "run", intake: "paused" },
      { ok: true },
    ],
    [
      "a draining factory",
      { v: 1, mode: "drain", intake: "paused" },
      { ok: true },
    ],
    [
      "a stopped factory",
      { v: 1, mode: "stop", intake: "paused" },
      { ok: false, code: "factory-stopped" },
    ],
  ])("answers for %s", (_label, factory, expected) => {
    expect(factoryPermitsRound(factory)).toEqual(expected);
  });
});

describe("factoryPermitsIntake", () => {
  it.each([
    ["a missing factory", null, { ok: false, code: "factory-unconfigured" }],
    [
      "another schema version",
      { v: 2, mode: "run", intake: "open" },
      { ok: false, code: "factory-unconfigured" },
    ],
    [
      "a running factory with intake open",
      { v: 1, mode: "run", intake: "open" },
      { ok: true },
    ],
    [
      "a running factory with intake paused",
      { v: 1, mode: "run", intake: "paused" },
      { ok: false, code: "intake-paused" },
    ],
    [
      "a running factory with no intake recorded",
      { v: 1, mode: "run" },
      { ok: false, code: "intake-paused" },
    ],
    [
      "a draining factory with intake open",
      { v: 1, mode: "drain", intake: "open" },
      { ok: false, code: "factory-drain" },
    ],
    [
      "a stopped factory with intake open",
      { v: 1, mode: "stop", intake: "open" },
      { ok: false, code: "factory-stop" },
    ],
    [
      "a draining factory, whose intake drain paused",
      { v: 1, mode: "drain", intake: "paused" },
      { ok: false, code: "factory-drain" },
    ],
    [
      "a stopped factory, whose intake stop paused",
      { v: 1, mode: "stop", intake: "paused" },
      { ok: false, code: "factory-stop" },
    ],
  ])("answers for %s", (_label, factory, expected) => {
    expect(factoryPermitsIntake(factory)).toEqual(expected);
  });
});
