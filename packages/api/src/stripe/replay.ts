import { getRawPayloadEvent, type StoredStripeRawEvent } from "./event-store";
import { ApiHttpError } from "../shared/http-errors";

import type { getAdminClient } from "@asym/database/supabase/admin";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function rowRecord(row: JsonRecord, key: string): JsonRecord {
  const value = row[key];
  return isJsonRecord(value) ? value : {};
}

function toStoredStripeRawEvent(row: JsonRecord): StoredStripeRawEvent {
  return {
    correlationId: asString(row.correlation_id) ?? "",
    donationId: asString(row.donation_id),
    duplicate: false,
    eventType: asString(row.event_type) ?? "",
    id: asString(row.id) ?? "",
    processAttempts: asNumber(row.process_attempts),
    processingStatus: asString(row.processing_status) ?? "received",
    rawPayload: rowRecord(row, "raw_payload"),
    stagedGiftId: asString(row.staged_gift_id),
    stripeEventId: asString(row.stripe_event_id) ?? "",
    tenantId: asString(row.tenant_id),
  };
}

export async function loadStripeRawEventForReplay(input: {
  supabaseAdmin: SupabaseAdminClient;
  stripeEventId: string;
  tenantId: string;
}): Promise<StoredStripeRawEvent> {
  const { data, error } = await input.supabaseAdmin
    .from("stripe_raw_events")
    .select("*")
    .eq("stripe_event_id", input.stripeEventId)
    .eq("tenant_id", input.tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!isJsonRecord(data)) {
    throw new ApiHttpError(404, "Stripe raw event not found.");
  }

  return toStoredStripeRawEvent(data);
}

/**
 * Resolve the most recent stored provider event id for a gift, so the inline
 * "Replay provider webhook" action can derive the event server-side instead of
 * requiring the client to carry (and be trusted for) a Stripe event id.
 * Returns null when the gift has no stored provider events.
 */
export async function resolveLatestStripeEventIdForDonation(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  donationId: string;
}): Promise<string | null> {
  const { data, error } = await input.supabaseAdmin
    .from("stripe_raw_events")
    .select("stripe_event_id")
    .eq("tenant_id", input.tenantId)
    .eq("donation_id", input.donationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return isJsonRecord(data) ? asString(data.stripe_event_id) : null;
}

export async function markStripeRawEventForReplay(input: {
  supabaseAdmin: SupabaseAdminClient;
  rawEventId: string;
}) {
  const { error } = await input.supabaseAdmin
    .from("stripe_raw_events")
    .update({
      processing_status: "received",
      next_attempt_at: new Date().toISOString(),
      lock_id: null,
      locked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.rawEventId);

  if (error) {
    throw new Error(error.message);
  }
}

export { getRawPayloadEvent };
