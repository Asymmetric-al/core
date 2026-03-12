import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
});

import { loadDashboardStats } from "../../../../../apps/admin/app/dashboard-stats-loader";

describe("apps/admin/app/dashboard-stats-loader", () => {
  it("returns null when dashboard stats loading fails", async () => {
    const loadStats = vi.fn().mockRejectedValue(new Error("db unavailable"));

    await expect(loadDashboardStats("tenant-1", loadStats)).resolves.toBeNull();
  });

  it("returns stats when dashboard stats loading succeeds", async () => {
    const stats = {
      totalDonors: 3,
      totalMissionaries: 2,
      totalDonationsThisMonth: 5,
      revenueThisMonth: 200,
      activeFundsCount: 4,
    };
    const loadStats = vi.fn().mockResolvedValue(stats);

    await expect(loadDashboardStats("tenant-1", loadStats)).resolves.toEqual(
      stats,
    );
  });
});
