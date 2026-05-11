import { NextResponse } from "next/server";

import { parseAdminCrmProjectionShadowParams } from "./query";
import { listMissionControlCrmProjectionShadow } from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { createSupabaseCrmProjectionStore } from "../../../crm/projections/store";
import { toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.projection.read",
      resourceType: "projection",
    });
    const params = parseAdminCrmProjectionShadowParams(
      new URL(request.url).searchParams,
    );

    try {
      const response = await listMissionControlCrmProjectionShadow({
        actor,
        params,
        store: createSupabaseCrmProjectionStore(supabaseAdmin),
      });

      return NextResponse.json({ ...response, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load CRM projection shadow state.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
