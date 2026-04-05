import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

import { type PaginatedResult, type PaginationParams } from "./types";

type QueryError = { message?: string } | null;

export interface DonorHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  donationType: string;
  missionaryId: string;
  createdAt: string;
}

type DonationRow = {
  id: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  donation_type: string | null;
  missionary_id: string | null;
  created_at: string | null;
};

type DonorRow = {
  id: string;
};

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

export async function getDonorHistory(
  donorId: string,
  tenantId: string,
  pagination: PaginationParams,
): Promise<PaginatedResult<DonorHistoryItem>> {
  "use cache";

  applyCacheMetadata(["donor-history", `donor:${donorId}`]);

  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }

  const limit = Math.max(1, pagination.limit);
  const offset = Math.max(0, pagination.offset);

  const [donationsResult, totalResult] = await Promise.all([
    client
      .from("donations")
      .select(
        "id, amount, currency, status, donation_type, missionary_id, created_at",
      )
      .eq("donor_id", donorId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
    client
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("donor_id", donorId)
      .eq("tenant_id", tenantId),
  ]);

  if (donationsResult.error) {
    throw new Error(
      toErrorMessage(
        donationsResult.error,
        "Failed to load donor donation history.",
      ),
    );
  }
  if (totalResult.error) {
    throw new Error(
      toErrorMessage(
        totalResult.error,
        "Failed to count donor donation history.",
      ),
    );
  }

  const rows = (donationsResult.data || []) as DonationRow[];
  const data: DonorHistoryItem[] = rows.map((row) => ({
    id: row.id,
    amount: typeof row.amount === "number" ? row.amount : 0,
    currency: row.currency || "usd",
    status: row.status || "pending",
    donationType: row.donation_type || "one_time",
    missionaryId: row.missionary_id || "",
    createdAt: row.created_at || new Date(0).toISOString(),
  }));

  const total = totalResult.count || 0;
  return {
    data,
    total,
    limit,
    offset,
    hasMore: offset + data.length < total,
  };
}

export async function resolveDonorId(
  queryDonorId: string | null,
  tenantId: string,
  profileId: string | null,
): Promise<string | null> {
  "use cache";

  if (!profileId) {
    return null;
  }

  applyCacheMetadata([
    "donor-profile",
    `tenant:${tenantId}`,
    `profile:${profileId}`,
  ]);

  const { client, error } = getAdminClient();
  if (!client || error) {
    return null;
  }

  const { data, error: donorLookupError } = await client
    .from("donors")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("profile_id", profileId)
    .maybeSingle<DonorRow>();

  if (donorLookupError || !data?.id) {
    return null;
  }

  if (queryDonorId && queryDonorId !== data.id) {
    return null;
  }

  return data.id;
}
