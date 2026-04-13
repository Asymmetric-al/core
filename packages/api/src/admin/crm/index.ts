import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { parseAdminCrmParams } from "./query";
import { listAdminCrmRecords } from "./service";
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
    requireRole(auth, ["staff", "admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const params = parseAdminCrmParams(new URL(request.url).searchParams);
    const result = await listAdminCrmRecords(
      supabaseAdmin,
      ctx.tenantId,
      params,
    );

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, "Failed to load CRM records.");
  }
}
