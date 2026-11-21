import { NextResponse } from "next/server";

import { loadEveEngineeringMonitorAdminView } from "./store";
import { toErrorResponse } from "../../shared/http-errors";
import { withPlatformOperation } from "../../shared/with-operation";

export const GET = withPlatformOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      return NextResponse.json({
        ...(await loadEveEngineeringMonitorAdminView({
          supabaseAdmin,
          tenantId: auth.tenantId,
        })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Eve engineering monitors.",
        requestId,
      );
    }
  },
  { tenantAdministrator: true },
);
