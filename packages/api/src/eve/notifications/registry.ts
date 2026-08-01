import { z } from "zod";

import {
  EVE_NOTIFICATION_CHANNELS,
  type EveNotificationChannelConfig,
} from "./types";

export function createEveNotificationChannelDefaults(input: {
  policyVersion: number;
  tenantId: string;
}): EveNotificationChannelConfig[] {
  const tenantId = z.string().uuid().parse(input.tenantId);
  const policyVersion = z.number().int().positive().parse(input.policyVersion);

  return EVE_NOTIFICATION_CHANNELS.map((channel) => ({
    tenantId,
    channel,
    enabled: false,
    paused: true,
    minimumSeverity: channel === "discord" ? "high" : "medium",
    richDetailEnabled: false,
    destinationKey:
      channel === "discord" ? "discord:ops-primary" : "platform-owners",
    dedupeWindowSeconds: channel === "discord" ? 3_600 : 21_600,
    maxAttempts: 3,
    retryBaseSeconds: 60,
    policyVersion,
  }));
}
