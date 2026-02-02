import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getAuthContext,
  requireAuth,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { getAdminClient } from "@asym/database/supabase/admin";

function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["donor", "admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const audit = createAuditLogger(ctx, request);

    const body = await request.json();
    const { amount, currency = "usd", missionary_id, fund_id } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    if (!missionary_id && !fund_id) {
      return NextResponse.json(
        { error: "Either missionary_id or fund_id is required" },
        { status: 400 },
      );
    }

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id, stripe_secret_key, stripe_publishable_key")
      .eq("id", ctx.tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const stripeSecretKey =
      tenant.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe not configured for this organization" },
        { status: 500 },
      );
    }

    const stripe = getStripeClient(stripeSecretKey);

    const { data: donor, error: donorError } = await supabaseAdmin
      .from("donors")
      .select("id, stripe_customer_id, profile_id")
      .eq("profile_id", ctx.profileId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    let donorRecord = donor;
    if (donorError || !donor) {
      const { data: newDonor, error: createError } = await supabaseAdmin
        .from("donors")
        .insert({
          tenant_id: ctx.tenantId,
          profile_id: ctx.profileId,
          giving_preferences: {},
          total_given: 0,
        })
        .select("id, stripe_customer_id, profile_id")
        .single();

      if (createError || !newDonor) {
        return NextResponse.json(
          { error: "Failed to create donor record" },
          { status: 500 },
        );
      }
      donorRecord = newDonor;
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", ctx.profileId)
      .single();

    let stripeCustomerId = donorRecord?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: profile
          ? `${profile.first_name} ${profile.last_name}`
          : undefined,
        metadata: {
          donor_id: donorRecord!.id,
          tenant_id: ctx.tenantId,
          user_id: ctx.userId,
        },
      });
      stripeCustomerId = customer.id;

      await supabaseAdmin
        .from("donors")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", donorRecord!.id);
    }

    if (missionary_id) {
      const { data: missionary } = await supabaseAdmin
        .from("missionaries")
        .select("id")
        .eq("id", missionary_id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      if (!missionary) {
        return NextResponse.json(
          { error: "Missionary not found or access denied" },
          { status: 404 },
        );
      }
    }

    if (fund_id) {
      const { data: fund } = await supabaseAdmin
        .from("funds")
        .select("id, name, description, target_amount, current_amount")
        .eq("id", fund_id)
        .eq("tenant_id", ctx.tenantId)
        .eq("is_active", true)
        .single();

      if (!fund) {
        return NextResponse.json(
          { error: "Fund not found or inactive" },
          { status: 404 },
        );
      }
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      metadata: {
        donor_id: donorRecord!.id,
        missionary_id: missionary_id || "",
        fund_id: fund_id || "",
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
      },
      automatic_payment_methods: { enabled: true },
    });

    const { data: donation, error: donationError } = await supabaseAdmin
      .from("donations")
      .insert({
        tenant_id: ctx.tenantId,
        donor_id: donorRecord!.id,
        missionary_id: missionary_id || null,
        fund_id: fund_id || null,
        amount: amountInCents,
        currency: currency.toLowerCase(),
        stripe_payment_intent_id: paymentIntent.id,
        status: "pending",
      })
      .select("id")
      .single();

    if (donationError) {
      return NextResponse.json(
        { error: "Failed to create donation record" },
        { status: 500 },
      );
    }

    await audit.logDonation(donation.id, "donation_initiated", {
      amount: amountInCents,
      currency,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      donationId: donation.id,
      publishableKey:
        tenant.stripe_publishable_key ||
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (e) {
    console.error("Donation error:", e);
    const message = e instanceof Error ? e.message : "Internal error";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("Forbidden")
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const missionaryId = searchParams.get("missionary_id");
    const fundId = searchParams.get("fund_id");

    const { data: donor } = await supabaseAdmin
      .from("donors")
      .select("id")
      .eq("profile_id", ctx.profileId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    let designations: { missionaries: unknown[]; funds: unknown[] } = {
      missionaries: [],
      funds: [],
    };

    if (missionaryId || fundId) {
      if (missionaryId) {
        const { data: missionary } = await supabaseAdmin
          .from("missionaries")
          .select(
            `
            id, 
            funding_goal, 
            current_funding,
            profile:profiles!profile_id(first_name, last_name, avatar_url)
          `,
          )
          .eq("id", missionaryId)
          .eq("tenant_id", ctx.tenantId)
          .single();

        if (missionary) {
          designations.missionaries = [missionary];
        }
      }

      if (fundId) {
        const { data: fund } = await supabaseAdmin
          .from("funds")
          .select("id, name, description, target_amount, current_amount")
          .eq("id", fundId)
          .eq("tenant_id", ctx.tenantId)
          .eq("is_active", true)
          .single();

        if (fund) {
          designations.funds = [fund];
        }
      }
    } else {
      const { data: missionaries } = await supabaseAdmin
        .from("missionaries")
        .select(
          `
          id, 
          funding_goal, 
          current_funding,
          profile:profiles!profile_id(first_name, last_name, avatar_url)
        `,
        )
        .eq("tenant_id", ctx.tenantId);

      const { data: funds } = await supabaseAdmin
        .from("funds")
        .select("id, name, description, target_amount, current_amount")
        .eq("tenant_id", ctx.tenantId)
        .eq("is_active", true);

      designations = {
        missionaries: missionaries || [],
        funds: funds || [],
      };
    }

    return NextResponse.json({
      designations,
      donor: donor || null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Unauthorized") ? 401 : 500 },
    );
  }
}
