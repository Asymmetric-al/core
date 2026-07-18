import { describe, expect, it } from "vitest";

import { createClearedEveKillSwitchState } from "../../../../packages/api/src/eve/governance/types";
import { resolveEveModelRole } from "../../../../packages/api/src/eve/model-policy/resolver";
import { createDefaultEveModelPolicy } from "../../../../packages/api/src/eve/model-policy/schema";

import type { EveGovernanceSnapshot } from "../../../../packages/api/src/eve/governance/types";
import type {
  EveModelBudgetOverride,
  EveModelPolicyRecord,
} from "../../../../packages/api/src/eve/model-policy/types";

const now = new Date("2026-07-17T12:00:00.000Z");

function createPolicy(): EveModelPolicyRecord {
  const policy = createDefaultEveModelPolicy();
  policy.roles.agent.fallbacks.push({
    route: "direct_provider",
    providerId: "partner-gpu",
    modelId: "partner/eve-agent",
    enabled: true,
  });
  policy.subagentOverrides.security = {
    role: "agent",
    reasoning: "medium",
    fallbackProviderId: "partner-gpu",
    budget: { maxRequestsPerMinute: 3 },
    evalGate: { suiteId: "security-agent", minimumScoreBps: 9_500 },
  };
  return {
    id: "00000000-0000-4000-8000-000000000001",
    version: 1,
    status: "active",
    evalStatus: "passed",
    policy,
    policyHash: "a".repeat(64),
    createdByProfileId: "00000000-0000-4000-8000-000000000002",
    createdAt: now.toISOString(),
  };
}

function createGovernance(): EveGovernanceSnapshot {
  return {
    source: "persisted",
    releaseEnabled: false,
    emergencyOff: false,
    killSwitchState: createClearedEveKillSwitchState(),
    policyStatus: "ready",
    stateVersion: 2,
    updatedAt: now.toISOString(),
  };
}

const unused = {
  inputTokens: 0,
  outputTokens: 0,
  requestsInCurrentMinute: 0,
  usdMicros: 0,
};

describe("Eve model-role resolver", () => {
  it("keeps Gateway primary and makes an eval-passed direct route fallback-only", () => {
    const result = resolveEveModelRole({
      policy: createPolicy(),
      governance: createGovernance(),
      requestedRole: "agent",
      usage: unused,
      now,
    });

    expect(result).toEqual(
      expect.objectContaining({
        allowed: true,
        primary: expect.objectContaining({ route: "vercel_ai_gateway" }),
        directFallback: expect.objectContaining({
          route: "direct_provider",
          providerId: "partner-gpu",
        }),
      }),
    );
  });

  it("revokes direct fallbacks immediately from persisted kill-switch state", () => {
    const governance = createGovernance();
    governance.killSwitchState.model_policy_changes = true;

    const result = resolveEveModelRole({
      policy: createPolicy(),
      governance,
      requestedRole: "agent",
      usage: unused,
      now,
    });

    expect(result).toEqual(
      expect.objectContaining({ allowed: true, directFallback: undefined }),
    );
  });

  it("applies subagent role, reasoning, budget, fallback, and eval-gate overrides", () => {
    const result = resolveEveModelRole({
      policy: createPolicy(),
      governance: createGovernance(),
      requestedRole: "review",
      subagentName: "security",
      usage: unused,
      now,
    });

    expect(result).toEqual(
      expect.objectContaining({
        allowed: true,
        role: "agent",
        reasoning: "medium",
        budget: expect.objectContaining({ maxRequestsPerMinute: 3 }),
        evalGate: { suiteId: "security-agent", minimumScoreBps: 9_500 },
        directFallback: expect.objectContaining({ providerId: "partner-gpu" }),
      }),
    );
  });

  it("hard-blocks exhausted request and spend limits", () => {
    expect(
      resolveEveModelRole({
        policy: createPolicy(),
        governance: createGovernance(),
        requestedRole: "agent",
        usage: { ...unused, requestsInCurrentMinute: 20 },
        now,
      }),
    ).toEqual({ allowed: false, reason: "rate_limit_exhausted" });

    expect(
      resolveEveModelRole({
        policy: createPolicy(),
        governance: createGovernance(),
        requestedRole: "agent",
        usage: { ...unused, usdMicros: 5_000_000 },
        now,
      }),
    ).toEqual({ allowed: false, reason: "budget_exhausted" });
  });

  it("applies only matching, unexpired, active-policy budget overrides", () => {
    const policy = createPolicy();
    const baseOverride: EveModelBudgetOverride = {
      id: "00000000-0000-4000-8000-000000000010",
      policyId: policy.id,
      scopeType: "role",
      scopeId: "agent",
      additionalInputTokens: 10,
      additionalOutputTokens: 20,
      additionalRequests: 5,
      additionalUsdMicros: 30,
      reason: "incident",
      expiresAt: "2026-07-17T13:00:00.000Z",
      createdAt: now.toISOString(),
    };
    const expired = {
      ...baseOverride,
      id: "00000000-0000-4000-8000-000000000011",
      expiresAt: "2026-07-17T11:00:00.000Z",
      additionalRequests: 999,
    };

    const result = resolveEveModelRole({
      policy,
      governance: createGovernance(),
      requestedRole: "agent",
      usage: unused,
      overrides: [baseOverride, expired],
      now,
    });

    expect(result).toEqual(
      expect.objectContaining({
        allowed: true,
        budget: {
          maxInputTokens: 200_010,
          maxOutputTokens: 50_020,
          maxRequestsPerMinute: 25,
          maxUsdMicros: 5_000_030,
        },
      }),
    );
  });
});
