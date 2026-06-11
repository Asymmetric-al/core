import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "../../shared/http-errors";
import {
  deleteInboundRoute,
  updateInboundRoute,
} from "../../workflows/adapters/inbound-routing";

const updateRouteSchema = z
  .object({
    inboxId: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

interface RouteParams {
  params: Promise<{ routeId: string }>;
}

/**
 * Tenant Route Management: tenant admins edit or disable an active saved
 * inbound route. Changes apply to future routing; already routed messages
 * keep their historical routing audit trail.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthContext(request);
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const { routeId } = await params;
    const routeIdParsed = z.string().uuid().safeParse(routeId);
    const parsed = updateRouteSchema.safeParse(await request.json());

    if (!routeIdParsed.success || !parsed.success) {
      return NextResponse.json(
        { error: "Invalid route update." },
        { status: 400 },
      );
    }

    await updateInboundRoute(supabaseAdmin, {
      tenantId: ctx.tenantId,
      routeId: routeIdParsed.data,
      actorProfileId: ctx.userId,
      patch: {
        ...(parsed.data.inboxId ? { inbox_id: parsed.data.inboxId } : {}),
        ...(parsed.data.isActive === undefined
          ? {}
          : { is_active: parsed.data.isActive }),
      },
    });

    return NextResponse.json({ updated: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Deleting a route removes the future active rule only; audit history stays.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthContext(request);
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const { routeId } = await params;
    const routeIdParsed = z.string().uuid().safeParse(routeId);
    if (!routeIdParsed.success) {
      return NextResponse.json({ error: "Invalid route id." }, { status: 400 });
    }

    await deleteInboundRoute(supabaseAdmin, {
      tenantId: ctx.tenantId,
      routeId: routeIdParsed.data,
      actorProfileId: ctx.userId,
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
