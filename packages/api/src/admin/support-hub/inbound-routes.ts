import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withOperation } from "../../shared/with-operation";
import {
  listInboundRoutes,
  saveInboundRouteAndResume,
} from "../../workflows/adapters/inbound-routing";

const saveRouteSchema = z
  .object({
    inboundEmailRowId: z.string().uuid(),
    inboxId: z.string().min(1),
    scope: z.enum(["recipient", "alias", "domain_default"]),
    matchValue: z.string().min(3).max(320),
    domainDefaultConfirmed: z.boolean().optional(),
  })
  .strict();

/**
 * Tenant admins view saved inbound routes. Route data is tenant-scoped and
 * carries no provider internals.
 */
export const GET = withOperation(
  async ({ supabaseAdmin, auth }) => {
    const ctx = auth as AuthenticatedContext;

    const routes = await listInboundRoutes(supabaseAdmin, ctx.tenantId);

    return NextResponse.json({
      routes: routes.map((route) => ({
        id: route.id,
        scope: route.scope,
        matchValue: route.match_value,
        inboxId: route.inbox_id,
        isActive: route.is_active,
      })),
    });
  },
  { roles: ["admin", "super_admin"] },
);

/**
 * Route Save And Continue: any authenticated support agent in the owning
 * tenant saves a reviewed route; the same inbound email immediately continues
 * toward Support Hub routing. Tenant-domain defaults require explicit
 * confirmation and the confirmation result is audit logged.
 */
export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const parsed = saveRouteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid route request." },
        { status: 400 },
      );
    }

    const result = await saveInboundRouteAndResume(
      { client: supabaseAdmin },
      {
        tenantId: ctx.tenantId,
        inboundEmailRowId: parsed.data.inboundEmailRowId,
        inboxId: parsed.data.inboxId,
        scope: parsed.data.scope,
        matchValue: parsed.data.matchValue,
        domainDefaultConfirmed: parsed.data.domainDefaultConfirmed,
        actorProfileId: ctx.userId,
      },
    );

    if (result.status === "confirmation_required") {
      return NextResponse.json(
        {
          status: result.status,
          error:
            "A tenant-domain default route affects many future addresses and needs explicit confirmation.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(result);
  },
  { roles: ["admin", "staff", "super_admin"] },
);
