import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { EveModelPolicyDocument } from "../../../../packages/api/src/eve/model-policy/types";

const dependencyMocks = vi.hoisted(() => ({
  assertPermission: vi.fn(),
  createIdentity: vi.fn(),
  evaluatePolicy: vi.fn(),
  hashPolicy: vi.fn(),
  loadPolicy: vi.fn(),
  summarizeAuditValue: vi.fn((value: string) => value),
}));

vi.mock("../../../../packages/api/src/eve/model-policy/permissions", () => ({
  assertEveModelPolicyPermission: dependencyMocks.assertPermission,
}));

vi.mock("../../../../packages/api/src/eve/model-policy/evaluator", () => ({
  evaluateEveModelPolicy: dependencyMocks.evaluatePolicy,
  hashEveModelPolicy: dependencyMocks.hashPolicy,
}));

vi.mock("../../../../packages/api/src/eve/model-policy/store", () => ({
  loadEveModelPolicyById: dependencyMocks.loadPolicy,
}));

vi.mock("../../../../packages/api/src/eve/audit/identity", () => ({
  createAdminEveAuditIdentity: dependencyMocks.createIdentity,
}));

vi.mock("../../../../packages/api/src/eve/audit/redaction", () => ({
  summarizeEveAuditValue: dependencyMocks.summarizeAuditValue,
}));

const POLICY_ID = "00000000-0000-4000-8000-000000000004";
const POLICY_HASH = "a".repeat(64);
const OVERRIDE_ID = "00000000-0000-4000-8000-000000000005";
const policy = {} as EveModelPolicyDocument;

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

type ControlModule =
  typeof import("../../../../packages/api/src/eve/model-policy/control");

type MutationCase = {
  blockedResult: null | false;
  invoke: (supabaseAdmin: AdminSupabaseClient) => Promise<unknown>;
  name: string;
  rpcName: string;
  successResult: string | true;
  unexpectedResult: unknown;
};

let control: ControlModule;

function mutationCases(): MutationCase[] {
  return [
    {
      name: "draft creation",
      rpcName: "create_eve_model_policy_draft",
      blockedResult: null,
      successResult: POLICY_ID,
      unexpectedResult: true,
      invoke: (supabaseAdmin) =>
        control.createEveModelPolicyDraft({ auth, policy, supabaseAdmin }),
    },
    {
      name: "evaluation",
      rpcName: "evaluate_eve_model_policy_draft",
      blockedResult: false,
      successResult: true,
      unexpectedResult: null,
      invoke: (supabaseAdmin) =>
        control.evaluateEveModelPolicyDraft({
          auth,
          policyId: POLICY_ID,
          supabaseAdmin,
        }),
    },
    {
      name: "activation",
      rpcName: "activate_eve_model_policy",
      blockedResult: false,
      successResult: true,
      unexpectedResult: null,
      invoke: (supabaseAdmin) =>
        control.activateEveModelPolicy({
          auth,
          expectedActivePolicyId: null,
          policyId: POLICY_ID,
          supabaseAdmin,
        }),
    },
    {
      name: "rollback",
      rpcName: "rollback_eve_model_policy",
      blockedResult: false,
      successResult: true,
      unexpectedResult: null,
      invoke: (supabaseAdmin) =>
        control.rollbackEveModelPolicy({
          auth,
          expectedActivePolicyId: POLICY_ID,
          supabaseAdmin,
        }),
    },
    {
      name: "budget override",
      rpcName: "create_eve_model_budget_override",
      blockedResult: null,
      successResult: OVERRIDE_ID,
      unexpectedResult: true,
      invoke: (supabaseAdmin) =>
        control.createEveModelBudgetOverride({
          additionalInputTokens: 1,
          additionalOutputTokens: 1,
          additionalRequests: 1,
          additionalUsdMicros: 1,
          auth,
          expiresAt: "2026-07-20T00:00:00.000Z",
          policyId: POLICY_ID,
          reason: "Incident response",
          scopeId: "agent",
          scopeType: "role",
          supabaseAdmin,
        }),
    },
  ];
}

function adminClientWithResult(
  data: unknown,
  error: { message: string } | null,
) {
  const rpc = vi.fn().mockResolvedValue({ data, error });
  return {
    rpc,
    supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
  };
}

describe("Eve model-policy blocked mutation sentinels", () => {
  beforeAll(async () => {
    control =
      await import("../../../../packages/api/src/eve/model-policy/control");
  });

  beforeEach(() => {
    dependencyMocks.assertPermission.mockResolvedValue(undefined);
    dependencyMocks.createIdentity.mockReturnValue({
      actorId: auth.userId,
      actorProfileId: auth.profileId,
      actorRole: auth.profileRole,
      tenantId: auth.tenantId,
      initiatorType: "user",
      initiatorId: auth.userId,
    });
    dependencyMocks.hashPolicy.mockResolvedValue(POLICY_HASH);
    dependencyMocks.evaluatePolicy.mockReturnValue({
      status: "passed",
      evaluatedAt: "2026-07-19T00:00:00.000Z",
      checks: [],
    });
    dependencyMocks.loadPolicy.mockResolvedValue({
      id: POLICY_ID,
      status: "draft",
      evalStatus: "not_evaluated",
      policy,
      policyHash: POLICY_HASH,
    });
  });

  it.each(mutationCases())(
    "maps the committed $name blocked sentinel to the governance conflict",
    async ({ blockedResult, invoke, rpcName }) => {
      const { rpc, supabaseAdmin } = adminClientWithResult(blockedResult, null);

      await expect(invoke(supabaseAdmin)).rejects.toMatchObject({
        status: 409,
        message: "Model-policy changes are blocked by Eve governance state.",
      });
      expect(rpc).toHaveBeenCalledWith(rpcName, expect.any(Object));
    },
  );

  it.each(mutationCases())(
    "accepts only the declared $name success result",
    async ({ invoke, successResult }) => {
      const { supabaseAdmin } = adminClientWithResult(successResult, null);

      await invoke(supabaseAdmin);
    },
  );

  it.each(mutationCases())(
    "fails closed for an unexpected successful $name result shape",
    async ({ invoke, unexpectedResult }) => {
      const { supabaseAdmin } = adminClientWithResult(unexpectedResult, null);

      await expect(invoke(supabaseAdmin)).rejects.toThrow(
        "eve_model_policy_mutation_failed",
      );
    },
  );

  it("does not treat exception text as a committed governance rejection", async () => {
    const { supabaseAdmin } = adminClientWithResult(null, {
      message: "eve_model_policy_changes_blocked",
    });
    const activation = mutationCases().find(
      ({ rpcName }) => rpcName === "activate_eve_model_policy",
    );
    if (!activation) throw new Error("missing activation mutation test case");

    const rejection = await activation
      .invoke(supabaseAdmin)
      .catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(Error);
    expect(rejection).toMatchObject({
      message: "eve_model_policy_changes_blocked",
    });
    expect(rejection).not.toMatchObject({ status: 409 });
  });
});
