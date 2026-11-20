import { requestScopeOf } from "@asym/auth/context";
import { isSameOriginDownload } from "@asym/auth/request-headers";
import { NextResponse } from "next/server";

import {
  reportRecordType,
  serializeAdminCrmReportCsv,
} from "./export-projection";
import { parseAdminCrmReportParams } from "./query";
import { buildAdminCrmExportGroups } from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { loadFieldPolicies } from "../../../field-policies/reader";
import { createRequestSessionClient } from "../../../shared/request-session-client";
import { withPlatformOperation } from "../../../shared/with-operation";

export const GET = withPlatformOperation(
  async ({ audit, auth, request, requestId, supabaseAdmin }) => {
    if (!isSameOriginDownload(request))
      return NextResponse.json(
        { error: "Same-origin download required" },
        { status: 403 },
      );
    const actor = requireCrmAccess(auth, {
      action: "crm.report.export",
      resourceType: "report",
    });
    const query = new URL(request.url).searchParams;
    const scope = requestScopeOf(auth);
    const assignment = auth.assignment;
    if (
      !scope ||
      !assignment ||
      assignment.membershipRole !== "staff" ||
      assignment.userId !== actor.userId ||
      scope.tenantId !== actor.tenantId
    ) {
      return NextResponse.json(
        { error: "Tenant or assignment mismatch" },
        { status: 403 },
      );
    }
    const params = parseAdminCrmReportParams(query);

    try {
      const sessionClient = await createRequestSessionClient(request, scope);
      const policies = await loadFieldPolicies({
        sessionClient,
        surface: "mission_control",
        recordType: reportRecordType,
      });
      const report = await buildAdminCrmExportGroups({
        params,
        supabaseAdmin,
        tenantId: actor.tenantId,
      });
      const exportedAt = new Date().toISOString();
      const { csv, groupIds } = serializeAdminCrmReportCsv(
        report,
        assignment,
        policies,
      );
      await audit.logRequired(
        "crm_export_created",
        "crm_report",
        params.slice,
        {
          filters: Object.keys(params.filters).filter(
            (key) =>
              params.filters[key as keyof typeof params.filters] !== null,
          ),
          groupIds,
          rowCount: groupIds.length,
        },
      );

      return new NextResponse(csv, {
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Disposition": `attachment; filename="crm-${params.slice}-${exportedAt.slice(0, 10)}.csv"`,
          "Content-Type": "text/csv; charset=utf-8",
          "X-Request-Id": requestId,
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to export CRM report.", requestId },
        { status: 500 },
      );
    }
  },
  {
    capability: "admin.reports.view",
  },
);
