import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

import { SETTLED_DONATION_STATUSES } from "./settled-donation-statuses";
import {
  deriveEffectiveContribution,
  mapContributionAdjustmentRow,
  type ContributionAdjustmentRecord,
} from "../admin/contribution-shared/effective-values";
import { normalizeSharedPaymentStatus } from "../admin/contribution-shared/row-contract";
import { ADMIN_CACHE_TAGS, READ_CACHE_TAGS } from "../shared/cache-tags";

type QueryError = { message?: string } | null;

/** Full calendar months before the current month in the giving trend. */
export const GIVING_TREND_FULL_MONTHS = 12;

const UNKNOWN_CURRENCY = "unknown";
const PAGE_SIZE = 1000;
/** Match Reports' bounded adjustment requests rather than one long ID URL. */
const ADJUSTMENT_ID_CHUNK = 150;

export interface GivingTrendMonth {
  /** UTC calendar month, `YYYY-MM`. */
  month: string;
  /** True for the current month: gifts so far, not a finished month. */
  soFar: boolean;
  /** Settled gift records created in the month, refunded ones included. */
  giftCount: number;
  /**
   * Settled giving after applied amount/currency corrections and refunds, in
   * cents. Null when the period's gifts do
   * not share one known currency, because amounts in different currencies
   * cannot be added together.
   */
  netCents: number | null;
}

export interface GivingTrend {
  /** Inclusive UTC start of the first month. */
  periodStart: string;
  /** When the read ran: the end of the current month's "so far". */
  asOf: string;
  /**
   * The one ISO currency shared by every gift in the period; null when there
   * are no gifts, several currencies, or a gift without a currency.
   */
  currency: string | null;
  /**
   * Every currency seen in the period, sorted (`unknown` for a gift without
   * one); empty when there are no gifts.
   */
  currencies: string[];
  /** Oldest first: 12 full months, then the current month. */
  months: GivingTrendMonth[];
}

export interface DashboardStats {
  crmRecordCount: number;
  totalMissionaries: number;
  totalDonationsThisMonth: number;
  /** Settled giving since the 1st after amount corrections and refunds, in cents. */
  revenueThisMonthCents: number;
  activeFundsCount: number;
  /** Settled giving by UTC month with the same corrections and refund rule. */
  givingTrend: GivingTrend;
}

type AdminClient = NonNullable<ReturnType<typeof getAdminClient>["client"]>;

type SettledGiftRow = {
  id: string;
  amount: number | null;
  refund_amount: number | null;
  currency: string | null;
  created_at: string;
};

function toErrorMessage(error: QueryError, fallback: string): string {
  return error?.message || fallback;
}

/** The UTC start of the month `offset` months from `now`'s month. */
function utcMonthStart(now: Date, offset = 0): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1),
  );
}

function applyCacheMetadata(tags: string[]): void {
  try {
    cacheLife("minutes");
    for (const tag of tags) {
      cacheTag(tag);
    }
  } catch {
    // Unit tests execute outside Next's Cache Components runtime.
  }
}

/** Net of refunds, never negative: a refund can only cancel its own gift. */
function netGiftValues(
  row: SettledGiftRow,
  adjustments: ContributionAdjustmentRecord[],
): { netCents: number; currency: string | null } {
  const applied = adjustments
    .filter((adjustment) => adjustment.status === "applied")
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    );
  const { effective } = deriveEffectiveContribution({
    original: {
      amountCents: typeof row.amount === "number" ? row.amount : 0,
      fundId: null,
      missionaryId: null,
      paymentStatus: "completed",
    },
    adjustments: applied,
  });
  if (
    !Number.isSafeInteger(effective.amountCents) ||
    !Number.isSafeInteger(row.refund_amount ?? 0)
  ) {
    throw new Error("Settled giving requires safe integer cents.");
  }
  // The shared amount resolver has no currency field yet. Honor an explicit
  // persisted currency correction without inventing a conversion or write path.
  let currency = row.currency;
  for (const adjustment of applied) {
    const values = adjustment.effectiveValues;
    if (!("currency" in values) || values.currency === undefined) continue;
    if (typeof values.currency !== "string" && values.currency !== null) {
      throw new Error("A settled gift has an unreadable corrected currency.");
    }
    currency = values.currency;
  }
  return {
    netCents:
      normalizeSharedPaymentStatus(effective.paymentStatus) === "completed"
        ? Math.max(
            0,
            effective.amountCents - Math.max(0, row.refund_amount ?? 0),
          )
        : 0,
    currency,
  };
}

/**
 * Reads every settled gift since `periodStartIso`, page by page. Any failed
 * page fails the whole read, so a capped list is never reported as complete.
 */
async function listSettledGifts(
  client: AdminClient,
  tenantId: string,
  periodStartIso: string,
): Promise<SettledGiftRow[]> {
  const rows: SettledGiftRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client
      .from("donations")
      .select("id, amount, refund_amount, currency, created_at")
      .eq("tenant_id", tenantId)
      .in("status", [...SETTLED_DONATION_STATUSES])
      .gte("created_at", periodStartIso)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      throw new Error(toErrorMessage(error, "Failed to load settled giving."));
    }
    rows.push(...((data ?? []) as SettledGiftRow[]));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

/** An unavailable correction page must never look like no corrections. */
async function listAppliedAdjustments(
  client: AdminClient,
  tenantId: string,
  donationIds: string[],
): Promise<Map<string, ContributionAdjustmentRecord[]>> {
  const byDonationId = new Map<string, ContributionAdjustmentRecord[]>();
  const uniqueIds = [...new Set(donationIds)];
  for (let start = 0; start < uniqueIds.length; start += ADJUSTMENT_ID_CHUNK) {
    const ids = uniqueIds.slice(start, start + ADJUSTMENT_ID_CHUNK);
    for (let from = 0; ;) {
      const { data, error } = await client
        .from("contribution_adjustments")
        .select(
          "id, donation_id, adjustment_type, status, effective_values, reason, actor_profile_id, source_surface, created_at",
        )
        .eq("tenant_id", tenantId)
        .eq("status", "applied")
        .in("donation_id", ids)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) {
        throw new Error(
          toErrorMessage(error, "Failed to load contribution corrections."),
        );
      }
      const page = (data ?? []) as Array<Record<string, unknown>>;
      for (const row of page) {
        if (typeof row.donation_id !== "string") continue;
        const adjustments = byDonationId.get(row.donation_id) ?? [];
        adjustments.push(mapContributionAdjustmentRow(row));
        byDonationId.set(row.donation_id, adjustments);
      }
      if (page.length === 0) break;
      // Use the actual length so a server cap below PAGE_SIZE cannot skip rows.
      from += page.length;
    }
  }
  return byDonationId;
}

function buildGivingTrend(
  rows: SettledGiftRow[],
  adjustmentsByDonationId: Map<string, ContributionAdjustmentRecord[]>,
  now: Date,
): { trend: GivingTrend; revenueThisMonthCents: number } {
  const keys = Array.from(
    { length: GIVING_TREND_FULL_MONTHS + 1 },
    (_, index) =>
      utcMonthStart(now, index - GIVING_TREND_FULL_MONTHS)
        .toISOString()
        .slice(0, 7),
  );
  const currentKey = keys.at(-1)!;
  const buckets = new Map(
    keys.map((key) => [key, { giftCount: 0, netCents: 0 }]),
  );
  const currencies = new Set<string>();

  for (const row of rows) {
    const createdAt = new Date(row.created_at);
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error("A settled gift has an unreadable created_at.");
    }
    // Clock skew can stamp a gift after now; it still belongs to this month,
    // as it does in "Net giving this month".
    const key =
      createdAt > now ? currentKey : createdAt.toISOString().slice(0, 7);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const effective = netGiftValues(
      row,
      adjustmentsByDonationId.get(row.id) ?? [],
    );
    bucket.giftCount += 1;
    bucket.netCents += effective.netCents;
    if (!Number.isSafeInteger(bucket.netCents)) {
      throw new Error("Settled giving requires safe integer cents.");
    }
    currencies.add(
      (effective.currency ?? "").trim().toUpperCase() || UNKNOWN_CURRENCY,
    );
  }

  const sortedCurrencies = [...currencies].sort();
  const currency =
    sortedCurrencies.length === 1 && sortedCurrencies[0] !== UNKNOWN_CURRENCY
      ? sortedCurrencies[0]!
      : null;
  // With no gifts every month is a true zero; otherwise amounts are only
  // added up when they share one known currency.
  const canTotal = sortedCurrencies.length === 0 || currency !== null;

  return {
    revenueThisMonthCents: buckets.get(currentKey)!.netCents,
    trend: {
      periodStart: utcMonthStart(now, -GIVING_TREND_FULL_MONTHS).toISOString(),
      asOf: now.toISOString(),
      currency,
      currencies: sortedCurrencies,
      months: keys.map((key) => {
        const bucket = buckets.get(key)!;
        return {
          month: key,
          soFar: key === currentKey,
          giftCount: bucket.giftCount,
          netCents: canTotal ? bucket.netCents : null,
        };
      }),
    },
  };
}

export async function getDashboardStats(
  tenantId: string,
): Promise<DashboardStats> {
  "use cache";

  applyCacheMetadata([
    READ_CACHE_TAGS.dashboardStats,
    READ_CACHE_TAGS.tenant(tenantId),
    ADMIN_CACHE_TAGS.contributions.tenant(tenantId),
    ADMIN_CACHE_TAGS.crm.tenant(tenantId),
  ]);

  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }

  const now = new Date();
  const monthStartIso = utcMonthStart(now).toISOString();
  // One read serves the trend and "Net giving this month", so they agree.
  const trendStartIso = utcMonthStart(
    now,
    -GIVING_TREND_FULL_MONTHS,
  ).toISOString();

  const [
    donorCountResult,
    missionaryCountResult,
    donationCountResult,
    settledGifts,
    activeFundsCountResult,
  ] = await Promise.all([
    client
      .from("donors")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    client
      .from("missionaries")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    client
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .in("status", [...SETTLED_DONATION_STATUSES])
      .gte("created_at", monthStartIso),
    listSettledGifts(client, tenantId, trendStartIso),
    client
      .from("funds")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("is_active", true),
  ]);

  if (donorCountResult.error) {
    throw new Error(
      toErrorMessage(donorCountResult.error, "Failed to count donors."),
    );
  }
  if (missionaryCountResult.error) {
    throw new Error(
      toErrorMessage(
        missionaryCountResult.error,
        "Failed to count missionaries.",
      ),
    );
  }
  if (donationCountResult.error) {
    throw new Error(
      toErrorMessage(
        donationCountResult.error,
        "Failed to count monthly donations.",
      ),
    );
  }
  if (activeFundsCountResult.error) {
    throw new Error(
      toErrorMessage(
        activeFundsCountResult.error,
        "Failed to count active funds.",
      ),
    );
  }

  const adjustments = await listAppliedAdjustments(
    client,
    tenantId,
    settledGifts.map((row) => row.id),
  );
  const { trend, revenueThisMonthCents } = buildGivingTrend(
    settledGifts,
    adjustments,
    now,
  );

  return {
    crmRecordCount: donorCountResult.count || 0,
    totalMissionaries: missionaryCountResult.count || 0,
    totalDonationsThisMonth: donationCountResult.count || 0,
    revenueThisMonthCents,
    activeFundsCount: activeFundsCountResult.count || 0,
    givingTrend: trend,
  };
}
