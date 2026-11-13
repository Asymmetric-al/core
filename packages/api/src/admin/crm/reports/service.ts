import { CSV_RECORD_SEPARATOR, CSV_UTF8_BOM, csvSafeCell } from "@asym/lib/csv";

import { ApiHttpError } from "../../../shared/http-errors";
import {
  deriveEffectiveContribution,
  mapContributionAdjustmentRow,
  type ContributionAdjustmentRecord,
} from "../../contribution-shared/effective-values";
import { resolveContributionProfileLabel } from "../../contribution-shared/profile-label";
import { normalizeSharedPaymentStatus } from "../../contribution-shared/row-contract";
import { toContributionCents } from "../../contribution-shared/row-inputs";

import type { AdminCrmReportParams } from "./query";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type {
  AdminCrmReportCompleteness,
  AdminCrmReportResponse,
  CrmReportRow,
} from "@asym/database/types";

type SupabaseAdmin = AdminSupabaseClient;

/**
 * PostgREST answers at most `max_rows` (1,000, supabase/config.toml) rows per
 * request whatever `.limit()` asks for, so the report reads in pages.
 */
const REPORT_PAGE_SIZE = 1000;

/**
 * Upper bound on gifts one report reads. Past it the totals are flagged
 * incomplete rather than presented as the whole period.
 */
export const CRM_REPORT_DONATION_LIMIT = 50_000;

/** Donation ids per adjustments request, keeping the request URL short. */
const ADJUSTMENT_ID_CHUNK = 150;

interface DonationRow {
  id: string;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number | string | null;
  refund_amount: number | string | null;
  status: string | null;
  created_at: string | null;
}

interface DonorRow {
  id: string;
  name: string | null;
  organization: string | null;
  status: string | null;
}

interface LabelRow {
  id: string;
  name?: string | null;
  profile?: {
    display_name?: string | null;
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
}

/** One designation of a settled gift, net of refunds, after corrections. */
interface ReportGiftLine {
  amountCents: number;
  fundId: string | null;
  missionaryId: string | null;
}

/** A settled gift as the report counts it. */
interface ReportGift {
  id: string;
  donorId: string | null;
  createdAt: string | null;
  netAmountCents: number;
  lines: ReportGiftLine[];
}

function assertNoError(
  error: { message?: string } | null,
  fallback: string,
): void {
  if (error) {
    throw new ApiHttpError(500, error.message ?? fallback);
  }
}

function uniq(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => !!value)),
  );
}

function matchesSearch(label: string, search: string | null) {
  return !search || label.toLowerCase().includes(search.toLowerCase());
}

function profileName(row: LabelRow): string {
  return (
    resolveContributionProfileLabel(row.profile, row.name ?? null) ??
    "Unassigned"
  );
}

async function fetchDonations(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
  params: AdminCrmReportParams,
  maxDonations: number,
): Promise<{ donations: DonationRow[]; complete: boolean }> {
  const donations: DonationRow[] = [];
  // Read one row past the limit so a full period is told apart from a cut one.
  const wanted = maxDonations + 1;

  while (donations.length < wanted) {
    const from = donations.length;
    const to = Math.min(from + REPORT_PAGE_SIZE, wanted) - 1;
    let query = supabaseAdmin
      .from("donations")
      .select(
        "id, donor_id, missionary_id, fund_id, amount, refund_amount, status, created_at",
      )
      // No status filter: an applied payment-state correction can settle a
      // pending or failed gift, or unsettle a completed one, so every gift in
      // the period is read and toReportGifts decides on the effective status.
      .eq("tenant_id", tenantId);

    if (params.filters.dateFrom) {
      query = query.gte("created_at", params.filters.dateFrom);
    }

    if (params.filters.dateTo) {
      query = query.lte("created_at", params.filters.dateTo);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);
    assertNoError(error, "Failed to load CRM report donations.");

    const page = (data ?? []) as DonationRow[];
    donations.push(...page);
    // Stop on an empty page, not a short one: a server cap below the page
    // size would otherwise end the read early and look complete.
    if (page.length === 0) {
      break;
    }
  }

  const complete = donations.length <= maxDonations;
  return {
    complete,
    donations: complete ? donations : donations.slice(0, maxDonations),
  };
}

async function fetchAppliedAdjustments(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
  donationIds: string[],
): Promise<Map<string, ContributionAdjustmentRecord[]>> {
  const byDonationId = new Map<string, ContributionAdjustmentRecord[]>();

  for (
    let start = 0;
    start < donationIds.length;
    start += ADJUSTMENT_ID_CHUNK
  ) {
    const ids = donationIds.slice(start, start + ADJUSTMENT_ID_CHUNK);
    for (let from = 0; ; from += REPORT_PAGE_SIZE) {
      const { data, error } = await supabaseAdmin
        .from("contribution_adjustments")
        .select(
          "id, donation_id, adjustment_type, status, effective_values, reason, actor_profile_id, source_surface, created_at",
        )
        .eq("tenant_id", tenantId)
        .eq("status", "applied")
        .in("donation_id", ids)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + REPORT_PAGE_SIZE - 1);
      assertNoError(error, "Failed to load contribution corrections.");

      const page = (data ?? []) as Array<Record<string, unknown>>;
      for (const row of page) {
        const donationId =
          typeof row.donation_id === "string" ? row.donation_id : "";
        const existing = byDonationId.get(donationId) ?? [];
        existing.push(mapContributionAdjustmentRow(row));
        byDonationId.set(donationId, existing);
      }
      if (page.length === 0) {
        break;
      }
    }
  }

  return byDonationId;
}

async function fetchFundLabels(
  supabaseAdmin: SupabaseAdmin,
  ids: string[],
): Promise<Map<string, LabelRow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from("funds")
    .select("id, name")
    .in("id", ids);
  assertNoError(error, "Failed to load fund labels.");
  return new Map(((data ?? []) as LabelRow[]).map((row) => [row.id, row]));
}

async function fetchMissionaryLabels(
  supabaseAdmin: SupabaseAdmin,
  ids: string[],
): Promise<Map<string, LabelRow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from("missionaries")
    .select(
      "id, profile:profiles!missionaries_profile_id_fkey(display_name, full_name, first_name, last_name, email)",
    )
    .in("id", ids);
  assertNoError(error, "Failed to load missionary labels.");
  return new Map(((data ?? []) as LabelRow[]).map((row) => [row.id, row]));
}

async function fetchDonors(
  supabaseAdmin: SupabaseAdmin,
  ids: string[],
): Promise<Map<string, DonorRow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from("donors")
    .select("id, name, organization, status")
    .in("id", ids);
  assertNoError(error, "Failed to load donor labels.");
  return new Map(((data ?? []) as DonorRow[]).map((row) => [row.id, row]));
}

/**
 * Splits `total` across `weights` in proportion, in whole cents, handing the
 * rounding remainder to the largest weights so the parts add up exactly.
 */
function splitCents(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum <= 0) {
    return weights.map((_, index) => (index === 0 ? total : 0));
  }

  const parts = weights.map((weight) =>
    Math.floor((total * weight) / weightSum),
  );
  let remainder = total - parts.reduce((sum, part) => sum + part, 0);
  const byWeight = weights
    .map((weight, index) => ({ index, weight }))
    .sort((left, right) => right.weight - left.weight);
  for (let cursor = 0; remainder > 0; cursor = (cursor + 1) % parts.length) {
    parts[byWeight[cursor]!.index]! += 1;
    remainder -= 1;
  }
  return parts;
}

/**
 * Turns raw donations into the gifts the report counts: approved corrections
 * applied to the amount, status and designation (ADR-CD-004), refunds
 * subtracted, and anything not settled or with no money kept left out.
 */
function toReportGifts(
  donations: DonationRow[],
  adjustmentsByDonationId: Map<string, ContributionAdjustmentRecord[]>,
): ReportGift[] {
  const gifts: ReportGift[] = [];

  for (const donation of donations) {
    const { effective, effectiveDesignationLines } =
      deriveEffectiveContribution({
        adjustments: adjustmentsByDonationId.get(donation.id) ?? [],
        original: {
          amountCents: toContributionCents(donation.amount),
          fundId: donation.fund_id,
          missionaryId: donation.missionary_id,
          paymentStatus: donation.status ?? "pending",
        },
      });

    if (normalizeSharedPaymentStatus(effective.paymentStatus) !== "completed") {
      continue;
    }

    const netAmountCents =
      effective.amountCents -
      Math.max(0, toContributionCents(donation.refund_amount));
    if (netAmountCents <= 0) {
      continue;
    }

    const designations =
      effectiveDesignationLines && effectiveDesignationLines.length > 0
        ? effectiveDesignationLines
        : [
            {
              amountCents: effective.amountCents,
              fundId: effective.fundId,
              missionaryId: effective.missionaryId,
            },
          ];
    const shares = splitCents(
      netAmountCents,
      designations.map((line) => Math.max(0, line.amountCents)),
    );

    gifts.push({
      createdAt: donation.created_at,
      donorId: donation.donor_id,
      id: donation.id,
      lines: designations.map((line, index) => ({
        amountCents: shares[index] ?? 0,
        fundId: line.fundId,
        missionaryId: line.missionaryId,
      })),
      netAmountCents,
    });
  }

  return gifts;
}

interface ReportAggregate {
  rows: CrmReportRow[];
  /** Distinct donors across the visible rows (anonymous gifts left out). */
  distinctDonorCount: number;
  /** Distinct gifts across the visible rows (a split gift counts once). */
  distinctGiftCount: number;
}

function aggregateGifts(input: {
  gifts: ReportGift[];
  /** Groups per designation line, or per gift when omitted. */
  getLineGroupId?: (line: ReportGiftLine) => string | null;
  getGiftGroupId?: (gift: ReportGift) => string | null;
  getLabel: (id: string | null) => string;
  getStatus?: (id: string | null) => string | null;
  search: string | null;
}): ReportAggregate {
  type Accumulator = CrmReportRow & {
    donorIds: Set<string>;
    giftIds: Set<string>;
  };
  const rows = new Map<string, Accumulator>();

  const add = (gift: ReportGift, rawGroupId: string | null, cents: number) => {
    const groupId = rawGroupId ?? "unassigned";
    const id = groupId === "unassigned" ? null : groupId;
    const row = rows.get(groupId) ?? {
      amountCents: 0,
      donorCount: 0,
      donorIds: new Set<string>(),
      giftCount: 0,
      giftIds: new Set<string>(),
      id: groupId,
      label: input.getLabel(id),
      lastGiftAt: null,
      metadata: {},
      status: input.getStatus?.(id) ?? null,
    };

    row.amountCents += cents;
    row.giftIds.add(gift.id);
    if (gift.donorId) {
      row.donorIds.add(gift.donorId);
    }
    if (
      gift.createdAt &&
      (!row.lastGiftAt ||
        new Date(gift.createdAt).getTime() > new Date(row.lastGiftAt).getTime())
    ) {
      row.lastGiftAt = gift.createdAt;
    }
    row.giftCount = row.giftIds.size;
    row.donorCount = row.donorIds.size;
    rows.set(groupId, row);
  };

  for (const gift of input.gifts) {
    if (input.getLineGroupId) {
      for (const line of gift.lines) {
        add(gift, input.getLineGroupId(line), line.amountCents);
      }
    } else {
      add(gift, input.getGiftGroupId?.(gift) ?? null, gift.netAmountCents);
    }
  }

  const visible = Array.from(rows.values()).filter((row) =>
    matchesSearch(row.label, input.search),
  );
  const donorIds = new Set(visible.flatMap((row) => [...row.donorIds]));
  const giftIds = new Set(visible.flatMap((row) => [...row.giftIds]));

  return {
    distinctDonorCount: donorIds.size,
    distinctGiftCount: giftIds.size,
    rows: visible
      .map(({ donorIds: _donorIds, giftIds: _giftIds, ...row }) => row)
      .sort((left, right) => right.amountCents - left.amountCents),
  };
}

async function buildSyncFailureRows(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
  params: AdminCrmReportParams,
): Promise<CrmReportRow[]> {
  const linksResult = await supabaseAdmin
    .from("donation_crm_links")
    .select("id, link_status, updated_at")
    .eq("tenant_id", tenantId)
    .eq("scope", "parent")
    .in("link_status", ["queued", "failed"])
    .limit(250);
  assertNoError(linksResult.error, "Failed to load leftover CRM gift links.");

  const linkRows = (
    (linksResult.data ?? []) as Array<{
      id: string;
      link_status: string | null;
      updated_at: string | null;
    }>
  ).map((row) => ({
    amountCents: 0,
    donorCount: 0,
    giftCount: 0,
    id: row.id,
    label: "Donation CRM link requires reconciliation",
    lastGiftAt: row.updated_at,
    metadata: { source: "donation_crm_links" },
    status: row.link_status,
  }));

  return linkRows.filter((row) =>
    matchesSearch(row.label, params.filters.search),
  );
}

export async function buildAdminCrmReport(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  params: AdminCrmReportParams;
  /** Read bound; defaults to {@link CRM_REPORT_DONATION_LIMIT}. */
  maxDonations?: number;
}): Promise<AdminCrmReportResponse> {
  if (input.params.slice === "sync-failures") {
    const rows = await buildSyncFailureRows(
      input.supabaseAdmin,
      input.tenantId,
      input.params,
    );
    return buildReportResponse(input.params, rows);
  }

  const donationLimit = input.maxDonations ?? CRM_REPORT_DONATION_LIMIT;
  const { complete, donations } = await fetchDonations(
    input.supabaseAdmin,
    input.tenantId,
    input.params,
    donationLimit,
  );
  const adjustments = await fetchAppliedAdjustments(
    input.supabaseAdmin,
    input.tenantId,
    donations.map((donation) => donation.id),
  );
  const gifts = toReportGifts(donations, adjustments);
  const completeness: AdminCrmReportCompleteness = {
    complete,
    donationLimit,
    includedGiftCount: donations.length,
  };
  const respond = (aggregate: ReportAggregate) =>
    buildReportResponse(input.params, aggregate.rows, {
      completeness,
      distinctDonorCount: aggregate.distinctDonorCount,
      distinctGiftCount: aggregate.distinctGiftCount,
    });
  const lines = gifts.flatMap((gift) => gift.lines);

  if (input.params.slice === "funds") {
    const labels = await fetchFundLabels(
      input.supabaseAdmin,
      uniq(lines.map((line) => line.fundId)),
    );
    return respond(
      aggregateGifts({
        getLabel: (id) =>
          id ? (labels.get(id)?.name ?? "Unnamed fund") : "Unassigned fund",
        getLineGroupId: (line) => line.fundId,
        gifts,
        search: input.params.filters.search,
      }),
    );
  }

  if (input.params.slice === "missionaries") {
    const labels = await fetchMissionaryLabels(
      input.supabaseAdmin,
      uniq(lines.map((line) => line.missionaryId)),
    );
    return respond(
      aggregateGifts({
        getLabel: (id) =>
          id ? profileName(labels.get(id) ?? { id }) : "Unassigned missionary",
        getLineGroupId: (line) => line.missionaryId,
        gifts,
        search: input.params.filters.search,
      }),
    );
  }

  const donors = await fetchDonors(
    input.supabaseAdmin,
    uniq(gifts.map((gift) => gift.donorId)),
  );
  return respond(
    aggregateGifts({
      getGiftGroupId: (gift) => gift.donorId,
      getLabel: (id) => {
        if (!id) {
          return "Anonymous donor";
        }
        const donor = donors.get(id);
        return donor?.name ?? donor?.organization ?? "Unnamed donor";
      },
      getStatus: (id) => (id ? (donors.get(id)?.status ?? null) : null),
      gifts,
      search: input.params.filters.search,
    }),
  );
}

export function buildReportResponse(
  params: AdminCrmReportParams,
  rows: CrmReportRow[],
  aggregate?: {
    completeness: AdminCrmReportCompleteness;
    distinctDonorCount: number;
    distinctGiftCount: number;
  },
): AdminCrmReportResponse {
  return {
    audit: {
      exportRequired: true,
      loggedEvents: ["actor", "tenant", "filters", "rowCount", "timestamp"],
    },
    completeness: aggregate?.completeness ?? {
      complete: true,
      donationLimit: null,
      includedGiftCount: rows.reduce((sum, row) => sum + row.giftCount, 0),
    },
    filters: params.filters,
    rows,
    slice: params.slice,
    totals: {
      amountCents: rows.reduce((sum, row) => sum + row.amountCents, 0),
      // Row counts overlap (one donor gives to several funds, one gift splits
      // across funds), so gift reports pass distinct people and gifts. The
      // row sum is only a fallback for rows that cannot overlap.
      donorCount:
        aggregate?.distinctDonorCount ??
        rows.reduce((sum, row) => sum + row.donorCount, 0),
      giftCount:
        aggregate?.distinctGiftCount ??
        rows.reduce((sum, row) => sum + row.giftCount, 0),
      rowCount: rows.length,
    },
  };
}

export function serializeAdminCrmReportCsv(report: AdminCrmReportResponse) {
  const headers = [
    "id",
    "label",
    "net_amount_cents",
    "gift_count",
    "donor_count",
    "last_gift_at",
    "status",
    "metadata",
  ];
  const rows = report.rows.map((row) =>
    [
      row.id,
      row.label,
      row.amountCents,
      row.giftCount,
      row.donorCount,
      row.lastGiftAt,
      row.status,
      row.metadata,
    ]
      .map(csvSafeCell)
      .join(","),
  );

  // Emit CRLF records + a UTF-8 BOM so Excel renders non-ASCII donor/org names
  // correctly and matches the client download path (@asym/ui data-table export).
  const body = [headers.map(csvSafeCell).join(","), ...rows].join(
    CSV_RECORD_SEPARATOR,
  );
  return `${CSV_UTF8_BOM}${body}`;
}
