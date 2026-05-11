import { runtimeEnvFlags, serverEnv } from "@asym/env";

import { createTwentyClients } from "./client";
import {
  resolveTwentyRuntimeConfig,
  type TwentyEnvInput,
} from "./client/config";

import type { ActorContext, CrmGatewayStatus } from "./types";

export interface GetCrmGatewayStatusOptions {
  actor: ActorContext;
  requestId?: string;
  probe?: boolean;
  env?: TwentyEnvInput;
  fetchImpl?: typeof fetch;
}

export function isCrmGatewaySmokeRouteEnabled(): boolean {
  return (
    runtimeEnvFlags.NODE_ENV !== "production" &&
    !runtimeEnvFlags.IS_PROTECTED_DEPLOYMENT
  );
}

function actorSummary(actor: ActorContext): CrmGatewayStatus["actor"] {
  return {
    userId: actor.userId,
    profileId: actor.profileId,
    tenantId: actor.tenantId,
    role: actor.role,
    isSuperAdmin: actor.isSuperAdmin,
  };
}

export async function getCrmGatewayStatus(
  options: GetCrmGatewayStatusOptions,
): Promise<CrmGatewayStatus> {
  const env = options.env ?? serverEnv;
  const config = resolveTwentyRuntimeConfig(env);
  const baseStatus = {
    service: "twenty" as const,
    enabled: isCrmGatewaySmokeRouteEnabled(),
    requestId: options.requestId,
    actor: actorSummary(options.actor),
    rateLimitRpm: config.rateLimitRpm,
  };

  if (!config.configured) {
    return {
      ...baseStatus,
      configured: false,
      mode: "not_configured",
      missing: config.missing,
    };
  }

  if (!options.probe) {
    return {
      ...baseStatus,
      configured: true,
      mode: "ready",
      apiBaseUrl: config.apiBaseUrl,
      workspaceId: config.workspaceId,
      hasWebhookSecret: config.hasWebhookSecret,
    };
  }

  const clients = createTwentyClients({ env, fetchImpl: options.fetchImpl });
  if (!clients) {
    return {
      ...baseStatus,
      configured: false,
      mode: "not_configured",
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
    };
  }

  try {
    await clients.metadata.listObjects();
    return {
      ...baseStatus,
      configured: true,
      mode: "probe_succeeded",
      apiBaseUrl: config.apiBaseUrl,
      workspaceId: config.workspaceId,
      hasWebhookSecret: config.hasWebhookSecret,
      probe: {
        ok: true,
      },
    };
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status: unknown }).status)
        : undefined;

    return {
      ...baseStatus,
      configured: true,
      mode: "probe_failed",
      apiBaseUrl: config.apiBaseUrl,
      workspaceId: config.workspaceId,
      hasWebhookSecret: config.hasWebhookSecret,
      probe: {
        ok: false,
        ...(Number.isFinite(status) ? { status } : {}),
        error: error instanceof Error ? error.message : "Unknown CRM error",
      },
    };
  }
}
