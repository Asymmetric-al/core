import {
  getAuthContext,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { parseAdminContributionsParams } from "./query";
import { listAdminContributions } from "./service";
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
    requireCapability(auth, "admin.gifts.manage");
    const ctx = auth as AuthenticatedContext;

    const params = parseAdminContributionsParams(
      new URL(request.url).searchParams,
    );
    const result = await listAdminContributions(
      supabaseAdmin,
      ctx.tenantId,
      params,
    );

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, "Failed to load contributions.");
  }
}
