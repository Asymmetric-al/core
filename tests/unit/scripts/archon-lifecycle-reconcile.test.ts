import { describe, expect, it } from "vitest";

import {
  Refusal,
  createAssignment,
  planClaim,
  planControl,
  planReconcile,
  planSweep,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

// lease-control#3 / installer-ops#1: an item left `active` after its run ended
// without a finish write (cancel-run, a failed or refused record) is
// reconciled to `waiting` on the run's route, never while a lease is live.

type Lease = { runId: string; live: boolean } | null;
type Doc = {
  name: string;
  revision: number;
  value: Record<string, any>;
  lease: Lease;
};

const T0 = "2026-11-11T09:00:00.000Z";
const T1 = "2026-11-11T10:00:00.000Z";
const T2 = "2026-11-11T11:00:00.000Z";
const ASSIGNMENT = "a12-0123456789ab";
const POLICY = "c".repeat(64);
const LIMITS = { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 };
const RUNNING = { v: 1, intake: "open", mode: "run", mergeHold: false };

function assign() {
  return createAssignment({
    issue: 12,
    assignmentId: ASSIGNMENT,
    owner: "conrad",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: POLICY,
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
): Doc => ({ name: "core/issues/12", revision, value, lease });

// A round run claimed the item on `route`; the engine then ended the run
// (cancelled or completed) without the run recording its round.
function abandoned(
  route = "repair",
  runId = "run-3",
  base: Doc | null = null,
): Doc {
  const waiting =
    base ?? observed({ ...assign(), status: "waiting", route, round: 2 }, 6);
  const plan = planClaim(waiting, {
    runId,
    assignmentId: ASSIGNMENT,
    policyRevision: POLICY,
    now: T1,
  });
  return observed(plan.value, waiting.revision + 1, { runId, live: false });
}

const ended = (runId = "run-3", status = "cancelled") => ({
  id: runId,
  status,
});

function code(action: () => unknown) {
  try {
    action();
  } catch (error) {
    if (error instanceof Refusal)
      return (error as Refusal & { code: string }).code;
    throw error;
  }
  return "accepted";
}

describe("planReconcile", () => {
  it("retains cleanup ownership after the native run lease ends", () => {
    const stuck = abandoned();
    stuck.value.cleanup = {
      runId: "run-3",
      receipt: { cleanupConfirmed: false },
    };
    expect(
      code(() => planReconcile(stuck, { now: T2, runStatus: ended() })),
    ).toBe("cleanup-unconfirmed");
    expect(planSweep(stuck, { factory: RUNNING })).toEqual({
      action: "skip",
      reason: "cleanup-unconfirmed",
    });
  });

  it("refuses direct claim and retry while cleanup is unresolved", () => {
    const waiting = observed({
      ...assign(),
      status: "waiting",
      route: "repair",
      cleanup: { runId: "run-3", receipt: {} },
    });
    expect(
      code(() =>
        planClaim(waiting, {
          runId: "run-4",
          assignmentId: ASSIGNMENT,
          policyRevision: POLICY,
          now: T2,
        }),
      ),
    ).toBe("cleanup-unconfirmed");
    const terminal = observed({ ...waiting.value, status: "BLOCKED" });
    expect(
      code(() =>
        planControl(terminal, {
          action: "retry",
          requestId: "retry-4",
          now: T2,
          by: "operator",
        }),
      ),
    ).toBe("cleanup-unconfirmed");
  });

  it("settles an item whose run ended without recording as waiting on the run's route", () => {
    const stuck = abandoned("repair");
    const plan = planReconcile(stuck, {
      now: T2,
      runStatus: ended(),
      limits: LIMITS,
    });
    expect({
      name: plan.name,
      ifRevision: plan.ifRevision,
      lease: plan.lease,
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
      run: plan.value.run,
      round: plan.value.round,
      repeats: plan.value.repeats,
      history: plan.value.history.at(-1),
    }).toEqual({
      name: "core/issues/12",
      ifRevision: 7,
      lease: undefined,
      outcome: "reconciled",
      status: "waiting",
      route: "repair",
      run: null,
      round: 3,
      repeats: { "unfinished-run": 1 },
      history: {
        round: 3,
        run: "run-3",
        route: "repair",
        outcome: "reconciled",
        next: "repair",
        at: T2,
        summary: "Run run-3 ended (cancelled) without recording its round",
      },
    });
  });

  // 12 Nov 2026, issue 2228: the engine was restarted while the reviews of a
  // committed candidate were running. Reconcile sent the next round back to
  // the interrupted round's own route (initial); the implementer had nothing
  // left to change and the issue blocked `no-change`.
  describe("the next route follows the progress the interrupted round recorded", () => {
    const interrupted = (
      route: string,
      before: Record<string, unknown>,
      during: Record<string, unknown>,
    ) => {
      const stuck = abandoned(
        route,
        "run-3",
        observed(
          { ...assign(), status: "waiting", route, round: 2, ...before },
          6,
        ),
      );
      Object.assign(stuck.value, during);
      return planReconcile(stuck, { now: T2, runStatus: ended() }).value;
    };
    const acceptance = (run: string) => ({ revision: "d".repeat(64), run });

    it.each(["initial", "repair", "oracle"])(
      "reviews the candidate a %s round committed before it was interrupted",
      (route) => {
        const next = interrupted(
          route,
          { head: route === "initial" ? null : "a".repeat(40) },
          { head: "b".repeat(40), acceptance: acceptance("run-3") },
        );
        expect({ status: next.status, route: next.route }).toEqual({
          status: "waiting",
          route: "review",
        });
        expect(next.history.at(-1)).toMatchObject({ route, next: "review" });
      },
    );

    // Only the run that recorded acceptance tests may commit them, so a
    // round that defined acceptance and committed nothing defines it again.
    it.each([
      ["initial", "initial"],
      ["oracle", "oracle"],
      ["repair", "oracle"],
    ])(
      "runs the acceptance stage again when the %s round defined acceptance and committed nothing",
      (route, expected) => {
        const next = interrupted(
          route,
          { head: route === "initial" ? null : "a".repeat(40) },
          { acceptance: acceptance("run-3") },
        );
        expect(next.route).toBe(expected);
      },
    );

    it("keeps the repair route when the acceptance came from an earlier round", () => {
      expect(
        interrupted(
          "repair",
          { head: "a".repeat(40), acceptance: acceptance("run-1") },
          {},
        ).route,
      ).toBe("repair");
    });

    it("runs the acceptance stage again when the interrupted round had not defined it", () => {
      expect(interrupted("initial", {}, {}).route).toBe("initial");
      // Acceptance left by an earlier round says nothing about this one.
      expect(
        interrupted(
          "oracle",
          { head: "a".repeat(40), acceptance: acceptance("run-1") },
          {},
        ).route,
      ).toBe("oracle");
    });

    it.each(["review", "feedback", "deliver"])(
      "keeps the %s route whatever the round recorded",
      (route) => {
        const next = interrupted(
          route,
          { head: "a".repeat(40), acceptance: acceptance("run-1") },
          { head: "b".repeat(40) },
        );
        expect(next.route).toBe(route);
      },
    );

    it("keeps the run's route for an item claimed before the starting head was recorded", () => {
      const stuck = abandoned("initial");
      delete stuck.value.run.head;
      stuck.value.head = "b".repeat(40);
      expect(
        planReconcile(stuck, { now: T2, runStatus: ended() }).value.route,
      ).toBe("initial");
    });
  });

  it("lets the reconciled item be claimed again under a new round", () => {
    const plan = planReconcile(abandoned(), { now: T2, runStatus: ended() });
    const claim = planClaim(
      observed(plan.value, 8, { runId: "run-3", live: false }),
      {
        runId: "run-4",
        assignmentId: ASSIGNMENT,
        policyRevision: POLICY,
        now: T2,
      },
    );
    expect({ round: claim.value.round, route: claim.value.run.route }).toEqual({
      round: 4,
      route: "repair",
    });
  });

  it("never reconciles while the lease is live (a paused or failed run can resume)", () => {
    const stuck = abandoned();
    const live = { ...stuck, lease: { runId: "run-3", live: true } };
    expect(
      code(() =>
        planReconcile(live, { now: T2, runStatus: ended("run-3", "failed") }),
      ),
    ).toBe("lease-live");
  });

  it.each(["running", "paused", "failed", "pending"])(
    "refuses while the engine reports the run %s",
    (status) => {
      expect(
        code(() =>
          planReconcile(abandoned(), {
            now: T2,
            runStatus: ended("run-3", status),
          }),
        ),
      ).toBe("run-not-terminal");
    },
  );

  it("refuses an engine report about another run", () => {
    expect(
      code(() =>
        planReconcile(abandoned(), { now: T2, runStatus: ended("run-9") }),
      ),
    ).toBe("run-changed");
  });

  it("accepts the engine's ended lease for that run when its status is unavailable", () => {
    expect(planReconcile(abandoned(), { now: T2 }).value.status).toBe(
      "waiting",
    );
  });

  it("refuses without evidence that the run ended", () => {
    const stuck = abandoned();
    expect(
      code(() => planReconcile({ ...stuck, lease: null }, { now: T2 })),
    ).toBe("run-unconfirmed");
  });

  it("refuses an item that is not active", () => {
    const waiting = observed(
      { ...assign(), status: "waiting", route: "repair" },
      3,
    );
    expect(code(() => planReconcile(waiting, { now: T2 }))).toBe("not-active");
  });

  it("blocks the third consecutive unfinished run through the no-progress rule", () => {
    let document = abandoned("repair", "run-3");
    for (const next of ["run-4", "run-5"]) {
      const plan = planReconcile(document, {
        now: T2,
        runStatus: ended(document.value.run.id),
        limits: LIMITS,
      });
      document = abandoned(
        "repair",
        next,
        observed(plan.value, document.revision + 1, {
          runId: document.value.run.id,
          live: false,
        }),
      );
    }
    const plan = planReconcile(document, {
      now: T2,
      runStatus: ended("run-5"),
      limits: LIMITS,
    });
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      blocker: plan.value.blocker,
    }).toEqual({
      outcome: "BLOCKED",
      status: "BLOCKED",
      blocker: {
        code: "no-progress",
        detail:
          "The same repair problem repeated 3 times without new progress.",
        recovery: null,
        route: "repair",
        at: T2,
      },
    });
  });

  it("settles an item an operator stopped as stopped", () => {
    const stuck = abandoned();
    const stopping = observed(
      { ...stuck.value, control: "stop" },
      stuck.revision,
      stuck.lease,
    );
    const plan = planReconcile(stopping, { now: T2, runStatus: ended() });
    expect({ status: plan.value.status, route: plan.value.route }).toEqual({
      status: "stopped",
      route: "repair",
    });
  });
});

describe("operator controls on an item whose run ended", () => {
  const act = (document: Doc, action: string, requestId: string, extra = {}) =>
    planControl(document, {
      action,
      requestId,
      by: "ops",
      now: T2,
      installed: { policyRevision: POLICY },
      ...extra,
    });

  it("stops an interrupted round on the route its recorded progress calls for", () => {
    const stuck = abandoned("initial");
    stuck.value.head = "b".repeat(40);
    const plan = act(stuck, "stop", "req-stop-committed-01");
    expect({ status: plan.value.status, route: plan.value.route }).toEqual({
      status: "stopped",
      route: "review",
    });
    expect(plan.value.history.at(-1)).toMatchObject({
      route: "initial",
      outcome: "stopped",
      next: "review",
    });
  });

  it("reconciles on request, recording the operator's request", () => {
    const plan = act(abandoned(), "reconcile", "req-reconcile-01", {
      runStatus: ended(),
      limits: LIMITS,
    });
    expect({
      status: plan.value.status,
      route: plan.value.route,
      run: plan.value.run,
      request: plan.value.requests.at(-1),
    }).toEqual({
      status: "waiting",
      route: "repair",
      run: null,
      request: {
        id: "req-reconcile-01",
        action: "reconcile",
        by: "ops",
        at: T2,
      },
    });
  });

  it("refuses an operator reconcile while the lease is live", () => {
    const stuck = abandoned();
    const live = { ...stuck, lease: { runId: "run-3", live: true } };
    expect(
      code(() =>
        act(live, "reconcile", "req-reconcile-01", { runStatus: ended() }),
      ),
    ).toBe("lease-live");
  });

  it("stops an active item whose lease is not live outright, so it can be reopened", () => {
    const stopped = act(abandoned("oracle"), "stop", "req-stop-0001");
    const reopened = act(
      observed(stopped.value, 8, { runId: "run-3", live: false }),
      "reopen",
      "req-reopen-0001",
    );
    expect({
      status: stopped.value.status,
      run: stopped.value.run,
      route: stopped.value.route,
      reopened: { status: reopened.value.status, route: reopened.value.route },
    }).toEqual({
      status: "stopped",
      run: null,
      route: "oracle",
      reopened: { status: "pending", route: "oracle" },
    });
  });

  it("keeps a stop issued during a live round as a control only", () => {
    const stuck = abandoned();
    const live = { ...stuck, lease: { runId: "run-3", live: true } };
    const plan = act(live, "stop", "req-stop-0001");
    expect({ status: plan.value.status, control: plan.value.control }).toEqual({
      status: "active",
      control: "stop",
    });
  });
});

describe("the intake sweep and an active item", () => {
  it("asks to reconcile an active item whose lease ended", () => {
    expect(
      planSweep(abandoned(), { factory: RUNNING, reservations: {} }),
    ).toEqual({
      action: "reconcile",
      runId: "run-3",
    });
  });

  it("asks to reconcile even while the factory is stopped (bookkeeping only)", () => {
    expect(
      planSweep(abandoned(), {
        factory: { ...RUNNING, mode: "stop" },
        reservations: {},
      }).action,
    ).toBe("reconcile");
  });

  it("leaves an active item with a live lease alone", () => {
    const stuck = abandoned();
    expect(
      planSweep(
        { ...stuck, lease: { runId: "run-3", live: true } },
        { factory: RUNNING, reservations: {} },
      ).action,
    ).toBe("skip");
  });
});
