import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { parseAdminCrmParams } from "./query";
import { listAdminCrmRecords } from "./service";
import { listAdminCrmTagOptions } from "./tags";
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

/**
 * GET /api/admin/crm/tags — the tenant's CRM tag options. It lives beside the
 * records read so both share this file's one service-role client site.
 */
export async function GET_TAG_OPTIONS(request: NextRequest) {
  try {
    const supabaseAdmin = requireAdminSupabase();
    const auth = await getAuthContext(request);
    requireRole(auth, ["staff", "admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const tags = await listAdminCrmTagOptions(supabaseAdmin, ctx.tenantId);
    return NextResponse.json({ tags });
  } catch (error) {
    return toErrorResponse(error, "Failed to load CRM tags.");
  }
}
