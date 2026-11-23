import { getAuthContext, requireRoleClass } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { toErrorResponse, toApiHttpError } from "../shared/http-errors";
import {
  missionaryArgs,
  missionaryScope,
} from "../shared/missionary-authority";

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: adminError ?? "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext(request);
    requireRoleClass(auth, ["missionary"]);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data, error } = await supabaseAdmin
      .rpc("missionary_directory", missionaryArgs(missionaryScope(auth)))
      .select("id, profile:profiles!profile_id(id)")
      .range(offset, offset + limit - 1);

    if (error) throw toApiHttpError(error, error.message);

    const rows: unknown[] = Array.isArray(data) ? data : [];
    const missionaries = rows.map((row) => {
      const record = row as {
        id: string;
        profile?: { id: string } | Array<{ id: string }> | null;
      };
      const rawProfile = Array.isArray(record.profile)
        ? record.profile[0]
        : record.profile;
      return {
        id: record.id,
        profile:
          rawProfile && typeof rawProfile === "object" && "id" in rawProfile
            ? { id: rawProfile.id }
            : null,
      };
    });

    return NextResponse.json({ missionaries });
  } catch (e) {
    return toErrorResponse(e);
  }
}
