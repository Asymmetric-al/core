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
  role: "super_admin",
  profileRole: "super_admin",
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000002",
  isAuthenticated: true,
} as AuthenticatedContext;

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
        policy: createDefaultEveModelPolicy(),
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toBe(policyId);

    expect(assertPermissionMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "draft" }),
    );
    expect(rpc).toHaveBeenCalledWith(
      "create_eve_model_policy_draft",
      expect.objectContaining({
        p_actor_id: "user_1",
        p_actor_profile_id: auth.profileId,
        p_policy_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        p_audit_id: expect.any(String),
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
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const { evaluateEveModelPolicyDraft } =
      await import("../../../../packages/api/src/eve/model-policy/control");

    await evaluateEveModelPolicyDraft({
      auth,
      policyId: "00000000-0000-4000-8000-000000000004",
      supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
    });

    expect(rpc).toHaveBeenCalledWith(
      "evaluate_eve_model_policy_draft",
      expect.objectContaining({
        p_policy_hash: policyHash,
        p_eval_status: "passed",
        p_eval_summary: expect.objectContaining({ status: "passed" }),
      }),
    );
  });

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
