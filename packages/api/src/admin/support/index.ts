import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { getSupportSummary } from "./service";
import { toErrorResponse } from "../../shared/http-errors";

const SUPPORT_ADMIN_ROLES = ["staff", "admin", "super_admin"] as const;

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
    requireRole(auth, [...SUPPORT_ADMIN_ROLES]);
    const ctx = auth as AuthenticatedContext;

    return NextResponse.json(
      await getSupportSummary(supabaseAdmin, ctx.tenantId),
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to load support summary.");
  }
}
