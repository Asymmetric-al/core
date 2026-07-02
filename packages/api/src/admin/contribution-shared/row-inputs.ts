import {
  buildContributionDesignationSet,
  type DesignationAllocationInput,
  type DesignationFundInput,
} from "./designation-set";
import {
  deriveEffectiveContribution,
  mapContributionAdjustmentRow,
  type EffectiveContributionResult,
} from "./effective-values";
import { resolveContributionProfileLabel } from "./profile-label";
import { ApiHttpError } from "../../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { ContributionDesignationSet } from "@asym/database/types";

/**
 * Shared contribution row input assembly (ADR-CD-032, issue #256).
 *
 * `buildSharedContributionRowFields` only guarantees display parity when both
 * surfaces feed it the same inputs. CRM donor gift history and the
 * Contributions Hub therefore assemble corrections, adjustment-derived
 * effective values, and designation sets through this one module instead of
 * re-implementing the load per surface.
 */

export interface SharedRowDonationSource {
  id: string;
  /** BIGINT cents; Postgres can deliver this as a string. */
  amount: number | string | null;
  currency: string | null;
  fund_id: string | null;
  missionary_id: string | null;
  status: string | null;
}

export interface SharedRowStagedGiftSource {
  id: string;
  donation_id: string;
  fund_id?: string | null;
  missionary_id?: string | null;
}

export interface SharedRowCorrectionSource {
  donation_id: string;
  status: string;
}

export interface SharedRowAllocationSource {
  id: string;
  staged_gift_id: string;
  /** Allocation amount in cents (normalize with `toContributionCents` first). */
  amount: number;
  fund_id: string | null;
  missionary_id: string | null;
  memo: string | null;
}

/**
 * Postgres BIGINT columns can arrive as strings; every shared row input must
 * normalize amounts through this before derivation.
 */
export function toContributionCents(
  value: number | string | null | undefined,
): number {
  if (value == null) {
    return 0;
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.round(numberValue) : 0;
}

export interface SharedContributionEffectiveState {
  correctionsByDonationId: Map<string, Array<{ status: string }>>;
  effectiveByDonationId: Map<string, EffectiveContributionResult>;
}

/**
 * Groups correction records and derives adjustment-based effective values per
 * donation. Corrections and pending correction requests share one correction
 * list because `deriveSharedCorrectionState` treats them identically.
 */
export function assembleSharedContributionEffectiveState(input: {
  donations: SharedRowDonationSource[];
  corrections: SharedRowCorrectionSource[];
  correctionRequests: SharedRowCorrectionSource[];
  adjustments: Array<Record<string, unknown>>;
}): SharedContributionEffectiveState {
  const correctionsByDonationId = new Map<string, Array<{ status: string }>>();
  for (const correction of [
    ...input.corrections,
    ...input.correctionRequests,
  ]) {
    const existing = correctionsByDonationId.get(correction.donation_id) ?? [];
    existing.push({ status: correction.status });
    correctionsByDonationId.set(correction.donation_id, existing);
  }

  const adjustmentsByDonationId = new Map<
    string,
    ReturnType<typeof mapContributionAdjustmentRow>[]
  >();
  for (const row of input.adjustments) {
    const donationId =
      typeof row.donation_id === "string" ? row.donation_id : "";
    const existing = adjustmentsByDonationId.get(donationId) ?? [];
    existing.push(mapContributionAdjustmentRow(row));
    adjustmentsByDonationId.set(donationId, existing);
  }

  const effectiveByDonationId = new Map<string, EffectiveContributionResult>(
    input.donations.map((donation) => [
      donation.id,
      deriveEffectiveContribution({
        original: {
          amountCents: toContributionCents(donation.amount),
          fundId: donation.fund_id,
          missionaryId: donation.missionary_id,
          paymentStatus: donation.status ?? "pending",
        },
        adjustments: adjustmentsByDonationId.get(donation.id) ?? [],
      }),
    ]),
  );

  return { correctionsByDonationId, effectiveByDonationId };
}

/**
 * Collects every fund and missionary id a page of shared rows can reference:
 * original donation targets, staged gift targets, allocation lines, and
 * adjustment-derived effective targets (including replacement designation
 * lines). Surfaces append their own extra ids (pledges, donor context).
 */
export function collectSharedContributionLookupIds(input: {
  donations: SharedRowDonationSource[];
  stagedGifts: SharedRowStagedGiftSource[];
  allocations: SharedRowAllocationSource[];
  effectiveByDonationId: Map<string, EffectiveContributionResult>;
  extraFundIds?: Array<string | null | undefined>;
  extraMissionaryIds?: Array<string | null | undefined>;
}): { fundIds: string[]; missionaryIds: string[] } {
  const effectiveResults = Array.from(input.effectiveByDonationId.values());

  const fundIds = mergeUniqueIds([
    ...input.donations.map((donation) => donation.fund_id),
    ...input.stagedGifts.map((gift) => gift.fund_id),
    ...input.allocations.map((allocation) => allocation.fund_id),
    ...effectiveResults.map((result) => result.effective.fundId),
    ...effectiveResults.flatMap(
      (result) =>
        result.effectiveDesignationLines?.map((line) => line.fundId) ?? [],
    ),
    ...(input.extraFundIds ?? []),
  ]);

  const missionaryIds = mergeUniqueIds([
    ...input.donations.map((donation) => donation.missionary_id),
    ...input.stagedGifts.map((gift) => gift.missionary_id),
    ...input.allocations.map((allocation) => allocation.missionary_id),
    ...effectiveResults.map((result) => result.effective.missionaryId),
    ...effectiveResults.flatMap(
      (result) =>
        result.effectiveDesignationLines?.map((line) => line.missionaryId) ??
        [],
    ),
    ...(input.extraMissionaryIds ?? []),
  ]);

  return { fundIds, missionaryIds };
}

/**
 * Builds the designation set for every donation from the same precedence CRM
 * detail established: replacement lines from the latest applied allocation
 * adjustment win, then staged gift allocation lines, then the single-line
 * donation fallback — always reconciled against the effective gift amount.
 */
export function buildSharedContributionDesignationSets(input: {
  donations: SharedRowDonationSource[];
  stagedGifts: SharedRowStagedGiftSource[];
  allocationsByStagedGiftId: Map<string, DesignationAllocationInput[]>;
  effectiveByDonationId: Map<string, EffectiveContributionResult>;
  funds: Map<string, DesignationFundInput>;
  missionaries: Map<string, string | null>;
}): Map<string, ContributionDesignationSet> {
  const stagedGiftIdByDonationId = new Map(
    input.stagedGifts.map((gift) => [gift.donation_id, gift.id]),
  );

  const sets = new Map<string, ContributionDesignationSet>();
  for (const donation of input.donations) {
    const effectiveResult = input.effectiveByDonationId.get(donation.id);
    const effective = effectiveResult?.effective ?? {
      amountCents: toContributionCents(donation.amount),
      fundId: donation.fund_id,
      missionaryId: donation.missionary_id,
      paymentStatus: donation.status ?? "pending",
    };

    const stagedGiftId = stagedGiftIdByDonationId.get(donation.id);
    const allocations = effectiveResult?.effectiveDesignationLines
      ? effectiveResult.effectiveDesignationLines.map((line) => ({
          id: line.id,
          amount: line.amountCents,
          fund_id: line.fundId,
          missionary_id: line.missionaryId,
          memo: line.memo,
        }))
      : stagedGiftId
        ? (input.allocationsByStagedGiftId.get(stagedGiftId) ?? [])
        : [];

    sets.set(
      donation.id,
      buildContributionDesignationSet({
        donation: {
          id: donation.id,
          amount: effective.amountCents,
          currency: donation.currency ?? "usd",
          fund_id: effective.fundId,
          missionary_id: effective.missionaryId,
        },
        effectiveAmountCents: effective.amountCents,
        allocations,
        funds: input.funds,
        missionaries: input.missionaries,
      }),
    );
  }

  return sets;
}

/**
 * Applies adjustment-derived effective values onto a donation row so shared
 * row derivation (amount, designation target, payment status) reads corrected
 * financial truth on every surface.
 */
export function applyEffectiveContributionToDonation<
  T extends SharedRowDonationSource,
>(
  donation: T,
  effectiveByDonationId: Map<string, EffectiveContributionResult>,
): T {
  const effectiveResult = effectiveByDonationId.get(donation.id);
  if (!effectiveResult) {
    return donation;
  }

  const withEffectiveValues = {
    ...donation,
    amount: effectiveResult.effective.amountCents,
    fund_id: effectiveResult.effective.fundId,
    missionary_id: effectiveResult.effective.missionaryId,
    status: effectiveResult.effective.paymentStatus,
  };
  return withEffectiveValues as T;
}

export interface SharedContributionRowInputs extends SharedContributionEffectiveState {
  designationSetByDonationId: Map<string, ContributionDesignationSet>;
  allocationsByStagedGiftId: Map<string, DesignationAllocationInput[]>;
  fundsById: Map<string, DesignationFundInput>;
  fundNamesById: Map<string, string | null>;
  missionaryLabelsById: Map<string, string | null>;
}

type SupabaseErrorShape = { message?: string | null } | null;

function assertNoRowInputError(
  error: SupabaseErrorShape,
  fallback: string,
): void {
  if (error) {
    throw new ApiHttpError(500, error.message ?? fallback);
  }
}

function mergeUniqueIds(ids: Array<string | null | undefined>): string[] {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

type MissionaryLabelRow = {
  id: string;
  profile: {
    display_name: string | null;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

type FundMetaRow = {
  id: string;
  name: string | null;
  missionary_id: string | null;
  goal_amount: number | string | null;
  start_date: string | null;
  end_date: string | null;
};

type AllocationRow = {
  id: string;
  staged_gift_id: string;
  amount: number | string | null;
  fund_id: string | null;
  missionary_id: string | null;
  memo: string | null;
};

/**
 * Loads and assembles every shared row input for one page of donations. Both
 * the Contributions Hub list and CRM donor gift history call this, so the
 * same gift always derives the same shared fields regardless of surface.
 */
export async function loadSharedContributionRowInputs(
  supabaseAdmin: AdminSupabaseClient,
  input: {
    tenantId: string;
    donations: SharedRowDonationSource[];
    stagedGifts: SharedRowStagedGiftSource[];
    extraFundIds?: Array<string | null | undefined>;
    extraMissionaryIds?: Array<string | null | undefined>;
  },
): Promise<SharedContributionRowInputs> {
  const donationIds = mergeUniqueIds(
    input.donations.map((donation) => donation.id),
  );
  const stagedGiftIds = mergeUniqueIds(
    input.stagedGifts.map((gift) => gift.id),
  );

  const [
    correctionsResult,
    correctionRequestsResult,
    adjustmentsResult,
    allocationsResult,
  ] = await Promise.all([
    donationIds.length > 0
      ? supabaseAdmin
          .from("contribution_corrections")
          .select("donation_id, status")
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
      : Promise.resolve({ data: [], error: null }),
    donationIds.length > 0
      ? supabaseAdmin
          .from("contribution_correction_requests")
          .select("donation_id, status")
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
          .eq("status", "pending")
      : Promise.resolve({ data: [], error: null }),
    donationIds.length > 0
      ? supabaseAdmin
          .from("contribution_adjustments")
          .select(
            "id, donation_id, adjustment_type, status, effective_values, reason, actor_profile_id, source_surface, created_at",
          )
          .eq("tenant_id", input.tenantId)
          .in("donation_id", donationIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    stagedGiftIds.length > 0
      ? supabaseAdmin
          .from("staged_gift_allocations")
          .select("id, staged_gift_id, amount, fund_id, missionary_id, memo")
          .eq("tenant_id", input.tenantId)
          .in("staged_gift_id", stagedGiftIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);
  assertNoRowInputError(
    correctionsResult.error,
    "Failed to load gift corrections.",
  );
  assertNoRowInputError(
    correctionRequestsResult.error,
    "Failed to load correction requests.",
  );
  assertNoRowInputError(
    adjustmentsResult.error,
    "Failed to load gift adjustments.",
  );
  assertNoRowInputError(
    allocationsResult.error,
    "Failed to load designation lines.",
  );

  const allocations: SharedRowAllocationSource[] = (
    (allocationsResult.data ?? []) as AllocationRow[]
  ).map((allocation) => ({
    id: allocation.id,
    staged_gift_id: allocation.staged_gift_id,
    amount: toContributionCents(allocation.amount),
    fund_id: allocation.fund_id,
    missionary_id: allocation.missionary_id,
    memo: allocation.memo,
  }));

  const { correctionsByDonationId, effectiveByDonationId } =
    assembleSharedContributionEffectiveState({
      donations: input.donations,
      corrections: (correctionsResult.data ??
        []) as SharedRowCorrectionSource[],
      correctionRequests: (correctionRequestsResult.data ??
        []) as SharedRowCorrectionSource[],
      adjustments: (adjustmentsResult.data ?? []) as Array<
        Record<string, unknown>
      >,
    });

  const { fundIds, missionaryIds } = collectSharedContributionLookupIds({
    donations: input.donations,
    stagedGifts: input.stagedGifts,
    allocations,
    effectiveByDonationId,
    extraFundIds: input.extraFundIds,
    extraMissionaryIds: input.extraMissionaryIds,
  });

  // Tenant-scope the label lookups even though ids come from tenant rows:
  // adjustment effective_values ids predate server-side reference validation,
  // and this loader runs on the service-role client where RLS cannot backstop
  // a foreign id (matches contribution-operations/operations.ts).
  const fundsResult =
    fundIds.length > 0
      ? await supabaseAdmin
          .from("funds")
          .select("id, name, missionary_id, goal_amount, start_date, end_date")
          .eq("tenant_id", input.tenantId)
          .in("id", fundIds)
      : { data: [], error: null };
  assertNoRowInputError(fundsResult.error, "Failed to load fund metadata.");

  const fundsById = new Map<string, DesignationFundInput>(
    ((fundsResult.data ?? []) as FundMetaRow[]).map((fund) => [
      fund.id,
      {
        id: fund.id,
        name: fund.name,
        missionary_id: fund.missionary_id,
        goal_amount:
          fund.goal_amount == null
            ? null
            : toContributionCents(fund.goal_amount),
        start_date: fund.start_date,
        end_date: fund.end_date,
      },
    ]),
  );
  const fundNamesById = new Map<string, string | null>(
    Array.from(fundsById.values()).map((fund) => [fund.id, fund.name]),
  );

  // Designation lines fall back to fund.missionary_id when an allocation
  // leaves missionary_id null, so missionaries owned by looked-up funds need
  // labels too — the funds fetch must complete before this lookup.
  const missionaryLookupIds = mergeUniqueIds([
    ...missionaryIds,
    ...Array.from(fundsById.values()).map((fund) => fund.missionary_id),
  ]);
  const missionariesResult =
    missionaryLookupIds.length > 0
      ? await supabaseAdmin
          .from("missionaries")
          .select(
            "id, profile:profiles!missionaries_profile_id_fkey(display_name, full_name, first_name, last_name, email)",
          )
          .eq("tenant_id", input.tenantId)
          .in("id", missionaryLookupIds)
      : { data: [], error: null };
  assertNoRowInputError(
    missionariesResult.error,
    "Failed to load missionary labels.",
  );

  const missionaryLabelsById = new Map<string, string | null>(
    ((missionariesResult.data ?? []) as unknown as MissionaryLabelRow[]).map(
      (row) => [row.id, resolveContributionProfileLabel(row.profile, null)],
    ),
  );

  const allocationsByStagedGiftId = new Map<
    string,
    DesignationAllocationInput[]
  >();
  for (const allocation of allocations) {
    const existing =
      allocationsByStagedGiftId.get(allocation.staged_gift_id) ?? [];
    existing.push({
      id: allocation.id,
      amount: allocation.amount,
      fund_id: allocation.fund_id,
      missionary_id: allocation.missionary_id,
      memo: allocation.memo,
    });
    allocationsByStagedGiftId.set(allocation.staged_gift_id, existing);
  }

  const designationSetByDonationId = buildSharedContributionDesignationSets({
    donations: input.donations,
    stagedGifts: input.stagedGifts,
    allocationsByStagedGiftId,
    effectiveByDonationId,
    funds: fundsById,
    missionaries: missionaryLabelsById,
  });

  return {
    correctionsByDonationId,
    effectiveByDonationId,
    designationSetByDonationId,
    allocationsByStagedGiftId,
    fundsById,
    fundNamesById,
    missionaryLabelsById,
  };
}
