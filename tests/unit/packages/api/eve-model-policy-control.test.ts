import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDefaultEveModelPolicy } from "../../../../packages/api/src/eve/model-policy/schema";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const assertPermissionMock = vi.fn();
const loadPolicyMock = vi.fn();

vi.mock("../../../../packages/api/src/eve/model-policy/permissions", () => ({
  assertEveModelPolicyPermission: assertPermissionMock,
}));

vi.mock("../../../../packages/api/src/eve/model-policy/store", () => ({
  loadEveModelPolicyById: loadPolicyMock,
}));

const auth = {
  userId: "user_1",
  email: "admin@example.com",
  tenantId: "00000000-0000-4000-8000-000000000003",
  role: "admin",
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000002",
  isAuthenticated: true,
} as AuthenticatedContext;

const operatorIdentity = {
  p_actor_id: auth.userId,
  p_actor_profile_id: auth.profileId,
  p_actor_role: "super_admin",
  p_tenant_id: null,
  p_audit_id: expect.any(String),
};

describe("Eve model-policy control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertPermissionMock.mockResolvedValue(undefined);
  });

  it("creates an immutable hashed draft through the atomic RPC", async () => {
    const policyId = "00000000-0000-4000-8000-000000000004";
    const rpc = vi.fn().mockResolvedValue({ data: policyId, error: null });
    const { createEveModelPolicyDraft } =
      await import("../../../../packages/api/src/eve/model-policy/control");

    await expect(
      createEveModelPolicyDraft({
        auth,
        platformOperator: true,
        policy: createDefaultEveModelPolicy(),
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toBe(policyId);

    expect(assertPermissionMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "draft", platformOperator: true }),
    );
    expect(rpc).toHaveBeenCalledWith(
      "create_eve_model_policy_draft",
      expect.objectContaining({
        ...operatorIdentity,
        p_policy_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
  });

  it("runs the server evaluator against the stored immutable hash", async () => {
    const policy = createDefaultEveModelPolicy();
    const { hashEveModelPolicy } =
      await import("../../../../packages/api/src/eve/model-policy/evaluator");
    const policyHash = await hashEveModelPolicy(policy);
    loadPolicyMock.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000004",
      status: "draft",
      evalStatus: "not_evaluated",
      policy,
      policyHash,
    });
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const { evaluateEveModelPolicyDraft } =
      await import("../../../../packages/api/src/eve/model-policy/control");

    await expect(
      evaluateEveModelPolicyDraft({
        auth,
        platformOperator: true,
        policyId: "00000000-0000-4000-8000-000000000004",
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toBeUndefined();

    expect(rpc).toHaveBeenCalledWith(
      "evaluate_eve_model_policy_draft",
      expect.objectContaining({
        p_policy_hash: policyHash,
        ...operatorIdentity,
        p_eval_status: "passed",
        p_eval_summary: expect.objectContaining({ status: "passed" }),
      }),
    );
  });

  it.each([
    ["activate", "activate_eve_model_policy"],
    ["rollback", "rollback_eve_model_policy"],
    ["override_budget", "create_eve_model_budget_override"],
  ] as const)(
    "records the verified operator on %s",
    async (action, rpcName) => {
      const policyId = "00000000-0000-4000-8000-000000000004";
      const rpc = vi.fn().mockResolvedValue({
        data: action === "override_budget" ? policyId : true,
        error: null,
      });
      const input = {
        auth,
        platformOperator: true,
        policyId,
        expectedActivePolicyId: policyId,
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      };
      const control =
        await import("../../../../packages/api/src/eve/model-policy/control");
      if (action === "activate") await control.activateEveModelPolicy(input);
      else if (action === "rollback")
        await control.rollbackEveModelPolicy(input);
      else
        await control.createEveModelBudgetOverride({
          ...input,
          scopeType: "role",
          scopeId: "agent",
          expiresAt: "2026-11-21T00:00:00Z",
          reason: "incident",
          additionalRequests: 1,
          additionalInputTokens: 1,
          additionalOutputTokens: 1,
          additionalUsdMicros: 1,
        });
      expect(assertPermissionMock).toHaveBeenCalledWith(
        expect.objectContaining({ action, platformOperator: true }),
      );
      expect(rpc).toHaveBeenCalledWith(
        rpcName,
        expect.objectContaining(operatorIdentity),
      );
    },
  );
  it("fails closed when activation has not passed evaluation", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "eve_model_policy_eval_required" },
    });
    const { activateEveModelPolicy } =
      await import("../../../../packages/api/src/eve/model-policy/control");

    await expect(
      activateEveModelPolicy({
        auth,
        policyId: "00000000-0000-4000-8000-000000000004",
        expectedActivePolicyId: null,
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: "The policy must pass its current eval gate before activation.",
    });
  });
});
