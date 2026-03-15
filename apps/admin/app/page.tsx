import { getAuthContext } from "@asym/auth/context";
import { DashboardHome } from "@asym/missionary/components/dashboard-home";

import { loadDashboardStats } from "./dashboard-stats-loader";

import { AdminDashboardStatsSection } from "@/features/mission-control/components/AdminDashboardStatsSection";

export default async function MissionControlDashboard() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.tenantId) {
    return <DashboardHome />;
  }

  const stats = await loadDashboardStats(auth.tenantId);

  if (!stats) {
    return <DashboardHome />;
  }

  return (
    <>
      <AdminDashboardStatsSection stats={stats} />
      <DashboardHome />
    </>
  );
}
