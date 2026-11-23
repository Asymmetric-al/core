import { NextResponse } from "next/server";

import { getAdminCrmDonorDetail } from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { ApiHttpError, toErrorResponse } from "../../../shared/http-errors";
import { requireRouteUuid } from "../../../shared/route-uuid";
import { withOperation } from "../../../shared/with-operation";
import { resolveContributionCapabilities } from "../../contribution-operations/permissions";

function getRecordIdFromPath(request: Request) {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const recordsIndex = segments.indexOf("records");
  const recordId = recordsIndex >= 0 ? segments[recordsIndex + 1] : null;

  if (!recordId) {
    throw new ApiHttpError(400, "Missing CRM record id.");
  }

  return requireRouteUuid(recordId);
}

export const GET = withOperation(
  async ({ auth, request, requestId, sessionClient }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.record.read",
      resourceType: "record",
    });

    try {
      const response = await getAdminCrmDonorDetail({
        crmWritesEnabled: true,
        donorId: getRecordIdFromPath(request),
        isTenantAdministrator: actor.isTenantAdministrator,
        sessionClient,
        tenantId: actor.tenantId,
        viewerCapabilities: resolveContributionCapabilities(auth),
      });

      return NextResponse.json({ ...response, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load CRM donor detail.",
        requestId,
      );
    }
  },
  {
    capability: "admin.crm.manage",
  },
);
