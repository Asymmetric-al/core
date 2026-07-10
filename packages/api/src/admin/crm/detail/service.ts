import { buildCrmGiftHistoryRow } from "./gift-history";
import { ApiHttpError } from "../../../shared/http-errors";
import { loadCorrectionApprovalPolicy } from "../../contribution-operations/correction-requests";
import { loadSharedContributionRowInputs } from "../../contribution-shared/row-inputs";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { CrmDonorDetailResponse, UserRole } from "@asym/database/types";

type SupabaseAdmin = AdminSupabaseClient;

const GIFT_HISTORY_LIMIT = 100;

interface DonorRow {
  id: string;
  profile_id: string | null;
  missionary_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  organization: string | null;
  title: string | null;
  type: string | null;
  status: string | null;
  total_given: number | string | null;
  last_gift_date: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
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
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  created_at: string | null;
  updated_at: string | null;
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
  allocation_id: string | null;
  donation_id: string | null;
  staged_gift_id: string | null;
  scope: string | null;
  link_status: string | null;
  twenty_record_id: string | null;
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
  /** Filters which contribution operations surface inline on gift rows (#270). */
  viewerCapabilities?: string[];
}): Promise<CrmDonorDetailResponse> {
  const donorResult = await input.supabaseAdmin
    .from("donors")
    .select(
      "id, profile_id, missionary_id, name, email, phone, avatar_url, location, organization, title, type, status, total_given, last_gift_date, tags, notes, created_at, updated_at",
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
      "id, donor_id, missionary_id, fund_id, amount, currency, status, is_recurring, recurring_interval, pledge_id, donation_type, gift_date, refund_amount, refunded_at, stripe_payment_intent_id, stripe_charge_id, created_at, updated_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("donor_id", donor.id)
    .order("created_at", { ascending: false })
    .limit(GIFT_HISTORY_LIMIT + 1);
  assertNoError(donationsResult.error, "Failed to load donor gifts.");
  const donationRows = (donationsResult.data ?? []) as DonationRow[];
  const giftHistoryTruncated = donationRows.length > GIFT_HISTORY_LIMIT;
  const donations = donationRows.slice(0, GIFT_HISTORY_LIMIT);

  const donationIds = mergeUniqueIds(donations.map((donation) => donation.id));
  const [
    stagedGiftResult,
    activityResult,
    pledgeResult,
    duplicateResult,
    approvalPolicy,
  ] = await Promise.all([
    donationIds.length > 0
      ? input.supabaseAdmin
          .from("staged_gifts")
          .select(
            "id, donation_id, fund_id, missionary_id, receipt_status, crm_post_status, status, twenty_record_id, posted_at, created_at",
          )
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
      : Promise.resolve({ data: [], error: null }),
    input.supabaseAdmin
      .from("donor_activities")
      .select("id, type, title, description, amount, date, created_at")
      .eq("donor_id", donor.id)
      .order("date", { ascending: false })
      .limit(50),
    input.supabaseAdmin
      .from("donor_pledges")
      .select(
        "id, amount, frequency, status, missionary_id, fund_id, next_payment_date, updated_at",
      )
      .eq("tenant_id", input.tenantId)
      .eq("donor_id", donor.id)
      .order("updated_at", { ascending: false })
      .limit(50),
    input.supabaseAdmin
      .from("crm_merge_candidates")
      .select(
        "id, candidate_twenty_record_id, confidence, score, match_reasons",
      )
      .eq("tenant_id", input.tenantId)
      .eq("source_entity_type", "donor_profile")
      .eq("source_entity_id", donor.id)
      .eq("status", "pending")
      .order("score", { ascending: false })
      .limit(10),
    loadCorrectionApprovalPolicy({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
    }),
  ]);
  assertNoError(stagedGiftResult.error, "Failed to load staged gift links.");
  assertNoError(activityResult.error, "Failed to load donor activities.");
  assertNoError(pledgeResult.error, "Failed to load donor commitments.");
  assertNoError(duplicateResult.error, "Failed to load duplicate warnings.");
  const stagedGifts = (stagedGiftResult.data ?? []) as StagedGiftRow[];
  const pledges = (pledgeResult.data ?? []) as PledgeRow[];

  const stagedGiftIds = mergeUniqueIds(stagedGifts.map((gift) => gift.id));
  const [linkResult, sharedInputs] = await Promise.all([
    stagedGiftIds.length > 0
      ? input.supabaseAdmin
          .from("donation_crm_links")
          .select(
            "id, allocation_id, donation_id, staged_gift_id, scope, link_status, twenty_record_id",
          )
          .eq("tenant_id", input.tenantId)
          .eq("scope", "parent")
          .in("staged_gift_id", stagedGiftIds)
      : Promise.resolve({ data: [], error: null }),
    // Corrections, effective values, and designation sets come from the same
    // shared loader the Contributions Hub uses (ADR-CD-032, #256).
    loadSharedContributionRowInputs(input.supabaseAdmin, {
      tenantId: input.tenantId,
      donations,
      stagedGifts,
      extraFundIds: pledges.map((pledge) => pledge.fund_id),
      extraMissionaryIds: [
        ...pledges.map((pledge) => pledge.missionary_id),
        donor.missionary_id,
      ],
    }),
  ]);
  assertNoError(linkResult.error, "Failed to load donation CRM links.");

  // Designation links are keyed by allocation_id; donation_id and
  // staged_gift_id are both nullable for this scope.
  const stagedGiftIdByAllocationId = new Map<string, string>();
  const allocationEntries = sharedInputs.allocationsByStagedGiftId.entries();
  for (const [stagedGiftId, allocations] of allocationEntries) {
    for (const allocation of allocations) {
      stagedGiftIdByAllocationId.set(allocation.id, stagedGiftId);
    }
  }
  const allocationIds = Array.from(stagedGiftIdByAllocationId.keys());
  const designationLinkResult =
    allocationIds.length > 0
      ? await input.supabaseAdmin
          .from("donation_crm_links")
          .select(
            "id, allocation_id, donation_id, staged_gift_id, scope, link_status, twenty_record_id",
          )
          .eq("tenant_id", input.tenantId)
          .eq("scope", "designation")
          .in("allocation_id", allocationIds)
      : { data: [], error: null };
  assertNoError(
    designationLinkResult.error,
    "Failed to load designation CRM links.",
  );
  const links = (linkResult.data ?? []) as DonationCrmLinkRow[];
  const designationLinks = (designationLinkResult.data ??
    []) as DonationCrmLinkRow[];

  const {
    correctionsByDonationId,
    effectiveByDonationId,
    designationSetByDonationId,
    fundNamesById: fundsById,
    missionaryLabelsById: missionariesById,
  } = sharedInputs;

  const stagedByDonationId = new Map(
    stagedGifts.map((gift) => [gift.donation_id, gift]),
  );
  const parentLinkByStagedGiftId = new Map(
    links
      .filter((link) => link.staged_gift_id)
      .map((link) => [link.staged_gift_id!, link]),
  );
  const failedStagedGiftIds = new Set(
    [...links, ...designationLinks]
      .filter((link) => link.link_status === "failed")
      .map(
        (link) =>
          link.staged_gift_id ??
          (link.allocation_id
            ? stagedGiftIdByAllocationId.get(link.allocation_id)
            : null),
      )
      .filter((stagedGiftId): stagedGiftId is string => Boolean(stagedGiftId)),
  );

  const giftHistory = donations.map((donation) => {
    const stagedGift = stagedByDonationId.get(donation.id) ?? null;
    const link = stagedGift
      ? parentLinkByStagedGiftId.get(stagedGift.id)
      : null;
    const effectiveResult = effectiveByDonationId.get(donation.id);
    const effective = effectiveResult?.effective ?? {
      amountCents: toCents(donation.amount),
      fundId: donation.fund_id,
      missionaryId: donation.missionary_id,
      paymentStatus: donation.status ?? "pending",
    };

    return buildCrmGiftHistoryRow({
      designationSet: designationSetByDonationId.get(donation.id),
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
      provider: {
        stripePaymentIntentId: donation.stripe_payment_intent_id,
        stripeChargeId: donation.stripe_charge_id,
      },
      viewerCapabilities: input.viewerCapabilities ?? [],
      approvalPolicy,
      hasCrmPostFailure: stagedGift
        ? failedStagedGiftIds.has(stagedGift.id)
        : false,
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
      avatarUrl: donor.avatar_url,
      createdAt: donor.created_at,
      email: donor.email,
      id: donor.id,
      location: donor.location,
      missionaryId: donor.missionary_id,
      name: donor.name,
      notesPreview: previewNotes(donor.notes),
      organization: donor.organization,
      phone: donor.phone,
      profileId: donor.profile_id,
      status: donor.status,
      tags: donor.tags ?? [],
      title: donor.title,
      type: donor.type,
      updatedAt: donor.updated_at,
    },
    duplicateWarnings,
    giftHistory,
    giftHistoryTruncated,
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
