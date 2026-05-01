import { getAuthContext } from "@asym/auth/context";

import {
  loadDashboardMissionaryId,
  loadDashboardStats,
} from "./dashboard-stats-loader";

import { MissionControlHome } from "@/features/mission-control/components/tiles/mission-control-home";

export default async function MissionControlDashboard() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.tenantId) {
    return <MissionControlHome />;
  }

  const [stats, dashboardMissionaryId] = await Promise.all([
    loadDashboardStats(auth.tenantId),
    loadDashboardMissionaryId(auth.tenantId),
  ]);

  if (!stats) {
    return (
      <MissionControlHome dashboardMissionaryId={dashboardMissionaryId} />
    );
  }

  return (
    <MissionControlHome
      dashboardMissionaryId={dashboardMissionaryId}
      stats={stats}
    />
  );
}
