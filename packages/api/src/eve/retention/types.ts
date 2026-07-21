export const EVE_ARTIFACT_KINDS = [
  "replay",
  "debug",
  "gateway_telemetry",
] as const;
export type EveArtifactKind = (typeof EVE_ARTIFACT_KINDS)[number];

export const EVE_RETENTION_HOLD_TYPES = ["incident", "legal"] as const;
export type EveRetentionHoldType = (typeof EVE_RETENTION_HOLD_TYPES)[number];

export const EVE_RETENTION_SCOPE_TYPES = [
  "artifact",
  "category",
  "audit_event",
  "run_summary",
] as const;
export type EveRetentionScopeType = (typeof EVE_RETENTION_SCOPE_TYPES)[number];

export interface EveRetentionCategory {
  category: string;
  retentionDays: number;
  metadataOnly: boolean;
  description: string;
}

export interface EveReplayArtifact {
  id: string;
  runId?: string;
  category: string;
  artifactKind: EveArtifactKind;
  redactedSummary: string;
  contentType?: string;
  byteSize?: number;
  sha256?: string;
  status: "upload_pending" | "available" | "delete_pending" | "expired";
  expiresAt: string;
  createdAt: string;
}

export interface EveRetentionHold {
  id: string;
  holdType: EveRetentionHoldType;
  scopeType: EveRetentionScopeType;
  targetId: string;
  reason: string;
  status: "active" | "cleared";
  createdAt: string;
  clearedAt?: string;
}

export interface EveRetentionLifecycleEvent {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: Record<string, unknown>;
  createdAt: string;
}

export interface EveRetentionAdminView {
  categories: EveRetentionCategory[];
  artifacts: EveReplayArtifact[];
  holds: EveRetentionHold[];
  lifecycle: EveRetentionLifecycleEvent[];
}
