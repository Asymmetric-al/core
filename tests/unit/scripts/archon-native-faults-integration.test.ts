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
