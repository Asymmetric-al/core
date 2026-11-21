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
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withPlatformOperation } from "../../shared/with-operation";

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

export const GET = withPlatformOperation(
  async ({ auth, supabaseAdmin, requestId, isPlatformOperator }) => {
    try {
      const platformOperator = await isPlatformOperator();
      return NextResponse.json({
        ...(await loadAdminView({ auth, supabaseAdmin, platformOperator })),
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
  { tenantAdministrator: true },
);

export const POST = withPlatformOperation(
  async ({ auth, request, supabaseAdmin, requestId, isPlatformOperator }) => {
    try {
      const parsed = createEveModelPolicyDraftSchema.parse(
        await ensureJsonBody(request),
      );
      // A platform operator manages model policy too (AL-2675 WP2c: the
      // shared operator check, not the super_admin role name).
      const platformOperator = await isPlatformOperator();
      const policyId = await createEveModelPolicyDraft({
        auth,
        platformOperator,
        supabaseAdmin,
        policy: parsed.policy,
      });
      return NextResponse.json(
        {
          ...(await loadAdminView({ auth, supabaseAdmin, platformOperator })),
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
  { tenantAdministrator: true },
);

export const PATCH = withPlatformOperation(
  async ({ auth, request, supabaseAdmin, requestId, isPlatformOperator }) => {
    try {
      const mutation = mutateEveModelPolicySchema.parse(
        await ensureJsonBody(request),
      );
      const platformOperator = await isPlatformOperator();
      if (mutation.action === "evaluate") {
        await evaluateEveModelPolicyDraft({
          auth,
          platformOperator,
          supabaseAdmin,
          policyId: mutation.policyId,
        });
      } else if (mutation.action === "activate") {
        await activateEveModelPolicy({
          auth,
          platformOperator,
          supabaseAdmin,
          ...mutation,
        });
      } else if (mutation.action === "rollback") {
        await rollbackEveModelPolicy({
          auth,
          platformOperator,
          supabaseAdmin,
          ...mutation,
        });
      } else {
        await createEveModelBudgetOverride({
          auth,
          platformOperator,
          supabaseAdmin,
          ...mutation,
        });
      }

      return NextResponse.json({
        ...(await loadAdminView({ auth, supabaseAdmin, platformOperator })),
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
  { tenantAdministrator: true },
);
