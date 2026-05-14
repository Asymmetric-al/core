import { NextResponse } from "next/server";

import { parseAdminCrmReportParams } from "./query";
import { buildAdminCrmReport, serializeAdminCrmReportCsv } from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

export const GET = withOperation(
  async ({ audit, auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.report.export",
      resourceType: "report",
    });
    const params = parseAdminCrmReportParams(new URL(request.url).searchParams);

    try {
      const report = await buildAdminCrmReport({
        params,
        supabaseAdmin,
        tenantId: actor.tenantId,
      });
      const exportedAt = new Date().toISOString();
      await audit.log("crm_export_created", "crm_report", params.slice, {
        actorProfileId: actor.profileId,
        filters: params.filters,
        rowCount: report.rows.length,
        tenantId: actor.tenantId,
        timestamp: exportedAt,
      });

      return new NextResponse(serializeAdminCrmReportCsv(report), {
        headers: {
          "Content-Disposition": `attachment; filename="crm-${params.slice}-${exportedAt.slice(0, 10)}.csv"`,
          "Content-Type": "text/csv; charset=utf-8",
          "X-Request-Id": requestId,
        },
      });
    } catch (error) {
      return toErrorResponse(error, "Failed to export CRM report.", requestId);
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
