import {
  getDashboardStats,
  getDashboardMissionaryId,
  type DashboardStats,
} from "@asym/api/reads/dashboard-stats";

type DashboardStatsLoader = (tenantId: string) => Promise<DashboardStats>;
type DashboardMissionaryIdLoader = (tenantId: string) => Promise<string | null>;

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

export async function loadDashboardMissionaryId(
  tenantId: string,
  loadMissionaryId: DashboardMissionaryIdLoader = getDashboardMissionaryId,
): Promise<string | null> {
  try {
    return await loadMissionaryId(tenantId);
  } catch {
    return null;
  }
}
