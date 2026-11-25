import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requesterOf } from "./requester";
import { ANONYMOUS_DONOR_LABEL } from "../missionary-portal/redaction";
import { runMissionaryPortalOperation } from "../missionary-portal/route-helpers";
import {
  ApiHttpError,
  ensureJsonBody,
  toApiHttpError,
} from "../shared/http-errors";
import {
  missionaryArgs,
  missionaryScope,
} from "../shared/missionary-authority";
import { requireRouteUuid } from "../shared/route-uuid";

import type { FollowerRequestDonor } from "./requester";

type RequestParams = { params: Promise<{ requestId: string }> };
const decision = z.object({
  status: z.enum(["approved", "rejected"]),
  access_level: z.unknown().optional(),
});

function decide(
  request: NextRequest,
  params: RequestParams,
  operation: "update" | "delete",
) {
  return runMissionaryPortalOperation(
    request,
    async ({ auth, supabaseAdmin }) => {
      const scope = missionaryScope(auth);
      const { requestId } = await params.params;
      const input =
        operation === "update"
          ? decision.parse(await ensureJsonBody(request))
          : null;
      const level = input?.access_level;
      const { data, error } = await supabaseAdmin
        .rpc("missionary_follower_request_write", {
          ...missionaryArgs(scope),
          p_operation: operation,
          p_id: requireRouteUuid(requestId),
          p_status: input?.status ?? null,
          p_access_level:
            level === "comment" || level === "view" ? level : null,
        })
        .select(
          operation === "delete"
            ? "id"
            : `
      id, donor_id, status, access_level, created_at, updated_at,
      donor:donors!donor_id(id, name, avatar_url, giving_preferences, donor_is_restricted_party)
    `,
        )
        .maybeSingle();
      if (error) throw toApiHttpError(error, error.message);
      if (!data) throw new ApiHttpError(404, "Request not found");
      if (operation === "delete") return NextResponse.json({ success: true });
      const row = data as unknown as {
        donor_id: string | null;
        donor: FollowerRequestDonor[] | FollowerRequestDonor | null;
      };
      const requester = requesterOf(row.donor);
      const donor =
        requester.shown && requester.donor
          ? {
              id: requester.donor.id ?? null,
              name: requester.donor.name ?? null,
              avatar_url: requester.donor.avatar_url ?? null,
            }
          : null;
      const name = donor
        ? donor.name || "Unknown Donor"
        : ANONYMOUS_DONOR_LABEL;
      const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return NextResponse.json({
        request: {
          ...row,
          donor_id: donor ? row.donor_id : null,
          donor,
          name,
          initials,
        },
      });
    },
  );
}

export function PATCH(request: NextRequest, params: RequestParams) {
  return decide(request, params, "update");
}
export function DELETE(request: NextRequest, params: RequestParams) {
  return decide(request, params, "delete");
}
