import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { processDueDonationSagaOutboxEvents } from "./saga";
import { toErrorResponse } from "../shared/http-errors";

function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });
}

function parseLimit(request: NextRequest, fallback = 10): number {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("limit");
  const parsed = raw ? Number(raw) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(Math.floor(parsed), 100));
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id, stripe_secret_key")
      .eq("id", ctx.tenantId)
      .single();
    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const stripeSecretKey =
      tenant.stripe_secret_key ?? process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe not configured for this organization" },
        { status: 500 },
      );
    }

    const stripe = getStripeClient(stripeSecretKey);
    const limit = parseLimit(request, 10);

    const result = await processDueDonationSagaOutboxEvents({
      supabaseAdmin,
      stripe,
      actorUserId: ctx.userId,
      tenantId: ctx.tenantId,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
