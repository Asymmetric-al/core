import { createHash } from "node:crypto";

import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { type NextRequest, NextResponse } from "next/server";

import { createStripeClient } from "./client";
import {
  PAYMENT_EVENT_LEASE_SECONDS,
  PAYMENT_EVENT_RETRY_DELAY_SECONDS,
  isDeferredEventType,
} from "./payment-event-types";

export { DEFERRED_EVENT_TYPES } from "./payment-event-types";

type AdminClientResult = ReturnType<typeof getAdminClient>;
type QueryError = { code?: string; message: string } | null;

interface PaymentEvent {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  account?: string | null;
}

export interface PaymentEventVerifier {
  webhooks: {
    constructEvent(payload: string, header: string, secret: string): unknown;
  };
}

type WorkerWrapper =
  | "claim_provider_event"
  | "apply_payment_outcome"
  | "defer_payment_event"
  | "record_provider_event_failure";

interface PaymentEventsDatabase {
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
  from(table: "stripe_connect_events"): {
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
    fn: WorkerWrapper,
    args: Record<string, unknown>,
  ): Promise<{ data: Record<string, unknown> | null; error: QueryError }>;
}

export interface StripePaymentEventsWebhookDeps {
  getWebhookSecret?: () => string | undefined;
  adminClientFactory?: () => AdminClientResult;
  createVerifier?: () => PaymentEventVerifier;
}

const CONNECTED_ACCOUNT = /^acct_[A-Za-z0-9]+$/;
const AMOUNT_TOKEN = /"amount[a-z_]*"\s*:\s*([-+0-9.eE]+)/g;
const PLAIN_INTEGER = /^-?(?:0|[1-9][0-9]*)$/;

function amountsAreIntegers(rawBody: string): boolean {
  for (const match of rawBody.matchAll(AMOUNT_TOKEN))
    if (!PLAIN_INTEGER.test(match[1]!)) return false;
  return true;
}

function isPaymentEvent(value: unknown): value is PaymentEvent {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.id === "string" &&
    typeof event.type === "string" &&
    typeof event.created === "number" &&
    typeof event.livemode === "boolean" &&
    (event.account === undefined ||
      event.account === null ||
      typeof event.account === "string")
  );
}

function retryLater(eventId: string, outcome: string) {
  return NextResponse.json(
    { received: false, eventId, outcome, retry: true },
    { status: 503 },
  );
}

export function createStripePaymentEventsWebhookHandler(
  deps: StripePaymentEventsWebhookDeps = {},
) {
  const getWebhookSecret =
    deps.getWebhookSecret ??
    (() => serverEnv.STRIPE_PAYMENT_EVENTS_WEBHOOK_SECRET);
  const resolveAdminClient = deps.adminClientFactory ?? getAdminClient;
  const createVerifier =
    deps.createVerifier ??
    (() =>
      createStripeClient(
        "sk_test_webhook_verify_only",
      ) as unknown as PaymentEventVerifier);

  return async function POST(request: NextRequest) {
    const webhookSecret = getWebhookSecret()?.trim();
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Stripe payment events are not configured." },
        { status: 503 },
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature." },
        { status: 400 },
      );
    }

    let verified: unknown;
    try {
      verified = createVerifier().webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid Stripe signature." },
        { status: 400 },
      );
    }
    if (!isPaymentEvent(verified)) {
      return NextResponse.json(
        { error: "payment_event_malformed" },
        { status: 400 },
      );
    }
    const event = verified;
    if (event.livemode !== false) {
      return NextResponse.json({ error: "live_mode_refused" }, { status: 400 });
    }
    if (!amountsAreIntegers(rawBody)) {
      return NextResponse.json(
        { error: "payment_event_malformed" },
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
    const db = adminClient as unknown as PaymentEventsDatabase;

    const accountId =
      typeof event.account === "string" && CONNECTED_ACCOUNT.test(event.account)
        ? event.account
        : null;

    let tenantId: string | null = null;
    if (accountId) {
      const res = await db
        .from("payment_provider_accounts")
        .select("tenant_id")
        .eq("provider_account_id", accountId)
        .eq("livemode", false)
        .maybeSingle();
      if (res.error) return retryLater(event.id, "account_lookup_failed");
      tenantId = res.data?.tenant_id ?? null;
    }

    const insertRes = await db
      .from("stripe_connect_events")
      .insert({
        tenant_id: tenantId,
        stripe_event_id: event.id,
        event_type: event.type,
        livemode: false,
        provider_account_id: accountId,
        event_created_at: new Date(event.created * 1000).toISOString(),
        payload_sha256: createHash("sha256").update(rawBody).digest("hex"),
        raw_payload: JSON.parse(rawBody) as Record<string, unknown>,
        processing_status: tenantId ? "received" : "ignored",
        processing_outcome: tenantId
          ? {}
          : {
              outcome: accountId ? "unknown_account" : "not_a_connected_event",
            },
      })
      .select("id, tenant_id")
      .single();

    let storedId = insertRes.data?.id ?? null;
    let storedTenant = insertRes.data?.tenant_id ?? null;
    if (insertRes.error) {
      if (insertRes.error.code !== "23505")
        return retryLater(event.id, "store_failed");
      const existing = await db
        .from("stripe_connect_events")
        .select("id, tenant_id")
        .eq("stripe_event_id", event.id)
        .maybeSingle();
      if (existing.error || !existing.data)
        return retryLater(event.id, "store_failed");
      storedId = existing.data.id;
      storedTenant = existing.data.tenant_id;
    }

    if (!storedTenant || !storedId) {
      return NextResponse.json({
        received: true,
        eventId: event.id,
        outcome: accountId ? "ignored_unknown_account" : "ignored",
      });
    }

    const claim = await db.rpc("claim_provider_event", {
      p_event_id: storedId,
      p_lease_seconds: PAYMENT_EVENT_LEASE_SECONDS,
    });
    if (claim.error || !claim.data) return retryLater(event.id, "claim_failed");
    if (claim.data.claimed !== true) {
      const outcome = String(claim.data.outcome ?? "skipped");
      if (claim.data.terminal === true)
        return NextResponse.json({
          received: true,
          eventId: event.id,
          outcome,
        });
      return retryLater(event.id, outcome);
    }

    const attempt = Number(claim.data.attempt);
    const applied = await db.rpc(
      isDeferredEventType(event.type)
        ? "defer_payment_event"
        : "apply_payment_outcome",
      { p_event_id: storedId, p_attempt: attempt },
    );
    if (applied.error) {
      if (applied.error.code !== "55000")
        await db.rpc("record_provider_event_failure", {
          p_event_id: storedId,
          p_attempt: attempt,
          p_error_code: applied.error.code ?? "apply_failed",
          p_error_message: applied.error.message,
          p_retryable: true,
          p_retry_delay_seconds: PAYMENT_EVENT_RETRY_DELAY_SECONDS,
        });
      return retryLater(event.id, "apply_failed");
    }

    return NextResponse.json({
      received: true,
      eventId: event.id,
      outcome: String(applied.data?.outcome ?? "applied"),
    });
  };
}

export const POST = createStripePaymentEventsWebhookHandler();
