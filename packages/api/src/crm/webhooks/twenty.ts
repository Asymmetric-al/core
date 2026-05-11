import { parseTwentyWebhookPayload } from "./payload";
import {
  TwentyWebhookSignatureError,
  verifyTwentyWebhookSignature,
} from "./signature";
import { resolveCrmSyncRuntimeConfig } from "../sync/config";

import type { CrmSyncEnvInput } from "../sync/config";
import type { CrmSyncStore } from "../sync/store";
import type { StoredCrmWebhookEvent } from "../sync/types";

export interface ReceiveTwentyWebhookOptions {
  rawBody: string;
  headers: Headers;
  secret?: string | null;
  env?: CrmSyncEnvInput;
  store: CrmSyncStore;
  now?: Date;
}

export type ReceiveTwentyWebhookResult =
  | {
      ok: true;
      eventId: string;
      status: StoredCrmWebhookEvent["status"] | "duplicate";
      duplicate: boolean;
      ignoredReason?: string;
    }
  | {
      ok: false;
      status: 400 | 401 | 409 | 500;
      error: string;
      code?: string;
    };

function signatureErrorStatus(
  error: TwentyWebhookSignatureError,
): ReceiveTwentyWebhookResult {
  return {
    ok: false,
    status: error.code === "missing_secret" ? 500 : 401,
    error: error.message,
    code: error.code,
  };
}

function isRelevantAction(action: string): boolean {
  return action === "created" || action === "updated" || action === "deleted";
}

async function markEvent(
  store: CrmSyncStore,
  event: StoredCrmWebhookEvent,
  status: StoredCrmWebhookEvent["status"],
  options?: {
    ignoredReason?: string | null;
    lastError?: string | null;
  },
): Promise<void> {
  await store.updateInboundEvent({
    id: event.id,
    status,
    ignoredReason: options?.ignoredReason,
    lastError: options?.lastError,
    processedAt:
      status === "processed" || status === "ignored"
        ? new Date().toISOString()
        : undefined,
  });
}

export async function receiveTwentyWebhook(
  options: ReceiveTwentyWebhookOptions,
): Promise<ReceiveTwentyWebhookResult> {
  const config = resolveCrmSyncRuntimeConfig(options.env);
  let verified;
  try {
    verified = verifyTwentyWebhookSignature({
      headers: options.headers,
      now: options.now,
      rawBody: options.rawBody,
      secret: options.secret,
      toleranceSeconds: config.webhookToleranceSeconds,
    });
  } catch (error) {
    if (error instanceof TwentyWebhookSignatureError) {
      return signatureErrorStatus(error);
    }
    throw error;
  }

  let parsed;
  try {
    parsed = parseTwentyWebhookPayload(options.rawBody, verified.timestamp);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      error:
        error instanceof Error
          ? error.message
          : "Invalid Twenty webhook payload.",
    };
  }

  const stored = await options.store.storeInboundEvent({
    ...parsed,
    signatureHash: verified.signatureHash,
  });

  if (stored.duplicate) {
    await options.store.appendSyncLog({
      tenantId: stored.tenantId,
      direction: "inbound",
      domain: stored.domain,
      status: "ignored",
      sourceTable: "crm_webhook_events",
      sourceId: stored.id,
      message: "Duplicate Twenty webhook delivery ignored.",
      details: {
        eventType: stored.eventType,
        eventKey: stored.eventKey,
      },
    });
    return {
      ok: true,
      eventId: stored.id,
      status: "duplicate",
      duplicate: true,
    };
  }

  if (!stored.domain || !isRelevantAction(stored.action)) {
    const ignoredReason = !stored.domain
      ? "unsupported_object"
      : "unsupported_action";
    await markEvent(options.store, stored, "ignored", { ignoredReason });
    await options.store.appendSyncLog({
      tenantId: stored.tenantId,
      direction: "inbound",
      domain: stored.domain,
      status: "ignored",
      sourceTable: "crm_webhook_events",
      sourceId: stored.id,
      message: "Twenty webhook event ignored.",
      details: {
        eventType: stored.eventType,
        ignoredReason,
      },
    });
    return {
      ok: true,
      eventId: stored.id,
      status: "ignored",
      duplicate: false,
      ignoredReason,
    };
  }

  if (!config.inboundEnabled) {
    await markEvent(options.store, stored, "queued", {
      ignoredReason: "inbound_sync_disabled",
    });
    return {
      ok: true,
      eventId: stored.id,
      status: "queued",
      duplicate: false,
      ignoredReason: "inbound_sync_disabled",
    };
  }

  if (!stored.tenantId) {
    await markEvent(options.store, stored, "failed", {
      lastError: "Twenty webhook payload did not include an Asym tenant id.",
    });
    return {
      ok: false,
      status: 409,
      error: "Twenty webhook payload did not include an Asym tenant id.",
    };
  }

  const pause = await options.store.getSyncPause(
    stored.tenantId,
    stored.domain,
  );
  if (pause.inboundPaused) {
    await markEvent(options.store, stored, "paused", {
      ignoredReason: pause.pausedReason ?? "inbound_sync_paused",
    });
    await options.store.appendSyncLog({
      tenantId: stored.tenantId,
      direction: "inbound",
      domain: stored.domain,
      status: "paused",
      sourceTable: "crm_webhook_events",
      sourceId: stored.id,
      message: "Twenty webhook event stored while inbound sync is paused.",
      details: {
        pausedReason: pause.pausedReason,
      },
    });
    return {
      ok: true,
      eventId: stored.id,
      status: "paused",
      duplicate: false,
      ignoredReason: pause.pausedReason ?? "inbound_sync_paused",
    };
  }

  try {
    await options.store.applyInboundEvent(stored);
    await markEvent(options.store, stored, "processed");
    await options.store.appendSyncLog({
      tenantId: stored.tenantId,
      direction: "inbound",
      domain: stored.domain,
      status: "processed",
      sourceTable: "crm_webhook_events",
      sourceId: stored.id,
      message: "Twenty webhook event processed.",
      details: {
        action: stored.action,
        eventType: stored.eventType,
        recordId: stored.recordId,
      },
    });
    return {
      ok: true,
      eventId: stored.id,
      status: "processed",
      duplicate: false,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process Twenty webhook event.";
    await markEvent(options.store, stored, "failed", { lastError: message });
    await options.store.appendSyncLog({
      tenantId: stored.tenantId,
      direction: "inbound",
      domain: stored.domain,
      status: "failed",
      sourceTable: "crm_webhook_events",
      sourceId: stored.id,
      message: "Twenty webhook event failed during processing.",
      details: {
        error: message,
      },
    });
    return {
      ok: false,
      status: 500,
      error: message,
    };
  }
}
