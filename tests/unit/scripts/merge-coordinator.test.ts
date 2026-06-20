import { describe, expect, it } from "vitest";

import { decide } from "../../../scripts/github/merge-coordinator.mjs";

// A clean, merge-ready candidate; override one axis per test.
function state(overrides: Record<string, unknown> = {}) {
  return {
    candidate: true,
    head: "abc",
    mergeableState: "clean",
    autoEscalated: false,
    humanParked: false,
    escalatedHead: null,
    recoveredSinceEscalation: false,
    ciAllGreen: true,
    ciAnyFailed: false,
    bugBotsFresh: true,
    activeBlocker: false,
    planBlocking: 0,
    settled: true,
    minutesStuck: 7,
    mergeReady: true,
    rounds: 0,
    fixAttempts: 0,
    updateAttempts: 0,
    nudges: 0,
    ...overrides,
  };
}

describe("merge-coordinator decide()", () => {
  it("merges a clean, freshly-reviewed, settled PR", () => {
    expect(decide(state()).action).toBe("MERGE");
  });

  it("skips anything that is not an open develop PR", () => {
    expect(decide(state({ candidate: false })).action).toBe("SKIP");
  });

  it("updates a branch that is behind develop (no AI)", () => {
    expect(
      decide(state({ mergeableState: "behind", mergeReady: false })).action,
    ).toBe("UPDATE_BRANCH");
  });

  it("escalates a conflicting branch for a human/agent to rebase", () => {
    expect(
      decide(state({ mergeableState: "dirty", mergeReady: false })).action,
    ).toBe("ESCALATE");
  });

  it("escalates a behind branch after repeated update failures", () => {
    expect(
      decide(
        state({
          mergeableState: "behind",
          mergeReady: false,
          updateAttempts: 3,
        }),
      ).action,
    ).toBe("ESCALATE");
  });

  it("dispatches autofix when the plan has blockers", () => {
    expect(decide(state({ planBlocking: 2, mergeReady: false })).action).toBe(
      "DISPATCH_FIX",
    );
  });

  it("escalates after the autofix round cap", () => {
    expect(
      decide(state({ planBlocking: 2, mergeReady: false, rounds: 3 })).action,
    ).toBe("ESCALATE");
  });

  it("escalates (recoverably) after the dispatch-attempt budget", () => {
    expect(
      decide(state({ planBlocking: 2, mergeReady: false, fixAttempts: 3 }))
        .action,
    ).toBe("ESCALATE");
  });

  it("nudges the reviewers when a stale PR is missing a bug-bot review", () => {
    expect(
      decide(
        state({
          bugBotsFresh: false,
          mergeReady: false,
          minutesStuck: 50,
          nudges: 0,
        }),
      ).action,
    ).toBe("NUDGE_REVIEWS");
  });

  it("escalates only after the nudge budget is spent", () => {
    expect(
      decide(
        state({
          bugBotsFresh: false,
          mergeReady: false,
          minutesStuck: 50,
          nudges: 2,
        }),
      ).action,
    ).toBe("ESCALATE");
  });

  it("waits (does not escalate) while still within the stale window", () => {
    expect(
      decide(
        state({ bugBotsFresh: false, mergeReady: false, minutesStuck: 10 }),
      ).action,
    ).toBe("WAIT");
  });

  it("treats a human-set needs-human as a hard stop", () => {
    expect(decide(state({ humanParked: true })).action).toBe("SKIP");
  });

  it("keeps an auto-escalated PR parked while nothing changes on its head", () => {
    expect(
      decide(
        state({
          autoEscalated: true,
          escalatedHead: "abc",
          head: "abc",
          mergeReady: false,
        }),
      ).action,
    ).toBe("SKIP");
  });

  it("auto-clears an escalation once the head changes", () => {
    expect(
      decide(
        state({
          autoEscalated: true,
          escalatedHead: "old",
          head: "abc",
          mergeReady: false,
        }),
      ).action,
    ).toBe("CLEAR_ESCALATION");
  });

  it("auto-clears an escalation once the PR is merge-ready again", () => {
    expect(
      decide(state({ autoEscalated: true, escalatedHead: "abc", head: "abc" }))
        .action,
    ).toBe("CLEAR_ESCALATION");
  });

  it("clears a workflow escalation once a recovery commit lands after it", () => {
    // No escalatedHead recorded (workflow escalation), but a commit landed after the label —
    // gatherState sets recoveredSinceEscalation, so we must resume, not adopt-and-park.
    expect(
      decide(
        state({
          autoEscalated: true,
          escalatedHead: null,
          recoveredSinceEscalation: true,
          mergeReady: false,
        }),
      ).action,
    ).toBe("CLEAR_ESCALATION");
  });

  it("stays parked (no clear-loop) when an escalation recorded no head", () => {
    // A guard/workflow escalation adds the labels but no escalatedHead — clearing here would
    // immediately un-park and loop, so we must SKIP until a real head change.
    expect(
      decide(
        state({
          autoEscalated: true,
          escalatedHead: null,
          head: "abc",
          mergeReady: false,
        }),
      ).action,
    ).toBe("SKIP");
  });

  it("handles a conflict before trusting a stale merge-ready signal", () => {
    expect(
      decide(state({ mergeableState: "dirty", mergeReady: true })).action,
    ).toBe("ESCALATE");
  });
});
