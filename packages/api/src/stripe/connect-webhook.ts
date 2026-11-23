import { createHash } from "node:crypto";

import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { type NextRequest, NextResponse } from "next/server";

import { createStripeClient } from "./client";
import {
  StripeWebhookVerificationError,
  constructVerifiedStripeEvent,
} from "./verify-event";

import type Stripe from "stripe";

type AdminClientResult = ReturnType<typeof getAdminClient>;
type QueryError = { code?: string; message: string } | null;

interface ConnectWebhookDatabase {
  from(table: "payment_provider_accounts"): {
    select(columns: string): {
      eq(
        column: string,
        value: string | boolean,
      ): {
        eq(
          column: string,
          value: string | boolean,
        ): {
          maybeSingle(): Promise<{
            data: { tenant_id: string } | null;
            error: QueryError;
          }>;
        };
      };
    };
  };
  from(table: "stripe_raw_events"): {
    insert(row: Record<string, unknown>): {
      select(columns: string): {
        single(): Promise<{
          data: { id: string; tenant_id: string | null } | null;
          error: QueryError;
        }>;
      };
    };
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        maybeSingle(): Promise<{
          data: { id: string; tenant_id: string | null } | null;
          error: QueryError;
        }>;
      };
    };
  };
  rpc(
    fn:
      | "claim_provider_event"
      | "apply_account_event"
      | "record_provider_event_failure",
    args: Record<string, unknown>,
  ): Promise<{ data: Record<string, unknown> | null; error: QueryError }>;
}

export interface StripeConnectWebhookDeps {
  getWebhookSecret?: () => string | undefined;
  adminClientFactory?: () => AdminClientResult;
  createVerifierStripe?: () => Stripe;
}

export function createStripeConnectWebhookHandler(
  deps: StripeConnectWebhookDeps = {},
) {
  const getWebhookSecret =
    deps.getWebhookSecret ?? (() => serverEnv.STRIPE_CONNECT_WEBHOOK_SECRET);
  const resolveAdminClient = deps.adminClientFactory ?? getAdminClient;
  const createVerifierStripe =
    deps.createVerifierStripe ??
    (() =>
      createStripeClient(
        serverEnv.STRIPE_SECRET_KEY?.trim() || "sk_test_webhook_verify_only",
      ));

  return async function POST(request: NextRequest) {
    const webhookSecret = getWebhookSecret()?.trim();
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Stripe Connect webhook is not configured." },
        { status: 503 },
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event;
    try {
      event = constructVerifiedStripeEvent({
        stripe: createVerifierStripe(),
        rawBody,
        signature,
        secret: webhookSecret,
      });
    } catch (error) {
      if (error instanceof StripeWebhookVerificationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.reason === "not_configured" ? 503 : 400 },
        );
      }
      return NextResponse.json(
        { error: "Invalid Stripe signature." },
        { status: 400 },
      );
    }

    const { client: adminClient, error: adminError } = resolveAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: adminError ?? "Database unavailable." },
        { status: 503 },
      );
    }

    const db = adminClient as unknown as ConnectWebhookDatabase;
    const stripeAccount =
      typeof event.account === "string" && event.account.trim().length > 0
        ? event.account.trim()
        : null;

    let tenantId: string | null = null;
    if (stripeAccount) {
      const accountRes = await db
        .from("payment_provider_accounts")
        .select("tenant_id")
        .eq("provider_account_id", stripeAccount)
        .eq("livemode", event.livemode)
        .maybeSingle();

      if (accountRes.error) {
        return NextResponse.json(
          { error: "Failed to resolve payment provider account." },
          { status: 500 },
        );
      }
      tenantId = accountRes.data?.tenant_id ?? null;
    }

    const payloadSha256 = createHash("sha256").update(rawBody).digest("hex");
    const nowIso = new Date().toISOString();

    const insertRes = await db
      .from("stripe_raw_events")
      .insert({
        tenant_id: tenantId,
        stripe_event_id: event.id,
        event_type: event.type,
        livemode: event.livemode,
        stripe_account: stripeAccount,
        endpoint_kind: "connect",
        payload_sha256: payloadSha256,
        raw_payload: event as unknown as Record<string, unknown>,
        processing_status: tenantId ? "received" : "ignored",
        processed_at: tenantId ? null : nowIso,
      })
      .select("id, tenant_id")
      .single();

    let rawEventId: string | null = insertRes.data?.id ?? null;
    let resolvedTenantId: string | null = insertRes.data?.tenant_id ?? tenantId;

    if (insertRes.error) {
      if (insertRes.error.code !== "23505") {
        return NextResponse.json(
          { error: "Failed to persist provider event." },
          { status: 500 },
        );
      }
      const existingRes = await db
        .from("stripe_raw_events")
        .select("id, tenant_id")
        .eq("stripe_event_id", event.id)
        .maybeSingle();
      if (existingRes.error || !existingRes.data) {
        return NextResponse.json(
          { error: "Failed to read persisted provider event." },
          { status: 500 },
        );
      }
      rawEventId = existingRes.data.id;
      resolvedTenantId = existingRes.data.tenant_id;
    }

    if (!resolvedTenantId || !rawEventId) {
      return NextResponse.json({
        received: true,
        eventId: event.id,
        outcome: "ignored_unknown_account",
      });
    }

    const claimRes = await db.rpc("claim_provider_event", {
      p_event_id: rawEventId,
      p_lease_seconds: 300,
    });
    if (claimRes.error || !claimRes.data) {
      return NextResponse.json(
        { error: "Failed to claim provider event." },
        { status: 500 },
      );
    }

    if (claimRes.data.claimed !== true) {
      return NextResponse.json({
        received: true,
        eventId: event.id,
        outcome: String(claimRes.data.outcome ?? "skipped"),
      });
    }

    const attempt = Number(claimRes.data.attempt);
    const applyRes = await db.rpc("apply_account_event", {
      p_event_id: rawEventId,
      p_attempt: attempt,
    });
    if (applyRes.error) {
      await db.rpc("record_provider_event_failure", {
        p_event_id: rawEventId,
        p_attempt: attempt,
        p_error_code: applyRes.error.code ?? "apply_account_event_failed",
        p_error_message: applyRes.error.message,
        p_retryable: true,
        p_retry_delay_seconds: 60,
      });
      return NextResponse.json(
        { error: "Failed to apply connected account event." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      received: true,
      eventId: event.id,
      outcome: String(applyRes.data?.outcome ?? "applied"),
    });
  };
}

export const POST = createStripeConnectWebhookHandler();
