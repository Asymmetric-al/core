import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

import { SETTLED_DONATION_STATUSES } from "./settled-donation-statuses";
import { READ_CACHE_TAGS } from "../shared/cache-tags";

type QueryError = { message?: string } | null;

interface DonationSeriesPoint {
  month: string;
  amount: number;
}

export interface MissionaryMetrics {
  missionaryId: string;
  tenantId: string;
  totalDonations: number;
  totalRevenue: number;
  followerCount: number;
  postCount: number;
  reactionCount: number;
  donationsLast13Months: DonationSeriesPoint[];
}

type MissionaryRow = {
  id: string;
  profile_id: string;
};

type MissionaryPostRow = {
  id: string;
  like_count: number | null;
  prayer_count: number | null;
  comment_count: number | null;
};

type AmountRow = {
  amount: number | null;
};

type AmountWithCreatedAtRow = {
  amount: number | null;
  created_at: string | null;
};

function toErrorMessage(error: QueryError, fallback: string): string {
  return error?.message || fallback;
}

function getMonthKey(value: Date): string {
  return value.toISOString().slice(0, 7);
}

function buildLast13MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 12; i >= 0; i -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    keys.push(getMonthKey(date));
  }
  return keys;
}

function get13MonthStartIso(): string {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1),
  );
  return start.toISOString();
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

export async function getMissionaryMetrics(
  missionaryId: string,
  tenantId: string,
): Promise<MissionaryMetrics> {
  "use cache";

  applyCacheMetadata([
    READ_CACHE_TAGS.missionaryMetrics,
    READ_CACHE_TAGS.missionary(missionaryId),
  ]);

  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }

  const { data: missionary, error: missionaryError } = await client
    .from("missionaries")
    .select("id, profile_id")
    .eq("id", missionaryId)
    .eq("tenant_id", tenantId)
    .maybeSingle<MissionaryRow>();

  if (missionaryError) {
    throw new Error(
      toErrorMessage(
        missionaryError,
        "Failed to load missionary metrics context.",
      ),
    );
  }

  if (!missionary?.profile_id) {
    throw new Error("Missionary not found for tenant.");
  }

  const seriesStartIso = get13MonthStartIso();
  const [
    followerCountResult,
    postsResult,
    donationTotalsResult,
    donationSeriesResult,
  ] = await Promise.all([
    client
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("missionary_id", missionary.profile_id)
      .eq("status", "approved"),
    client
      .from("posts")
      .select("id, like_count, prayer_count, comment_count")
      .eq("tenant_id", tenantId)
      .eq("missionary_id", missionary.profile_id),
    client
      .from("donations")
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("missionary_id", missionaryId)
      .in("status", [...SETTLED_DONATION_STATUSES]),
    client
      .from("donations")
      .select("amount, created_at")
      .eq("tenant_id", tenantId)
      .eq("missionary_id", missionaryId)
      .in("status", [...SETTLED_DONATION_STATUSES])
      .gte("created_at", seriesStartIso)
      .order("created_at", { ascending: true }),
  ]);

  if (followerCountResult.error) {
    throw new Error(
      toErrorMessage(followerCountResult.error, "Failed to count followers."),
    );
  }
  if (postsResult.error) {
    throw new Error(
      toErrorMessage(postsResult.error, "Failed to count posts."),
    );
  }
  if (donationTotalsResult.error) {
    throw new Error(
      toErrorMessage(
        donationTotalsResult.error,
        "Failed to load donation totals.",
      ),
    );
  }
  if (donationSeriesResult.error) {
    throw new Error(
      toErrorMessage(
        donationSeriesResult.error,
        "Failed to load donation series.",
      ),
    );
  }

  const posts = (postsResult.data || []) as MissionaryPostRow[];
  const reactionCount = posts.reduce((sum, post) => {
    return (
      sum +
      (post.like_count || 0) +
      (post.prayer_count || 0) +
      (post.comment_count || 0)
    );
  }, 0);

  const totalDonationsRows = (donationTotalsResult.data || []) as AmountRow[];
  const totalRevenue = totalDonationsRows.reduce((sum, row) => {
    return sum + (typeof row.amount === "number" ? row.amount : 0);
  }, 0);

  const seriesRows = (donationSeriesResult.data ||
    []) as AmountWithCreatedAtRow[];
  const monthTotals = new Map<string, number>();
  for (const row of seriesRows) {
    if (!row.created_at) continue;
    const key = getMonthKey(new Date(row.created_at));
    const amount = typeof row.amount === "number" ? row.amount : 0;
    monthTotals.set(key, (monthTotals.get(key) || 0) + amount);
  }

  const donationsLast13Months = buildLast13MonthKeys().map((month) => ({
    month,
    amount: monthTotals.get(month) || 0,
  }));

  return {
    missionaryId,
    tenantId,
    totalDonations: totalDonationsRows.length,
    totalRevenue,
    followerCount: followerCountResult.count || 0,
    postCount: posts.length,
    reactionCount,
    donationsLast13Months,
  };
}
