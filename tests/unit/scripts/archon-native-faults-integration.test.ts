import { describe, expect, it } from "vitest";

import {
  classifyNativeFaults,
  nativeFaultRequiresHold,
} from "../../../scripts/archon-factory/pack/.shared/native-faults.mjs";
import { decideRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";

const RUN_ID = "native-integration-run";

function faultReport(
  nodeId = "publish",
  data: Record<string, unknown> = {
    failure_kind: "fatal",
    provider_failure: { class: "auth", evidence: "expired" },
  },
) {
  return classifyNativeFaults({
    runId: RUN_ID,
    outcomes: {
      run_id: RUN_ID,
      first_failed_node: nodeId,
      nodes: [{ node_id: nodeId, state: "failed" }],
    },
    detail: {
      id: RUN_ID,
      status: "running",
      metadata: {},
      events: [
        {
          id: "auth-at-publish",
          workflow_run_id: RUN_ID,
          event_type: "node_failed",
          step_index: 12,
          step_name: nodeId,
          created_at: "2026-11-12T02:00:00Z",
          event_order: 1,
          data: { error: "not used for policy", ...data },
        },
      ],
    },
  });
}

describe("native adapter settlement integration seam", () => {
  it("holds a malformed safe-looking observation before failed-node repair", () => {
    const malformed = { ...faultReport(), action: "none" };

    expect(nativeFaultRequiresHold(malformed)).toBe(true);
    expect(
      decideRound({
        ledger: {},
        item: { run: { id: RUN_ID, route: "initial" } },
        nodes: [{ node_id: "publish", state: "failed" }],
        nativeFaults: malformed,
      }),
    ).toMatchObject({ nativePending: true });
  });

  it("does not replace a stored held observation with a fresh clear observation", () => {
    const stored = { ...faultReport(), action: "code-failure" };
    const fresh = classifyNativeFaults({
      runId: RUN_ID,
      detail: { id: RUN_ID, status: "running", metadata: {}, events: [] },
      outcomes: { run_id: RUN_ID, first_failed_node: null, nodes: [] },
    });

    expect(nativeFaultRequiresHold(stored)).toBe(true);
    expect(nativeFaultRequiresHold(fresh)).toBe(false);
    expect(
      decideRound({
        ledger: {},
        item: { run: { id: RUN_ID, route: "initial" }, nativeFaults: stored },
        nodes: [],
        nativeFaults: fresh,
      }),
    ).toMatchObject({ nativePending: true });
  });

  // The blocker's recovery line is what an operator reads in the status and
  // on the Console's issue page.
  it.each([
    [
      "native-recovery",
      /intake pass clears this hold by itself.*issue <n> recover-native/s,
    ],
    ["owner-action", /Deal with the cause.*issue <n> recover-native/s],
    ["configuration-action", /Deal with the cause.*issue <n> recover-native/s],
  ])("tells the operator how a %s hold is cleared", (action, advice) => {
    const decision = decideRound({
      ledger: {},
      item: { run: { id: RUN_ID, route: "review" } },
      nodes: [{ node_id: "micaiah", state: "failed" }],
      nativeFaults: { ...faultReport("micaiah"), action },
    });

    expect(decision.blocker).toMatchObject({ code: action });
    expect(decision.blocker.recovery).toMatch(advice);
    expect(decision.blocker.recovery).toMatch(
      /retry, reopen and release cannot clear it/,
    );
  });

  it("describes what the control does with a branch somebody pushed to", () => {
    const decision = decideRound({
      ledger: {},
      item: { run: { id: RUN_ID, route: "initial" } },
      nodes: [{ node_id: "publish", state: "failed" }],
      nativeFaults: faultReport("publish", { failure_kind: "exec_failed" }),
    });
    expect(decision.blocker.recovery).toMatch(/external readback/);
    expect(decision.blocker.recovery).toMatch(
      /did not publish.*feedback stage/s,
    );
    expect(decision.blocker.recovery).not.toMatch(/refuses while they hold/);
  });

  // The engine wakes a run it paused for a usage limit. That run can meet
  // another fault before it ends: the limit again, with a later reset, or a
  // sign-in that expired meanwhile.
  describe("a held run that met another fault after the engine woke it", () => {
    const quota = (resetAt: string) => ({
      ...faultReport("micaiah"),
      action: "native-recovery",
      reason: "quota-reset-reported",
      faults: [
        { nodeId: "micaiah", providerClass: "quota_exhausted", resetAt },
      ],
    });
    const decide = (stored: unknown, fresh: unknown) =>
      decideRound({
        ledger: {},
        item: { run: { id: RUN_ID, route: "review" }, nativeFaults: stored },
        nodes: [{ node_id: "micaiah", state: "failed" }],
        nativeFaults: fresh,
      });

    it("records the newer reset time, so the pass waits for it", () => {
      const decision = decide(
        quota("2026-11-16T15:00:00.000Z"),
        quota("2026-11-23T15:00:00.000Z"),
      );
      expect(decision.nativeFaults.faults[0].resetAt).toBe(
        "2026-11-23T15:00:00.000Z",
      );
    });

    it("records a fault that needs a person, so the pass no longer clears the hold by itself", () => {
      const decision = decide(quota("2026-11-16T15:00:00.000Z"), {
        ...faultReport("micaiah"),
        action: "owner-action",
        reason: "provider-auth",
      });
      expect(decision).toMatchObject({
        outcome: "owner-action",
        nativeFaults: { action: "owner-action", reason: "provider-auth" },
      });
    });

    it("never replaces a hold that waits for a person, and never takes another run's report", () => {
      const person = {
        ...faultReport("micaiah"),
        action: "owner-action",
        reason: "provider-auth",
      };
      expect(
        decide(person, quota("2026-11-23T15:00:00.000Z")).nativeFaults,
      ).toEqual(person);
      const stored = quota("2026-11-16T15:00:00.000Z");
      expect(
        decide(stored, {
          ...quota("2026-11-23T15:00:00.000Z"),
          runId: "another-run",
        }).nativeFaults,
      ).toEqual(stored);
    });
  });

  it.each(["publish", "readiness"])(
    "holds a typed %s failure until its external effects are reconciled",
    (nodeId) => {
      const report = faultReport(nodeId, { failure_kind: "exec_failed" });

      expect(nativeFaultRequiresHold(report)).toBe(false);
      expect(
        decideRound({
          ledger: {},
          item: { run: { id: RUN_ID, route: "initial" } },
          nodes: [{ node_id: nodeId, state: "failed" }],
          nativeFaults: report,
        }),
      ).toMatchObject({
        outcome: "reconcile",
        nativePending: true,
        nativeFaults: {
          reason: "native-publication-effects-unreconciled",
          preserveOwnership: true,
          automaticRetry: false,
        },
      });
    },
  );
});
