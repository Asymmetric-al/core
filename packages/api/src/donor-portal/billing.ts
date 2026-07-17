import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";

import { resolveDonorPortalContext } from "./service";
import { withOperation } from "../shared/with-operation";
import { resolveTenantStripe } from "../stripe/tenant-client";

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

    const tenantStripe = await resolveTenantStripe({
      supabaseAdmin,
      tenantId: ctx.tenantId,
    });
    if (!tenantStripe.ok) {
      if (tenantStripe.reason === "stripe_unconfigured") {
        return NextResponse.json(
          { error: "Stripe is not configured for this organization" },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { stripe } = tenantStripe;
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
