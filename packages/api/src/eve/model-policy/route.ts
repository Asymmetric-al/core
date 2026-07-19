import { NextResponse } from "next/server";

import {
  activateEveModelPolicy,
  createEveModelBudgetOverride,
  createEveModelPolicyDraft,
  evaluateEveModelPolicyDraft,
  rollbackEveModelPolicy,
} from "./control";
import { canManageEveModelPolicy } from "./permissions";
import {
  createEveModelPolicyDraftSchema,
  mutateEveModelPolicySchema,
} from "./schema";
import {
  loadActiveEveModelBudgetOverrides,
  loadEveModelPolicies,
} from "./store";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

async function loadAdminView(
  input: Parameters<typeof canManageEveModelPolicy>[0],
) {
  const [canManage, policies, budgetOverrides] = await Promise.all([
    canManageEveModelPolicy(input),
    loadEveModelPolicies(input),
    loadActiveEveModelBudgetOverrides(input),
  ]);
  return {
    canManage,
    policies,
    budgetOverrides,
    activePolicy: policies.find((policy) => policy.status === "active"),
  };
}

export const GET = withOperation(
  async ({ auth, supabaseAdmin, requestId }) => {
    try {
      return NextResponse.json({
        ...(await loadAdminView({ auth, supabaseAdmin })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Eve model policy.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ auth, request, supabaseAdmin, requestId }) => {
    try {
      const parsed = createEveModelPolicyDraftSchema.parse(
        await request.json(),
      );
      const policyId = await createEveModelPolicyDraft({
        auth,
        supabaseAdmin,
        policy: parsed.policy,
      });
      return NextResponse.json(
        {
          ...(await loadAdminView({ auth, supabaseAdmin })),
          mutation: { action: "draft", policyId },
          requestId,
        },
        { status: 201 },
      );
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to draft Eve model policy.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const PATCH = withOperation(
  async ({ auth, request, supabaseAdmin, requestId }) => {
    try {
      const mutation = mutateEveModelPolicySchema.parse(await request.json());
      if (mutation.action === "evaluate") {
        await evaluateEveModelPolicyDraft({
          auth,
          supabaseAdmin,
          policyId: mutation.policyId,
        });
      } else if (mutation.action === "activate") {
        await activateEveModelPolicy({ auth, supabaseAdmin, ...mutation });
      } else if (mutation.action === "rollback") {
        await rollbackEveModelPolicy({ auth, supabaseAdmin, ...mutation });
      } else {
        await createEveModelBudgetOverride({
          auth,
          supabaseAdmin,
          ...mutation,
        });
      }

      return NextResponse.json({
        ...(await loadAdminView({ auth, supabaseAdmin })),
        mutation: { action: mutation.action },
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to update Eve model policy.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
