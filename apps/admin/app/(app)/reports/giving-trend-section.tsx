import { getAuthContext } from "@asym/auth/context";

import { RefreshableGivingTrendCard } from "./giving-trend-refresh";
import { loadDashboardStats } from "../dashboard-stats-loader";

/**
 * Streams the tenant's monthly giving trend from the cached dashboard read
 * that Home uses, so both pages show the same figures.
 */
export async function ReportsGivingTrend() {
  const auth = await getAuthContext();
  const stats =
    auth.isAuthenticated && auth.tenantId
      ? await loadDashboardStats(auth.tenantId)
      : null;
  return <RefreshableGivingTrendCard trend={stats?.givingTrend ?? null} />;
}
