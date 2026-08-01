import { describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { EveSessionIdentity } from "../../../../packages/api/src/eve/session-ownership/types";

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
  it("consults runtime policy with only verified session identity fields", async () => {
    const result = {
      actionId: "engineering.dynamic_workflow.execute",
      trustZone: "engineering",
      writeClass: "operational",
      decision: "allow",
      reason: "operational_policy_allowed",
    };
    const rpc = vi.fn().mockResolvedValue({ data: result, error: null });
    const identity = {
      actorId: "github-app:123",
      identityMode: "service",
      initiatorId: "installation:123",
      initiatorType: "system",
      tenantId: auth.tenantId,
    } as EveSessionIdentity;
    const { executeEveRuntimePolicyConsult } =
      await import("../../../../packages/api/src/eve/approval-budget/control");

    await expect(
      executeEveRuntimePolicyConsult({
        actionId: "engineering.dynamic_workflow.execute",
        identity,
        sessionId: "root-session",
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
        targetKey: "workflow:review-417",
      }),
    ).resolves.toEqual(result);
    expect(rpc).toHaveBeenCalledWith(
      "consult_eve_runtime_budget_policy",
      expect.objectContaining({
        p_action_id: "engineering.dynamic_workflow.execute",
        p_actor_id: "github-app:123",
        p_session_id: "root-session",
        p_tenant_id: auth.tenantId,
      }),
    );
    const params = rpc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(params).not.toHaveProperty("p_identity_mode");
    expect(params).not.toHaveProperty("p_governance_domain");
    expect(params).not.toHaveProperty("p_request_cost");
  });
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

  it("checks approval-response tenant and user ownership before the decision RPC", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "00000000-0000-4000-8000-000000000003" },
      error: null,
    });
    const requestedByEq = vi.fn().mockReturnValue({ maybeSingle });
    const tenantEq = vi.fn().mockReturnValue({ eq: requestedByEq });
    const idEq = vi.fn().mockReturnValue({ eq: tenantEq });
    const select = vi.fn().mockReturnValue({ eq: idEq });
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const supabaseAdmin = {
      from: vi.fn().mockReturnValue({ select }),
      rpc,
    } as unknown as AdminSupabaseClient;
    const { decideEvePolicyApproval } =
      await import("../../../../packages/api/src/eve/approval-budget/control");

    await decideEvePolicyApproval({
      approvalId: "00000000-0000-4000-8000-000000000003",
      approved: true,
      auth,
      reason: "Explicitly approved after review.",
      supabaseAdmin,
    });

    expect(idEq).toHaveBeenCalledWith(
      "id",
      "00000000-0000-4000-8000-000000000003",
    );
    expect(tenantEq).toHaveBeenCalledWith("tenant_id", auth.tenantId);
    expect(requestedByEq).toHaveBeenCalledWith(
      "requested_by_profile_id",
      auth.profileId,
    );
    expect(rpc).toHaveBeenCalledWith(
      "decide_eve_policy_approval",
      expect.objectContaining({
        p_actor_profile_id: auth.profileId,
        p_tenant_id: auth.tenantId,
      }),
    );
  });

  it("refuses an approval response not owned by the verified admin", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const requestedByEq = vi.fn().mockReturnValue({ maybeSingle });
    const tenantEq = vi.fn().mockReturnValue({ eq: requestedByEq });
    const idEq = vi.fn().mockReturnValue({ eq: tenantEq });
    const select = vi.fn().mockReturnValue({ eq: idEq });
    const rpc = vi.fn();
    const { decideEvePolicyApproval } =
      await import("../../../../packages/api/src/eve/approval-budget/control");

    await expect(
      decideEvePolicyApproval({
        approvalId: "00000000-0000-4000-8000-000000000004",
        approved: false,
        auth,
        reason: "Not authorized for this request.",
        supabaseAdmin: {
          from: vi.fn().mockReturnValue({ select }),
          rpc,
        } as unknown as AdminSupabaseClient,
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(rpc).not.toHaveBeenCalled();
  });
});
