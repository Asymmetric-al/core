import { describe, expect, it, vi } from "vitest";

import {
  evaluateEveGovernance,
  runGovernedEveAction,
} from "../../../../packages/api/src/eve/governance/kernel";
import {
  createClearedEveKillSwitchState,
  EVE_AUTONOMOUS_DOMAINS,
} from "../../../../packages/api/src/eve/governance/types";

import type {
  EveGovernanceSnapshot,
  EveGovernanceStore,
} from "../../../../packages/api/src/eve/governance/types";

const enabledSnapshot: EveGovernanceSnapshot = {
  source: "persisted",
  releaseEnabled: true,
  emergencyOff: false,
  killSwitchState: createClearedEveKillSwitchState(),
  policyStatus: "ready",
  stateVersion: 1,
  updatedAt: "2026-07-17T00:00:00.000Z",
};

function createStore(
  snapshot: EveGovernanceSnapshot | null,
): EveGovernanceStore & { recordDecision: ReturnType<typeof vi.fn> } {
  return {
    loadSnapshot: vi.fn().mockResolvedValue(snapshot),
    recordDecision: vi.fn().mockResolvedValue(undefined),
  };
}

describe("Eve governance kernel", () => {
  it("blocks a disabled release gate without invoking the autonomous effect", async () => {
    const store = createStore({
      ...enabledSnapshot,
      releaseEnabled: false,
    });
    const effect = vi.fn();

    const result = await runGovernedEveAction({
      action: "github.review",
      domain: "github_actions",
      target: "Asymmetric-al/core#999",
      store,
      effect,
    });

    expect(result).toEqual({
      executed: false,
      reason: "release_disabled",
    });
    expect(effect).not.toHaveBeenCalled();
    expect(store.recordDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "github.review",
        decision: "blocked",
        reason: "release_disabled",
        status: "skipped",
      }),
    );
  });

  it("fails closed when governance state is absent or unavailable", async () => {
    const absentStore = createStore(null);
    const unavailableStore = createStore(enabledSnapshot);
    unavailableStore.loadSnapshot = vi
      .fn()
      .mockRejectedValue(new Error("database unavailable"));
    const effect = vi.fn();

    const absentResult = await runGovernedEveAction({
      action: "schedule.tick",
      domain: "dynamic_workflows",
      store: absentStore,
      effect,
    });
    const unavailableResult = await runGovernedEveAction({
      action: "schedule.tick",
      domain: "dynamic_workflows",
      store: unavailableStore,
      effect,
    });

    expect(absentResult).toEqual({
      executed: false,
      reason: "governance_unavailable",
    });
    expect(unavailableResult).toEqual({
      executed: false,
      reason: "governance_unavailable",
    });
    expect(effect).not.toHaveBeenCalled();
  });

  it("gives emergency-off precedence over an enabled gate", () => {
    expect(
      evaluateEveGovernance(
        {
          ...enabledSnapshot,
          emergencyOff: true,
        },
        { domain: "active_runs" },
      ),
    ).toEqual({ allowed: false, reason: "emergency_off" });
  });

  it("requires ready policy and clear all-automation kill-switch state", () => {
    expect(
      evaluateEveGovernance(
        {
          ...enabledSnapshot,
          policyStatus: "blocked",
        },
        { domain: "active_runs" },
      ),
    ).toEqual({ allowed: false, reason: "policy_not_ready" });

    expect(
      evaluateEveGovernance(
        {
          ...enabledSnapshot,
          killSwitchState: {
            ...createClearedEveKillSwitchState(),
            all_automation: true,
          },
        },
        { domain: "active_runs" },
      ),
    ).toEqual({ allowed: false, reason: "kill_switch_active" });
  });

  it("executes only after an allow decision is recorded", async () => {
    const store = createStore(enabledSnapshot);
    const effect = vi.fn().mockResolvedValue("done");

    const result = await runGovernedEveAction({
      action: "eval.run",
      domain: "active_runs",
      store,
      effect,
    });

    expect(store.recordDecision).toHaveBeenCalledWith(
      expect.objectContaining({ decision: "allowed", status: "started" }),
    );
    expect(effect).toHaveBeenCalledOnce();
    expect(result).toEqual({ executed: true, value: "done" });
  });

  it("does not execute when the required decision record cannot be written", async () => {
    const store = createStore(enabledSnapshot);
    store.recordDecision.mockRejectedValue(new Error("write failed"));
    const effect = vi.fn();

    const result = await runGovernedEveAction({
      action: "eval.run",
      domain: "active_runs",
      store,
      effect,
    });

    expect(result).toEqual({
      executed: false,
      reason: "decision_record_failed",
    });
    expect(effect).not.toHaveBeenCalled();
  });

  it("does not misreport an executed effect when only its completion update fails", async () => {
    const store = createStore(enabledSnapshot);
    store.recordDecision
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("completion write failed"));
    const effect = vi.fn().mockResolvedValue("done");

    const result = await runGovernedEveAction({
      action: "eval.run",
      domain: "active_runs",
      store,
      effect,
    });

    expect(effect).toHaveBeenCalledOnce();
    expect(result).toEqual({ executed: true, value: "done" });
  });

  it.each(EVE_AUTONOMOUS_DOMAINS)(
    "blocks the %s domain from persisted switch state",
    (domain) => {
      expect(
        evaluateEveGovernance(
          {
            ...enabledSnapshot,
            killSwitchState: {
              ...createClearedEveKillSwitchState(),
              [domain]: true,
            },
          },
          { domain },
        ),
      ).toEqual({ allowed: false, reason: "kill_switch_active" });
    },
  );

  it("requires explicit approval while force-approval mode is engaged", () => {
    const snapshot = {
      ...enabledSnapshot,
      killSwitchState: {
        ...createClearedEveKillSwitchState(),
        force_approval: true,
      },
    };

    expect(
      evaluateEveGovernance(snapshot, { domain: "production_writes" }),
    ).toEqual({ allowed: false, reason: "approval_required" });
    expect(
      evaluateEveGovernance(snapshot, {
        domain: "production_writes",
        approvalGranted: true,
      }),
    ).toEqual({ allowed: true, reason: "governance_allowed" });
  });
});
