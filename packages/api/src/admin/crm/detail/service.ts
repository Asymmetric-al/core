import { buildCrmGiftHistoryRow } from "./gift-history";
import { ApiHttpError } from "../../../shared/http-errors";
import { buildContributionDesignationSet } from "../../contribution-shared/designation-set";
import {
  deriveEffectiveContribution,
  mapContributionAdjustmentRow,
  type ContributionAdjustmentRecord,
  type EffectiveContributionResult,
} from "../../contribution-shared/effective-values";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { CrmDonorDetailResponse, UserRole } from "@asym/database/types";

type SupabaseAdmin = AdminSupabaseClient;

interface DonorRow {
  id: string;
  profile_id: string | null;
  missionary_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  type: string | null;
  status: string | null;
  total_given: number | string | null;
  last_gift_date: string | null;
  notes: string | null;
}

interface DonationRow {
  id: string;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number | string | null;
  currency: string | null;
  status: string | null;
  is_recurring: boolean | null;
  recurring_interval: string | null;
  pledge_id: string | null;
  donation_type: string | null;
  gift_date: string | null;
  refund_amount: number | string | null;
  refunded_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CorrectionRow {
  donation_id: string;
  status: string;
}

interface AllocationRow {
  id: string;
  staged_gift_id: string;
  amount: number | string | null;
  fund_id: string | null;
  missionary_id: string | null;
  memo: string | null;
}

interface FundMetaRow {
  id: string;
  name: string | null;
  missionary_id: string | null;
  goal_amount: number | string | null;
  start_date: string | null;
  end_date: string | null;
}

interface StagedGiftRow {
  id: string;
  donation_id: string;
  fund_id: string | null;
  missionary_id: string | null;
  receipt_status: string | null;
  crm_post_status: string | null;
  status: string | null;
  twenty_record_id: string | null;
  posted_at: string | null;
  created_at: string | null;
}

interface DonationCrmLinkRow {
  id: string;
  donation_id: string | null;
  staged_gift_id: string | null;
  link_status: string | null;
  twenty_record_id: string | null;
}

interface LabelRow {
  id: string;
  name?: string | null;
  profile_id?: string | null;
  profile?: {
    display_name?: string | null;
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
}

interface DonorActivityRow {
  id: string;
  type: string | null;
  title: string | null;
  description: string | null;
  amount: number | string | null;
  date: string | null;
  created_at: string | null;
}

interface PledgeRow {
  id: string;
  amount: number | string | null;
  frequency: string | null;
  status: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  next_payment_date: string | null;
  updated_at: string | null;
}

interface DuplicateCandidateRow {
  id: string;
  candidate_twenty_record_id: string | null;
  confidence: string | null;
  score: number | null;
  match_reasons: string[] | null;
}

function assertNoError(
  error: { message?: string } | null,
  fallback: string,
): void {
  if (error) {
    throw new ApiHttpError(500, error.message ?? fallback);
  }
}

function toCents(value: number | string | null | undefined): number {
  if (value == null) {
    return 0;
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.round(numberValue) : 0;
}

function previewNotes(notes: string | null): string | null {
  if (!notes?.trim()) {
    return null;
  }

  const trimmed = notes.trim().replace(/\s+/g, " ");
  return trimmed.length <= 160 ? trimmed : `${trimmed.slice(0, 157)}...`;
}

function profileName(row: LabelRow): string | null {
  const profile = row.profile ?? {};
  return (
    profile.display_name?.trim() ||
    profile.full_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
    row.name?.trim() ||
    null
  );
}

function getLabel(
  map: Map<string, string | null>,
  id: string | null,
  fallback: string,
) {
  return id ? (map.get(id) ?? fallback) : fallback;
}

function mergeUniqueIds(ids: Array<string | null | undefined>): string[] {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

async function fetchLabels(
  supabaseAdmin: SupabaseAdmin,
  table: "funds" | "missionaries",
  ids: string[],
): Promise<Map<string, string | null>> {
  if (ids.length === 0) {
    return new Map();
  }

  const select =
    table === "missionaries"
      ? "id, profile:profiles!missionaries_profile_id_fkey(display_name, full_name, first_name, last_name)"
      : "id, name";
  const { data, error } = await supabaseAdmin
    .from(table)
    .select(select)
    .in("id", ids);
  assertNoError(error, `Failed to load ${table} labels.`);

  return new Map(
    ((data ?? []) as LabelRow[]).map((row) => [
      row.id,
      table === "missionaries" ? profileName(row) : (row.name ?? null),
    ]),
  );
}

function buildSupportSummary(input: {
  donor: DonorRow;
  donations: DonationRow[];
  fundsById: Map<string, string | null>;
  missionariesById: Map<string, string | null>;
  pledges: PledgeRow[];
}): CrmDonorDetailResponse["support"] {
  const byFund = new Map<string, { label: string; amountCents: number }>();
  const byMissionary = new Map<
    string,
    { label: string; amountCents: number }
  >();

  for (const donation of input.donations) {
    if (donation.status && donation.status !== "completed") {
      continue;
    }

    const amountCents = toCents(donation.amount);
    const fundKey = donation.fund_id ?? "unassigned";
    const fund = byFund.get(fundKey) ?? {
      amountCents: 0,
      label: getLabel(input.fundsById, donation.fund_id, "Unassigned fund"),
    };
    fund.amountCents += amountCents;
    byFund.set(fundKey, fund);

    const missionaryKey = donation.missionary_id ?? "unassigned";
    const missionary = byMissionary.get(missionaryKey) ?? {
      amountCents: 0,
      label: getLabel(
        input.missionariesById,
        donation.missionary_id,
        "Unassigned missionary",
      ),
    };
    missionary.amountCents += amountCents;
    byMissionary.set(missionaryKey, missionary);
  }

  const activeRecurringCommitments = input.pledges.filter(
    (pledge) => pledge.status === "active",
  ).length;
  const lapsedCommitments = input.pledges.filter(
    (pledge) => pledge.status === "lapsed" || pledge.status === "cancelled",
  ).length;
  const now = Date.now();
  const atRiskCommitments = input.pledges.filter((pledge) => {
    if (pledge.status !== "active" || !pledge.next_payment_date) {
      return false;
    }

    const nextPaymentAt = new Date(pledge.next_payment_date).getTime();
    return Number.isFinite(nextPaymentAt) && nextPaymentAt < now;
  }).length;

  return {
    activeRecurringCommitments,
    atRiskCommitments,
    byFund: Array.from(byFund.entries()).map(([fundId, row]) => ({
      amountCents: row.amountCents,
      fundId: fundId === "unassigned" ? null : fundId,
      fundName: row.label,
    })),
    byMissionary: Array.from(byMissionary.entries()).map(
      ([missionaryId, row]) => ({
        amountCents: row.amountCents,
        missionaryId: missionaryId === "unassigned" ? null : missionaryId,
        missionaryName: row.label,
      }),
    ),
    lapsedCommitments,
    lastGiftAt: input.donor.last_gift_date,
    lifetimeGivingCents: toCents(input.donor.total_given),
  };
}

export async function getAdminCrmDonorDetail(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  donorId: string;
  role: UserRole;
  crmWritesEnabled?: boolean;
}): Promise<CrmDonorDetailResponse> {
  const donorResult = await input.supabaseAdmin
    .from("donors")
    .select(
      "id, profile_id, missionary_id, name, email, phone, organization, type, status, total_given, last_gift_date, notes",
    )
    .eq("tenant_id", input.tenantId)
    .eq("id", input.donorId)
    .single();

  if (donorResult.error || !donorResult.data) {
    throw new ApiHttpError(404, "CRM donor record not found.");
  }

  const donor = donorResult.data as DonorRow;
  const donationsResult = await input.supabaseAdmin
    .from("donations")
    .select(
      "id, donor_id, missionary_id, fund_id, amount, currency, status, is_recurring, recurring_interval, pledge_id, donation_type, gift_date, refund_amount, refunded_at, created_at, updated_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("donor_id", donor.id)
    .order("created_at", { ascending: false })
    .limit(100);
  assertNoError(donationsResult.error, "Failed to load donor gifts.");
  const donations = (donationsResult.data ?? []) as DonationRow[];

  const donationIds = mergeUniqueIds(donations.map((donation) => donation.id));
  const stagedGiftResult =
    donationIds.length > 0
      ? await input.supabaseAdmin
          .from("staged_gifts")
          .select(
            "id, donation_id, fund_id, missionary_id, receipt_status, crm_post_status, status, twenty_record_id, posted_at, created_at",
          )
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
      : { data: [], error: null };
  assertNoError(stagedGiftResult.error, "Failed to load staged gift links.");
  const stagedGifts = (stagedGiftResult.data ?? []) as StagedGiftRow[];

  const stagedGiftIds = mergeUniqueIds(stagedGifts.map((gift) => gift.id));
  const linkResult =
    stagedGiftIds.length > 0
      ? await input.supabaseAdmin
          .from("donation_crm_links")
          .select(
            "id, donation_id, staged_gift_id, link_status, twenty_record_id",
          )
          .eq("tenant_id", input.tenantId)
          .in("staged_gift_id", stagedGiftIds)
      : { data: [], error: null };
  assertNoError(linkResult.error, "Failed to load donation CRM links.");
  const links = (linkResult.data ?? []) as DonationCrmLinkRow[];

  const correctionsResult =
    donationIds.length > 0
      ? await input.supabaseAdmin
          .from("contribution_corrections")
          .select("donation_id, status")
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
      : { data: [], error: null };
  assertNoError(correctionsResult.error, "Failed to load gift corrections.");

  const correctionRequestsResult =
    donationIds.length > 0
      ? await input.supabaseAdmin
          .from("contribution_correction_requests")
          .select("donation_id, status")
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
          .eq("status", "pending")
      : { data: [], error: null };
  assertNoError(
    correctionRequestsResult.error,
    "Failed to load correction requests.",
  );

  const correctionsByDonationId = new Map<string, Array<{ status: string }>>();
  for (const correction of [
    ...((correctionsResult.data ?? []) as CorrectionRow[]),
    ...((correctionRequestsResult.data ?? []) as CorrectionRow[]),
  ]) {
    const existing = correctionsByDonationId.get(correction.donation_id) ?? [];
    existing.push({ status: correction.status });
    correctionsByDonationId.set(correction.donation_id, existing);
  }

  const adjustmentsResult =
    donationIds.length > 0
      ? await input.supabaseAdmin
          .from("contribution_adjustments")
          .select(
            "id, donation_id, adjustment_type, status, effective_values, reason, actor_profile_id, source_surface, created_at",
          )
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };
  assertNoError(adjustmentsResult.error, "Failed to load gift adjustments.");
  const adjustmentsByDonationId = new Map<
    string,
    ContributionAdjustmentRecord[]
  >();
  for (const row of (adjustmentsResult.data ?? []) as Array<
    Record<string, unknown>
  >) {
    const donationId =
      typeof row.donation_id === "string" ? row.donation_id : "";
    const existing = adjustmentsByDonationId.get(donationId) ?? [];
    existing.push(mapContributionAdjustmentRow(row));
    adjustmentsByDonationId.set(donationId, existing);
  }

  const effectiveByDonationId = new Map<string, EffectiveContributionResult>(
    donations.map((donation) => [
      donation.id,
      deriveEffectiveContribution({
        original: {
          amountCents: toCents(donation.amount),
          fundId: donation.fund_id,
          missionaryId: donation.missionary_id,
          paymentStatus: donation.status ?? "pending",
        },
        adjustments: adjustmentsByDonationId.get(donation.id) ?? [],
      }),
    ]),
  );

  const allocationsResult =
    stagedGiftIds.length > 0
      ? await input.supabaseAdmin
          .from("staged_gift_allocations")
          .select("id, staged_gift_id, amount, fund_id, missionary_id, memo")
          .eq("tenant_id", input.tenantId)
          .in("staged_gift_id", stagedGiftIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };
  assertNoError(allocationsResult.error, "Failed to load designation lines.");
  const allocationRows = (allocationsResult.data ?? []) as AllocationRow[];
  const allocationsByStagedGiftId = new Map<
    string,
    Array<{
      id: string;
      amount: number;
      fund_id: string | null;
      missionary_id: string | null;
      memo: string | null;
    }>
  >();
  for (const allocation of allocationRows) {
    const existing =
      allocationsByStagedGiftId.get(allocation.staged_gift_id) ?? [];
    existing.push({
      id: allocation.id,
      amount: toCents(allocation.amount),
      fund_id: allocation.fund_id,
      missionary_id: allocation.missionary_id,
      memo: allocation.memo,
    });
    allocationsByStagedGiftId.set(allocation.staged_gift_id, existing);
  }

  const activityResult = await input.supabaseAdmin
    .from("donor_activities")
    .select("id, type, title, description, amount, date, created_at")
    .eq("donor_id", donor.id)
    .order("date", { ascending: false })
    .limit(50);
  assertNoError(activityResult.error, "Failed to load donor activities.");

  const pledgeResult = await input.supabaseAdmin
    .from("donor_pledges")
    .select(
      "id, amount, frequency, status, missionary_id, fund_id, next_payment_date, updated_at",
    )
    .eq("donor_id", donor.id)
    .order("updated_at", { ascending: false })
    .limit(50);
  assertNoError(pledgeResult.error, "Failed to load donor commitments.");
  const pledges = (pledgeResult.data ?? []) as PledgeRow[];

  const duplicateResult = await input.supabaseAdmin
    .from("crm_merge_candidates")
    .select("id, candidate_twenty_record_id, confidence, score, match_reasons")
    .eq("tenant_id", input.tenantId)
    .eq("source_entity_type", "donor_profile")
    .eq("source_entity_id", donor.id)
    .eq("status", "pending")
    .order("score", { ascending: false })
    .limit(10);
  assertNoError(duplicateResult.error, "Failed to load duplicate warnings.");

  const effectiveResults = Array.from(effectiveByDonationId.values());
  const fundIds = mergeUniqueIds([
    ...donations.map((donation) => donation.fund_id),
    ...stagedGifts.map((gift) => gift.fund_id),
    ...pledges.map((pledge) => pledge.fund_id),
    ...allocationRows.map((allocation) => allocation.fund_id),
    ...effectiveResults.map((result) => result.effective.fundId),
    ...effectiveResults.flatMap(
      (result) =>
        result.effectiveDesignationLines?.map((line) => line.fundId) ?? [],
    ),
  ]);
  const missionaryIds = mergeUniqueIds([
    ...donations.map((donation) => donation.missionary_id),
    ...stagedGifts.map((gift) => gift.missionary_id),
    ...pledges.map((pledge) => pledge.missionary_id),
    ...allocationRows.map((allocation) => allocation.missionary_id),
    ...effectiveResults.map((result) => result.effective.missionaryId),
    ...effectiveResults.flatMap(
      (result) =>
        result.effectiveDesignationLines?.map((line) => line.missionaryId) ??
        [],
    ),
    donor.missionary_id,
  ]);
  const [fundsMetaResult, missionariesById] = await Promise.all([
    fundIds.length > 0
      ? input.supabaseAdmin
          .from("funds")
          .select("id, name, missionary_id, goal_amount, start_date, end_date")
          .in("id", fundIds)
      : Promise.resolve({ data: [], error: null }),
    fetchLabels(input.supabaseAdmin, "missionaries", missionaryIds),
  ]);
  assertNoError(fundsMetaResult.error, "Failed to load fund metadata.");
  const fundsMetaById = new Map(
    ((fundsMetaResult.data ?? []) as FundMetaRow[]).map((fund) => [
      fund.id,
      {
        id: fund.id,
        name: fund.name,
        missionary_id: fund.missionary_id,
        goal_amount:
          fund.goal_amount == null ? null : toCents(fund.goal_amount),
        start_date: fund.start_date,
        end_date: fund.end_date,
      },
    ]),
  );
  const fundsById = new Map<string, string | null>(
    Array.from(fundsMetaById.values()).map((fund) => [fund.id, fund.name]),
  );

  const stagedByDonationId = new Map(
    stagedGifts.map((gift) => [gift.donation_id, gift]),
  );
  const linkByStagedGiftId = new Map(
    links
      .filter((link) => link.staged_gift_id)
      .map((link) => [link.staged_gift_id!, link]),
  );

  const giftHistory = donations.map((donation) => {
    const stagedGift = stagedByDonationId.get(donation.id) ?? null;
    const link = stagedGift ? linkByStagedGiftId.get(stagedGift.id) : null;
    const effectiveResult = effectiveByDonationId.get(donation.id);
    const effective = effectiveResult?.effective ?? {
      amountCents: toCents(donation.amount),
      fundId: donation.fund_id,
      missionaryId: donation.missionary_id,
      paymentStatus: donation.status ?? "pending",
    };
    const allocations = effectiveResult?.effectiveDesignationLines
      ? effectiveResult.effectiveDesignationLines.map((line) => ({
          id: line.id,
          amount: line.amountCents,
          fund_id: line.fundId,
          missionary_id: line.missionaryId,
          memo: line.memo,
        }))
      : stagedGift
        ? (allocationsByStagedGiftId.get(stagedGift.id) ?? [])
        : [];
    const designationSet = buildContributionDesignationSet({
      donation: {
        id: donation.id,
        amount: effective.amountCents,
        currency: donation.currency ?? "usd",
        fund_id: effective.fundId,
        missionary_id: effective.missionaryId,
      },
      effectiveAmountCents: effective.amountCents,
      allocations,
      funds: fundsMetaById,
      missionaries: missionariesById,
    });

    return buildCrmGiftHistoryRow({
      designationSet,
      donation: {
        id: donation.id,
        donor_id: donation.donor_id,
        missionary_id: effective.missionaryId,
        fund_id: effective.fundId,
        amount: effective.amountCents,
        currency: donation.currency ?? "usd",
        status: effective.paymentStatus,
        gift_date: donation.gift_date,
        refund_amount: toCents(donation.refund_amount),
        refunded_at: donation.refunded_at,
        created_at: donation.created_at ?? "",
        updated_at: donation.updated_at ?? donation.created_at ?? "",
        is_recurring: donation.is_recurring,
        recurring_interval: donation.recurring_interval,
        pledge_id: donation.pledge_id,
      },
      donor: {
        id: donor.id,
        name: donor.name,
        email: donor.email,
      },
      fund: effective.fundId
        ? {
            id: effective.fundId,
            name: fundsById.get(effective.fundId) ?? null,
          }
        : null,
      missionary: effective.missionaryId
        ? {
            id: effective.missionaryId,
            display_name: missionariesById.get(effective.missionaryId) ?? null,
          }
        : null,
      stagedGift: stagedGift
        ? {
            id: stagedGift.id,
            status: stagedGift.status,
            receipt_status: stagedGift.receipt_status,
            crm_post_status: stagedGift.crm_post_status,
            twenty_record_id:
              stagedGift.twenty_record_id ?? link?.twenty_record_id ?? null,
          }
        : null,
      corrections: correctionsByDonationId.get(donation.id),
    });
  });

  const timeline = [
    ...giftHistory.map((gift) => ({
      amountCents: gift.amountCents,
      currencyCode: gift.currencyCode,
      description: gift.fundName,
      id: `gift:${gift.id}`,
      kind: "gift" as const,
      occurredAt: gift.giftDate || new Date(0).toISOString(),
      source: "platform" as const,
      title: "Gift received",
      visibility: "standard" as const,
    })),
    ...((activityResult.data ?? []) as DonorActivityRow[]).map((activity) => ({
      amountCents: toCents(activity.amount) || null,
      currencyCode: null,
      description: activity.description,
      id: `activity:${activity.id}`,
      kind: "activity" as const,
      occurredAt:
        activity.date ?? activity.created_at ?? new Date(0).toISOString(),
      source: "platform" as const,
      title: activity.title ?? activity.type ?? "Donor activity",
      visibility: "standard" as const,
    })),
  ].sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() -
      new Date(left.occurredAt).getTime(),
  );

  const duplicateWarnings = (
    (duplicateResult.data ?? []) as DuplicateCandidateRow[]
  ).map((candidate) => ({
    candidateId: candidate.candidate_twenty_record_id,
    candidateLabel: candidate.candidate_twenty_record_id,
    confidence: candidate.confidence,
    id: candidate.id,
    reason: candidate.match_reasons?.join(", ") || "Potential duplicate",
    score: candidate.score,
  }));

  return {
    donor: {
      email: donor.email,
      id: donor.id,
      missionaryId: donor.missionary_id,
      name: donor.name,
      notesPreview: previewNotes(donor.notes),
      organization: donor.organization,
      phone: donor.phone,
      profileId: donor.profile_id,
      status: donor.status,
      type: donor.type,
    },
    duplicateWarnings,
    giftHistory,
    privacy: {
      missionaryContactDataExposed: false,
      restrictedNotesVisible:
        input.role === "admin" || input.role === "super_admin",
      roleGate:
        input.role === "admin" || input.role === "super_admin"
          ? "admin"
          : "staff",
    },
    reconciliation: {
      crmWriteMode: input.crmWritesEnabled ? "enabled" : "disabled",
      platformPaymentTruth: true,
      twentyIsPaymentTruth: false,
    },
    support: buildSupportSummary({
      donor,
      donations,
      fundsById,
      missionariesById,
      pledges,
    }),
    timeline,
  };
}
