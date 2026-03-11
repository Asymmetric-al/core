import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { findFullProfileById } from "./queries";
import { findMissionaryByProfileId } from "../shared/queries";

export async function GET() {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { data: profile, error: profileError } = await findFullProfileById(
      supabaseAdmin,
      ctx.profileId,
      ctx.tenantId,
    );

    if (profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );

    let profileData = { ...profile };

    if (ctx.role === "missionary") {
      const { data: missionary } = await findMissionaryByProfileId(
        supabaseAdmin,
        ctx.profileId,
      );

      if (missionary) {
        profileData = { ...profileData, missionary };
      }
    }

    return NextResponse.json({ profile: profileData });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Unauthorized") ? 401 : 500 },
    );
  }
}

/** Read-only demo: profile updates disabled. */
export async function PATCH(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
