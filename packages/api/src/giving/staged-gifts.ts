import { ApiHttpError } from "../shared/http-errors";
import { asString, isRecord } from "../shared/json-coerce";

import type { getAdminClient } from "@asym/database/supabase/admin";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

type JsonRecord = Record<string, unknown>;

export type StagedGiftStatus =
  | "received"
  | "needs_review"
  | "ready_to_post"
  | "posted"
  | "failed"
  | "refunded"
  | "voided";

export type StagedGiftReceiptStatus =
  | "not_required"
  | "pending"
  | "sent"
  | "failed"
  | "suppressed";

export type StagedGiftCrmPostStatus =
  | "not_required"
  | "queued"
  | "posted"
  | "failed"
  | "blocked";

export interface StagedGiftRow {
  id: string;
  tenantId: string;
  donationId: string;
  donorId: string | null;
  missionaryId: string | null;
  fundId: string | null;
  stripeRawEventId: string | null;
  stripeEventId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  amount: number;
  currency: string;
  status: StagedGiftStatus;
  donorMatchStatus: string;
  allocationStatus: string;
  reviewReason: string | null;
  receiptStatus: StagedGiftReceiptStatus;
  crmPostStatus: StagedGiftCrmPostStatus;
  crmOutboundJobId: string | null;
  twentyRecordId: string | null;
  metadata: JsonRecord;
}

interface DonationForStaging {
  id: string;
  tenant_id: string | null;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string | null;
  status: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
}

export interface StageGiftInput {
  supabaseAdmin: SupabaseAdminClient;
  donation: DonationForStaging;
  rawEventId: string | null;
  stripeEventId: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
}

export interface StagedGiftActionInput {
  supabaseAdmin: SupabaseAdminClient;
  stagedGiftId: string;
  tenantId: string;
  actorProfileId: string | null;
  note?: string | null;
}

const RETIRED_CRM_POSTING_MESSAGE =
  "Twenty CRM posting is retired. Staged gifts stay in Asym Postgres as finance records.";

export interface ReconciliationFinding {
  id: string;
  reason: string;
  details?: JsonRecord;
}

export interface GivingReconciliationResult {
  runId: string | null;
  status: "succeeded" | "failed";
  checkedCounts: Record<string, number>;
  findings: {
    unlinkedStripeEvents: ReconciliationFinding[];
    unstagedDonationSagaEvents: ReconciliationFinding[];
    unpostedStagedGifts: ReconciliationFinding[];
    pendingReceipts: ReconciliationFinding[];
  };
}

const ALLOWED_TRANSITIONS: Record<
  StagedGiftStatus,
  readonly StagedGiftStatus[]
> = {
  received: ["needs_review", "ready_to_post", "failed", "refunded", "voided"],
  needs_review: ["ready_to_post", "failed", "voided"],
  ready_to_post: ["posted", "failed", "needs_review", "voided"],
  posted: ["refunded"],
  failed: ["needs_review", "ready_to_post", "voided"],
  refunded: [],
  voided: [],
};

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function rowRecord(row: JsonRecord, key: string): JsonRecord {
  const value = row[key];
  return isRecord(value) ? value : {};
}

function requireNoError(error: { message?: string } | null, fallback: string) {
  if (error) {
    throw new Error(error.message ?? fallback);
  }
}

function toStagedGiftRow(row: JsonRecord): StagedGiftRow {
  return {
    allocationStatus: asString(row.allocation_status) ?? "single_allocation",
    amount: asNumber(row.amount),
    crmOutboundJobId: asString(row.crm_outbound_job_id),
    crmPostStatus:
      (asString(row.crm_post_status) as StagedGiftCrmPostStatus | null) ??
      "not_required",
    currency: asString(row.currency) ?? "usd",
    donationId: asString(row.donation_id) ?? "",
    donorId: asString(row.donor_id),
    donorMatchStatus: asString(row.donor_match_status) ?? "matched",
    fundId: asString(row.fund_id),
    id: asString(row.id) ?? "",
    metadata: rowRecord(row, "metadata"),
    missionaryId: asString(row.missionary_id),
    receiptStatus:
      (asString(row.receipt_status) as StagedGiftReceiptStatus | null) ??
      "pending",
    reviewReason: asString(row.review_reason),
    status: (asString(row.status) as StagedGiftStatus | null) ?? "received",
    stripeChargeId: asString(row.stripe_charge_id),
    stripeEventId: asString(row.stripe_event_id),
    stripePaymentIntentId: asString(row.stripe_payment_intent_id),
    stripeRawEventId: asString(row.stripe_raw_event_id),
    tenantId: asString(row.tenant_id) ?? "",
    twentyRecordId: asString(row.twenty_record_id),
  };
}

function determineInitialReview(input: DonationForStaging) {
  if (!input.tenant_id) {
    throw new Error("Cannot stage a gift without tenant_id.");
  }

  const needsDonorReview = !input.donor_id;
  const needsAllocationReview = !input.fund_id && !input.missionary_id;
  const reviewReasons = [
    needsDonorReview ? "donor_match_missing" : null,
    needsAllocationReview ? "allocation_missing" : null,
  ].filter(Boolean);

  return {
    allocationStatus: needsAllocationReview
      ? "needs_review"
      : "single_allocation",
    donorMatchStatus: needsDonorReview ? "needs_review" : "matched",
    reviewReason: reviewReasons.join(",") || null,
    status:
      needsDonorReview || needsAllocationReview
        ? ("needs_review" as const)
        : ("received" as const),
  };
}

export function canTransitionStagedGift(
  from: StagedGiftStatus,
  to: StagedGiftStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return ALLOWED_TRANSITIONS[from].includes(to);
}

async function appendGiftAuditEvent(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  stagedGiftId: string;
  actorProfileId?: string | null;
  action: string;
  note?: string | null;
  details?: JsonRecord;
}) {
  const { error } = await input.supabaseAdmin
    .from("staged_gift_audit_events")
    .insert({
      tenant_id: input.tenantId,
      staged_gift_id: input.stagedGiftId,
      actor_profile_id: input.actorProfileId ?? null,
      action: input.action,
      note: input.note ?? null,
      details: input.details ?? {},
    });

  requireNoError(error, "Failed to write staged gift audit event.");
}

export async function loadStagedGiftById(input: {
  supabaseAdmin: SupabaseAdminClient;
  stagedGiftId: string;
  tenantId: string;
}): Promise<StagedGiftRow> {
  const { data, error } = await input.supabaseAdmin
    .from("staged_gifts")
    .select("*")
    .eq("id", input.stagedGiftId)
    .eq("tenant_id", input.tenantId)
    .single();

  if (error || !isRecord(data)) {
    throw new ApiHttpError(404, "Staged gift not found.");
  }

  return toStagedGiftRow(data);
}

type StagedGiftAllocationSnapshot = {
  amount: number;
  fundId: string | null;
  missionaryId: string | null;
};

function allocationFromDonation(
  donation: DonationForStaging,
): StagedGiftAllocationSnapshot {
  return {
    amount: donation.amount,
    fundId: donation.fund_id,
    missionaryId: donation.missionary_id,
  };
}

function allocationFromStagedGift(
  gift: StagedGiftRow,
): StagedGiftAllocationSnapshot {
  return {
    amount: gift.amount,
    fundId: gift.fundId,
    missionaryId: gift.missionaryId,
  };
}

async function ensureInitialAllocation(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  stagedGiftId: string;
  allocation: StagedGiftAllocationSnapshot;
}) {
  if (!(input.allocation.amount > 0)) {
    return;
  }

  const existing = await input.supabaseAdmin
    .from("staged_gift_allocations")
    .select("id")
    .eq("staged_gift_id", input.stagedGiftId)
    .limit(1)
    .maybeSingle();
  requireNoError(existing.error, "Failed to read staged gift allocations.");
  if (isRecord(existing.data)) {
    // Any allocation row (initial or reviewed admin split) blocks stale full re-insert on webhook replay.
    return;
  }

  const { error } = await input.supabaseAdmin
    .from("staged_gift_allocations")
    .insert({
      tenant_id: input.tenantId,
      staged_gift_id: input.stagedGiftId,
      fund_id: input.allocation.fundId,
      missionary_id: input.allocation.missionaryId,
      amount: input.allocation.amount,
      memo: "Initial allocation from Stripe payment intent.",
      is_initial: true,
    });
  if (error?.code === "23505") {
    // A concurrent webhook delivery already inserted the initial allocation.
    return;
  }
  requireNoError(error, "Failed to stage gift allocation.");
}

export async function stageGiftFromStripeDonation(
  input: StageGiftInput,
): Promise<StagedGiftRow> {
  const existing = await input.supabaseAdmin
    .from("staged_gifts")
    .select("*")
    .eq("donation_id", input.donation.id)
    .maybeSingle();

  requireNoError(existing.error, "Failed to read staged gift.");
  if (isRecord(existing.data)) {
    const existingGift = toStagedGiftRow(existing.data);
    await ensureInitialAllocation({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: existingGift.tenantId,
      stagedGiftId: existingGift.id,
      allocation: allocationFromStagedGift(existingGift),
    });
    return existingGift;
  }

  const initialReview = determineInitialReview(input.donation);
  const tenantId = input.donation.tenant_id;
  if (!tenantId) {
    throw new Error("Cannot stage a gift without tenant_id.");
  }

  const inserted = await input.supabaseAdmin
    .from("staged_gifts")
    .insert({
      tenant_id: tenantId,
      donation_id: input.donation.id,
      donor_id: input.donation.donor_id,
      missionary_id: input.donation.missionary_id,
      fund_id: input.donation.fund_id,
      stripe_raw_event_id: input.rawEventId,
      stripe_event_id: input.stripeEventId,
      stripe_payment_intent_id:
        input.stripePaymentIntentId ?? input.donation.stripe_payment_intent_id,
      stripe_charge_id: input.stripeChargeId ?? input.donation.stripe_charge_id,
      amount: input.donation.amount,
      currency: (input.donation.currency ?? "usd").toLowerCase(),
      status: initialReview.status,
      donor_match_status: initialReview.donorMatchStatus,
      allocation_status: initialReview.allocationStatus,
      review_reason: initialReview.reviewReason,
      receipt_status: "pending",
      crm_post_status: "not_required",
      metadata: {
        source: "stripe_webhook",
      },
    })
    .select("*")
    .single();

  if (inserted.error?.code === "23505") {
    const duplicate = await input.supabaseAdmin
      .from("staged_gifts")
      .select("*")
      .eq("donation_id", input.donation.id)
      .single();
    requireNoError(duplicate.error, "Failed to read duplicate staged gift.");
    if (!isRecord(duplicate.data)) {
      throw new Error("Staged gift insert returned no row.");
    }
    const duplicateGift = toStagedGiftRow(duplicate.data);
    await ensureInitialAllocation({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: duplicateGift.tenantId,
      stagedGiftId: duplicateGift.id,
      allocation: allocationFromStagedGift(duplicateGift),
    });
    return duplicateGift;
  }

  requireNoError(inserted.error, "Failed to stage gift.");
  if (!isRecord(inserted.data)) {
    throw new Error("Staged gift insert returned no row.");
  }
  const stagedGift = toStagedGiftRow(inserted.data);

  await ensureInitialAllocation({
    supabaseAdmin: input.supabaseAdmin,
    tenantId,
    stagedGiftId: stagedGift.id,
    allocation: allocationFromDonation(input.donation),
  });

  try {
    await appendGiftAuditEvent({
      supabaseAdmin: input.supabaseAdmin,
      tenantId,
      stagedGiftId: stagedGift.id,
      action: "staged_gift_created",
      details: {
        donationId: input.donation.id,
        stripeEventId: input.stripeEventId,
        status: stagedGift.status,
      },
    });
  } catch (error) {
    console.error("staged_gift_created audit event failed:", error);
  }

  return stagedGift;
}

export async function markStagedGiftRefunded(input: {
  supabaseAdmin: SupabaseAdminClient;
  donationId: string;
  tenantId: string | null;
  stripeChargeId: string;
  fullRefund: boolean;
}) {
  if (!input.tenantId) {
    return null;
  }

  const existing = await input.supabaseAdmin
    .from("staged_gifts")
    .select("*")
    .eq("donation_id", input.donationId)
    .maybeSingle();
  requireNoError(existing.error, "Failed to read staged gift for refund.");

  if (!isRecord(existing.data)) {
    return null;
  }

  const gift = toStagedGiftRow(existing.data);
  const status = input.fullRefund ? "refunded" : gift.status;
  const { data, error } = await input.supabaseAdmin
    .from("staged_gifts")
    .update({
      status,
      stripe_charge_id: input.stripeChargeId,
      metadata: {
        ...gift.metadata,
        latestRefund: {
          fullRefund: input.fullRefund,
          stripeChargeId: input.stripeChargeId,
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift.id)
    .select("*")
    .single();

  requireNoError(error, "Failed to update staged gift refund state.");
  await appendGiftAuditEvent({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    stagedGiftId: gift.id,
    action: input.fullRefund
      ? "staged_gift_refunded"
      : "staged_gift_partially_refunded",
    details: {
      stripeChargeId: input.stripeChargeId,
    },
  });

  return toStagedGiftRow((data ?? {}) as JsonRecord);
}

export async function approveStagedGiftForFinance(
  input: StagedGiftActionInput,
): Promise<StagedGiftRow> {
  const gift = await loadStagedGiftById(input);
  if (!canTransitionStagedGift(gift.status, "ready_to_post")) {
    throw new ApiHttpError(
      409,
      `Cannot approve staged gift from ${gift.status} status.`,
    );
  }

  const { data, error } = await input.supabaseAdmin
    .from("staged_gifts")
    .update({
      status: "ready_to_post",
      crm_post_status: "not_required",
      crm_outbound_job_id: null,
      reviewed_by_profile_id: input.actorProfileId,
      reviewed_at: new Date().toISOString(),
      last_error_code: null,
      last_error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift.id)
    .select("*")
    .single();

  requireNoError(error, "Failed to approve staged gift.");

  await appendGiftAuditEvent({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: gift.tenantId,
    stagedGiftId: gift.id,
    actorProfileId: input.actorProfileId,
    action: "staged_gift_approved_for_finance",
    note: input.note,
    details: {
      crmPostStatus: "not_required",
    },
  });

  return toStagedGiftRow((data ?? {}) as JsonRecord);
}

export function rejectRetiredCrmPostingRetry(): never {
  throw new ApiHttpError(410, RETIRED_CRM_POSTING_MESSAGE);
}

async function insertReconciliationRun(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  requestedByProfileId: string | null;
  result: Omit<GivingReconciliationResult, "runId">;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("giving_reconciliation_runs")
    .insert({
      tenant_id: input.tenantId,
      run_type: "full",
      status: input.result.status,
      checked_counts: input.result.checkedCounts,
      findings: input.result.findings,
      requested_by_profile_id: input.requestedByProfileId,
      finished_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return isRecord(data) ? (asString(data.id) ?? null) : null;
}

function toFinding(row: JsonRecord, reason: string): ReconciliationFinding {
  return {
    id: asString(row.id) ?? "",
    reason,
    details: row,
  };
}

export async function runGivingReconciliation(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  requestedByProfileId: string | null;
}): Promise<GivingReconciliationResult> {
  const [unlinkedStripeEvents, completedOutbox, stagedGifts, pendingReceipts] =
    await Promise.all([
      input.supabaseAdmin
        .from("stripe_raw_events")
        .select("id,stripe_event_id,event_type,payment_intent_id,donation_id")
        .eq("tenant_id", input.tenantId)
        .eq("event_type", "payment_intent.succeeded")
        .is("donation_id", null)
        .limit(100),
      input.supabaseAdmin
        .from("donation_saga_outbox")
        .select("id,donation_id,status,stripe_payment_intent_id")
        .eq("tenant_id", input.tenantId)
        .eq("status", "completed")
        .limit(500),
      input.supabaseAdmin
        .from("staged_gifts")
        .select("id,donation_id,status,crm_post_status,receipt_status")
        .eq("tenant_id", input.tenantId)
        .limit(500),
      input.supabaseAdmin
        .from("staged_gifts")
        .select("id,donation_id,receipt_status,status")
        .eq("tenant_id", input.tenantId)
        .eq("receipt_status", "pending")
        .limit(100),
    ]);

  for (const result of [
    unlinkedStripeEvents,
    completedOutbox,
    stagedGifts,
    pendingReceipts,
  ]) {
    requireNoError(result.error, "Failed to run giving reconciliation.");
  }

  const stagedByDonation = new Set(
    ((stagedGifts.data ?? []) as JsonRecord[])
      .map((row) => asString(row.donation_id))
      .filter(Boolean),
  );
  const unstagedDonationSagaEvents = (
    (completedOutbox.data ?? []) as JsonRecord[]
  )
    .filter((row) => {
      const donationId = asString(row.donation_id);
      return donationId ? !stagedByDonation.has(donationId) : false;
    })
    .map((row) =>
      toFinding(row, "completed_donation_saga_without_staged_gift"),
    );
  const unpostedStagedGifts = ((stagedGifts.data ?? []) as JsonRecord[])
    .filter((row) => {
      const status = asString(row.status);
      const crmPostStatus = asString(row.crm_post_status);
      return (
        status === "ready_to_post" &&
        !["queued", "posted", "not_required"].includes(crmPostStatus ?? "")
      );
    })
    .map((row) => toFinding(row, "ready_gift_not_approved_for_finance"));
  const findings = {
    pendingReceipts: ((pendingReceipts.data ?? []) as JsonRecord[]).map((row) =>
      toFinding(row, "receipt_required_but_not_sent"),
    ),
    unlinkedStripeEvents: (
      (unlinkedStripeEvents.data ?? []) as JsonRecord[]
    ).map((row) =>
      toFinding(row, "stripe_success_event_without_donation_link"),
    ),
    unpostedStagedGifts,
    unstagedDonationSagaEvents,
  };
  const checkedCounts = {
    completedDonationSagaEvents: (completedOutbox.data ?? []).length,
    pendingReceiptStagedGifts: (pendingReceipts.data ?? []).length,
    stagedGifts: (stagedGifts.data ?? []).length,
    unlinkedStripeEvents: (unlinkedStripeEvents.data ?? []).length,
  };
  const status =
    findings.pendingReceipts.length > 0 ||
    findings.unlinkedStripeEvents.length > 0 ||
    findings.unpostedStagedGifts.length > 0 ||
    findings.unstagedDonationSagaEvents.length > 0
      ? "failed"
      : "succeeded";
  const resultWithoutRun = {
    checkedCounts,
    findings,
    status,
  } satisfies Omit<GivingReconciliationResult, "runId">;
  const runId = await insertReconciliationRun({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    requestedByProfileId: input.requestedByProfileId,
    result: resultWithoutRun,
  });

  return {
    ...resultWithoutRun,
    runId,
  };
}
