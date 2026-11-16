import { describe, expect, it } from "vitest";

import {
  Refusal,
  createAssignment,
  deliveryKey,
  planClaim,
  planControl,
  planFinish,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

type Lease = { runId: string; live: boolean } | null;
type Doc = {
  name: string;
  revision: number;
  value: Record<string, any>;
  lease: Lease;
};

const T0 = "2026-11-11T09:00:00.000Z";
const T1 = "2026-11-11T10:00:00.000Z";
const ASSIGNMENT = "a12-0123456789ab";
const OLD = "c".repeat(64);
const NEW = "d".repeat(64);

function assign() {
  return createAssignment({
    issue: 12,
    assignmentId: ASSIGNMENT,
    owner: "conrad",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: OLD,
    endState: "PR_READY",
    reason: "Only eligible issue",
    by: "selector:run-0",
    now: T0,
  });
}

const observed = (
  value: Record<string, any>,
  revision = 1,
  lease: Lease = null,
): Doc => ({
  name: "core/issues/12",
  revision,
  value,
  lease,
});

function finishedAs(outcome: string, args: Record<string, unknown> = {}): Doc {
  const claim = planClaim(observed(assign()), {
    runId: "run-1",
    assignmentId: ASSIGNMENT,
    policyRevision: OLD,
    now: T1,
  });
  const active = observed(claim.value, 2, { runId: "run-1", live: true });
  const plan = planFinish(active, {
    runId: "run-1",
    now: T1,
    outcome,
    ...args,
  });
  return observed(plan.value, 3, { runId: "run-1", live: false });
}

const act = (
  document: Doc,
  action: string,
  extra: Record<string, unknown> = {},
) =>
  planControl(document, {
    action,
    requestId: `req-${action}-0001`,
    by: "ops",
    now: T1,
    installed: { policyRevision: OLD },
    ...extra,
  });

function claimCode(value: Record<string, any>, policyRevision: string) {
  try {
    planClaim(observed(value, 9, { runId: "run-1", live: false }), {
      runId: "run-2",
      assignmentId: ASSIGNMENT,
      policyRevision,
      now: T1,
    });
    return "claimed";
  } catch (error) {
    if (error instanceof Refusal)
      return (error as Refusal & { code: string }).code;
    throw error;
  }
}

describe("retained assignment policy fencing", () => {
  it.each([
    ["retry", () => finishedAs("BLOCKED", { blocker: { code: "ci" } })],
    ["reopen", () => finishedAs("PR_READY", { fields: { pr: { number: 7 } } })],
    ["reopen", () => finishedAs("stopped")],
    [
      "release",
      () => {
        const waiting = finishedAs("continue", { route: "repair" });
        return observed(act(waiting, "hold").value, 4, waiting.lease);
      },
    ],
  ])(
    "refuses %s across a changed policy without changing any evidence",
    (action, build) => {
      const document = build();
      const before = structuredClone(document);
      expect(() =>
        act(document, action, { installed: { policyRevision: NEW } }),
      ).toThrow(/policy-transition-required/);
      expect(document).toEqual(before);
      const compatible = act(document, action);
      expect(compatible.value.assignment).toEqual(before.value.assignment);
      expect(claimCode(compatible.value, OLD)).toBe("claimed");
      expect(claimCode(compatible.value, NEW)).toBe("policy-changed");
    },
  );

  it("records nothing extra when the assignment already matches the installed release", () => {
    const plan = act(finishedAs("BLOCKED"), "retry", {
      installed: { policyRevision: OLD },
    });
    expect(plan.value.requests.at(-1)).toEqual({
      id: "req-retry-0001",
      action: "retry",
      by: "ops",
      at: T1,
    });
  });

  it.each([
    ["retry", () => finishedAs("BLOCKED")],
    ["reopen", () => finishedAs("PR_READY")],
    [
      "release",
      () => {
        const waiting = finishedAs("continue", { route: "repair" });
        return observed(act(waiting, "hold").value, 4, waiting.lease);
      },
    ],
  ])(
    "refuses %s when installed identity differs from the attempt",
    (action, build) => {
      const document = build();
      expect(() =>
        act(document, action, {
          installed: { policyRevision: OLD, profileDigest: "e".repeat(64) },
        }),
      ).toThrow(/identity-drift/);
      expect(document.value.assignment.profileDigest).toBe("a".repeat(64));
    },
  );

  it.each([
    undefined,
    null,
    {},
    { policyRevision: "not-a-digest" },
    { policyRevision: [OLD] },
  ])("refuses unavailable or malformed installed policy %j", (installed) => {
    const document = finishedAs("BLOCKED");
    const before = structuredClone(document);
    expect(() => act(document, "retry", { installed })).toThrow(
      /policy-unavailable/,
    );
    expect(document).toEqual(before);
  });

  it("keeps a replay a read-only no-op after the installed policy changes", () => {
    const retried = act(finishedAs("BLOCKED"), "retry");
    const document = observed(retried.value, 4);
    expect(
      act(document, "retry", { installed: { policyRevision: NEW } }),
    ).toEqual({
      noop: true,
      value: document.value,
    });
  });

  it.each(["hold", "stop"])("never re-binds on %s", (action) => {
    const waiting = finishedAs("continue", { route: "repair" });
    const plan = act(waiting, action, { installed: { policyRevision: NEW } });
    expect(plan.value.assignment.policyRevision).toBe(OLD);
  });
});

// Observed on VM 100 (12 November 2026): #2233 (open PR) and #2234 were BLOCKED
// by a defect whose fix was a new release, and the only way to install it was
// to delete their work items. The refusal texts promised "an explicitly
// reconciled policy transition" that did not exist.
describe("explicit policy transition (adopt-policy)", () => {
  const HEAD = "f".repeat(40);
  const evidence = {
    head: HEAD,
    reviews: { micaiah: { decision: "CLEAR" }, luke: { decision: "CLEAR" } },
    final: { decision: "INCONCLUSIVE" },
  };
  const blocked = (fields: Record<string, unknown> = evidence) =>
    finishedAs("BLOCKED", {
      blocker: { code: "final-inconclusive", route: "oracle" },
      fields,
    });
  // The profile digest verified for the installed release, after the
  // retained one was proven against the previous release's record.
  const VERIFIED = "7".repeat(64);
  const adopt = (document: Doc, extra: Record<string, unknown> = {}) =>
    act(document, "adopt-policy", {
      installed: { policyRevision: NEW },
      identity: { profileDigest: VERIFIED },
      ...extra,
    });

  it("moves a blocked assignment to the installed release and drops evidence earned under the old one", () => {
    const document = blocked();
    const plan = adopt(document);
    // The predecessor release and identity digest stay on the assignment.
    expect(plan.value.assignment).toEqual({
      ...document.value.assignment,
      policyRevision: NEW,
      profileDigest: VERIFIED,
      transitions: [
        {
          from: OLD,
          to: NEW,
          profile: { from: "a".repeat(64), to: VERIFIED },
          request: "req-adopt-policy-0001",
          by: "ops",
          at: T1,
        },
      ],
    });
    expect(plan.value).toMatchObject({
      status: "BLOCKED",
      head: HEAD,
      reviews: null,
      final: null,
      // The recorded head is reviewed again before anything is published.
      blocker: { code: "final-inconclusive", route: "review" },
    });
    expect(plan.value.requests.at(-1)).toEqual({
      id: "req-adopt-policy-0001",
      action: "adopt-policy",
      by: "ops",
      at: T1,
      policy: { from: OLD, to: NEW },
      profile: { from: "a".repeat(64), to: VERIFIED },
    });
    expect(plan.lease).toBeUndefined();
    // Nothing starts by itself: the operator still retries the block.
    const retried = act(observed(plan.value, 4, document.lease), "retry", {
      installed: { policyRevision: NEW },
    });
    expect(retried.value).toMatchObject({ status: "pending", route: "review" });
    expect(claimCode(retried.value, NEW)).toBe("claimed");
    expect(claimCode(retried.value, OLD)).toBe("policy-changed");
  });

  it("keeps the blocked route of an assignment that has no candidate yet", () => {
    const plan = adopt(blocked({}));
    expect(plan.value.blocker).toMatchObject({ route: "oracle" });
    expect(plan.value.assignment.policyRevision).toBe(NEW);
  });

  it("moves a stopped assignment and lets reopen start from a fresh review", () => {
    const waiting = finishedAs("continue", {
      route: "feedback",
      fields: { ...evidence, pr: { number: 7 } },
    });
    const stopped = observed(act(waiting, "stop").value, 4, waiting.lease);
    expect(stopped.value.status).toBe("stopped");
    const plan = adopt(stopped);
    expect(plan.value).toMatchObject({
      status: "stopped",
      control: "stop",
      route: "review",
      reviews: null,
      final: null,
      pr: { number: 7 },
    });
    const reopened = act(observed(plan.value, 5, waiting.lease), "reopen", {
      installed: { policyRevision: NEW },
    });
    expect(reopened.value).toMatchObject({
      status: "pending",
      control: "run",
      route: "review",
    });
  });

  it.each([
    ["pending", () => observed(assign())],
    ["waiting", () => finishedAs("continue", { route: "repair" })],
    [
      "PR_READY",
      () => finishedAs("PR_READY", { fields: { pr: { number: 7 } } }),
    ],
  ])("refuses a %s assignment and changes nothing", (_status, build) => {
    const document = build();
    const before = structuredClone(document);
    expect(() => adopt(document)).toThrow(/not-adoptable/);
    expect(document).toEqual(before);
  });

  it("refuses an assignment a run still owns", () => {
    const claim = planClaim(observed(assign()), {
      runId: "run-1",
      assignmentId: ASSIGNMENT,
      policyRevision: OLD,
      now: T1,
    });
    expect(() =>
      adopt(observed(claim.value, 2, { runId: "run-1", live: false })),
    ).toThrow(/unreconciled-run/);
    const document = blocked();
    expect(() =>
      adopt(observed(document.value, 3, { runId: "run-9", live: true })),
    ).toThrow(/lease-held/);
  });

  it("refuses when the installed release is the assignment's own, unknown or malformed", () => {
    const document = blocked();
    const before = structuredClone(document);
    expect(() =>
      adopt(document, { installed: { policyRevision: OLD } }),
    ).toThrow(/policy-current/);
    for (const installed of [
      undefined,
      null,
      {},
      { policyRevision: "not-a-digest" },
    ])
      expect(() => adopt(document, { installed })).toThrow(
        /policy-unavailable/,
      );
    expect(document).toEqual(before);
  });

  it("re-binds the identity digest only to a verified one", () => {
    const document = blocked();
    const before = structuredClone(document);
    for (const identity of [
      undefined,
      null,
      {},
      { profileDigest: "not-a-digest" },
    ])
      expect(() => adopt(document, { identity })).toThrow(
        /identity-proof-unavailable/,
      );
    expect(document).toEqual(before);
    expect(adopt(document).value.assignment.profileDigest).toBe(VERIFIED);
  });

  it("refuses under a cleanup or native hold", () => {
    const cleanup = blocked();
    cleanup.value.cleanup = { runId: "run-1" };
    expect(() => adopt(cleanup)).toThrow(/cleanup-unconfirmed/);
    const native = blocked();
    native.value.nativeFaults = null;
    expect(() => adopt(native)).toThrow(/native-fault-held/);
  });

  it("is a read-only no-op when the same request is replayed", () => {
    const document = blocked();
    const adopted = observed(adopt(document).value, 4, document.lease);
    expect(adopt(adopted)).toEqual({ noop: true, value: adopted.value });
  });

  it("keeps every earlier release when an assignment is moved again", () => {
    const document = blocked();
    const first = observed(adopt(document).value, 4, document.lease);
    const NEWER = "9".repeat(64);
    const second = act(first, "adopt-policy", {
      requestId: "req-adopt-policy-0002",
      installed: { policyRevision: NEWER },
      identity: { profileDigest: "8".repeat(64) },
    });
    expect(
      second.value.assignment.transitions.map(
        ({ from, to }: { from: string; to: string }) => [from, to],
      ),
    ).toEqual([
      [OLD, NEW],
      [NEW, NEWER],
    ]);
    expect(second.value.assignment.policyRevision).toBe(NEWER);
  });
});

describe("re-arming an idle item's dispatch", () => {
  it("records an operator reconcile on an idle item so its next fire gets a new key", () => {
    const waiting = finishedAs("continue", { route: "repair" });
    const plan = act(waiting, "reconcile");
    const after = observed(plan.value, waiting.revision + 1, waiting.lease);
    expect({
      status: plan.value.status,
      route: plan.value.route,
      before: deliveryKey(waiting.value, waiting.revision),
      after: deliveryKey(after.value, after.revision),
    }).toEqual({
      status: "waiting",
      route: "repair",
      before: "a12-0123456789ab:r2:v3",
      after: "a12-0123456789ab:r2:v4",
    });
  });

  it("refuses to reconcile a finished item", () => {
    expect(() => act(finishedAs("PR_READY"), "reconcile")).toThrow(
      /not-active/,
    );
  });
});
