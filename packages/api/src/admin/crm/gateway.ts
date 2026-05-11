import { NextResponse } from "next/server";

import { requireCrmAccess } from "../../crm/auth/access";
import {
  getCrmGatewayStatus,
  isCrmGatewaySmokeRouteEnabled,
} from "../../crm/gateway";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, request, requestId }) => {
    if (!isCrmGatewaySmokeRouteEnabled()) {
      return NextResponse.json(
        {
          error:
            "CRM gateway smoke route is disabled in protected deployments.",
          requestId,
        },
        { status: 404 },
      );
    }

    const actor = requireCrmAccess(auth, {
      action: "crm.gateway.read",
      resourceType: "crm_gateway",
    });
    const searchParams = new URL(request.url).searchParams;

    try {
      const status = await getCrmGatewayStatus({
        actor,
        requestId,
        probe: searchParams.get("probe") === "1",
      });

      return NextResponse.json(status);
    } catch (error) {
      return toErrorResponse(error, "Failed to read CRM gateway status.");
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
