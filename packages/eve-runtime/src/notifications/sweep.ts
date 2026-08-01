import { executeEveRuntimePolicyConsult } from "@asym/api/eve/approval-budget";
import { createServiceEveAuditIdentity } from "@asym/api/eve/audit";
import { loadEveGovernanceSnapshot } from "@asym/api/eve/governance";
import {
  claimDueEveNotificationRecords,
  completeEveNotificationAttempt,
  deliverEveNotificationRecord,
  loadEveNotificationChannels,
  resolveEveNotificationAttemptState,
} from "@asym/api/eve/notifications";
import {
  claimEveSessionOwnership,
  createServiceEveSessionIdentity,
} from "@asym/api/eve/session-ownership";

import type { EveNotificationChannelConfig } from "@asym/api/eve/notifications";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function requireTenantId(): string {
  const tenantId = process.env.EVE_GITHUB_TENANT_ID?.trim();
  if (!tenantId || !UUID_PATTERN.test(tenantId)) {
    throw new Error("Eve notification tenant configuration is unavailable.");
  }
  return tenantId;
}

export async function runEveNotificationSweep(now = new Date()) {
  const tenantId = requireTenantId();
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) throw new Error("Eve notification store is unavailable.");
  const records = await claimDueEveNotificationRecords({
    limit: 50,
    now: now.toISOString(),
    supabaseAdmin: admin.client,
    tenantId,
  });
  let delivered = 0;
  for (const record of records) {
    let config: EveNotificationChannelConfig | undefined;
    const sessionId = `notification:${record.id}:${record.attemptCount + 1}`;
    const sessionIdentity = createServiceEveSessionIdentity({
      initiatorId: record.id,
      initiatorType: "schedule",
      serviceId: "eve-notification-delivery",
      tenantId,
    });
    try {
      await claimEveSessionOwnership({
        identity: sessionIdentity,
        sessionId,
        supabaseAdmin: admin.client,
      });
      const [governance, channels] = await Promise.all([
        loadEveGovernanceSnapshot({ supabaseAdmin: admin.client }),
        loadEveNotificationChannels({ supabaseAdmin: admin.client, tenantId }),
      ]);
      config = channels.find((value) => value.channel === record.channel);
      if (!governance) throw new Error("Eve governance state is unavailable.");
      if (!config) throw new Error("Eve notification channel is unavailable.");
      await deliverEveNotificationRecord({
        config,
        consultPolicy: (targetKey) =>
          executeEveRuntimePolicyConsult({
            actionId: "engineering.notification.deliver",
            identity: sessionIdentity,
            sessionId,
            supabaseAdmin: admin.client!,
            targetKey,
          }),
        governance,
        identity: createServiceEveAuditIdentity({
          initiatorId: record.id,
          initiatorType: "schedule",
          serviceId: "eve-notification-delivery",
          tenantId,
        }),
        now,
        record,
        supabaseAdmin: admin.client,
      });
      delivered += 1;
    } catch {
      if (!config) {
        const channels = await loadEveNotificationChannels({
          supabaseAdmin: admin.client,
          tenantId,
        }).catch(() => []);
        config = channels.find((value) => value.channel === record.channel);
      }
      const attempt = config
        ? resolveEveNotificationAttemptState({
            attemptCount: record.attemptCount,
            maxAttempts: config.maxAttempts,
            now,
            outcome: { retryable: true, success: false },
            retryBaseSeconds: config.retryBaseSeconds,
          })
        : { nextAttemptAt: undefined, status: "terminal_failed" as const };
      await completeEveNotificationAttempt({
        errorCode: "notification_runtime_error",
        nextAttemptAt: attempt.nextAttemptAt,
        providerResponseClass: "runtime_error",
        record,
        status: attempt.status,
        supabaseAdmin: admin.client,
      }).catch(() => undefined);
    }
  }
  return { claimed: records.length, completed: delivered };
}
