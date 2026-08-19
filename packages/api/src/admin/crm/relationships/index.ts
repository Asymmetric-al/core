import { NextResponse } from "next/server";

import { parseAdminCrmRelationshipsParams } from "./query";
import {
  listMissionControlCrmRelationships,
  type RelationshipsClient,
} from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import { toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.relationship.read",
      resourceType: "relationship",
    });
    const params = parseAdminCrmRelationshipsParams(
      new URL(request.url).searchParams,
    );

    try {
      const response = await listMissionControlCrmRelationships({
        actor,
        params,
        supabase: supabaseAdmin as unknown as RelationshipsClient,
      });

      return NextResponse.json({ ...response, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load CRM relationships.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
