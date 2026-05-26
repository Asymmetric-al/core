import { buildContributionDetail } from "./detail-read-model";
import { ApiHttpError } from "../../shared/http-errors";

import type { ContributionDetail } from "./detail-read-model";
import type {
  ContributionCorrectionRecordInput,
  ContributionOperationAuditEventInput,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function assertNoError(
  error: { message?: string } | null,
  fallback: string,
): void {
  if (error) {
    throw new Error(error.message ?? fallback);
  }
}

function normalizeDonation(row: JsonRecord) {
  return {
    id: asString(row.id) ?? "",
    tenantId: asString(row.tenant_id) ?? "",
    donorId: asString(row.donor_id),
    missionaryId: asString(row.missionary_id),
    fundId: asString(row.fund_id),
    amount: asNumber(row.amount),
    currency: asString(row.currency) ?? "usd",
    status: asString(row.status),
    donationType: asString(row.donation_type),
    paymentMethod: asString(row.payment_method),
    isRecurring: row.is_recurring === true,
    recurringInterval: asString(row.recurring_interval),
    notes: asString(row.notes),
    stripePaymentIntentId: asString(row.stripe_payment_intent_id),
    stripeChargeId: asString(row.stripe_charge_id),
    giftDate:
      asString(row.gift_date) ??
      asString(row.created_at) ??
      new Date(0).toISOString(),
    campaignId: asString(row.campaign_id),
    pledgeId: asString(row.pledge_id),
    processedAt: asString(row.processed_at),
    completedAt: asString(row.completed_at),
    failedAt: asString(row.failed_at),
    errorCode: asString(row.error_code),
    errorMessage: asString(row.error_message),
    refundedAt: asString(row.refunded_at),
    refundAmount: asNumber(row.refund_amount),
    source: asString(row.source),
    createdAt: asString(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: asString(row.updated_at) ?? new Date(0).toISOString(),
  };
}

async function maybeFetchById(
  supabaseAdmin: SupabaseAdmin,
  table: string,
  id: string | null,
  select: string,
) {
  if (!id) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from(table)
    .select(select)
    .eq("id", id)
    .maybeSingle();

  assertNoError(error, `Failed to load ${table}.`);
  return isRecord(data) ? data : null;
}

async function fetchMissionaryLabel(
  supabaseAdmin: SupabaseAdmin,
  missionaryId: string | null,
) {
  if (!missionaryId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("missionaries")
    .select(
      "id, profile:profiles!missionaries_profile_id_fkey(display_name, full_name, first_name, last_name, email)",
    )
    .eq("id", missionaryId)
    .maybeSingle();

  assertNoError(error, "Failed to load missionary.");
  if (!isRecord(data)) {
    return null;
  }

  const profile: JsonRecord = isRecord(data.profile) ? data.profile : {};
  const firstLastName = [
    asString(profile.first_name),
    asString(profile.last_name),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const name =
    asString(profile.display_name) ??
    asString(profile.full_name) ??
    asString(firstLastName) ??
    asString(profile.email);

  return {
    id: asString(data.id) ?? missionaryId,
    name: name || "Unassigned missionary",
  };
}

export async function loadContributionDetailFromSupabase(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  contributionId: string;
}): Promise<ContributionDetail> {
  const donationResult = await input.supabaseAdmin
    .from("donations")
    .select(
      "id, tenant_id, donor_id, missionary_id, fund_id, amount, currency, status, donation_type, payment_method, is_recurring, recurring_interval, notes, stripe_payment_intent_id, gift_date, campaign_id, pledge_id, processed_at, completed_at, failed_at, error_code, error_message, stripe_charge_id, refunded_at, refund_amount, source, created_at, updated_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("id", input.contributionId)
    .single();

  if (donationResult.error || !isRecord(donationResult.data)) {
    throw new ApiHttpError(404, "Contribution not found.");
  }

  const donation = normalizeDonation(donationResult.data);

  const [
    donor,
    fund,
    missionary,
    stagedGiftResult,
    auditResult,
    correctionResult,
  ] = await Promise.all([
    maybeFetchById(
      input.supabaseAdmin,
      "donors",
      donation.donorId,
      "id, profile_id, name, email, phone, mobile, location, organization",
    ),
    maybeFetchById(input.supabaseAdmin, "funds", donation.fundId, "id, name"),
    fetchMissionaryLabel(input.supabaseAdmin, donation.missionaryId),
    input.supabaseAdmin
      .from("staged_gifts")
      .select(
        "id, donation_id, status, review_reason, receipt_status, crm_post_status, twenty_record_id",
      )
      .eq("tenant_id", input.tenantId)
      .eq("donation_id", input.contributionId)
      .maybeSingle(),
    input.supabaseAdmin
      .from("contribution_operation_audit_events")
      .select("id, operation, source_surface, reason, created_at")
      .eq("tenant_id", input.tenantId)
      .eq("donation_id", input.contributionId)
      .order("created_at", { ascending: false })
      .limit(50),
    input.supabaseAdmin
      .from("contribution_corrections")
      .select("id, correction_type, status")
      .eq("tenant_id", input.tenantId)
      .eq("donation_id", input.contributionId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  assertNoError(stagedGiftResult.error, "Failed to load staged gift.");
  assertNoError(auditResult.error, "Failed to load contribution audit.");
  assertNoError(
    correctionResult.error,
    "Failed to load contribution corrections.",
  );

  const stagedGift = isRecord(stagedGiftResult.data)
    ? {
        id: asString(stagedGiftResult.data.id) ?? "",
        status: asString(stagedGiftResult.data.status),
        receiptStatus: asString(stagedGiftResult.data.receipt_status),
        crmPostStatus: asString(stagedGiftResult.data.crm_post_status),
        reviewReason: asString(stagedGiftResult.data.review_reason),
        twentyRecordId: asString(stagedGiftResult.data.twenty_record_id),
      }
    : null;

  return buildContributionDetail({
    donation,
    donor: donor
      ? {
          id: asString(donor.id) ?? donation.donorId ?? "",
          profileId: asString(donor.profile_id),
          name: asString(donor.name),
          email: asString(donor.email),
          phone: asString(donor.phone),
          mobile: asString(donor.mobile),
          location: asString(donor.location),
          organization: asString(donor.organization),
        }
      : null,
    fund: fund
      ? {
          id: asString(fund.id) ?? donation.fundId ?? "",
          name: asString(fund.name),
        }
      : null,
    missionary,
    stagedGift,
    auditEvents: ((auditResult.data ?? []) as JsonRecord[]).map((event) => ({
      id: asString(event.id) ?? "",
      actionType: asString(event.operation) ?? "unknown",
      sourceSurface: asString(event.source_surface) ?? "api",
      reason: asString(event.reason),
      createdAt: asString(event.created_at) ?? new Date(0).toISOString(),
    })),
    corrections: ((correctionResult.data ?? []) as JsonRecord[]).map(
      (correction) => ({
        id: asString(correction.id) ?? "",
        correctionType: asString(correction.correction_type) ?? "unknown",
        status: asString(correction.status) ?? "pending",
      }),
    ),
  });
}

export async function appendContributionOperationAuditEvent(input: {
  supabaseAdmin: SupabaseAdmin;
  event: ContributionOperationAuditEventInput;
}): Promise<string> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_operation_audit_events")
    .insert({
      tenant_id: input.event.tenantId,
      actor_profile_id: input.event.actorProfileId,
      donation_id: input.event.contributionId,
      staged_gift_id: input.event.stagedGiftId ?? null,
      donor_id: input.event.donorId ?? null,
      correction_id: input.event.correctionId ?? null,
      operation: input.event.actionType,
      resource_type: "donation",
      resource_id: input.event.contributionId,
      source_surface: input.event.sourceSurface,
      reason: input.event.reason ?? null,
      before_snapshot: input.event.beforeSummary ?? {},
      after_snapshot: input.event.afterSummary ?? {},
      provider_outcome: input.event.providerOutcome ?? {},
      downstream_effects: input.event.downstreamEffects ?? {},
    })
    .select("id")
    .single();

  if (error || !isRecord(data)) {
    throw new Error(
      error?.message ?? "Failed to write contribution audit event.",
    );
  }

  return asString(data.id) ?? "";
}

export async function createContributionCorrectionRecord(input: {
  supabaseAdmin: SupabaseAdmin;
  correction: ContributionCorrectionRecordInput;
}): Promise<string> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_corrections")
    .insert({
      tenant_id: input.correction.tenantId,
      donation_id: input.correction.contributionId,
      staged_gift_id: input.correction.stagedGiftId ?? null,
      correction_type: input.correction.correctionType,
      status: input.correction.status ?? "applied",
      reason: input.correction.reason,
      source_surface: input.correction.sourceSurface,
      actor_profile_id: input.correction.actorProfileId,
      before_summary: input.correction.beforeSummary ?? {},
      after_summary: input.correction.afterSummary ?? {},
      provider_outcome: input.correction.providerOutcome ?? {},
      applied_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !isRecord(data)) {
    throw new Error(
      error?.message ?? "Failed to write contribution correction.",
    );
  }

  return asString(data.id) ?? "";
}
