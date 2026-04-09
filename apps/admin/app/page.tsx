import { getAuthContext } from "@asym/auth/context";
import { DashboardHome } from "@asym/missionary/components/dashboard-home";

import {
  loadDashboardMissionaryId,
  loadDashboardStats,
} from "./dashboard-stats-loader";

import { AdminDashboardStatsSection } from "@/features/mission-control/components/AdminDashboardStatsSection";

export default async function MissionControlDashboard() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.tenantId) {
    return <DashboardHome />;
  }

  const [stats, dashboardMissionaryId] = await Promise.all([
    loadDashboardStats(auth.tenantId),
    loadDashboardMissionaryId(auth.tenantId),
  ]);

  if (!stats) {
    return <DashboardHome missionaryId={dashboardMissionaryId ?? undefined} />;
  }

  return (
    <DashboardHome
      missionaryId={dashboardMissionaryId ?? undefined}
      belowHeaderSlot={<AdminDashboardStatsSection stats={stats} />}
    />
  );
}
