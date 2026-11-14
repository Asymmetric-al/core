import { getAuthContext } from "@asym/auth/context";

import { loadDashboardStats } from "./dashboard-stats-loader";

import type { Metadata } from "next";

import { MissionControlHome } from "@/features/mission-control/components/tiles/mission-control-home";

export const metadata: Metadata = { title: "Home" };

export default async function MissionControlDashboard() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.tenantId) {
    return <MissionControlHome />;
  }

  const stats = await loadDashboardStats(auth.tenantId);
  return <MissionControlHome stats={stats} />;
}
