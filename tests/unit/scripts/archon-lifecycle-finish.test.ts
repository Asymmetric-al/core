import { describe, expect, it } from "vitest";

import {
  Refusal,
  createAssignment,
  planClaim,
  planControl,
  planFinish,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

// How a round's finish settles the work item: external merges (I3), parked
// rounds (I4), round budgets (lease-control#5), stops that land after context
// (lease-control#9), consecutive no-progress (lease-control#10) and the route a
// retry or reopen resumes (wiring-bugs#9).

type Lease = { runId: string; live: boolean } | null;
type Doc = {
  name: string;
  revision: number;
  value: Record<string, any>;
  lease: Lease;
};
type Args = Record<string, unknown>;

const T0 = "2026-11-11T09:00:00.000Z";
const T1 = "2026-11-11T10:00:00.000Z";
const ASSIGNMENT = "a12-0123456789ab";
const POLICY = "c".repeat(64);
const LIMITS = { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 };

function assign(overrides: Args = {}) {
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
    ...overrides,
  });
}

const observed = (
  value: Record<string, any>,
  revision = 1,
  lease: Lease = null,
): Doc => ({ name: "core/issues/12", revision, value, lease });

function claimed(document: Doc, runId: string): Doc {
  const plan = planClaim(document, {
    runId,
    assignmentId: ASSIGNMENT,
    policyRevision: POLICY,
    now: T1,
  });
  return observed(plan.value, document.revision + 1, { runId, live: true });
}

function finish(document: Doc, runId: string, args: Args) {
  return planFinish(document, { runId, now: T1, ...args });
}

function cycle(document: Doc, runId: string, args: Args): Doc {
  const active = claimed(document, runId);
  const plan = finish(active, runId, args);
  return observed(plan.value, active.revision + 1, { runId, live: false });
}

function control(
  document: Doc,
  action: string,
  requestId: string,
  extra: Args = {},
) {
  const plan = planControl(document, {
    action,
    requestId,
    by: "ops",
    now: T1,
    installed: { policyRevision: POLICY },
    ...extra,
  });
  return observed(plan.value, document.revision + 1, document.lease);
}

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

describe("external merges (I3)", () => {
  it("records a merge observed outside the factory for a PR_READY assignment as MERGED", () => {
    const active = claimed(
      observed({ ...assign(), status: "waiting", route: "feedback", round: 2 }),
      "run-3",
    );
    const plan = finish(active, "run-3", {
      outcome: "MERGED",
      external: true,
      summary: "PR #501 is merged",
    });
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
      run: plan.value.run,
      history: plan.value.history.at(-1),
    }).toEqual({
      outcome: "MERGED",
      status: "MERGED",
      route: null,
      run: null,
      history: {
        round: 3,
        run: "run-3",
        route: "feedback",
        outcome: "MERGED",
        next: null,
        at: T1,
        external: true,
        summary: "Merged outside the factory. PR #501 is merged",
      },
    });
  });

  it("still refuses a factory merge the assignment does not authorize", () => {
    const active = claimed(observed(assign()), "run-1");
    expect(
      code(() =>
        finish(active, "run-1", { outcome: "MERGED", external: false }),
      ),
    ).toBe("merge-not-authorized");
  });

  it("records an authorized factory merge without the external note", () => {
    const active = claimed(observed(assign({ endState: "MERGED" })), "run-1");
    const plan = finish(active, "run-1", {
      outcome: "MERGED",
      summary: "Merged",
    });
    expect({
      status: plan.value.status,
      external: plan.value.history.at(-1).external,
      summary: plan.value.history.at(-1).summary,
    }).toEqual({ status: "MERGED", external: undefined, summary: "Merged" });
  });
});

describe("parked rounds (I4)", () => {
  const parked = {
    areas: ["migrations", "lockfile"],
    holders: { migrations: 20 },
  };

  it("parks the round on the run's route with the areas, their holders and the time", () => {
    const active = claimed(observed(assign()), "run-1");
    const plan = finish(active, "run-1", {
      outcome: "parked",
      parked,
      summary: "Waiting for migrations",
      limits: LIMITS,
    });
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
      parked: plan.value.parked,
      lease: plan.lease,
      history: plan.value.history.at(-1).outcome,
    }).toEqual({
      outcome: "parked",
      status: "waiting",
      route: "initial",
      parked: {
        areas: ["lockfile", "migrations"],
        holders: { migrations: 20 },
        at: T1,
      },
      lease: "release",
      history: "parked",
    });
  });

  it("does not count a parked round toward the round budgets or the no-progress rule", () => {
    let document = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "repair",
      fingerprint: "fp-a",
      limits: LIMITS,
    });
    const before = {
      workRounds: document.value.workRounds,
      feedbackRounds: document.value.feedbackRounds,
      repeats: document.value.repeats,
    };
    document = cycle(document, "run-2", {
      outcome: "parked",
      parked,
      limits: LIMITS,
    });
    expect({
      workRounds: document.value.workRounds,
      feedbackRounds: document.value.feedbackRounds,
      repeats: document.value.repeats,
    }).toEqual(before);
  });

  it("clears the parked record when the item is claimed again", () => {
    const document = cycle(observed(assign()), "run-1", {
      outcome: "parked",
      parked,
    });
    expect(claimed(document, "run-2").value.parked).toBeNull();
  });
});

describe("round budgets (lease-control#5)", () => {
  it("lets WAIT feedback rounds continue past maxRounds rounds", () => {
    // Round 1 publishes; rounds 2-11 are feedback rounds that return WAIT.
    let document = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "feedback",
      limits: LIMITS,
    });
    for (let round = 2; round <= 11; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: "feedback",
        limits: LIMITS,
      });
    expect({
      round: document.value.round,
      status: document.value.status,
      route: document.value.route,
      feedbackRounds: document.value.feedbackRounds,
    }).toEqual({
      round: 11,
      status: "waiting",
      route: "feedback",
      feedbackRounds: 11,
    });
  });

  it("bounds feedback polling by maxFeedbackRounds", () => {
    let document = observed(assign());
    for (let round = 1; round <= 12; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: "feedback",
        limits: LIMITS,
      });
    const active = claimed(document, "run-13");
    const plan = finish(active, "run-13", {
      outcome: "continue",
      route: "feedback",
      limits: LIMITS,
    });
    expect({ outcome: plan.outcome, blocker: plan.value.blocker }).toEqual({
      outcome: "BLOCKED",
      blocker: {
        code: "feedback-limit",
        detail: "Waited 12 feedback rounds without a delivery decision",
        recovery:
          "Check the pull request's checks and reviews, then retry to wait again",
        route: "feedback",
        at: T1,
      },
    });
  });

  it("blocks the work round that would exceed maxRounds, keeping its route for retry", () => {
    let document = observed(assign());
    for (let round = 1; round <= 7; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: "repair",
        limits: LIMITS,
      });
    expect(document.value.status).toBe("waiting");
    const active = claimed(document, "run-8");
    const plan = finish(active, "run-8", {
      outcome: "continue",
      route: "repair",
      limits: LIMITS,
    });
    expect({ outcome: plan.outcome, blocker: plan.value.blocker }).toEqual({
      outcome: "BLOCKED",
      blocker: {
        code: "round-limit",
        detail: "Reached 8 work rounds without delivery",
        recovery: "Review the history, clarify the scope if needed, then retry",
        route: "repair",
        at: T1,
      },
    });
  });

  it("does not count feedback rounds toward the work-round limit", () => {
    let document = observed(assign());
    for (let round = 1; round <= 10; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: round % 2 ? "repair" : "feedback",
        limits: LIMITS,
      });
    expect({
      status: document.value.status,
      workRounds: document.value.workRounds,
      feedbackRounds: document.value.feedbackRounds,
    }).toEqual({ status: "waiting", workRounds: 5, feedbackRounds: 5 });
  });

  it("gives retry a new baseline for both budgets", () => {
    let document = observed(assign());
    for (let round = 1; round <= 8; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: round === 8 ? "repair" : "feedback",
        limits: LIMITS,
      });
    document = cycle(document, "run-9", {
      outcome: "BLOCKED",
      blocker: { code: "readiness" },
      limits: LIMITS,
    });
    const retried = control(document, "retry", "req-retry-0001");
    expect({
      status: retried.value.status,
      workRounds: retried.value.workRounds,
      feedbackRounds: retried.value.feedbackRounds,
      repeats: retried.value.repeats,
    }).toEqual({
      status: "pending",
      workRounds: 0,
      feedbackRounds: 0,
      repeats: {},
    });
  });

  it("lets a retried round-limited issue take more work rounds", () => {
    let document = observed(assign());
    for (let round = 1; round <= 8; round += 1)
      document = cycle(document, `run-${round}`, {
        outcome: "continue",
        route: "repair",
        limits: LIMITS,
      });
    expect(document.value.blocker?.code).toBe("round-limit");
    document = control(document, "retry", "req-retry-0001");
    document = cycle(document, "run-9", {
      outcome: "continue",
      route: "repair",
      limits: LIMITS,
    });
    expect({
      status: document.value.status,
      route: document.value.route,
    }).toEqual({
      status: "waiting",
      route: "repair",
    });
  });
});

describe("a stop that lands after context (lease-control#9)", () => {
  it("settles a continuing round as stopped, keeping the route it would have continued on", () => {
    const active = claimed(observed(assign()), "run-1");
    const stopping = control(active, "stop", "req-stop-0001");
    const plan = finish(stopping, "run-1", {
      outcome: "continue",
      route: "repair",
      limits: LIMITS,
    });
    expect({
      outcome: plan.outcome,
      status: plan.value.status,
      route: plan.value.route,
      control: plan.value.control,
    }).toEqual({
      outcome: "stopped",
      status: "stopped",
      route: "repair",
      control: "stop",
    });
  });

  it("lets reopen undo that stop and resume the pending route", () => {
    const active = claimed(observed(assign()), "run-1");
    const stopping = control(active, "stop", "req-stop-0001");
    const plan = finish(stopping, "run-1", {
      outcome: "continue",
      route: "repair",
    });
    const stopped = observed(plan.value, stopping.revision + 1, {
      runId: "run-1",
      live: false,
    });
    const reopened = control(stopped, "reopen", "req-reopen-0001");
    expect({
      control: reopened.value.control,
      status: reopened.value.status,
      route: reopened.value.route,
    }).toEqual({ control: "run", status: "pending", route: "repair" });
  });

  it("keeps a merge MERGED under a stop", () => {
    const active = claimed(observed(assign({ endState: "MERGED" })), "run-1");
    const stopping = control(active, "stop", "req-stop-0001");
    const plan = finish(stopping, "run-1", { outcome: "MERGED" });
    expect({ outcome: plan.outcome, status: plan.value.status }).toEqual({
      outcome: "MERGED",
      status: "MERGED",
    });
  });
});

describe("consecutive no-progress (lease-control#10)", () => {
  it("does not block a progressing issue whose transient failures are not consecutive", () => {
    let document = observed(assign());
    const fail = {
      outcome: "continue",
      route: "repair",
      fingerprint: "failed:context",
    };
    document = cycle(document, "run-1", { ...fail, limits: LIMITS });
    document = cycle(document, "run-2", {
      outcome: "continue",
      route: "feedback",
      fields: { head: "1".repeat(40) },
      limits: LIMITS,
    });
    document = cycle(document, "run-3", { ...fail, limits: LIMITS });
    document = cycle(document, "run-4", {
      outcome: "continue",
      route: "feedback",
      fields: { head: "2".repeat(40) },
      limits: LIMITS,
    });
    document = cycle(document, "run-5", { ...fail, limits: LIMITS });
    expect({
      status: document.value.status,
      repeats: document.value.repeats,
    }).toEqual({ status: "waiting", repeats: { "failed:context": 1 } });
  });

  it("restarts the streak when a round records a new head, even with the same problem", () => {
    let document = observed(assign());
    const repeat = {
      outcome: "continue",
      route: "repair",
      fingerprint: "review:M1",
    };
    document = cycle(document, "run-1", {
      ...repeat,
      fields: { head: "1".repeat(40) },
    });
    document = cycle(document, "run-2", {
      ...repeat,
      fields: { head: "2".repeat(40) },
    });
    document = cycle(document, "run-3", {
      ...repeat,
      fields: { head: "3".repeat(40) },
    });
    expect({
      status: document.value.status,
      repeats: document.value.repeats,
    }).toEqual({ status: "waiting", repeats: { "review:M1": 1 } });
  });

  it("restarts the streak when the problem differs", () => {
    let document = observed(assign());
    for (const [index, fingerprint] of [
      "fp-a",
      "fp-a",
      "fp-b",
      "fp-a",
    ].entries())
      document = cycle(document, `run-${index + 1}`, {
        outcome: "continue",
        route: "repair",
        fingerprint,
      });
    expect(document.value.repeats).toEqual({ "fp-a": 1 });
  });

  it("uses the configured number of tolerated repeats", () => {
    const repeat = {
      outcome: "continue",
      route: "repair",
      fingerprint: "no-change",
      limits: { ...LIMITS, noProgressRepeats: 1 },
    };
    const once = cycle(observed(assign()), "run-1", repeat);
    const active = claimed(once, "run-2");
    expect(finish(active, "run-2", repeat).outcome).toBe("BLOCKED");
  });
});

describe("the route a retry or reopen resumes (wiring-bugs#9)", () => {
  it("records the route a BLOCKED round ran on as the blocker's retry route", () => {
    const repairing = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "repair",
    });
    const active = claimed(repairing, "run-2");
    const plan = finish(active, "run-2", {
      outcome: "BLOCKED",
      blocker: { code: "acceptance-strays", detail: "x" },
    });
    expect(plan.value.blocker.route).toBe("repair");
  });

  it("records the continue's route for a round blocked by the no-progress rule", () => {
    const repeat = {
      outcome: "continue",
      route: "repair",
      fingerprint: "no-change",
    };
    let document = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "feedback",
    });
    document = cycle(document, "run-2", repeat);
    document = cycle(document, "run-3", repeat);
    const active = claimed(document, "run-4");
    const plan = finish(active, "run-4", repeat);
    expect({ outcome: plan.outcome, route: plan.value.blocker.route }).toEqual({
      outcome: "BLOCKED",
      route: "repair",
    });
  });

  it("retries a repair that a feedback round decided but could not schedule on repair, not feedback", () => {
    const limits = { ...LIMITS, maxRounds: 2 };
    let document = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "feedback",
      fields: { pr: { number: 7, url: "https://example.invalid/pull/7" } },
      limits,
    });
    document = cycle(document, "run-2", {
      outcome: "continue",
      route: "repair",
      limits,
    });
    document = cycle(document, "run-3", {
      outcome: "continue",
      route: "feedback",
      limits,
    });
    // The feedback round's REPAIR verdict exceeds the work-round budget.
    document = cycle(document, "run-4", {
      outcome: "continue",
      route: "repair",
      limits,
    });
    expect({
      status: document.value.status,
      ran: document.value.history.at(-1).route,
    }).toEqual({ status: "BLOCKED", ran: "feedback" });
    expect(control(document, "retry", "req-retry-0001").value.route).toBe(
      "repair",
    );
  });

  it("reopens an issue stopped while waiting on a repair into that repair, even with a PR", () => {
    let document = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "feedback",
      fields: { pr: { number: 7, url: "https://example.invalid/pull/7" } },
    });
    document = cycle(document, "run-2", {
      outcome: "continue",
      route: "repair",
    });
    document = control(document, "stop", "req-stop-0001");
    expect(document.value.status).toBe("stopped");
    expect(control(document, "reopen", "req-reopen-0001").value.route).toBe(
      "repair",
    );
  });

  it("reopens a round-stopped item on the route that round ran", () => {
    const repairing = cycle(observed(assign()), "run-1", {
      outcome: "continue",
      route: "oracle",
    });
    const stopped = cycle(repairing, "run-2", { outcome: "stopped" });
    expect({
      status: stopped.value.status,
      reopened: control(stopped, "reopen", "req-reopen-0001").value.route,
    }).toEqual({ status: "stopped", reopened: "oracle" });
  });
});
