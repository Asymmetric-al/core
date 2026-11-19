import {
  getAuthContext,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { getSupportSummary } from "./service";
import { toErrorResponse } from "../../shared/http-errors";

function requireAdminSupabase() {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable");
  }

  return client;
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = requireAdminSupabase();
    const auth = await getAuthContext(request);
    requireCapability(auth, "admin.dashboard.access");
    const ctx = auth as AuthenticatedContext;

    return NextResponse.json(
      await getSupportSummary(supabaseAdmin, ctx.tenantId),
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to load support summary.");
  }
}
