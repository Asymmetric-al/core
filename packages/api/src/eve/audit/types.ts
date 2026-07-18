import type { UserRole } from "@asym/database/types";

export const EVE_AUDIT_IDENTITY_MODES = [
  "admin",
  "service",
  "github_bot",
] as const;

export type EveAuditIdentityMode = (typeof EVE_AUDIT_IDENTITY_MODES)[number];

export const EVE_AUDIT_RESULTS = [
  "blocked",
  "failed",
  "skipped",
  "started",
  "succeeded",
] as const;

export type EveAuditResult = (typeof EVE_AUDIT_RESULTS)[number];

declare const verifiedIdentity: unique symbol;

/**
 * An identity constructed from an authenticated route, service configuration,
 * or verified GitHub event boundary. Prompt/model/tool data cannot construct
 * this type without deliberately bypassing TypeScript at the server boundary.
 */
export interface EveVerifiedAuditIdentity {
  readonly [verifiedIdentity]: true;
  actorId: string;
  actorProfileId?: string;
  actorRole?: UserRole;
  identityMode: EveAuditIdentityMode;
  initiatorId: string;
  initiatorType: string;
  tenantId?: string;
}

export interface EveAuditPolicySnapshot {
  id: string;
  status: string;
  governanceStateVersion?: number;
}

export interface EveAuditDecisionSummaryInput {
  rationale: string;
  risk?: string;
  approval?: string;
  reversalOrFollowUp?: string;
}

export interface EveAuditEventInput {
  id?: string;
  runId?: string;
  identity: EveVerifiedAuditIdentity;
  policy: EveAuditPolicySnapshot;
  action: string;
  target?: string;
  result: EveAuditResult;
  toolName?: string;
  subagentName?: string;
  modelRole?: string;
  evidence: unknown;
  change: unknown;
  decision: EveAuditDecisionSummaryInput;
  debug?: Record<string, unknown>;
}

export interface EveAuditEventRecord {
  id: string;
  runId?: string;
  tenantId?: string;
  actorId: string;
  actorProfileId?: string;
  actorRole?: string;
  identityMode: EveAuditIdentityMode;
  initiatorType: string;
  initiatorId: string;
  policyId: string;
  policyStatus: string;
  governanceStateVersion?: number;
  action: string;
  target?: string;
  result: EveAuditResult;
  toolName?: string;
  subagentName?: string;
  modelRole: string;
  evidenceSummary: string;
  changeSummary: string;
  decisionSummary: string;
  debugMetadata: Record<string, unknown>;
  redactionVersion: "eve-audit-v1";
  createdAt: string;
}

export interface EveAuditStore {
  append(record: EveAuditEventRecord): Promise<void>;
}
