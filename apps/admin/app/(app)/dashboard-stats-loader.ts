import {
  getDashboardStats,
  type DashboardStats,
} from "@asym/api/reads/dashboard-stats";

type DashboardStatsLoader = (tenantId: string) => Promise<DashboardStats>;

export async function loadDashboardStats(
  tenantId: string,
  loadStats: DashboardStatsLoader = getDashboardStats,
): Promise<DashboardStats | null> {
  try {
    return await loadStats(tenantId);
  } catch {
    return null;
  }
}
