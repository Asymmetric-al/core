import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { NextResponse } from "next/server";

import { toErrorResponse } from "../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { NextRequest } from "next/server";

export async function runDonorPortalOperation(
  request: NextRequest,
  handler: (ctx: {
    supabaseAdmin: AdminSupabaseClient;
    auth: AuthenticatedContext;
  }) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    void request.headers.get("cookie");

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireRole(auth, ["donor"]);

    return handler({ supabaseAdmin, auth });
  } catch (error) {
    return toErrorResponse(error, "Internal error");
  }
}
