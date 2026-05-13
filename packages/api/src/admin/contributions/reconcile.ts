import { NextResponse } from "next/server";

import { runGivingReconciliation } from "../../giving/staged-gifts";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const POST = withOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      const result = await runGivingReconciliation({
        supabaseAdmin,
        tenantId: auth.tenantId,
        requestedByProfileId: auth.profileId,
      });

      return NextResponse.json({ reconciliation: result, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to run giving reconciliation.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
