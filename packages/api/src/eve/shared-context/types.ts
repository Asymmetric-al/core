import type { EveSpecialistId } from "../subagent-catalog/types";

export const EVE_SHARED_CONTEXT_CATEGORIES = [
  "pr_metadata",
  "issue_scope",
  "decision",
  "eval_status",
  "finding",
  "safe_page_context",
] as const;

export type EveSharedContextCategory =
  (typeof EVE_SHARED_CONTEXT_CATEGORIES)[number];

export const EVE_SHARED_CONTEXT_RISKS = [
  "low",
  "medium",
  "high",
  "protected",
] as const;

export type EveSharedContextRisk = (typeof EVE_SHARED_CONTEXT_RISKS)[number];

export const EVE_SHARED_CONTEXT_PROVENANCE_KINDS = [
  "repository",
  "github",
  "ci",
  "openspec",
  "eval",
  "admin_page",
  "inference",
] as const;

export type EveSharedContextProvenanceKind =
  (typeof EVE_SHARED_CONTEXT_PROVENANCE_KINDS)[number];

export type EveSharedContextRelationship =
  | "independent"
  | "supports"
  | "contradicts"
  | "supersedes";

export type EveSharedContextValue =
  | boolean
  | null
  | number
  | string
  | EveSharedContextValue[]
  | { [key: string]: EveSharedContextValue };

export interface EveSharedContextEvidence {
  digest?: string;
  kind: EveSharedContextProvenanceKind;
  reference: string;
}

export interface EveSharedContextWriteInput {
  category: EveSharedContextCategory;
  confidenceBps: number;
  evidence: EveSharedContextEvidence[];
  fieldPath: string;
  provenance: {
    kind: EveSharedContextProvenanceKind;
    reference: string;
  };
  relatedClaimIds: string[];
  relationship: EveSharedContextRelationship;
  risk: EveSharedContextRisk;
  schemaVersion: 1;
  value: EveSharedContextValue;
}

export interface EveSharedContextClaim extends EveSharedContextWriteInput {
  accountableRunId: string;
  createdAt: string;
  id: string;
  rootSessionId: string;
  sessionId: string;
  tenantId: string;
  writerSubagentId: EveSpecialistId;
}

export interface EveSharedContextConflict {
  claimIds: string[];
  createdAt: string;
  fieldPath: string;
  id: string;
  risk: EveSharedContextRisk;
  rootSessionId: string;
  tenantId: string;
}

export interface EveSharedContextResolution {
  conflictId: string;
  createdAt: string;
  evidence: EveSharedContextEvidence[];
  id: string;
  outcome: string;
  policyId: string;
  resolverActorId: string;
  selectedClaimIds: string[];
  tenantId: string;
}

export interface EveSharedContextSnapshot {
  claims: EveSharedContextClaim[];
  conflicts: Array<
    EveSharedContextConflict & { resolution?: EveSharedContextResolution }
  >;
  rootSessionId: string;
}

export interface EveSharedContextStore {
  appendClaim(input: {
    claim: EveSharedContextClaim;
    conflict?: EveSharedContextConflict;
  }): Promise<void>;
  appendResolution(resolution: EveSharedContextResolution): Promise<void>;
  loadConflict(input: { conflictId: string; tenantId: string }): Promise<
    | (EveSharedContextConflict & {
        resolution?: EveSharedContextResolution;
      })
    | null
  >;
  loadSnapshot(input: {
    rootSessionId: string;
    tenantId: string;
  }): Promise<EveSharedContextSnapshot>;
}
