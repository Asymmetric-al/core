import { serverEnv } from "@asym/env";
import { type NextRequest, NextResponse } from "next/server";

import { getTwentyCrmHealth, type TwentyCrmHealthResult } from "../crm/health";

const NO_STORE_HEADERS = {
  "cache-control": "no-store",
} as const;

type CrmHealthResponse =
  | {
      apiBaseUrlKind: "twenty_cloud_rest" | "custom_rest";
      configured: true;
      giftSummaries: {
        exists: boolean;
        missingFieldCount: number;
      };
      hasWebhookSecret: boolean;
      metadataRead: {
        attempted: true;
        ok: boolean;
        status?: number;
      };
      objectInventory: {
        count: number;
        includesGiftSummaries: boolean;
      };
      ok: boolean;
      requestId: string;
      status: "ready" | "provider_error";
      workspaceConfigured: boolean;
    }
  | {
      configured: false;
      invalid: Extract<TwentyCrmHealthResult, { configured: false }>["invalid"];
      metadataRead: {
        attempted: false;
        ok: false;
      };
      missing: string[];
      ok: false;
      requestId: string;
      status: "missing" | "invalid";
    };

function sanitizeTwentyCrmHealth(
  health: TwentyCrmHealthResult,
  requestId: string,
): CrmHealthResponse {
  if (!health.configured) {
    return {
      configured: false,
      invalid: health.invalid,
      metadataRead: health.metadataRead,
      missing: health.missing,
      ok: health.ok,
      requestId,
      status: health.status,
    };
  }

  return {
    apiBaseUrlKind: health.apiBaseUrlKind,
    configured: true,
    giftSummaries: {
      exists: health.giftSummaries.exists,
      missingFieldCount: health.giftSummaries.missingFields.length,
    },
    hasWebhookSecret: health.hasWebhookSecret,
    metadataRead: health.metadataRead,
    objectInventory: {
      count: health.objectInventory.count,
      includesGiftSummaries:
        health.objectInventory.names.includes("giftSummaries"),
    },
    ok: health.ok,
    requestId,
    status: health.status,
    workspaceConfigured: health.workspaceConfigured,
  };
}

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
 * The response reuses `getTwentyCrmHealth` and returns an explicit allowlist so
 * the Twenty API key, webhook secret, raw object-name list, expected repository
 * model, and missing provider field names are never published.
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

  return NextResponse.json(sanitizeTwentyCrmHealth(health, requestId), {
    headers: NO_STORE_HEADERS,
    status: health.ok ? 200 : 503,
  });
}
