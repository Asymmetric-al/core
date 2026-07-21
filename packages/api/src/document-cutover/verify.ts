import { digestCanonicalValue } from "./canonical";
import { digestDestructiveCutoverPlan } from "./plan";
import { DOCUMENT_CUTOVER_PROOF_SCHEMA_VERSION } from "./types";

import type {
  DocumentCutoverEnvironmentProof,
  DocumentCutoverProofVerificationFailure,
  DocumentCutoverProofVerificationResult,
} from "./types";

function checkCleanOutcomeConsistency(
  proof: DocumentCutoverEnvironmentProof,
): DocumentCutoverProofVerificationFailure[] {
  const failures: DocumentCutoverProofVerificationFailure[] = [];
  const inconsistent = (detail: string) => {
    failures.push({ code: "outcome_inconsistent", detail });
  };

  if (proof.blockingReasons.length > 0) {
    inconsistent("A clean proof cannot carry blocking reasons.");
  }
  if (proof.assessmentStatus !== "complete") {
    inconsistent("A clean proof requires a complete assessment.");
  }
  if (proof.approval.decision !== "go") {
    inconsistent("A clean proof requires an explicit go decision.");
  }
  if (!proof.owner.ownerId.trim() || !proof.approval.approverId.trim()) {
    inconsistent("A clean proof requires named owner and approver identities.");
  }
  if (
    proof.environment === null ||
    proof.environment.productionClassification !== "non_production"
  ) {
    inconsistent(
      "A clean proof requires an authoritative non-production classification.",
    );
  }
  for (const procedure of [
    proof.procedures.resetRebuild,
    proof.procedures.rollbackBeforeFirstCanonicalWrite,
  ]) {
    if (!procedure.present || !procedure.pinnedVersion.trim()) {
      inconsistent(
        `Procedure ${procedure.reference} must be present and version-pinned in a clean proof.`,
      );
    }
  }
  for (const evidence of proof.evidence) {
    if (evidence.completeness !== "complete" || evidence.failure) {
      inconsistent(
        `Evidence for ${evidence.surfaceKind}:${evidence.surfaceId} is not complete.`,
      );
    }
    for (const [key, count] of Object.entries(evidence.relianceCounts)) {
      if (typeof count === "number" && count > 0) {
        inconsistent(
          `Evidence for ${evidence.surfaceKind}:${evidence.surfaceId} reports ${count} ${key}.`,
        );
      }
    }
  }

  return failures;
}

/**
 * Detect any changed field or mismatched digest in a stored proof. Digest
 * recomputation catches byte-level tampering; the clean-outcome consistency
 * check additionally rejects a proof whose digests are internally consistent
 * but whose content could never legitimately produce a clean outcome.
 */
export async function verifyDocumentCutoverEnvironmentProof(
  proof: DocumentCutoverEnvironmentProof,
): Promise<DocumentCutoverProofVerificationResult> {
  const failures: DocumentCutoverProofVerificationFailure[] = [];

  if (proof.proofSchemaVersion !== DOCUMENT_CUTOVER_PROOF_SCHEMA_VERSION) {
    failures.push({
      code: "schema_version_unsupported",
      detail: `Proof schema version ${proof.proofSchemaVersion} is not supported by this verifier.`,
    });
    return { valid: false, failures };
  }

  const expectedPlanDigest = await digestDestructiveCutoverPlan(proof.plan);
  if (expectedPlanDigest !== proof.planDigest) {
    failures.push({
      code: "plan_digest_mismatch",
      detail: "The embedded plan does not match the recorded plan digest.",
    });
  }

  for (const evidence of proof.evidence) {
    const { evidenceDigest, ...body } = evidence;
    const expected = await digestCanonicalValue(body);
    if (expected !== evidenceDigest) {
      failures.push({
        code: "evidence_digest_mismatch",
        detail: `Evidence for ${evidence.surfaceKind}:${evidence.surfaceId} does not match its digest.`,
      });
    }
  }

  const { proofDigest, ...body } = proof;
  const expectedProofDigest = await digestCanonicalValue(body);
  if (expectedProofDigest !== proofDigest) {
    failures.push({
      code: "proof_digest_mismatch",
      detail: "The proof content does not match its whole-proof digest.",
    });
  }

  if (proof.outcome === "clean_preproduction_proof") {
    failures.push(...checkCleanOutcomeConsistency(proof));
  }

  return { valid: failures.length === 0, failures };
}
