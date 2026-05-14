import type { CrmSyncRuntimeConfig } from "./types";

type CrmSyncEnvKey =
  | "CRM_SYNC_INBOUND_ENABLED"
  | "CRM_SYNC_OUTBOUND_ENABLED"
  | "CRM_SYNC_REPLAY_ENABLED"
  | "CRM_SYNC_RECONCILIATION_ENABLED"
  | "CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS";

export type CrmSyncEnvInput = Partial<
  Record<CrmSyncEnvKey, boolean | number | string | undefined>
>;

const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

function normalizeBoolean(value: unknown): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value !== "string") return false;
  return value.trim().toLowerCase() === "true";
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }
  }

  return fallback;
}

export function resolveCrmSyncRuntimeConfig(
  envInput: CrmSyncEnvInput = {},
): CrmSyncRuntimeConfig {
  return {
    inboundEnabled: normalizeBoolean(envInput.CRM_SYNC_INBOUND_ENABLED),
    outboundEnabled: normalizeBoolean(envInput.CRM_SYNC_OUTBOUND_ENABLED),
    replayEnabled: normalizeBoolean(envInput.CRM_SYNC_REPLAY_ENABLED),
    reconciliationEnabled: normalizeBoolean(
      envInput.CRM_SYNC_RECONCILIATION_ENABLED,
    ),
    webhookToleranceSeconds: normalizePositiveInteger(
      envInput.CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS,
      DEFAULT_WEBHOOK_TOLERANCE_SECONDS,
    ),
  };
}
