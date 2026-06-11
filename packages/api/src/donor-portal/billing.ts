import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";

import { resolveDonorPortalContext } from "./service";
import { withOperation } from "../shared/with-operation";
import { getStripeClient } from "../stripe/client";

export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;
    const { donor } = await resolveDonorPortalContext(
      supabaseAdmin,
      ctx.profileId,
      ctx.tenantId,
    );

    if (!donor.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer is linked to this donor account" },
        { status: 409 },
      );
    }

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
        { error: "Stripe is not configured for this organization" },
        { status: 503 },
      );
    }

    const stripe = getStripeClient(stripeSecretKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: donor.stripe_customer_id,
      return_url: new URL("/donor-dashboard/wallet", request.url).toString(),
    });

    return NextResponse.json({
      url: session.url,
      stripeManaged: true,
    });
  },
  { roles: ["donor"] },
);
