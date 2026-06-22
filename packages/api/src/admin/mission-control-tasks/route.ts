import { NextResponse } from "next/server";

import { listContributionNeedsAttention } from "./store";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const GET_NEEDS_ATTENTION = withOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      const result = await listContributionNeedsAttention({
        supabaseAdmin,
        tenantId: auth.tenantId,
      });

      return NextResponse.json({ ...result, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Mission Control Needs Attention.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
