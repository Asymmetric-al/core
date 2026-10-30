import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { DONATION_WITH_PARTIES_SELECT, giftMismatches } from "./select";
import { beginGiftIntake } from "../donate/begin-gift-intake";
import { resolveRequiredIdempotencyKey } from "../donate/idempotency";
import { processDonationSagaOutboxEvent } from "../donate/saga";
import { ensureJsonBody, toErrorResponse } from "../shared/http-errors";
import { resolveTenantStripe } from "../stripe/tenant-client";

function getSupabaseAdmin() {
  const { client, error } = getAdminClient();
  if (!client) return { supabaseAdmin: null, error };
  return { supabaseAdmin: client, error: null };
}

export async function GET(request: NextRequest) {
  try {
    const { supabaseAdmin, error } = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: error ?? "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext(request);
    requireRole(auth, ["donor", "admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: donor, error: donorError } = await supabaseAdmin
      .from("donors")
      .select("id")
      .eq("profile_id", ctx.profileId)
      .eq("tenant_id", ctx.tenantId)
      .maybeSingle();

    if (donorError) {
      console.error("[donations] Donor lookup failed", donorError);
      return NextResponse.json(
        { error: "Failed to load donations" },
        { status: 500 },
      );
    }
    if (!donor?.id) {
      return NextResponse.json({ donations: [] });
    }

    const { data, error: queryError } = await supabaseAdmin
      .from("donations")
      .select(DONATION_WITH_PARTIES_SELECT)
      .eq("donor_id", donor.id)
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (queryError) {
      console.error("[donations] Donations query failed", queryError);
      return NextResponse.json(
        { error: "Failed to load donations" },
        { status: 500 },
      );
    }
    return NextResponse.json({ donations: data });
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabaseAdmin, error } = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: error ?? "Admin client unavailable" },
        { status: 503 },
      );
    }

    const auth = await getAuthContext(request);
    requireRole(auth, ["donor", "admin", "staff", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const body = (await ensureJsonBody(request)) as Record<string, unknown>;
    const missionaryId =
      typeof body.missionaryId === "string" ? body.missionaryId : "";
    const amount = typeof body.amount === "number" ? body.amount : Number.NaN;
    const currency =
      typeof body.currency === "string" && body.currency.trim().length > 0
        ? body.currency.trim().toLowerCase()
        : "usd";

    if (
      !missionaryId ||
      !Number.isInteger(amount) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid donation data" },
        { status: 400 },
      );
    }

    const idempotencyKey = resolveRequiredIdempotencyKey(request.headers);
    const tenantStripe = await resolveTenantStripe({
      supabaseAdmin,
      tenantId: ctx.tenantId,
    });
    if (!tenantStripe.ok) {
      if (tenantStripe.reason === "stripe_unconfigured") {
        return NextResponse.json(
          { error: "Stripe not configured for this organization" },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const begin = await beginGiftIntake({
      rpc: async (fn, rpcArgs) => {
        const response = await supabaseAdmin.rpc(fn, rpcArgs as never);
        return { data: response.data, error: response.error };
      },
      tenantId: ctx.tenantId,
      profileId: ctx.profileId,
      actorUserId: ctx.userId,
      missionaryId,
      fundId: null,
      amountCents: amount,
      currency,
      idempotencyKey,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    if (!begin.ok) {
      switch (begin.code) {
        case "not_found":
          return NextResponse.json(
            { error: "Missionary not found" },
            { status: 404 },
          );
        case "invalid":
          return NextResponse.json({ error: begin.message }, { status: 400 });
        case "incomplete":
          return NextResponse.json(
            { error: "Failed to start donation saga" },
            { status: 500 },
          );
        case "failed":
          return NextResponse.json({ error: begin.message }, { status: 500 });
        default: {
          const _exhaustive: never = begin;
          return NextResponse.json(
            { error: String(_exhaustive) },
            { status: 500 },
          );
        }
      }
    }

    const requested = {
      profileId: ctx.profileId,
      amountCents: amount,
      currency,
      missionaryId,
      fundId: null,
    };
    const readBack = () =>
      supabaseAdmin
        .from("donations")
        .select(DONATION_WITH_PARTIES_SELECT)
        .eq("id", begin.donationId)
        .eq("tenant_id", ctx.tenantId)
        .single();

    // A replayed key can resolve to another donor's gift. Confirm the gift is
    // this request before driving its saga or returning anything from it; if
    // that can't be confirmed, run nothing and return no ids.
    if (begin.replayed) {
      const { data: prior, error: priorError } = await readBack();
      if (priorError || !prior) {
        console.error("[donations] Replayed gift read-back failed", {
          donationId: begin.donationId,
          error: priorError,
        });
        return NextResponse.json(
          { donation: null, readBack: "failed" },
          { status: 201 },
        );
      }
      const mismatched = giftMismatches(prior, requested);
      if (mismatched.length > 0) {
        return keyReused(begin.donationId, ctx.profileId, mismatched);
      }
    }

    const { stripe } = tenantStripe;
    const sagaResult = await processDonationSagaOutboxEvent({
      supabaseAdmin,
      stripe,
      outboxId: begin.outboxId,
      actorUserId: ctx.userId,
    });
    if (sagaResult.status !== "completed") {
      return NextResponse.json(
        {
          error: sagaResult.error ?? "Donation is still processing",
          donationId: begin.donationId,
          outboxId: begin.outboxId,
          status: sagaResult.status,
        },
        { status: sagaResult.status === "processing" ? 202 : 500 },
      );
    }

    const { data: donation, error: donationError } = await readBack();
    // The gift already exists here, so a read-back failure must not look like
    // a failed gift: a client retrying with a new key would give twice.
    if (donationError || !donation) {
      console.error("[donations] Donation read-back failed", {
        donationId: begin.donationId,
        error: donationError,
      });
      return NextResponse.json(
        { donation: null, donationId: begin.donationId, readBack: "failed" },
        { status: 201 },
      );
    }
    // Checked again after the saga: on a first request this is the first check.
    const mismatched = giftMismatches(donation, requested);
    if (mismatched.length > 0) {
      return keyReused(begin.donationId, ctx.profileId, mismatched);
    }

    return NextResponse.json(
      { donation, donationId: begin.donationId },
      { status: 201 },
    );
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** A replayed idempotency key whose gift is not this request: no row data. */
function keyReused(
  donationId: string,
  callerProfileId: string,
  mismatched: string[],
) {
  console.error("[donations] Idempotency key replay does not match request", {
    donationId,
    callerProfileId,
    mismatched,
  });
  return NextResponse.json(
    { error: "Idempotency key already used" },
    { status: 409 },
  );
}
