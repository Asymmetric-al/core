import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { parseSupportTicketListParams } from "./query";
import { createSupportTicket, listSupportTickets } from "./service";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

const SUPPORT_ADMIN_ROLES = ["staff", "admin", "super_admin"] as const;

const createSupportTicketSchema = z.object({
  contactId: z.string().trim().min(1).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactName: z.string().trim().min(1, "Contact is required."),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  queueId: z.enum(["donor_care", "mobilization", "missionary_support"]),
  subject: z.string().trim().min(1, "Subject is required."),
  summary: z.string().trim().min(1, "Summary is required."),
});

function requireAdminSupabase() {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable");
  }

  return client;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    requireRole(auth, [...SUPPORT_ADMIN_ROLES]);
    const ctx = auth as AuthenticatedContext;
    const searchParams = new URL(request.url).searchParams;
    const params = parseSupportTicketListParams(searchParams);
    const supabaseAdmin = requireAdminSupabase();

    return NextResponse.json(
      await listSupportTickets(supabaseAdmin, ctx.tenantId, params),
    );
  } catch (error) {
    return toErrorResponse(error, "Failed to load support tickets.");
  }
}

export const POST = withOperation(
  async ({ auth, request, supabaseAdmin }) => {
    const body = await request.json();
    const parsed = createSupportTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid support ticket payload.",
          details: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    const ticket = await createSupportTicket(
      supabaseAdmin,
      auth.tenantId,
      auth.userId,
      {
        ...parsed.data,
        contactId: parsed.data.contactId || undefined,
        contactEmail: parsed.data.contactEmail || undefined,
      },
    );

    return NextResponse.json(ticket, { status: 201 });
  },
  { roles: [...SUPPORT_ADMIN_ROLES] },
);
