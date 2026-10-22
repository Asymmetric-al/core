import { digestCanonicalValue } from "./canonical";
import {
  checkPlanEvidenceCoverage,
  digestDestructiveCutoverPlan,
  validateDestructiveCutoverPlan,
} from "./plan";
import { documentCutoverProofPath } from "./store";
import { DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS } from "./types";

import type {
  DocumentCutoverAssessment,
  DocumentCutoverEnvironmentProof,
  DocumentCutoverOwnerIdentity,
  DocumentCutoverProofStore,
} from "./types";

export type DocumentCutoverApprovalErrorCode =
  | "approval_invalid"
  | "assessment_stale"
  | "assessment_tampered"
  | "owner_missing"
  | "owner_unauthorized"
  | "unsafe_assessment";

/**
 * Server-side rejection of an approval attempt. Approval can only confirm a
 * fully clean assessment; it can never convert unsafe or incomplete evidence
 * into clean proof, no matter what the caller claims.
 */
export class DocumentCutoverApprovalError extends Error {
  readonly code: DocumentCutoverApprovalErrorCode;

  constructor(code: DocumentCutoverApprovalErrorCode, message: string) {
    super(message);
    this.name = "DocumentCutoverApprovalError";
    this.code = code;
  }
}

/** One allowlisted owner, as listed in docs/ops/document-cutover/allowlist.json. */
export interface DocumentCutoverAuthorizedOwner {
  id: string;
  role: string;
}

export interface RecordDocumentCutoverApprovalInput {
  assessment: DocumentCutoverAssessment;
  owner: DocumentCutoverOwnerIdentity;
  /**
   * The owner's decision. There is no approver: the approval of record is the
   * owner's approving review of the PR that commits the proof.
   */
  approval: {
    approvalStatement: string;
    decision: "go" | "no_go";
  };
  store: DocumentCutoverProofStore;
  /**
   * Owners from the repo-committed allowlist file, in its own
   * `owners: [{ id, role }]` shape. A `go` decision requires a non-empty list
   * containing the named owner with the same role, otherwise a caller could
   * self-declare authorization and mint a clean proof. A `no_go` may omit it
   * so stopped states stay auditable without a policy.
   */
  authorization?: {
    owners?: readonly DocumentCutoverAuthorizedOwner[];
    /**
     * @deprecated Id-only allowlist from before the owner-role check moved
     * into this library. Used only when `owners` is absent; it cannot check
     * the role, so new callers must pass `owners`. The #2067 operator gate
     * always passes `owners` from allowlist.json and never this field.
     * TODO(https://github.com/Asymmetric-al/core/issues/2066): remove once the
     * #2066 acceptance harness passes `owners` instead.
     */
    allowedOwnerIds?: readonly string[];
  };
  /**
   * Non-authorizing provenance: who ran the command, and the repo directory
   * the proof file is committed under (default `DOCUMENT_CUTOVER_PROOFS_DIR`).
   */
  provenance?: {
    recordedBy?: string;
    proofDirectory?: string;
  };
  now?: () => Date;
  generateId?: () => string;
  maxAssessmentAgeMs?: number;
}

async function verifyAssessmentIntegrity(
  assessment: DocumentCutoverAssessment,
): Promise<void> {
  const planIssues = validateDestructiveCutoverPlan(assessment.plan);
  if (planIssues.length > 0) {
    throw new DocumentCutoverApprovalError(
      "assessment_tampered",
      "The assessment carries a structurally invalid destructive plan.",
    );
  }

  const expectedPlanDigest = await digestDestructiveCutoverPlan(
    assessment.plan,
  );
  if (expectedPlanDigest !== assessment.planDigest) {
    throw new DocumentCutoverApprovalError(
      "assessment_tampered",
      "The assessment plan digest does not match the embedded plan.",
    );
  }

  for (const evidence of assessment.evidence) {
    const { evidenceDigest, ...body } = evidence;
    const expected = await digestCanonicalValue(body);
    if (expected !== evidenceDigest) {
      throw new DocumentCutoverApprovalError(
        "assessment_tampered",
        `Evidence for ${evidence.surfaceKind}:${evidence.surfaceId} does not match its digest.`,
      );
    }
  }
}

function unsafe(message: string): DocumentCutoverApprovalError {
  return new DocumentCutoverApprovalError(
    "unsafe_assessment",
    `Approval rejected: ${message}`,
  );
}

/**
 * Whether `owner` is allowlisted: id and role must both match one entry of
 * `authorization.owners`. Without `owners`, the deprecated id-only list is
 * consulted. Returns null when no allowlist was given at all.
 */
function ownerIsAllowlisted(
  owner: DocumentCutoverOwnerIdentity,
  authorization: RecordDocumentCutoverApprovalInput["authorization"],
): boolean | null {
  const owners = authorization?.owners;
  if (owners) {
    return owners.some(
      (entry) => entry.id === owner.ownerId && entry.role === owner.ownerRole,
    );
  }
  const ids = authorization?.allowedOwnerIds;
  return ids ? ids.includes(owner.ownerId) : null;
}

function hasNonEmptyAllowlist(
  authorization: RecordDocumentCutoverApprovalInput["authorization"],
): boolean {
  return (
    (authorization?.owners?.length ?? 0) > 0 ||
    (!authorization?.owners &&
      (authorization?.allowedOwnerIds?.length ?? 0) > 0)
  );
}

/**
 * A clean `go` must bind to the committed owner allowlist. A missing or empty
 * allowlist fails closed so self-declared owners cannot mint clean proofs, and
 * an allowlisted id with a different role is rejected.
 */
function requireAuthorizedGoOwner(
  owner: DocumentCutoverOwnerIdentity,
  authorization: RecordDocumentCutoverApprovalInput["authorization"],
): void {
  if (!hasNonEmptyAllowlist(authorization)) {
    throw new DocumentCutoverApprovalError(
      "owner_unauthorized",
      "A clean go requires a non-empty owner allowlist; self-declared owners are rejected.",
    );
  }
  if (ownerIsAllowlisted(owner, authorization) !== true) {
    throw new DocumentCutoverApprovalError(
      "owner_unauthorized",
      "The named owner and role are not in the owner allowlist.",
    );
  }
}

/**
 * Independently re-derive the clean verdict from the assessment's primitive
 * evidence instead of trusting caller-supplied summary fields. A caller who
 * clears `blockingReasons` or flips `proposedOutcome` on an unsafe assessment
 * still cannot mint a clean proof: the environment classification, procedure
 * pins, plan-surface coverage, and every reliance count are re-checked here.
 */
function requireCleanAssessment(
  assessment: DocumentCutoverAssessment,
  ageMs: number,
  maxAgeMs: number,
): void {
  if (
    assessment.proposedOutcome !== "clean_preproduction_proof" ||
    assessment.status !== "complete" ||
    assessment.blockingReasons.length > 0
  ) {
    throw unsafe(
      "the assessment is stopped or incomplete, and approval cannot override evidence.",
    );
  }

  if (assessment.environment === null) {
    throw unsafe("the target environment was never resolved.");
  }
  if (assessment.environment.productionClassification !== "non_production") {
    throw unsafe(
      `the target is classified ${assessment.environment.productionClassification}; only an authoritative non-production target can be approved.`,
    );
  }

  for (const procedure of [
    assessment.procedures.resetRebuild,
    assessment.procedures.rollbackBeforeFirstCanonicalWrite,
  ]) {
    if (
      !procedure.present ||
      !procedure.pinnedVersion.trim() ||
      !procedure.digest.trim()
    ) {
      throw unsafe(
        `the procedure at ${procedure.reference} is missing, unpinned, or undigested.`,
      );
    }
  }

  const coverageGaps = checkPlanEvidenceCoverage(
    assessment.plan,
    assessment.evidence,
  );
  if (coverageGaps.length > 0) {
    throw unsafe(
      `plan-surface evidence coverage is incomplete (${coverageGaps[0]}).`,
    );
  }

  const unsafeEvidence = assessment.evidence.find(
    (item) =>
      item.completeness !== "complete" ||
      item.failure !== undefined ||
      Object.values(item.relianceCounts).some(
        (count) => typeof count === "number" && count !== 0,
      ),
  );
  if (unsafeEvidence) {
    throw unsafe(
      `${unsafeEvidence.surfaceKind}:${unsafeEvidence.surfaceId} carries reliance or indeterminate evidence.`,
    );
  }

  if (!Number.isFinite(ageMs) || ageMs < 0) {
    throw new DocumentCutoverApprovalError(
      "assessment_stale",
      "Approval rejected: the assessment completion time is invalid or in the future.",
    );
  }
  if (ageMs > maxAgeMs) {
    throw new DocumentCutoverApprovalError(
      "assessment_stale",
      `Approval rejected: the assessment is ${ageMs}ms old, beyond the ${maxAgeMs}ms freshness bound. Rerun the assessment.`,
    );
  }
}

/**
 * Record the owner's go/no-go decision as an immutable, append-only proof.
 * The proof carries non-authorizing provenance (`recordedBy`, `proofPath`) and
 * a whole-proof `digest`; approval of record is the owner's PR review.
 *
 * - `go` is accepted only for a fully clean, fresh, untampered assessment and
 *   yields a `clean_preproduction_proof`.
 * - `no_go` is always recordable and yields a `stop_the_line` proof so the
 *   audit trail keeps the stopped state.
 */
export async function recordDocumentCutoverApproval(
  input: RecordDocumentCutoverApprovalInput,
): Promise<DocumentCutoverEnvironmentProof> {
  const now = input.now ?? (() => new Date());
  const generateId = input.generateId ?? (() => crypto.randomUUID());
  const maxAgeMs =
    input.maxAssessmentAgeMs ?? DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS;
  const recordedAt = now();

  if (!input.owner.ownerId.trim() || !input.owner.ownerRole.trim()) {
    throw new DocumentCutoverApprovalError(
      "owner_missing",
      "A named accountable owner (id and role) is required before any proof is recorded.",
    );
  }
  if (!input.approval.approvalStatement.trim()) {
    throw new DocumentCutoverApprovalError(
      "approval_invalid",
      "An explicit decision statement is required.",
    );
  }

  if (input.approval.decision === "go") {
    requireAuthorizedGoOwner(input.owner, input.authorization);
  } else if (ownerIsAllowlisted(input.owner, input.authorization) === false) {
    // Optional membership check for no_go when a policy is present.
    throw new DocumentCutoverApprovalError(
      "owner_unauthorized",
      "The named owner and role are not in the owner allowlist.",
    );
  }

  await verifyAssessmentIntegrity(input.assessment);

  if (input.approval.decision === "go") {
    const completedAtMs = Date.parse(input.assessment.completedAt);
    const ageMs = recordedAt.getTime() - completedAtMs;
    requireCleanAssessment(input.assessment, ageMs, maxAgeMs);
  }

  const outcome =
    input.approval.decision === "go"
      ? "clean_preproduction_proof"
      : "stop_the_line";

  const proofId = generateId();
  const recordedAtIso = recordedAt.toISOString();
  const body: Omit<DocumentCutoverEnvironmentProof, "digest"> = {
    proofId,
    proofSchemaVersion: input.assessment.proofSchemaVersion,
    toolVersion: input.assessment.toolVersion,
    serializerVersion: input.assessment.serializerVersion,
    environment: input.assessment.environment,
    assessmentId: input.assessment.assessmentId,
    assessmentStartedAt: input.assessment.startedAt,
    assessmentCompletedAt: input.assessment.completedAt,
    assessmentStatus: input.assessment.status,
    plan: input.assessment.plan,
    planDigest: input.assessment.planDigest,
    procedures: input.assessment.procedures,
    evidence: input.assessment.evidence,
    owner: { ownerId: input.owner.ownerId, ownerRole: input.owner.ownerRole },
    approval: {
      approvalStatement: input.approval.approvalStatement,
      decision: input.approval.decision,
    },
    outcome,
    blockingReasons: input.assessment.blockingReasons,
    recordedAt: recordedAtIso,
    recordedBy: input.provenance?.recordedBy?.trim() || "unattributed",
    proofPath: documentCutoverProofPath(
      recordedAtIso,
      proofId,
      input.provenance?.proofDirectory,
    ),
  };

  const proof: DocumentCutoverEnvironmentProof = {
    ...body,
    digest: await digestCanonicalValue(body),
  };

  await input.store.append(proof);
  return proof;
}
