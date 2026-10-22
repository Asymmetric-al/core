/**
 * Phase 18 D17 pre-production document-cutover environment assertion.
 *
 * These contracts implement the `P18-D17-ENV-GATE` obligation from the Phase 18
 * decision/test traceability register: a destructive document cutover may only
 * be authorized by a server-authoritative, read-only assessment that proves the
 * target environment is pre-production and carries no real tenant data,
 * irreplaceable artifacts, or external reliance. Anything unknown, unchecked,
 * or indeterminate stops the line.
 *
 * The module is evidence-only. It has no mutation capability against the
 * inspected database or object store, and a future destructive ticket must
 * consume the proof through its own separately authorized path.
 */

/**
 * Version 2 (#2067) replaces the self-declared `attestation` with
 * non-authorizing provenance (`recordedBy`, `proofPath`) and renames the
 * whole-proof digest to `digest`.
 */
export const DOCUMENT_CUTOVER_PROOF_SCHEMA_VERSION = "2";

export const DOCUMENT_CUTOVER_TOOL_VERSION = "1.0.0";

/**
 * Bounded freshness rule (Phase 18 contract): an assessment must be approved
 * within this window, and a clean proof only authorizes work within the proof
 * window. A stale proof is never silently reused; the assessment reruns.
 */
export const DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS = 60 * 60 * 1000;
export const DOCUMENT_CUTOVER_PROOF_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Repository directory for committed proofs (#2067 Q4a). Each run writes a new
 * `<ISO>-<proofId>.json` file here, never overwriting an existing one, and the
 * file is committed through a PR. The owner's approving review of that PR is
 * the go/no-go approval of record; nothing inside the proof authorizes work.
 */
export const DOCUMENT_CUTOVER_PROOFS_DIR = "docs/ops/document-cutover/proofs";

/** Repo-committed owner and non-production project allowlist (#2067 Q6). */
export const DOCUMENT_CUTOVER_ALLOWLIST_PATH =
  "docs/ops/document-cutover/allowlist.json";

export const DOCUMENT_CUTOVER_OUTCOMES = [
  "clean_preproduction_proof",
  "stop_the_line",
] as const;
export type DocumentCutoverOutcome = (typeof DOCUMENT_CUTOVER_OUTCOMES)[number];

export const DOCUMENT_CUTOVER_SURFACE_KINDS = [
  "database_table",
  "storage_location",
  "route",
  "background_job",
  "configuration",
  "prototype_test",
  "external_reference",
  "user_account",
  "report",
  "integration",
] as const;
export type DocumentCutoverSurfaceKind =
  (typeof DOCUMENT_CUTOVER_SURFACE_KINDS)[number];

export const DOCUMENT_CUTOVER_BLOCKING_CODES = [
  "production_classification",
  "unknown_environment_classification",
  "environment_identity_mismatch",
  "environment_resolution_failed",
  "tenant_data_present",
  "user_data_present",
  "rows_present",
  "storage_objects_present",
  "external_reference_present",
  "retained_history_present",
  "active_job_present",
  "report_present",
  "integration_present",
  "detector_error",
  "detector_timeout",
  "permission_denied",
  "unknown_schema",
  "detector_incomplete",
  "plan_invalid",
  "plan_surface_without_detector",
  "detector_without_plan_surface",
  "procedure_missing",
  "procedure_unpinned",
  "procedure_digest_mismatch",
  "owner_missing",
  "approval_invalid",
  "assessment_stale",
  "assessment_incomplete",
] as const;
export type DocumentCutoverBlockingCode =
  (typeof DOCUMENT_CUTOVER_BLOCKING_CODES)[number];

/**
 * Reliance count keys whose non-zero value always blocks the cutover. Every
 * detector reports observations under these names so the outcome derivation
 * never has to guess which numbers matter.
 */
export const DOCUMENT_CUTOVER_RELIANCE_COUNT_KEYS = [
  "tenants",
  "users",
  "rows",
  "objects",
  "externalReferences",
  "retainedHistory",
  "activeJobs",
  "reports",
  "integrations",
] as const;
export type DocumentCutoverRelianceCountKey =
  (typeof DOCUMENT_CUTOVER_RELIANCE_COUNT_KEYS)[number];

export type DocumentCutoverProductionClassification =
  "production" | "protected_non_production" | "non_production" | "unknown";

export interface DocumentCutoverEnvironmentIdentity {
  /** Canonical label, e.g. "local", "preview", "production". */
  environmentLabel: string;
  productionClassification: DocumentCutoverProductionClassification;
  /** Database/project identity, e.g. a Supabase project ref or local host. */
  databaseProjectId: string;
  /** Object-store identity, e.g. the storage host serving artifact objects. */
  storageIdentity: string;
  /**
   * Latest migration version applied to the target database, read from its
   * migrations table (never from the checkout).
   */
  schemaVersion: string;
  /** Git commit or equivalent code identity for the assessment run. */
  codeVersion: string;
  /** Hosted deployment identity when one exists. */
  deploymentVersion?: string;
}

export type DestructiveCutoverPlanAction =
  | "drop_table"
  | "delete_objects"
  | "remove_route"
  | "remove_job"
  | "remove_configuration"
  | "remove_test"
  | "sever_external_reference"
  | "sever_integration"
  | "remove_reports"
  | "assert_no_reliance";

export interface DestructiveCutoverPlanSurface {
  surfaceKind: DocumentCutoverSurfaceKind;
  surfaceId: string;
  action: DestructiveCutoverPlanAction;
  description: string;
}

/**
 * The exact destructive plan under assessment. The proof authorizes only this
 * plan's digest; a different plan needs a fresh assessment.
 */
export interface DestructiveCutoverPlan {
  planId: string;
  planTitle: string;
  planVersion: string;
  surfaces: DestructiveCutoverPlanSurface[];
}

export interface DocumentCutoverSurfaceInspection {
  completeness: "complete" | "indeterminate";
  relianceCounts?: Partial<Record<DocumentCutoverRelianceCountKey, number>>;
  inventoryFindings?: Record<string, boolean | number | string>;
  /** Raw external references; the assessment redacts them before recording. */
  externalReferences?: string[];
  /** The query or detector description that produced the result. */
  detectorQuery: string;
  failure?: { code: DocumentCutoverBlockingCode; message: string };
}

export interface DocumentCutoverDetector {
  detectorId: string;
  detectorVersion: string;
  surfaceKind: DocumentCutoverSurfaceKind;
  surfaceIds: readonly string[];
  inspectSurface(surfaceId: string): Promise<DocumentCutoverSurfaceInspection>;
}

export interface DocumentCutoverSurfaceEvidence {
  surfaceKind: DocumentCutoverSurfaceKind;
  surfaceId: string;
  detectorId: string;
  detectorVersion: string;
  completeness: "complete" | "indeterminate";
  relianceCounts: Partial<Record<DocumentCutoverRelianceCountKey, number>>;
  inventoryFindings: Record<string, boolean | number | string>;
  /** Redacted (origin/path-prefix only) external reference summaries. */
  externalReferenceSummaries: string[];
  detectorQuery: string;
  failure?: { code: DocumentCutoverBlockingCode; message: string };
  evidenceDigest: string;
}

export interface DocumentCutoverProcedureReference {
  /** Repository path or durable reference to the procedure document. */
  reference: string;
  /** Pinned version identifier (commit, tag, or document version). */
  pinnedVersion: string;
  present: boolean;
  digest: string;
}

export interface DocumentCutoverProcedureSet {
  resetRebuild: DocumentCutoverProcedureReference;
  rollbackBeforeFirstCanonicalWrite: DocumentCutoverProcedureReference;
}

export interface DocumentCutoverBlockingReason {
  code: DocumentCutoverBlockingCode;
  surfaceKind?: DocumentCutoverSurfaceKind;
  surfaceId?: string;
  explanation: string;
}

export interface DocumentCutoverAssessment {
  assessmentId: string;
  proofSchemaVersion: string;
  toolVersion: string;
  serializerVersion: string;
  environment: DocumentCutoverEnvironmentIdentity | null;
  startedAt: string;
  completedAt: string;
  status: "complete" | "incomplete";
  plan: DestructiveCutoverPlan;
  planDigest: string;
  procedures: DocumentCutoverProcedureSet;
  evidence: DocumentCutoverSurfaceEvidence[];
  proposedOutcome: DocumentCutoverOutcome;
  blockingReasons: DocumentCutoverBlockingReason[];
}

export interface DocumentCutoverOwnerIdentity {
  ownerId: string;
  ownerRole: string;
}

/**
 * The owner's recorded go/no-go decision. It is not the approval of record:
 * approval is the owner's approving GitHub review of the PR that commits the
 * proof (#2067 Q6a), which the destructive consumer (#961) checks.
 */
export interface DocumentCutoverDecisionRecord {
  approvalStatement: string;
  decision: "go" | "no_go";
}

export interface DocumentCutoverEnvironmentProof {
  proofId: string;
  proofSchemaVersion: string;
  toolVersion: string;
  serializerVersion: string;
  environment: DocumentCutoverEnvironmentIdentity | null;
  assessmentId: string;
  assessmentStartedAt: string;
  assessmentCompletedAt: string;
  assessmentStatus: "complete" | "incomplete";
  plan: DestructiveCutoverPlan;
  planDigest: string;
  procedures: DocumentCutoverProcedureSet;
  evidence: DocumentCutoverSurfaceEvidence[];
  owner: DocumentCutoverOwnerIdentity;
  approval: DocumentCutoverDecisionRecord;
  outcome: DocumentCutoverOutcome;
  blockingReasons: DocumentCutoverBlockingReason[];
  recordedAt: string;
  /** Non-authorizing provenance: who ran the command that recorded the proof. */
  recordedBy: string;
  /** Repo-relative path the proof is committed at. */
  proofPath: string;
  /**
   * SHA-256 over the canonical serialization of the proof without `digest`
   * (every other field, including `recordedBy` and `proofPath`, is covered).
   */
  digest: string;
}

export interface DocumentCutoverProofVerificationFailure {
  code:
    | "environment_mismatch"
    | "evidence_digest_mismatch"
    | "legacy_attestation"
    | "outcome_inconsistent"
    | "plan_coverage_mismatch"
    | "plan_digest_mismatch"
    | "plan_invalid"
    | "proof_digest_mismatch"
    | "proof_stale"
    | "schema_version_unsupported";
  detail: string;
}

export interface DocumentCutoverProofVerificationResult {
  valid: boolean;
  failures: DocumentCutoverProofVerificationFailure[];
}

/**
 * Append-only sink for newly recorded proofs. Implementations must reject any
 * attempt to overwrite an existing proof; reruns always append new records.
 * The durable record is the proof file committed under
 * `DOCUMENT_CUTOVER_PROOFS_DIR` through a PR, not any store.
 */
export interface DocumentCutoverProofStore {
  append(proof: DocumentCutoverEnvironmentProof): Promise<void>;
}
