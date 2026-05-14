import { runtimeEnvFlags, serverEnv } from "@asym/env";
import { NextResponse } from "next/server";

import { getTwentyCrmHealth } from "../../crm/health";

import type { NextRequest } from "next/server";

type TwentyCrmHealthRouteFlags = Pick<
  typeof runtimeEnvFlags,
  "NODE_ENV" | "VERCEL_ENV" | "VERCEL_TARGET_ENV"
>;

export function isTwentyCrmStagingHealthEnabled(
  flags: TwentyCrmHealthRouteFlags = runtimeEnvFlags,
): boolean {
  const targetEnv = flags.VERCEL_TARGET_ENV?.toLowerCase();
  const vercelEnv = flags.VERCEL_ENV?.toLowerCase();

  if (targetEnv === "production" || vercelEnv === "production") {
    return false;
  }

  if (targetEnv === "staging") {
    return true;
  }

  return flags.NODE_ENV !== "production";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  void request.headers.get("x-vercel-id");

  if (!isTwentyCrmStagingHealthEnabled()) {
    return NextResponse.json(
      {
        error: "Twenty CRM staging health route is not enabled.",
        requestId,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
        status: 404,
      },
    );
  }

  const health = await getTwentyCrmHealth({
    env: serverEnv,
  });

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
      headers: {
        "cache-control": "no-store",
      },
      status: health.ok ? 200 : 503,
    },
  );
}
