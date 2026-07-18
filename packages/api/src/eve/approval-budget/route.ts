import { NextResponse } from "next/server";

import {
  createEveBudgetEmergencyOverride,
  decideEvePolicyApproval,
  executeEvePolicyTracer,
  requestEvePolicyApproval,
} from "./control";
import { mutateEveApprovalBudgetSchema } from "./schema";
import { loadEveApprovalBudgetAdminView } from "./store";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      return NextResponse.json({
        ...(await loadEveApprovalBudgetAdminView({
          tenantId: auth.tenantId,
          supabaseAdmin,
        })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Eve approval and budget policy.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const mutation = mutateEveApprovalBudgetSchema.parse(
        await request.json(),
      );
      let result: unknown;
      if (mutation.action === "execute")
        result = await executeEvePolicyTracer({
          auth,
          supabaseAdmin,
          ...mutation,
        });
      else if (mutation.action === "request_approval")
        result = {
          approvalId: await requestEvePolicyApproval({
            auth,
            supabaseAdmin,
            ...mutation,
          }),
        };
      else if (mutation.action === "decide_approval") {
        await decideEvePolicyApproval({ auth, supabaseAdmin, ...mutation });
        result = { decided: true };
      } else
        result = {
          overrideId: await createEveBudgetEmergencyOverride({
            auth,
            supabaseAdmin,
            ...mutation,
          }),
        };
      return NextResponse.json({
        ...(await loadEveApprovalBudgetAdminView({
          tenantId: auth.tenantId,
          supabaseAdmin,
        })),
        mutation: { action: mutation.action, result },
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to apply Eve approval and budget policy.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
