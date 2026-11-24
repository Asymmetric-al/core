import { createHash } from "node:crypto";

import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { type NextRequest, NextResponse } from "next/server";

import { createStripeClient } from "./client";
import {
  StripeLiveModeRefusedError,
  assertStripeTestModeKey,
  fetchConnectedAccountSnapshot,
  type ConnectedAccountSnapshot,
  type StripeConnectClient,
} from "./connect";

type AdminClientResult = ReturnType<typeof getAdminClient>;
type QueryError = { code?: string; message: string } | null;

interface ConnectEventNotification {
  id: string;
  type: string;
  created: string;
  livemode: boolean;
  related_object?: { id?: string; type?: string } | null;
}

export interface ConnectEventVerifier {
  parseEventNotification(
    payload: string,
    header: string,
    secret: string,
  ): ConnectEventNotification;
}

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
    fn:
      | "confirm_payment_account_onboarding"
      | "claim_provider_event"
      | "apply_account_event"
      | "record_provider_event_failure",
    args: Record<string, unknown>,
  ): Promise<{ data: Record<string, unknown> | null; error: QueryError }>;
}

export const CONNECT_ACCOUNT_EVENT_PREFIX = "v2.core.account";
export const CONNECT_ACCOUNT_CLOSED_EVENT = "v2.core.account.closed";
const CONFIRMED_OUTCOMES = new Set(["confirmed", "already_confirmed"]);
const LEASE_SECONDS = 120;
const RETRY_DELAY_SECONDS = 60;

export interface StripeConnectWebhookDeps {
  getWebhookSecret?: () => string | undefined;
  getSecretKey?: () => string | undefined;
  adminClientFactory?: () => AdminClientResult;
  createVerifier?: () => ConnectEventVerifier;
  createProviderStripe?: (secretKey: string) => StripeConnectClient;
}

function accountOf(notification: ConnectEventNotification): string | null {
  const related = notification.related_object;
  if (
    !notification.type.startsWith(CONNECT_ACCOUNT_EVENT_PREFIX) ||
    notification.type.startsWith("v2.core.account_") ||
    related?.type !== "v2.core.account" ||
    typeof related.id !== "string" ||
    !/^acct_[A-Za-z0-9]+$/.test(related.id)
  ) {
    return null;
  }
  return related.id;
}

function retryLater(eventId: string, outcome: string) {
  return NextResponse.json(
    { received: false, eventId, outcome, retry: true },
    { status: 503 },
  );
}

export function createStripeConnectWebhookHandler(
  deps: StripeConnectWebhookDeps = {},
) {
  const getWebhookSecret =
    deps.getWebhookSecret ?? (() => serverEnv.STRIPE_CONNECT_WEBHOOK_SECRET);
  const getSecretKey = deps.getSecretKey ?? (() => serverEnv.STRIPE_SECRET_KEY);
  const resolveAdminClient = deps.adminClientFactory ?? getAdminClient;
  const createVerifier =
    deps.createVerifier ??
    (() =>
      createStripeClient(
        "sk_test_webhook_verify_only",
      ) as unknown as ConnectEventVerifier);
  const createProviderStripe =
    deps.createProviderStripe ??
    ((key: string) =>
      createStripeClient(key) as unknown as StripeConnectClient);

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
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature." },
        { status: 400 },
      );
    }

    let notification: ConnectEventNotification;
    try {
      notification = createVerifier().parseEventNotification(
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

    if (
      typeof notification?.id !== "string" ||
      typeof notification.type !== "string" ||
      typeof notification.livemode !== "boolean" ||
      typeof notification.created !== "string"
    ) {
      return NextResponse.json(
        { error: "Unsupported Stripe event notification." },
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

    let providerStripe: StripeConnectClient | null = null;
    const provider = (): StripeConnectClient => {
      if (providerStripe) return providerStripe;
      try {
        providerStripe = createProviderStripe(
          assertStripeTestModeKey(getSecretKey() ?? ""),
        );
      } catch (error) {
        throw error instanceof StripeLiveModeRefusedError
          ? error
          : new Error("Stripe is not configured for this environment.");
      }
      return providerStripe;
    };

    const accountId = accountOf(notification);

    const resolveTenant = async (): Promise<string | null | "error"> => {
      if (!accountId) return null;
      const res = await db
        .from("payment_provider_accounts")
        .select("tenant_id")
        .eq("provider_account_id", accountId)
        .eq("livemode", notification.livemode)
        .maybeSingle();
      if (res.error) return "error";
      return res.data?.tenant_id ?? null;
    };

    let tenantId = await resolveTenant();
    if (tenantId === "error") {
      return retryLater(notification.id, "account_lookup_failed");
    }

    if (!tenantId && accountId) {
      let snapshot: ConnectedAccountSnapshot;
      try {
        snapshot = await fetchConnectedAccountSnapshot(provider(), accountId);
      } catch {
        return retryLater(notification.id, "account_fetch_failed");
      }
      if (snapshot.metadata.asym_onboarding_intent) {
        const confirmRes = await db.rpc("confirm_payment_account_onboarding", {
          p_stripe_event_id: notification.id,
          p_livemode: notification.livemode,
          p_snapshot: snapshot,
        });
        if (confirmRes.error && confirmRes.error.code !== "22023") {
          return retryLater(notification.id, "confirmation_failed");
        }
        if (CONFIRMED_OUTCOMES.has(String(confirmRes.data?.outcome ?? ""))) {
          tenantId = await resolveTenant();
          if (tenantId === "error") {
            return retryLater(notification.id, "account_lookup_failed");
          }
        }
      }
    }

    const insertRes = await db
      .from("stripe_connect_events")
      .insert({
        tenant_id: tenantId,
        stripe_event_id: notification.id,
        event_type: notification.type,
        livemode: notification.livemode,
        provider_account_id: accountId,
        event_created_at: notification.created,
        payload_sha256: createHash("sha256").update(rawBody).digest("hex"),
        raw_payload: JSON.parse(rawBody) as Record<string, unknown>,
        processing_status: tenantId ? "received" : "ignored",
        processing_outcome: tenantId
          ? {}
          : { outcome: accountId ? "unknown_account" : "not_an_account_event" },
      })
      .select("id, tenant_id")
      .single();

    let rawEventId = insertRes.data?.id ?? null;
    let storedTenantId = insertRes.data?.tenant_id ?? null;

    if (insertRes.error) {
      if (insertRes.error.code !== "23505") {
        return retryLater(notification.id, "store_failed");
      }
      const existingRes = await db
        .from("stripe_connect_events")
        .select("id, tenant_id")
        .eq("stripe_event_id", notification.id)
        .maybeSingle();
      if (existingRes.error || !existingRes.data) {
        return retryLater(notification.id, "store_failed");
      }
      rawEventId = existingRes.data.id;
      storedTenantId = existingRes.data.tenant_id;
    }

    if (!storedTenantId || !rawEventId) {
      return NextResponse.json({
        received: true,
        eventId: notification.id,
        outcome: accountId ? "ignored_unknown_account" : "ignored",
      });
    }

    const claimRes = await db.rpc("claim_provider_event", {
      p_event_id: rawEventId,
      p_lease_seconds: LEASE_SECONDS,
    });
    if (claimRes.error || !claimRes.data) {
      return retryLater(notification.id, "claim_failed");
    }
    if (claimRes.data.claimed !== true) {
      const outcome = String(claimRes.data.outcome ?? "skipped");
      if (claimRes.data.terminal === true) {
        return NextResponse.json({
          received: true,
          eventId: notification.id,
          outcome,
        });
      }
      return retryLater(notification.id, outcome);
    }

    const attempt = Number(claimRes.data.attempt);
    const recordFailure = async (code: string, message: string) => {
      await db.rpc("record_provider_event_failure", {
        p_event_id: rawEventId,
        p_attempt: attempt,
        p_error_code: code,
        p_error_message: message,
        p_retryable: true,
        p_retry_delay_seconds: RETRY_DELAY_SECONDS,
      });
    };

    let snapshot: ConnectedAccountSnapshot | null = null;
    try {
      snapshot = await fetchConnectedAccountSnapshot(provider(), accountId!);
    } catch {
      if (notification.type !== CONNECT_ACCOUNT_CLOSED_EVENT) {
        await recordFailure(
          "account_fetch_failed",
          "Could not read the connected account from Stripe.",
        );
        return retryLater(notification.id, "account_fetch_failed");
      }
    }

    const applyRes = await db.rpc("apply_account_event", {
      p_event_id: rawEventId,
      p_attempt: attempt,
      p_snapshot: snapshot,
    });
    if (applyRes.error) {
      if (applyRes.error.code !== "55000") {
        await recordFailure(
          applyRes.error.code ?? "apply_account_event_failed",
          applyRes.error.message,
        );
      }
      return retryLater(notification.id, "apply_failed");
    }

    return NextResponse.json({
      received: true,
      eventId: notification.id,
      outcome: String(applyRes.data?.outcome ?? "applied"),
    });
  };
}

export const POST = createStripeConnectWebhookHandler();
