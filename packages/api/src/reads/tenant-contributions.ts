import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

import { type PaginatedResult, type PaginationParams } from "./types";

type QueryError = { message?: string } | null;
type MaybeMany<T> = T | T[] | null;

type DonorRow = {
  id: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type FundRow = {
  id: string | null;
  name: string | null;
};

type MissionaryProfileRow = {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

type MissionaryRow = {
  id: string | null;
  profile: MaybeMany<MissionaryProfileRow>;
};

type DonationRow = {
  id: string;
  donor_id: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  donation_type: string | null;
  payment_method: string | null;
  source: string | null;
  notes: string | null;
  stripe_charge_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  donor: MaybeMany<DonorRow>;
  fund: MaybeMany<FundRow>;
  missionary: MaybeMany<MissionaryRow>;
};

export interface TenantContributionItem {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorAvatarUrl: string | null;
  amount: number;
  currency: string;
  status: string;
  donationType: string;
  paymentMethod: string | null;
  source: string | null;
  fundCode: string;
  fundName: string;
  missionaryId: string | null;
  missionaryName: string | null;
  transactionId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function toErrorMessage(error: QueryError, fallback: string): string {
  return error?.message || fallback;
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

function buildMissionaryName(profile: MissionaryProfileRow): string | null {
  if (profile.display_name) {
    return profile.display_name;
  }

  const fullName = [profile.first_name, profile.last_name]
    .filter((part): part is string => Boolean(part))
    .join(" ");

  return fullName || null;
}

function firstOrNull<T>(value: MaybeMany<T> | undefined): T | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value;
}

function toTenantContributionItem(row: DonationRow): TenantContributionItem {
  const createdAt = row.created_at || new Date(0).toISOString();
  const donor = firstOrNull(row.donor);
  const fund = firstOrNull(row.fund);
  const missionary = firstOrNull(row.missionary);
  const missionaryProfile = missionary ? firstOrNull(missionary.profile) : null;

  return {
    id: row.id,
    donorId: row.donor_id || `unknown-${row.id}`,
    donorName: donor?.name || "Unknown Donor",
    donorEmail: donor?.email || "",
    donorAvatarUrl: donor?.avatar_url || null,
    amount: typeof row.amount === "number" ? row.amount : 0,
    currency: row.currency || "usd",
    status: row.status || "pending",
    donationType: row.donation_type || "one_time",
    paymentMethod: row.payment_method || null,
    source: row.source || null,
    fundCode: fund?.id || "N/A",
    fundName: fund?.name || "General Fund",
    missionaryId: missionary?.id || null,
    missionaryName: missionaryProfile
      ? buildMissionaryName(missionaryProfile)
      : null,
    transactionId:
      row.stripe_charge_id || row.stripe_payment_intent_id || row.id,
    notes: row.notes || null,
    createdAt,
    updatedAt: row.updated_at || createdAt,
  };
}

type TenantContributionFilters = {
  donorId?: string;
};

export async function getTenantContributions(
  tenantId: string,
  pagination: PaginationParams,
  filters?: TenantContributionFilters,
): Promise<PaginatedResult<TenantContributionItem>> {
  "use cache";

  const cacheTags = ["tenant-contributions", `tenant:${tenantId}`];
  if (filters?.donorId) {
    cacheTags.push(`donor:${filters.donorId}`);
  }
  applyCacheMetadata(cacheTags);

  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }

  const limit = Math.max(1, pagination.limit);
  const offset = Math.max(0, pagination.offset);

  let listQuery = client
    .from("donations")
    .select(
      "id, donor_id, amount, currency, status, donation_type, payment_method, source, notes, stripe_charge_id, stripe_payment_intent_id, created_at, updated_at, donor:donors!donor_id(id, name, email, avatar_url), fund:funds!fund_id(id, name), missionary:missionaries!missionary_id(id, profile:profiles!profile_id(display_name, first_name, last_name))",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  let countQuery = client
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  if (filters?.donorId) {
    listQuery = listQuery.eq("donor_id", filters.donorId);
    countQuery = countQuery.eq("donor_id", filters.donorId);
  }

  const [contributionsResult, totalResult] = await Promise.all([
    listQuery,
    countQuery,
  ]);

  if (contributionsResult.error) {
    throw new Error(
      toErrorMessage(
        contributionsResult.error,
        "Failed to load tenant contributions.",
      ),
    );
  }
  if (totalResult.error) {
    throw new Error(
      toErrorMessage(
        totalResult.error,
        "Failed to count tenant contributions.",
      ),
    );
  }

  const rows = (contributionsResult.data || []) as DonationRow[];
  const data = rows.map(toTenantContributionItem);
  const total = totalResult.count || 0;

  return {
    data,
    total,
    limit,
    offset,
    hasMore: offset + data.length < total,
  };
}
