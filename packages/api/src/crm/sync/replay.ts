import type { CrmSyncStore } from "./store";
import type {
  CrmOutboundJob,
  CrmSyncRuntimeConfig,
  StoredCrmWebhookEvent,
} from "./types";

export async function replayInboundWebhookEvent(
  store: CrmSyncStore,
  config: CrmSyncRuntimeConfig,
  event: StoredCrmWebhookEvent,
): Promise<StoredCrmWebhookEvent> {
  if (!config.replayEnabled) {
    await store.updateInboundEvent({
      id: event.id,
      status: "paused",
      ignoredReason: "replay_disabled",
    });
    return {
      ...event,
      status: "paused",
    };
  }

  if (!event.tenantId || !event.domain) {
    await store.updateInboundEvent({
      id: event.id,
      status: "ignored",
      ignoredReason: "replay_missing_tenant_or_domain",
      processedAt: new Date().toISOString(),
    });
    return {
      ...event,
      status: "ignored",
    };
  }

  const pause = await store.getSyncPause(event.tenantId, event.domain);
  if (pause.replayPaused || pause.inboundPaused) {
    await store.updateInboundEvent({
      id: event.id,
      status: "paused",
      ignoredReason: pause.pausedReason ?? "replay_paused",
    });
    return {
      ...event,
      status: "paused",
    };
  }

  await store.applyInboundEvent(event);
  await store.updateInboundEvent({
    id: event.id,
    status: "processed",
    replayedAt: new Date().toISOString(),
    replayCount: 1,
    processedAt: new Date().toISOString(),
    lastError: null,
  });
  await store.appendSyncLog({
    tenantId: event.tenantId,
    direction: "replay",
    domain: event.domain,
    status: "processed",
    sourceTable: "crm_webhook_events",
    sourceId: event.id,
    message:
      "CRM inbound webhook event replayed without creating a duplicate event.",
    details: {
      eventKey: event.eventKey,
    },
  });

  return {
    ...event,
    status: "processed",
  };
}

export async function replayOutboundJob(
  store: CrmSyncStore,
  config: CrmSyncRuntimeConfig,
  job: CrmOutboundJob,
): Promise<CrmOutboundJob> {
  if (!config.replayEnabled) {
    await store.updateOutboundJob(job.id, {
      status: "paused",
      lastError: "replay_disabled",
    });
    return {
      ...job,
      status: "paused",
      lastError: "replay_disabled",
    };
  }

  const pause = await store.getSyncPause(job.tenantId, job.domain);
  if (pause.replayPaused || pause.outboundPaused) {
    const reason = pause.pausedReason ?? "replay_paused";
    await store.updateOutboundJob(job.id, {
      status: "paused",
      lastError: reason,
    });
    return {
      ...job,
      status: "paused",
      lastError: reason,
    };
  }

  await store.updateOutboundJob(job.id, {
    status: "queued",
    lastError: null,
  });
  await store.appendSyncLog({
    tenantId: job.tenantId,
    direction: "replay",
    domain: job.domain,
    status: "queued",
    sourceTable: "crm_outbound_jobs",
    sourceId: job.id,
    message:
      "CRM outbound job replayed by returning the original job to the queue.",
    details: {
      idempotencyKey: job.idempotencyKey,
    },
  });

  return {
    ...job,
    status: "queued",
    lastError: null,
  };
}
