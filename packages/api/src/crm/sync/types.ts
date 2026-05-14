import type { CrmIdentityConceptId } from "../identity/concepts";

export type CrmSyncDomain =
  | "people"
  | "companies"
  | "churches"
  | "households"
  | "tasks"
  | "notes"
  | "ministry_activities"
  | "relationship_commitments"
  | "gifts";

export type CrmSyncDirection =
  | "inbound"
  | "outbound"
  | "replay"
  | "reconciliation";

export type CrmSyncRecordStatus =
  | "received"
  | "queued"
  | "processing"
  | "processed"
  | "succeeded"
  | "ignored"
  | "failed"
  | "dead_letter"
  | "paused";

export type CrmOutboundJobType =
  | "create"
  | "update"
  | "delete"
  | "upsert"
  | "reconcile";

export type CrmReconciliationStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed";

export interface CrmSyncRuntimeConfig {
  inboundEnabled: boolean;
  outboundEnabled: boolean;
  replayEnabled: boolean;
  reconciliationEnabled: boolean;
  webhookToleranceSeconds: number;
}

export interface CrmSyncPauseState {
  tenantId: string;
  domain: CrmSyncDomain;
  inboundPaused: boolean;
  outboundPaused: boolean;
  replayPaused: boolean;
  pausedReason: string | null;
}

export interface TwentyWebhookEnvelope {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface ParsedTwentyWebhookEvent {
  eventType: string;
  objectName: string;
  action: string;
  domain: CrmSyncDomain | null;
  recordId: string | null;
  tenantId: string | null;
  timestamp: Date;
  eventKey: string;
  payloadHash: string;
  payload: TwentyWebhookEnvelope;
}

export interface StoredCrmWebhookEvent extends ParsedTwentyWebhookEvent {
  id: string;
  status: CrmSyncRecordStatus;
  duplicate: boolean;
}

export interface StoreCrmWebhookEventInput extends ParsedTwentyWebhookEvent {
  signatureHash: string;
}

export interface UpdateCrmWebhookEventInput {
  id: string;
  status: CrmSyncRecordStatus;
  processAttempts?: number;
  ignoredReason?: string | null;
  lastError?: string | null;
  processedAt?: string | null;
  replayedAt?: string | null;
  replayCount?: number;
}

export interface CrmOutboundJob {
  id: string;
  tenantId: string;
  domain: CrmSyncDomain;
  jobType: CrmOutboundJobType;
  twentyObjectName: string;
  sourceEntityType: CrmIdentityConceptId | null;
  sourceEntityId: string | null;
  crmRecordLinkId: string | null;
  idempotencyKey: string;
  status: CrmSyncRecordStatus;
  attemptCount: number;
  maxAttempts: number;
  payload: Record<string, unknown>;
  resultSummary: Record<string, unknown>;
  lastError: string | null;
}

export interface RecordCrmOutboundSuccessInput {
  job: CrmOutboundJob;
  twentyRecordId: string | null;
  resultSummary: Record<string, unknown>;
}

export interface RecordCrmOutboundFailureInput {
  job: CrmOutboundJob;
  status: Extract<CrmSyncRecordStatus, "failed" | "dead_letter">;
  error: string;
}

export interface EnqueueCrmOutboundJobInput {
  tenantId: string;
  domain: CrmSyncDomain;
  jobType: CrmOutboundJobType;
  twentyObjectName: string;
  sourceEntityType?: CrmIdentityConceptId | null;
  sourceEntityId?: string | null;
  crmRecordLinkId?: string | null;
  idempotencyKey?: string | null;
  payload: Record<string, unknown>;
  maxAttempts?: number;
}

export interface CrmSyncLogInput {
  tenantId: string | null;
  direction: CrmSyncDirection;
  domain: CrmSyncDomain | null;
  status: CrmSyncRecordStatus;
  sourceTable: string;
  sourceId: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface CrmReconciliationFinding {
  id: string;
  reason: string;
  details?: Record<string, unknown>;
}

export interface CrmReconciliationSnapshot {
  orphanLinks: CrmReconciliationFinding[];
  staleProjections: CrmReconciliationFinding[];
  stalledJobs: CrmReconciliationFinding[];
  duplicateCandidates: CrmReconciliationFinding[];
  failedWebhooks: CrmReconciliationFinding[];
}

export interface CrmReconciliationRun {
  id: string;
  tenantId: string | null;
  domain: CrmSyncDomain | null;
  reconciliationType: string;
  status: CrmReconciliationStatus;
  checkedCounts: Record<string, number>;
  findings: CrmReconciliationSnapshot;
  lastError: string | null;
}
