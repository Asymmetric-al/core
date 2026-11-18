import {
  getAuthContext,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { getSupportTicket } from "./service";
import { toErrorResponse } from "../../shared/http-errors";

interface SupportTicketRouteParams {
  params: Promise<{ id: string }>;
}

function requireAdminSupabase() {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable");
  }

  return client;
}

export async function GET(
  request: NextRequest,
  { params }: SupportTicketRouteParams,
) {
  try {
    const supabaseAdmin = requireAdminSupabase();
    const auth = await getAuthContext(request);
    requireCapability(auth, "admin.dashboard.access");
    const ctx = auth as AuthenticatedContext;
    const { id } = await params;
    const ticket = await getSupportTicket(supabaseAdmin, ctx.tenantId, id);

    if (!ticket) {
      return NextResponse.json(
        { error: "Support ticket not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return toErrorResponse(error, "Failed to load support ticket.");
  }
}
