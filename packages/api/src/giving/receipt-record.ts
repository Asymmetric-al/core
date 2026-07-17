import { isRecord } from "../shared/json-coerce";

import type { getAdminClient } from "@asym/database/supabase/admin";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

/**
 * Minimum Statement-Studio-compatible receipt/statement path (Conrad 2026-07-04 §3).
 *
 * This module owns the ONE thing the existing receipt subsystem does not:
 * an immutable, per-successful-gift receipt record that captures the donor
 * identity + gift facts AT TIME OF GIVING (§2.6). Existing receipts render live
 * from mutable `donors`/`profiles`, so a later donor merge/rename would rewrite
 * receipt truth. The frozen snapshot below is the receipt truth of record.
 *
 * Card receipts follow real payment state; ACH/delayed rails stay honest with
 * pending/processing language until settlement (§2.9/§3). Receipt language here
 * is a CLEARLY-MARKED non-production placeholder pending finance/admin sign-off.
 */

export const GIFT_RECEIPT_SNAPSHOT_VERSION = 1;

/** Clearly-marked NON-PRODUCTION language — Conrad §3: placeholder is fine for MVP
 *  testing as long as it is clearly not final production language. */
export const NON_PRODUCTION_RECEIPT_NOTICE =
  "[TEST RECEIPT — NOT AN OFFICIAL TAX RECEIPT] Placeholder receipt language pending finance/admin approval. Not valid for tax or legal filing.";

export type GiftReceiptStatus =
  | "paid"
  | "processing"
  | "pending"
  | "failed"
  | "refunded";

const SETTLED_DONATION_STATUSES = new Set([
  "completed",
  "succeeded",
  "success",
]);
const FAILED_DONATION_STATUSES = new Set(["failed", "canceled", "cancelled"]);

/**
 * Derive the receipt status from the donation's real payment state.
 * Card → straight to `paid` on settlement. ACH/delayed rails surface as
 * `processing`/`pending` and are NEVER reported as paid until settled.
 */
export function deriveGiftReceiptStatus(input: {
  donationStatus: string;
}): GiftReceiptStatus {
  const status = input.donationStatus.trim().toLowerCase();
  if (SETTLED_DONATION_STATUSES.has(status)) return "paid";
  if (status === "refunded") return "refunded";
  if (FAILED_DONATION_STATUSES.has(status)) return "failed";
  if (status === "processing") return "processing";
  // pending, or anything unrecognized → conservative "pending" (never silently paid).
  return "pending";
}

/** Honest donor-facing status language. Delayed rails read as provisional. */
export function receiptStatusLanguage(status: GiftReceiptStatus): string {
  switch (status) {
    case "paid":
      return "Payment received in full.";
    case "processing":
      return "Payment processing — for bank-based methods (e.g. ACH) this receipt is provisional until settlement clears.";
    case "pending":
      return "Payment pending — this receipt is not yet final.";
    case "failed":
      return "Payment did not complete — no receipt is due for this gift.";
    case "refunded":
      return "This gift was refunded.";
  }
}

function toReceiptDateStamp(giftDate: string): string {
  // Deterministic YYYYMMDD stamp from an ISO date (YYYY-MM-DD...).
  return giftDate.slice(0, 10).replace(/-/g, "");
}

/** Deterministic, human-referenceable receipt number, stable per gift. */
export function buildReceiptNumber(input: {
  giftDate: string;
  donationId: string;
}): string {
  const stamp = toReceiptDateStamp(input.giftDate);
  const suffix = input.donationId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `RCPT-${stamp}-${suffix}`;
}

export interface GiftReceiptIdentitySnapshot {
  readonly donorName: string;
  readonly donorEmail: string | null;
}

export interface GiftReceiptSnapshot {
  readonly snapshotVersion: number;
  readonly receiptNumber: string;
  readonly tenantId: string;
  readonly donationId: string;
  readonly status: GiftReceiptStatus;
  readonly paymentMethod: string | null;
  readonly amountCents: number;
  readonly currency: string;
  readonly designation: string;
  readonly giftDate: string;
  readonly identity: GiftReceiptIdentitySnapshot;
  readonly isTest: boolean;
  readonly notice: string;
}

export interface BuildGiftReceiptInput {
  tenantId: string;
  donationId: string;
  donationStatus: string;
  paymentMethod: string | null;
  amountCents: number;
  currency: string;
  designation: string;
  giftDate: string;
  donorName: string;
  donorEmail: string | null;
  isTest?: boolean;
}

/**
 * Build the immutable receipt snapshot. Values are COPIED (not referenced) and
 * the result is deep-frozen, so a later mutation/merge of the source donor
 * record cannot rewrite this receipt's truth (§2.6).
 */
export function buildGiftReceiptSnapshot(
  input: BuildGiftReceiptInput,
): GiftReceiptSnapshot {
  const identity: GiftReceiptIdentitySnapshot = Object.freeze({
    donorName: input.donorName,
    donorEmail: input.donorEmail ?? null,
  });

  return Object.freeze({
    snapshotVersion: GIFT_RECEIPT_SNAPSHOT_VERSION,
    receiptNumber: buildReceiptNumber({
      giftDate: input.giftDate,
      donationId: input.donationId,
    }),
    tenantId: input.tenantId,
    donationId: input.donationId,
    status: deriveGiftReceiptStatus({ donationStatus: input.donationStatus }),
    paymentMethod: input.paymentMethod ?? null,
    amountCents: input.amountCents,
    currency: input.currency,
    designation: input.designation,
    giftDate: input.giftDate,
    identity,
    isTest: input.isTest ?? false,
    notice: NON_PRODUCTION_RECEIPT_NOTICE,
  });
}

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(cents / 100);
}

/**
 * Render donor-facing receipt text FROM THE FROZEN SNAPSHOT (never from live
 * identity), so it always reflects receipt truth. Clearly marked non-production.
 */
export function renderGiftReceiptText(snapshot: GiftReceiptSnapshot): string {
  const lines = [
    snapshot.notice,
    "",
    "Donation Receipt",
    "",
    `Receipt No: ${snapshot.receiptNumber}`,
    `Date: ${snapshot.giftDate}`,
    `Donor: ${snapshot.identity.donorName}`,
    snapshot.identity.donorEmail
      ? `Email: ${snapshot.identity.donorEmail}`
      : null,
    `Designation: ${snapshot.designation}`,
    `Amount: ${formatMoney(snapshot.amountCents, snapshot.currency)}`,
    `Status: ${receiptStatusLanguage(snapshot.status)}`,
  ].filter((line): line is string => line !== null);

  return `${lines.join("\n")}\n`;
}

// --- Persistence (server-only; idempotent one row per gift) -------------------

interface GiftReceiptRow {
  id: string;
  receipt_number: string;
  status: GiftReceiptStatus;
}

// Intentionally different from the shared `asString`: receipt snapshot fields
// preserve raw values (length check only, no trim-based emptiness rule).
function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export interface RecordGiftReceiptInput extends BuildGiftReceiptInput {
  supabaseAdmin: SupabaseAdminClient;
}

export interface RecordGiftReceiptResult {
  id: string;
  receiptNumber: string;
  status: GiftReceiptStatus;
  created: boolean;
}

/**
 * Write exactly one immutable receipt record for a settled/settling gift.
 * Idempotent: a UNIQUE(donation_id) collision (Postgres 23505) means the
 * receipt already exists — re-read and return it rather than failing. This is
 * the function the money-path owner calls right after the donation advances in
 * `stripe/webhooks.ts` `updatePaymentIntentDonation` (see design note). It is
 * intentionally NOT wired into that protected file in this slice.
 */
export async function recordGiftReceipt(
  input: RecordGiftReceiptInput,
): Promise<RecordGiftReceiptResult> {
  const snapshot = buildGiftReceiptSnapshot(input);

  const insert = await input.supabaseAdmin
    .from("gift_receipt_records")
    .insert({
      tenant_id: snapshot.tenantId,
      donation_id: snapshot.donationId,
      receipt_number: snapshot.receiptNumber,
      status: snapshot.status,
      payment_method: snapshot.paymentMethod,
      snapshot_version: snapshot.snapshotVersion,
      snapshot,
      is_test: snapshot.isTest,
    })
    .select("id")
    .single();

  if (insert.error) {
    if (insert.error.code === "23505") {
      const existing = await input.supabaseAdmin
        .from("gift_receipt_records")
        .select("id, receipt_number, status")
        .eq("tenant_id", snapshot.tenantId)
        .eq("donation_id", snapshot.donationId)
        .maybeSingle();
      if (existing.error) {
        throw new Error(existing.error.message);
      }
      const row = isRecord(existing.data)
        ? (existing.data as unknown as GiftReceiptRow)
        : null;
      if (!row) {
        throw new Error(
          "Duplicate gift receipt reported but existing row not found.",
        );
      }
      return {
        id: row.id,
        receiptNumber: row.receipt_number,
        status: row.status,
        created: false,
      };
    }
    throw new Error(insert.error.message);
  }

  const id = isRecord(insert.data) ? asString(insert.data.id) : null;
  if (!id) {
    throw new Error("Gift receipt insert returned no id.");
  }

  return {
    id,
    receiptNumber: snapshot.receiptNumber,
    status: snapshot.status,
    created: true,
  };
}
