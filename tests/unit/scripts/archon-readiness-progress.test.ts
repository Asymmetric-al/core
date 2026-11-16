import { describe, expect, it } from "vitest";

import { evaluateReadiness } from "../../../scripts/archon-factory/pack/.shared/readiness.mjs";
import {
  markResolved,
  planDispositions,
  threadsToResolve,
} from "../../../scripts/archon-factory/pack/deliver/scripts/readiness-logic.mjs";

const HEAD = "1".repeat(40);
const OLD = "2".repeat(40);
const BEFORE = "acceptance-before";
const AFTER = "acceptance-corrected";
const POLICY = `sha256:${"c".repeat(64)}`;
const thread = {
  id: "PRRT_1",
  isResolved: false,
  comments: {
    nodes: [
      {
        id: "C1",
        databaseId: 101,
        body: "Correct the oracle criterion",
        url: "https://example.test/thread/1",
      },
    ],
  },
};

function ready() {
  return {
    workItem: {
      issue: 12,
      head: HEAD,
      control: "run",
      assignment: { policyRevision: POLICY, endState: "PR_READY" },
      brief: { repair: null },
      acceptance: { revision: AFTER },
      final: {
        decision: "PASS",
        taskStatus: "DONE",
        candidate: HEAD,
        acceptanceRevision: AFTER,
      },
      reviews: {
        micaiah: { decision: "CLEAR", candidate: HEAD, acceptance: AFTER },
        luke: { decision: "CLEAR", candidate: HEAD, acceptance: AFTER },
      },
    },
    installedPolicyRevision: POLICY,
    targetBranch: "develop",
    pr: {
      state: "open",
      merged: false,
      head: { sha: HEAD },
      base: { ref: "develop" },
      mergeable: true,
      mergeable_state: "clean",
    },
    rules: [],
    protection: null,
    checkRuns: [],
    reviews: [],
    threads: [thread],
    dispositions: {
      PRRT_1: {
        action: "fix-acceptance",
        head: HEAD,
        acceptanceRevision: BEFORE,
        lastComment: "C1",
        status: "fix-pending",
      },
    },
    topLevelFeedback: [],
    factory: { mode: "run", mergeHold: false },
  };
}

describe("acceptance repair progress is independent of source-head progress (F1)", () => {
  it("does not accept a fix-acceptance disposition without its observed revision", () => {
    const plan = planDispositions({
      items: [{ id: "comment-1", kind: "comment", body: "Fix the criterion" }],
      dispose: {
        task_status: "DONE",
        items: [
          {
            id: "comment-1",
            action: "fix-acceptance",
            reason: "Incorrect criterion",
          },
        ],
      },
      head: HEAD,
    });
    expect(plan.blocked?.code).toBe("acceptance-revision-unavailable");
    expect(plan.actions).toBeUndefined();
  });

  it("records the acceptance revision Samson actually judged", () => {
    const plan = planDispositions({
      items: [
        {
          id: "PRRT_1",
          kind: "review-thread",
          lastComment: "C1",
          lastReply: { id: "C1", body: "Correct the criterion" },
          comments: "",
        },
      ],
      dispose: {
        task_status: "DONE",
        items: [
          {
            id: "PRRT_1",
            action: "fix-acceptance",
            reason: "Incorrect criterion",
          },
        ],
      },
      head: HEAD,
      acceptanceRevision: BEFORE,
    });
    expect(plan.actions[0].record).toMatchObject({
      head: HEAD,
      acceptanceRevision: BEFORE,
      status: "fix-pending",
    });
  });

  it("resolves a corrected acceptance-only thread on the same head after both new reviews and final PASS", () => {
    const input = ready();
    const closures = threadsToResolve({
      threads: input.threads,
      dispositions: input.dispositions,
      head: HEAD,
      workItem: input.workItem,
    });
    expect(closures).toHaveLength(1);
    expect(closures[0]).toMatchObject({ id: "PRRT_1", fixed: true });
    expect(closures[0].body).toContain(AFTER);
    const resolved = markResolved(input.dispositions, {
      resolved: [thread.id],
      fixed: [thread.id],
      head: HEAD,
      acceptanceRevision: AFTER,
      at: "2026-11-12T10:00:00Z",
    });
    expect(resolved.PRRT_1).toMatchObject({
      acceptanceRevision: BEFORE,
      fixedAcceptanceRevision: AFTER,
      fixedIn: HEAD,
      status: "fixed",
    });
    input.threads[0] = { ...thread, isResolved: true };
    input.dispositions = resolved;
    expect(evaluateReadiness(input).verdict).toBe("PR_READY");
  });

  it("also clears acceptance-only top-level feedback without changing the head", () => {
    const input = ready();
    input.threads = [];
    Object.assign(input, {
      topLevelFeedback: [{ id: "comment-1" }],
      dispositions: {
        "comment-1": {
          action: "fix-acceptance",
          head: HEAD,
          acceptanceRevision: BEFORE,
        },
      },
    });
    expect(evaluateReadiness(input).verdict).toBe("PR_READY");
  });

  it.each([
    "same-revision",
    "missing-original",
    "missing-current",
    "stale-micaiah",
    "stale-luke",
    "wrong-review-head",
    "incomplete-final",
    "stale-final",
    "pending-correction",
  ])("does not settle acceptance with %s evidence", (scenario) => {
    const input = ready();
    if (scenario === "same-revision")
      input.dispositions.PRRT_1.acceptanceRevision = AFTER;
    if (scenario === "missing-original")
      input.dispositions.PRRT_1.acceptanceRevision = "";
    if (scenario === "missing-current") input.workItem.acceptance.revision = "";
    if (scenario === "stale-micaiah")
      input.workItem.reviews.micaiah.acceptance = BEFORE;
    if (scenario === "stale-luke")
      input.workItem.reviews.luke.acceptance = BEFORE;
    if (scenario === "wrong-review-head")
      input.workItem.reviews.luke.candidate = OLD;
    if (scenario === "incomplete-final")
      input.workItem.final.taskStatus = "BLOCKED";
    if (scenario === "stale-final")
      input.workItem.final.acceptanceRevision = BEFORE;
    if (scenario === "pending-correction")
      Object.assign(input.workItem.brief, {
        repair: { acceptance: ["still pending"], implementation: [] },
      });
    expect(
      threadsToResolve({
        threads: input.threads,
        dispositions: input.dispositions,
        head: HEAD,
        workItem: input.workItem,
      }),
    ).toEqual([]);
    input.threads[0] = { ...thread, isResolved: true };
    expect(evaluateReadiness(input).verdict).not.toBe("PR_READY");
  });

  it.each([HEAD, OLD])(
    "still requires implementation progress beyond an unchanged or carried head %s",
    (dispositionHead) => {
      const input = ready();
      Object.assign(input.workItem.final, { carriedFrom: OLD });
      Object.assign(input.dispositions.PRRT_1, {
        action: "fix-implementation",
        head: dispositionHead,
      });
      expect(
        threadsToResolve({
          threads: input.threads,
          dispositions: input.dispositions,
          head: HEAD,
          carriedFrom: [OLD],
          workItem: input.workItem,
        }),
      ).toEqual([]);
      const decision = evaluateReadiness(input);
      expect(decision.verdict).toBe("REPAIR");
      expect(decision.repair.implementation).toHaveLength(1);
    },
  );
});
