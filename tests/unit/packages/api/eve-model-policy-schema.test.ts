import { describe, expect, it } from "vitest";

import {
  createDefaultEveModelPolicy,
  eveModelPolicyDocumentSchema,
  mutateEveModelPolicySchema,
} from "../../../../packages/api/src/eve/model-policy/schema";

describe("Eve model-policy schemas", () => {
  it("defines one platform policy with Gateway-primary named roles", () => {
    const policy = createDefaultEveModelPolicy();

    expect(eveModelPolicyDocumentSchema.parse(policy)).toEqual(policy);
    expect(policy.scope).toBe("platform");
    expect(Object.keys(policy.roles)).toEqual(["agent", "review", "judge"]);
    expect(
      Object.values(policy.roles).every(
        (role) => role.primary.route === "vercel_ai_gateway",
      ),
    ).toBe(true);
    expect(policy.judgeRole).not.toBe(policy.agentRole);
    policy.roles.agent.budget.maxRequestsPerMinute = 1;
    expect(policy.roles.review.budget.maxRequestsPerMinute).toBe(20);
  });

  it("supports a complete per-subagent override without changing the platform role", () => {
    const policy = createDefaultEveModelPolicy();
    policy.subagentOverrides.security = {
      role: "review",
      reasoning: "medium",
      fallbackProviderId: "partner-gpu",
      budget: { maxUsdMicros: 750_000 },
      evalGate: { suiteId: "security", minimumScoreBps: 9_750 },
    };
    policy.roles.review.fallbacks.push({
      route: "direct_provider",
      providerId: "partner-gpu",
      modelId: "partner/security",
      enabled: true,
    });

    expect(eveModelPolicyDocumentSchema.safeParse(policy).success).toBe(true);
    expect(policy.roles.review.reasoning).toBe("high");
  });

  it("enforces emergency override amount and duration ceilings", () => {
    const base = {
      action: "override_budget" as const,
      policyId: "00000000-0000-4000-8000-000000000001",
      scopeType: "role" as const,
      scopeId: "agent",
      additionalInputTokens: 0,
      additionalOutputTokens: 0,
      additionalRequests: 1,
      additionalUsdMicros: 0,
      reason: "Incident response",
    };

    expect(
      mutateEveModelPolicySchema.safeParse({
        ...base,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }).success,
    ).toBe(true);
    expect(
      mutateEveModelPolicySchema.safeParse({
        ...base,
        additionalRequests: 1_001,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }).success,
    ).toBe(false);
    expect(
      mutateEveModelPolicySchema.safeParse({
        ...base,
        expiresAt: new Date(Date.now() + 86_500_000).toISOString(),
      }).success,
    ).toBe(false);
    expect(
      mutateEveModelPolicySchema.safeParse({
        ...base,
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
      }).success,
    ).toBe(false);
  });
});
