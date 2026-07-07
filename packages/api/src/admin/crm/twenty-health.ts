import { runtimeEnvFlags, serverEnv } from "@asym/env";
import {
  isProductionDeployment,
  isProtectedNonProductionDeployment,
} from "@asym/env/target-env";
import { NextResponse } from "next/server";

import { getTwentyCrmHealth } from "../../crm/health";

import type { NextRequest } from "next/server";

type TwentyCrmHealthRouteFlags = Pick<
  typeof runtimeEnvFlags,
  "NODE_ENV" | "VERCEL_ENV" | "VERCEL_TARGET_ENV"
>;

export function isTwentyCrmDevelopmentHealthEnabled(
  flags: TwentyCrmHealthRouteFlags = runtimeEnvFlags,
): boolean {
  if (isProductionDeployment(flags)) {
    return false;
  }

  if (isProtectedNonProductionDeployment(flags)) {
    return true;
  }

  return flags.NODE_ENV !== "production";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  void request.headers.get("x-vercel-id");

  if (!isTwentyCrmDevelopmentHealthEnabled()) {
    return NextResponse.json(
      {
        error: "Twenty CRM development health route is not enabled.",
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
