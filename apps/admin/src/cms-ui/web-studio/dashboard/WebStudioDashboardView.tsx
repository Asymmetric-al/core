import { loadWebStudioDashboardData } from "./load-dashboard-data";
import { WebStudioDashboard } from "./web-studio-dashboard";

import type { AdminViewServerProps } from "payload";

/**
 * Payload `admin.components.views.dashboard`: the Web Studio home at
 * `/web-studio`. Server-rendered so counts and recent documents arrive with
 * the page, read through the Local API as the signed-in user.
 */
export async function WebStudioDashboardView({
  initPageResult,
}: AdminViewServerProps) {
  const data = await loadWebStudioDashboardData({
    payload: initPageResult.req.payload,
    req: initPageResult.req,
    permissions: initPageResult.permissions,
  });

  return <WebStudioDashboard data={data} />;
}
