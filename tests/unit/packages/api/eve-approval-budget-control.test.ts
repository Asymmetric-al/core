import { describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const auth = {
  userId: "user_1",
  email: "admin@example.com",
  tenantId: "00000000-0000-4000-8000-000000000001",
  profileId: "00000000-0000-4000-8000-000000000002",
  role: "super_admin",
  profileRole: "super_admin",
  memberships: [],
  isAuthenticated: true,
} as AuthenticatedContext;

describe("Eve approval and budget controls", () => {
  it("submits only a fixed action id and target, never caller-selected policy fields", async () => {
    const result = {
      actionId: "engineering.review_artifact.write",
      trustZone: "engineering",
      writeClass: "operational",
      decision: "allow",
      reason: "operational_policy_allowed",
    };
    const rpc = vi.fn().mockResolvedValue({ data: result, error: null });
    const { executeEvePolicyTracer } =
      await import("../../../../packages/api/src/eve/approval-budget/control");
    await expect(
      executeEvePolicyTracer({
        actionId: "engineering.review_artifact.write",
        targetKey: "review:one",
        auth,
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toEqual(result);
    expect(rpc).toHaveBeenCalledWith(
      "consult_eve_approval_budget_policy",
      expect.objectContaining({
        p_action_id: "engineering.review_artifact.write",
        p_target_key: "review:one",
        p_actor_profile_id: auth.profileId,
        p_tenant_id: auth.tenantId,
      }),
    );
    const params = rpc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(params).not.toHaveProperty("p_trust_zone");
    expect(params).not.toHaveProperty("p_write_class");
    expect(params).not.toHaveProperty("p_request_cost");
  });

  it("fails a permissioned mutation closed when its dedicated grant is absent", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "eve_budget_override_permission_required" },
    });
    const { createEveBudgetEmergencyOverride } =
      await import("../../../../packages/api/src/eve/approval-budget/control");
    await expect(
      createEveBudgetEmergencyOverride({
        auth,
        scopeType: "expensive_feature",
        scopeId: "policy-tracer",
        additionalRequests: 1,
        additionalUsdMicros: 0,
        additionalInputTokens: 0,
        additionalOutputTokens: 0,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        reason: "Critical tracer proof",
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
