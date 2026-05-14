import { NextResponse } from "next/server";

import { parseAdminCrmReportParams } from "./query";
import { buildAdminCrmReport } from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.report.read",
      resourceType: "report",
    });

    try {
      const report = await buildAdminCrmReport({
        params: parseAdminCrmReportParams(new URL(request.url).searchParams),
        supabaseAdmin,
        tenantId: actor.tenantId,
      });

      return NextResponse.json({ ...report, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to load CRM report.", requestId);
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
