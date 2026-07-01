import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withOperation } from "../../shared/with-operation";
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
export const PATCH = withOperation<RouteParams>(
  async ({ supabaseAdmin, auth, request }, routeContext) => {
    const ctx = auth as AuthenticatedContext;

    const { routeId } = await (routeContext as RouteParams).params;
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
  },
  { roles: ["admin", "super_admin"] },
);

/**
 * Deleting a route removes the future active rule only; audit history stays.
 */
export const DELETE = withOperation<RouteParams>(
  async ({ supabaseAdmin, auth }, routeContext) => {
    const ctx = auth as AuthenticatedContext;

    const { routeId } = await (routeContext as RouteParams).params;
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
  },
  { roles: ["admin", "super_admin"] },
);
