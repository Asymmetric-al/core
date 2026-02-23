import { getDashboardStats } from "@asym/api/reads/dashboard-stats";
import { getAuthContext } from "@asym/auth/context";
import { DashboardHome } from "@asym/missionary/components/dashboard-home";

import { AdminDashboardStatsSection } from "@/features/mission-control/components/AdminDashboardStatsSection";

export default async function MissionControlDashboard() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.tenantId) {
    return <DashboardHome />;
  }

  const stats = await getDashboardStats(auth.tenantId);

  return (
    <>
      <AdminDashboardStatsSection stats={stats} />
      <DashboardHome />
    </>
  );
}
