import { getAuthContext, requireRoleClass } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { requesterOf } from "./requester";
import { ANONYMOUS_DONOR_LABEL } from "../missionary-portal/redaction";
import { toErrorResponse, toApiHttpError } from "../shared/http-errors";
import {
  missionaryArgs,
  missionaryScope,
} from "../shared/missionary-authority";

import type { FollowerRequestDonor } from "./requester";

interface FollowerRequestRow {
  id: string;
  donor_id: string;
  status: string;
  access_level: string | null;
  created_at: string;
  donor: FollowerRequestDonor[] | FollowerRequestDonor | null;
}

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireRoleClass(auth, ["missionary"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data: requests, error } = await supabaseAdmin
      .rpc(
        "missionary_follower_requests",
        missionaryArgs(missionaryScope(auth)),
      )
      .select(
        `
        id,
        donor_id,
        status,
        access_level,
        created_at,
        updated_at,
        donor:donors!donor_id(
          id,
          name,
          avatar_url,
          status,
          total_given,
          last_gift_date,
          giving_preferences,
          donor_is_restricted_party
        )
      `,
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw toApiHttpError(error, error.message);

    const requestRows = (requests || []) as FollowerRequestRow[];
    const formattedRequests = requestRows.map((req) => {
      const requester = requesterOf(req.donor);
      const donorName = requester.shown
        ? requester.donor?.name || "Unknown Donor"
        : ANONYMOUS_DONOR_LABEL;

      return {
        id: req.id,
        donor_id: requester.shown ? req.donor_id : null,
        name: donorName,
        avatar_url: requester.shown ? requester.donor?.avatar_url : null,
        is_donor: (requester.donor?.total_given || 0) > 0,
        access_level: req.access_level,
        status: req.status,
        created_at: req.created_at,
        initials: getInitials(donorName),
      };
    });

    return NextResponse.json({ requests: formattedRequests });
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** Read-only demo: follower request creation disabled. */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
