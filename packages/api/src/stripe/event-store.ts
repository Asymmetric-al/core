import { createHash, randomUUID } from "node:crypto";

import type { getAdminClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

type JsonRecord = Record<string, unknown>;

export type StripeRawEventCompletionStatus = "processed" | "ignored";

export interface StripeEventReferences {
  tenantId: string | null;
  donationId: string | null;
  paymentIntentId: string | null;
  chargeId: string | null;
}

export interface StoredStripeRawEvent {
  id: string;
  stripeEventId: string;
  eventType: string;
  tenantId: string | null;
  donationId: string | null;
  stagedGiftId: string | null;
  processingStatus: string;
  processAttempts: number;
  correlationId: string;
  duplicate: boolean;
  rawPayload: JsonRecord;
}

export interface StripeRawEventClaim {
  claimed: boolean;
  lockId: string;
  rawEvent: StoredStripeRawEvent;
}

export interface StripeWebhookErrorClassification {
  code: string;
  message: string;
  retryable: boolean;
}

interface SupabaseError {
  code?: string;
  message?: string;
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function rowRecord(row: JsonRecord, key: string): JsonRecord {
  const value = row[key];
  return isJsonRecord(value) ? value : {};
}

function parseRawPayload(rawBody: string, event: Stripe.Event): JsonRecord {
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (isJsonRecord(parsed)) {
      return parsed;
    }
  } catch {}

  return event as unknown as JsonRecord;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getStripeObjectId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (isJsonRecord(value) && typeof value.id === "string" && value.id) {
    return value.id;
  }

  return null;
}

function getStripeObjectMetadata(value: unknown): Record<string, string> {
  if (!isJsonRecord(value) || !isJsonRecord(value.metadata)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value.metadata).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

async function resolveDonationReferenceByPaymentIntent(
  supabaseAdmin: SupabaseAdminClient | null,
  paymentIntentId: string | null,
): Promise<Pick<StripeEventReferences, "tenantId" | "donationId">> {
  if (!supabaseAdmin || !paymentIntentId) {
    return {
      donationId: null,
      tenantId: null,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("id, tenant_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row: JsonRecord = isJsonRecord(data) ? data : {};
  return {
    donationId: asString(row.id),
    tenantId: asString(row.tenant_id),
  };
}

export async function resolveStripeEventReferences(
  event: Stripe.Event,
  supabaseAdmin: SupabaseAdminClient | null = null,
): Promise<StripeEventReferences> {
  const object = event.data.object as unknown;
  const objectRecord = isJsonRecord(object) ? object : {};
  const metadata = getStripeObjectMetadata(objectRecord);
  const objectType = asString(objectRecord.object);

  const paymentIntentId =
    objectType === "payment_intent"
      ? asString(objectRecord.id)
      : getStripeObjectId(objectRecord.payment_intent);
  const chargeId = objectType === "charge" ? asString(objectRecord.id) : null;
  const fallback = await resolveDonationReferenceByPaymentIntent(
    supabaseAdmin,
    paymentIntentId,
  );

  return {
    tenantId: asString(metadata.tenant_id) ?? fallback.tenantId,
    donationId: asString(metadata.donation_id) ?? fallback.donationId,
    paymentIntentId,
    chargeId,
  };
}

function toStoredStripeRawEvent(
  row: JsonRecord,
  duplicate: boolean,
): StoredStripeRawEvent {
  return {
    correlationId: asString(row.correlation_id) ?? "",
    donationId: asString(row.donation_id),
    duplicate,
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

async function loadStripeRawEventByEventId(
  supabaseAdmin: SupabaseAdminClient,
  stripeEventId: string,
): Promise<StoredStripeRawEvent | null> {
  const { data, error } = await supabaseAdmin
    .from("stripe_raw_events")
    .select("*")
    .eq("stripe_event_id", stripeEventId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return isJsonRecord(data) ? toStoredStripeRawEvent(data, true) : null;
}

async function loadStripeRawEventById(
  supabaseAdmin: SupabaseAdminClient,
  rawEventId: string,
): Promise<StoredStripeRawEvent> {
  const { data, error } = await supabaseAdmin
    .from("stripe_raw_events")
    .select("*")
    .eq("id", rawEventId)
    .single();

  if (error || !isJsonRecord(data)) {
    throw new Error(error?.message ?? "Stripe raw event not found.");
  }

  return toStoredStripeRawEvent(data, false);
}

function isUniqueViolation(error: SupabaseError | null): boolean {
  return (
    error?.code === "23505" ||
    Boolean(error?.message?.toLowerCase().includes("duplicate"))
  );
}

export async function storeStripeRawEvent(input: {
  supabaseAdmin: SupabaseAdminClient;
  event: Stripe.Event;
  rawBody: string;
  signatureHeader: string;
}): Promise<StoredStripeRawEvent> {
  const references = await resolveStripeEventReferences(
    input.event,
    input.supabaseAdmin,
  );
  const rawPayload = parseRawPayload(input.rawBody, input.event);
  const signatureHeader = input.signatureHeader.trim();
  const { data, error } = await input.supabaseAdmin
    .from("stripe_raw_events")
    .insert({
      tenant_id: references.tenantId,
      donation_id: references.donationId,
      stripe_event_id: input.event.id,
      event_type: input.event.type,
      api_version: input.event.api_version ?? null,
      livemode: input.event.livemode === true,
      stripe_account: input.event.account ?? null,
      payment_intent_id: references.paymentIntentId,
      charge_id: references.chargeId,
      payload_sha256: sha256Hex(input.rawBody),
      signature_header_present: signatureHeader.length > 0,
      signature_header_sha256:
        signatureHeader.length > 0 ? sha256Hex(signatureHeader) : null,
      raw_payload: rawPayload,
      processing_status: "received",
    })
    .select("*")
    .single();

  if (isUniqueViolation(error)) {
    const duplicate = await loadStripeRawEventByEventId(
      input.supabaseAdmin,
      input.event.id,
    );
    if (duplicate) {
      return duplicate;
    }
  }

  if (error || !isJsonRecord(data)) {
    throw new Error(error?.message ?? "Failed to store Stripe raw event.");
  }

  return toStoredStripeRawEvent(data, false);
}

function parseClaimedFlag(value: unknown): boolean {
  if (Array.isArray(value)) {
    return parseClaimedFlag(value[0]);
  }
  if (!isJsonRecord(value)) {
    return false;
  }
  return value.claimed === true;
}

export async function claimStripeRawEvent(input: {
  supabaseAdmin: SupabaseAdminClient;
  rawEventId: string;
}): Promise<StripeRawEventClaim> {
  const lockId = randomUUID();
  const { data, error } = await input.supabaseAdmin.rpc(
    "claim_stripe_raw_event",
    {
      p_raw_event_id: input.rawEventId,
      p_lock_id: lockId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  const rawEvent = await loadStripeRawEventById(
    input.supabaseAdmin,
    input.rawEventId,
  );

  return {
    claimed: parseClaimedFlag(data),
    lockId,
    rawEvent,
  };
}

export async function completeStripeRawEvent(input: {
  supabaseAdmin: SupabaseAdminClient;
  rawEventId: string;
  lockId: string;
  status: StripeRawEventCompletionStatus;
  outcome: JsonRecord;
  stagedGiftId?: string | null;
}) {
  const { error } = await input.supabaseAdmin.rpc("complete_stripe_raw_event", {
    p_raw_event_id: input.rawEventId,
    p_lock_id: input.lockId,
    p_processing_status: input.status,
    p_processing_outcome: input.outcome,
    p_staged_gift_id: input.stagedGiftId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export function classifyStripeWebhookProcessingError(
  error: unknown,
): StripeWebhookErrorClassification {
  const message =
    error instanceof Error
      ? error.message
      : "Stripe webhook processing failed.";
  const lowered = message.toLowerCase();
  const retryable = !(
    lowered.includes("not found") ||
    lowered.includes("invalid") ||
    lowered.includes("forbidden") ||
    lowered.includes("unauthorized")
  );

  return {
    code: retryable
      ? "stripe_webhook_retryable_processing_error"
      : "stripe_webhook_permanent_processing_error",
    message,
    retryable,
  };
}

export async function recordStripeRawEventFailure(input: {
  supabaseAdmin: SupabaseAdminClient;
  rawEventId: string;
  lockId: string;
  error: unknown;
}) {
  const classification = classifyStripeWebhookProcessingError(input.error);
  const { error } = await input.supabaseAdmin.rpc(
    "record_stripe_raw_event_failure",
    {
      p_raw_event_id: input.rawEventId,
      p_lock_id: input.lockId,
      p_error_code: classification.code,
      p_error_message: classification.message,
      p_retryable: classification.retryable,
      p_retry_delay_seconds: 60,
      p_dead_letter_after: 5,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return classification;
}

export function shouldSkipAlreadyProcessedRawEvent(
  rawEvent: StoredStripeRawEvent,
): boolean {
  return ["processed", "ignored", "processing", "dead_letter"].includes(
    rawEvent.processingStatus,
  );
}

export function getRawPayloadEvent(rawEvent: StoredStripeRawEvent) {
  return rawEvent.rawPayload as unknown as Stripe.Event;
}

export function isStripeRawEventLiveMode(rawEvent: StoredStripeRawEvent) {
  return asBoolean(rawEvent.rawPayload.livemode);
}
