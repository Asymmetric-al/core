import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { runMissionaryPortalOperation } from "../missionary-portal/route-helpers";
import { ApiHttpError, ensureJsonBody } from "../shared/http-errors";
import {
  missionaryArgs,
  missionaryScope,
} from "../shared/missionary-authority";

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
      const { requestId } = await params.params;
      const input =
        operation === "update"
          ? decision.parse(await ensureJsonBody(request))
          : null;
      const level = input?.access_level;
      const { data, error } = await supabaseAdmin
        .rpc("missionary_follower_request_write", {
          ...missionaryArgs(missionaryScope(auth)),
          p_operation: operation,
          p_id: requestId,
          p_status: input?.status ?? null,
          p_access_level:
            level === "comment" || level === "view" ? level : null,
        })
        .select(
          operation === "delete"
            ? "id"
            : `
      id, donor_id, status, access_level, created_at, updated_at,
      donor:donors!donor_id(id, name, avatar_url)
    `,
        )
        .maybeSingle();
      if (error) throw new ApiHttpError(500, error.message);
      if (!data) throw new ApiHttpError(404, "Request not found");
      if (operation === "delete") return NextResponse.json({ success: true });
      const row = data as unknown as { donor: { name?: string | null } | null };
      const name = row.donor?.name || "Unknown Donor";
      const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return NextResponse.json({ request: { ...row, name, initials } });
    },
  );
}

export function PATCH(request: NextRequest, params: RequestParams) {
  return decide(request, params, "update");
}
export function DELETE(request: NextRequest, params: RequestParams) {
  return decide(request, params, "delete");
}
