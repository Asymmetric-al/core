import { digestCanonicalValue } from "./canonical";
import { digestDestructiveCutoverPlan } from "./plan";
import { DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS } from "./types";

import type {
  DocumentCutoverAssessment,
  DocumentCutoverAttestation,
  DocumentCutoverEnvironmentProof,
  DocumentCutoverOwnerIdentity,
  DocumentCutoverProofStore,
  DocumentCutoverSurfaceEvidence,
} from "./types";

export type DocumentCutoverApprovalErrorCode =
  | "approval_invalid"
  | "assessment_stale"
  | "assessment_tampered"
  | "owner_missing"
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

export interface RecordDocumentCutoverApprovalInput {
  assessment: DocumentCutoverAssessment;
  owner: DocumentCutoverOwnerIdentity;
  approval: {
    approverId: string;
    approvalStatement: string;
    decision: "go" | "no_go";
  };
  attestation: DocumentCutoverAttestation;
  store: DocumentCutoverProofStore;
  now?: () => Date;
  generateId?: () => string;
  maxAssessmentAgeMs?: number;
}

async function verifyAssessmentIntegrity(
  assessment: DocumentCutoverAssessment,
): Promise<void> {
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
    throw new DocumentCutoverApprovalError(
      "unsafe_assessment",
      "Approval rejected: the assessment is stopped or incomplete, and approval cannot override evidence.",
    );
  }

  const unsafeEvidence = assessment.evidence.find(
    (item: DocumentCutoverSurfaceEvidence) =>
      item.completeness !== "complete" ||
      Object.values(item.relianceCounts).some(
        (count) => typeof count === "number" && count > 0,
      ),
  );
  if (unsafeEvidence) {
    throw new DocumentCutoverApprovalError(
      "unsafe_assessment",
      `Approval rejected: ${unsafeEvidence.surfaceKind}:${unsafeEvidence.surfaceId} carries reliance or indeterminate evidence.`,
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
  if (
    !input.approval.approverId.trim() ||
    !input.approval.approvalStatement.trim()
  ) {
    throw new DocumentCutoverApprovalError(
      "approval_invalid",
      "An explicit approver identity and approval statement are required.",
    );
  }

  await verifyAssessmentIntegrity(input.assessment);

  if (input.approval.decision === "go") {
    const ageMs =
      recordedAt.getTime() - Date.parse(input.assessment.completedAt);
    requireCleanAssessment(input.assessment, ageMs, maxAgeMs);
  }

  const outcome =
    input.approval.decision === "go"
      ? "clean_preproduction_proof"
      : "stop_the_line";

  const body: Omit<DocumentCutoverEnvironmentProof, "proofDigest"> = {
    proofId: generateId(),
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
    owner: input.owner,
    approval: {
      approverId: input.approval.approverId,
      approvedAt: recordedAt.toISOString(),
      approvalStatement: input.approval.approvalStatement,
      decision: input.approval.decision,
    },
    outcome,
    blockingReasons: input.assessment.blockingReasons,
    attestation: input.attestation,
    recordedAt: recordedAt.toISOString(),
  };

  const proof: DocumentCutoverEnvironmentProof = {
    ...body,
    proofDigest: await digestCanonicalValue(body),
  };

  await input.store.append(proof);
  return proof;
}
