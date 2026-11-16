import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";

import { resolveDonorPortalContext } from "./service";
import { listDonorWallet } from "./wallet";
import { withOperation } from "../shared/with-operation";
import { resolveTenantStripe } from "../stripe/tenant-client";

/**
 * The donor's Stripe billing, as one operation:
 * - GET lists their saved payment methods (read only), for the wallet.
 * - POST opens Stripe's billing portal, where they add, remove or choose a
 *   default payment method.
 */
const donorBilling = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;
    const { donor } = await resolveDonorPortalContext(
      supabaseAdmin,
      ctx.profileId,
      ctx.tenantId,
    );

    if (request.method === "GET" && !donor.stripe_customer_id) {
      return NextResponse.json({ status: "not_linked", methods: [] });
    }

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

    if (request.method === "GET") {
      const wallet = await listDonorWallet({
        stripe,
        supabaseAdmin,
        donor,
        tenantId: ctx.tenantId,
      });
      return NextResponse.json(wallet);
    }

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

export const GET = donorBilling;
export const POST = donorBilling;
