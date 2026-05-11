import { sha256Hex } from "../webhooks/signature";

import type { CrmSyncStore } from "./store";
import type {
  CrmOutboundJob,
  CrmSyncRuntimeConfig,
  EnqueueCrmOutboundJobInput,
} from "./types";
import type { TwentyCoreClient } from "../client/core";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([key, childValue]) =>
        `${JSON.stringify(key)}:${stableStringify(childValue)}`,
    )
    .join(",")}}`;
}

export function buildCrmOutboundIdempotencyKey(
  input: Omit<EnqueueCrmOutboundJobInput, "idempotencyKey">,
): string {
  const source = [
    input.tenantId,
    input.domain,
    input.jobType,
    input.twentyObjectName,
    input.sourceEntityType ?? "no-source-type",
    input.sourceEntityId ?? "no-source-id",
    sha256Hex(stableStringify(input.payload)).slice(0, 24),
  ].join(":");

  return `crm:${source}`;
}

export async function enqueueCrmOutboundJob(
  store: CrmSyncStore,
  config: CrmSyncRuntimeConfig,
  input: EnqueueCrmOutboundJobInput,
): Promise<CrmOutboundJob> {
  const pause = await store.getSyncPause(input.tenantId, input.domain);
  const idempotencyKey =
    input.idempotencyKey ??
    buildCrmOutboundIdempotencyKey({
      tenantId: input.tenantId,
      domain: input.domain,
      jobType: input.jobType,
      twentyObjectName: input.twentyObjectName,
      sourceEntityType: input.sourceEntityType,
      sourceEntityId: input.sourceEntityId,
      crmRecordLinkId: input.crmRecordLinkId,
      payload: input.payload,
      maxAttempts: input.maxAttempts,
    });

  const job = await store.enqueueOutboundJob({
    ...input,
    idempotencyKey,
  });

  if (!config.outboundEnabled || pause.outboundPaused) {
    await store.updateOutboundJob(job.id, {
      status: "paused",
      lastError: pause.pausedReason ?? "outbound_sync_paused_or_disabled",
    });
    await store.appendSyncLog({
      tenantId: job.tenantId,
      direction: "outbound",
      domain: job.domain,
      status: "paused",
      sourceTable: "crm_outbound_jobs",
      sourceId: job.id,
      message: "CRM outbound job queued but paused.",
      details: {
        idempotencyKey,
        pausedReason: pause.pausedReason,
        outboundEnabled: config.outboundEnabled,
      },
    });
    return {
      ...job,
      status: "paused",
      lastError: pause.pausedReason ?? "outbound_sync_paused_or_disabled",
    };
  }

  return job;
}

function jobPath(job: CrmOutboundJob): string {
  if (
    (job.jobType === "update" || job.jobType === "delete") &&
    typeof job.payload.id === "string"
  ) {
    return `/${job.twentyObjectName}/${job.payload.id}`;
  }

  return `/${job.twentyObjectName}`;
}

function jobMethod(job: CrmOutboundJob) {
  if (job.jobType === "delete") return "DELETE";
  if (job.jobType === "update") return "PATCH";
  return "POST";
}

export async function processCrmOutboundJob(
  store: CrmSyncStore,
  client: TwentyCoreClient,
  config: CrmSyncRuntimeConfig,
  job: CrmOutboundJob,
): Promise<CrmOutboundJob> {
  const pause = await store.getSyncPause(job.tenantId, job.domain);
  if (!config.outboundEnabled || pause.outboundPaused) {
    await store.updateOutboundJob(job.id, {
      status: "paused",
      lastError: pause.pausedReason ?? "outbound_sync_paused_or_disabled",
    });
    return {
      ...job,
      status: "paused",
      lastError: pause.pausedReason ?? "outbound_sync_paused_or_disabled",
    };
  }

  const attemptCount = job.attemptCount + 1;
  await store.updateOutboundJob(job.id, {
    status: "processing",
    attemptCount,
  });

  try {
    const result = await client.request({
      body: job.jobType === "delete" ? undefined : job.payload,
      idempotencyKey: job.idempotencyKey,
      method: jobMethod(job),
      path: jobPath(job),
      retry: {
        retries: 2,
      },
    });

    await store.updateOutboundJob(job.id, {
      status: "succeeded",
      attemptCount,
      resultSummary: {
        result,
      },
      lastError: null,
    });
    await store.appendSyncLog({
      tenantId: job.tenantId,
      direction: "outbound",
      domain: job.domain,
      status: "succeeded",
      sourceTable: "crm_outbound_jobs",
      sourceId: job.id,
      message: "CRM outbound job succeeded.",
      details: {
        idempotencyKey: job.idempotencyKey,
      },
    });

    return {
      ...job,
      attemptCount,
      resultSummary: {
        result: result as Record<string, unknown>,
      },
      status: "succeeded",
      lastError: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CRM outbound job failed.";
    const status = attemptCount >= job.maxAttempts ? "dead_letter" : "failed";
    await store.updateOutboundJob(job.id, {
      status,
      attemptCount,
      lastError: message,
    });
    await store.appendSyncLog({
      tenantId: job.tenantId,
      direction: "outbound",
      domain: job.domain,
      status,
      sourceTable: "crm_outbound_jobs",
      sourceId: job.id,
      message: "CRM outbound job failed.",
      details: {
        attemptCount,
        error: message,
      },
    });

    return {
      ...job,
      attemptCount,
      status,
      lastError: message,
    };
  }
}
