import { NextResponse } from "next/server";

import { loadEveGovernanceAdminView } from "./store";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ supabaseAdmin, requestId }) => {
    try {
      const governance = await loadEveGovernanceAdminView({ supabaseAdmin });
      return NextResponse.json({ ...governance, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Eve governance state.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
