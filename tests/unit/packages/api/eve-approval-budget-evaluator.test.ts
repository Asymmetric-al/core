import { describe, expect, it } from "vitest";

import { EVE_ACTION_CATALOG } from "../../../../packages/api/src/eve/approval-budget/catalog";
import { evaluateEveApprovalBudgetPolicy } from "../../../../packages/api/src/eve/approval-budget/evaluator";
import { createClearedEveKillSwitchState } from "../../../../packages/api/src/eve/governance/types";

import type { EveBudgetRecord } from "../../../../packages/api/src/eve/approval-budget/types";
import type { EveGovernanceSnapshot } from "../../../../packages/api/src/eve/governance/types";

const governance: EveGovernanceSnapshot = {
  source: "persisted",
  releaseEnabled: true,
  emergencyOff: false,
  killSwitchState: createClearedEveKillSwitchState(),
  policyStatus: "ready",
  stateVersion: 1,
  updatedAt: "2026-07-17T00:00:00.000Z",
};
const budget: EveBudgetRecord = {
  id: crypto.randomUUID(),
  scopeType: "expensive_feature",
  scopeId: "policy-tracer",
  maxRequests: 3,
  maxUsdMicros: 10_000,
  maxInputTokens: 1_000,
  maxOutputTokens: 500,
  windowSeconds: 3600,
  usedRequests: 0,
  usedUsdMicros: 0,
  usedInputTokens: 0,
  usedOutputTokens: 0,
  additionalRequests: 0,
  additionalUsdMicros: 0,
  additionalInputTokens: 0,
  additionalOutputTokens: 0,
};

describe("Eve approval and budget policy", () => {
  it("uses the action governance domain instead of the production-write switch", () => {
    const action = EVE_ACTION_CATALOG["engineering.dynamic_workflow.execute"];
    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget,
        governance: {
          ...governance,
          killSwitchState: {
            ...governance.killSwitchState,
            production_writes: true,
          },
        },
      }),
    ).toMatchObject({ decision: "allow" });

    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget,
        governance: {
          ...governance,
          killSwitchState: {
            ...governance.killSwitchState,
            dynamic_workflows: true,
          },
        },
      }),
    ).toMatchObject({ decision: "deny", reason: "governance_blocked" });
  });
  it("allows an engineering operational action under its persisted zone policy", () => {
    expect(
      evaluateEveApprovalBudgetPolicy({
        action: EVE_ACTION_CATALOG["engineering.review_artifact.write"],
        operationalMode: "allow",
        budget,
        governance,
      }),
    ).toMatchObject({
      decision: "allow",
      trustZone: "engineering",
      writeClass: "operational",
    });
  });

  it("does not let product/admin borrow the engineering allow rule", () => {
    expect(
      evaluateEveApprovalBudgetPolicy({
        action: EVE_ACTION_CATALOG["product.internal_status.write"],
        operationalMode: "require_approval",
        budget,
        governance,
      }),
    ).toMatchObject({
      decision: "deny",
      reason: "approval_required",
      trustZone: "product_admin",
    });
  });

  it("requires a strict approval for business data", () => {
    const action = EVE_ACTION_CATALOG["product.donor.write"];
    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget,
        governance,
        approvalLevel: "zone",
      }),
    ).toMatchObject({ decision: "deny", reason: "approval_required" });
    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget,
        governance,
        approvalLevel: "strict",
      }),
    ).toMatchObject({ decision: "allow" });
  });

  it("defaults an unknown action to the strict class and denies it", () => {
    expect(
      evaluateEveApprovalBudgetPolicy({
        action: null,
        operationalMode: "allow",
        budget,
        governance,
      }),
    ).toEqual(
      expect.objectContaining({
        decision: "deny",
        reason: "unknown_action",
        writeClass: "business_data",
      }),
    );
  });

  it("pauses at a hard budget and permits only a bounded persisted increase", () => {
    const action = EVE_ACTION_CATALOG["engineering.review_artifact.write"];
    const exhausted = { ...budget, usedRequests: 3 };
    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget: exhausted,
        governance,
      }),
    ).toMatchObject({ decision: "pause", reason: "budget_exhausted" });
    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget: { ...exhausted, additionalRequests: 1 },
        governance,
      }),
    ).toMatchObject({ decision: "allow" });
  });

  it("gives release, emergency, and production-write stops precedence", () => {
    const action = EVE_ACTION_CATALOG["engineering.review_artifact.write"];
    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget,
        governance: { ...governance, emergencyOff: true },
      }),
    ).toMatchObject({ decision: "deny", reason: "governance_blocked" });
    expect(
      evaluateEveApprovalBudgetPolicy({
        action,
        operationalMode: "allow",
        budget,
        governance: {
          ...governance,
          killSwitchState: {
            ...governance.killSwitchState,
            production_writes: true,
          },
        },
      }),
    ).toMatchObject({ decision: "deny", reason: "governance_blocked" });
  });
});
