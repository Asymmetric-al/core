import { executeEveRuntimePolicyConsult } from "@asym/api/eve/approval-budget";
import { createServiceEveAuditIdentity } from "@asym/api/eve/audit";
import { loadEveGovernanceSnapshot } from "@asym/api/eve/governance";
import {
  claimDueEveNotificationRecords,
  completeEveNotificationAttempt,
  deliverEveNotificationRecord,
  loadEveNotificationChannels,
} from "@asym/api/eve/notifications";
import {
  claimEveSessionOwnership,
  createServiceEveSessionIdentity,
} from "@asym/api/eve/session-ownership";

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
  const governance = await loadEveGovernanceSnapshot({
    supabaseAdmin: admin.client,
  });
  if (!governance) throw new Error("Eve governance state is unavailable.");
  const [records, channels] = await Promise.all([
    claimDueEveNotificationRecords({
      limit: 50,
      now: now.toISOString(),
      supabaseAdmin: admin.client,
      tenantId,
    }),
    loadEveNotificationChannels({ supabaseAdmin: admin.client, tenantId }),
  ]);
  let delivered = 0;
  for (const record of records) {
    const config = channels.find((value) => value.channel === record.channel);
    if (!config) continue;
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
      await completeEveNotificationAttempt({
        errorCode: "notification_runtime_error",
        nextAttemptAt: new Date(now.getTime() + 60_000).toISOString(),
        providerResponseClass: "runtime_error",
        record,
        status: "retryable_failed",
        supabaseAdmin: admin.client,
      }).catch(() => undefined);
    }
  }
  return { claimed: records.length, completed: delivered };
}
