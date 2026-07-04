import { serverEnv } from "@asym/env";
import { type NextRequest, NextResponse } from "next/server";

import { getTwentyCrmHealth } from "../crm/health";

const NO_STORE_HEADERS = {
  "cache-control": "no-store",
} as const;

/**
 * Production-reachable Twenty CRM health check.
 *
 * Unlike the unauthenticated development route
 * (`/api/admin/crm/gateway/development-health`, disabled in production by
 * `isTwentyCrmDevelopmentHealthEnabled`), this endpoint is reachable in every
 * environment and is guarded by the same `CRON_SECRET` bearer contract as
 * `/api/health/db`, so uptime/monitoring automation can probe the CRM link in
 * prod without exposing the raw provider inventory.
 *
 * The response reuses `getTwentyCrmHealth` (already sanitized — it never returns
 * the Twenty API key or webhook secret) and collapses `objectInventory` to a
 * count plus a `giftSummaries` presence flag so the raw object-name list is
 * never published.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized.", requestId },
        { headers: NO_STORE_HEADERS, status: 401 },
      );
    }
  }

  const health = await getTwentyCrmHealth({ env: serverEnv });

  return NextResponse.json(
    {
      ...health,
      objectInventory: health.configured
        ? {
            count: health.objectInventory.count,
            includesGiftSummaries:
              health.objectInventory.names.includes("giftSummaries"),
          }
        : undefined,
      requestId,
    },
    {
      headers: NO_STORE_HEADERS,
      status: health.ok ? 200 : 503,
    },
  );
}
