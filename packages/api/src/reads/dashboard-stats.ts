import { getAdminClient } from "@asym/database/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";

type QueryError = { message?: string } | null;

export interface DashboardStats {
  totalDonors: number;
  totalMissionaries: number;
  totalDonationsThisMonth: number;
  revenueThisMonth: number;
  activeFundsCount: number;
}

function toErrorMessage(error: QueryError, fallback: string): string {
  return error?.message || fallback;
}

function getMonthStartIso(): string {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  return monthStart.toISOString();
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

export async function getDashboardStats(
  tenantId: string,
): Promise<DashboardStats> {
  "use cache";

  applyCacheMetadata(["dashboard-stats", `tenant:${tenantId}`]);

  const { client, error } = getAdminClient();
  if (!client) {
    throw new Error(error || "Admin client unavailable.");
  }

  const monthStartIso = getMonthStartIso();

  const [
    donorCountResult,
    missionaryCountResult,
    donationCountResult,
    revenueResult,
    activeFundsCountResult,
  ] = await Promise.all([
    client
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("role", "donor"),
    client
      .from("missionaries")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    client
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", monthStartIso),
    client
      .from("donations")
      .select("amount")
      .eq("tenant_id", tenantId)
      .gte("created_at", monthStartIso),
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
  if (revenueResult.error) {
    throw new Error(
      toErrorMessage(revenueResult.error, "Failed to load monthly revenue."),
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

  const revenueThisMonth = (revenueResult.data || []).reduce((sum, row) => {
    const amount = typeof row.amount === "number" ? row.amount : 0;
    return sum + amount;
  }, 0);

  return {
    totalDonors: donorCountResult.count || 0,
    totalMissionaries: missionaryCountResult.count || 0,
    totalDonationsThisMonth: donationCountResult.count || 0,
    revenueThisMonth,
    activeFundsCount: activeFundsCountResult.count || 0,
  };
}
