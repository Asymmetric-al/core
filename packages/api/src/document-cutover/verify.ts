import { digestCanonicalValue } from "./canonical";
import {
  checkPlanEvidenceCoverage,
  digestDestructiveCutoverPlan,
  validateDestructiveCutoverPlan,
} from "./plan";
import {
  DOCUMENT_CUTOVER_PROOF_MAX_AGE_MS,
  DOCUMENT_CUTOVER_PROOF_SCHEMA_VERSION,
} from "./types";

import type {
  DocumentCutoverEnvironmentIdentity,
  DocumentCutoverEnvironmentProof,
  DocumentCutoverProofVerificationFailure,
  DocumentCutoverProofVerificationResult,
} from "./types";

/** The identity fields `--verify` compares against the current target. */
export const DOCUMENT_CUTOVER_VERIFIED_ENVIRONMENT_FIELDS = [
  "environmentLabel",
  "databaseProjectId",
  "storageIdentity",
  "schemaVersion",
] as const;

export type DocumentCutoverTargetIdentity = Pick<
  DocumentCutoverEnvironmentIdentity,
  (typeof DOCUMENT_CUTOVER_VERIFIED_ENVIRONMENT_FIELDS)[number]
>;

export interface VerifyDocumentCutoverProofOptions {
  now?: () => Date;
  /** Bounded freshness rule (from `recordedAt`); stale clean proofs fail. */
  maxProofAgeMs?: number;
  /**
   * The current target, resolved server-side at verification time. When
   * given, any difference from the proof's recorded environment fails.
   */
  currentTarget?: DocumentCutoverTargetIdentity;
}

/**
 * Legacy self-declared attestation fields (`cli:<os user>` / `git:<sha>`).
 * They never authorized anything, and a proof that still carries them is
 * rejected outright rather than trusted.
 */
const LEGACY_ATTESTATION_FIELDS = [
  "attestation",
  "attestedBy",
  "attestationContext",
] as const;

function checkLegacyAttestation(
  proof: DocumentCutoverEnvironmentProof,
): DocumentCutoverProofVerificationFailure[] {
  const record = proof as unknown as Record<string, unknown>;
  return LEGACY_ATTESTATION_FIELDS.filter((field) => field in record).map(
    (field) => ({
      code: "legacy_attestation",
      detail: `The proof carries a self-declared \`${field}\` attestation; only the owner's PR review of the committed proof approves it.`,
    }),
  );
}

function checkEnvironmentMatchesTarget(
  proof: DocumentCutoverEnvironmentProof,
  target: DocumentCutoverTargetIdentity,
): DocumentCutoverProofVerificationFailure[] {
  if (proof.environment === null) {
    return [
      {
        code: "environment_mismatch",
        detail: "The proof records no environment to compare with the target.",
      },
    ];
  }
  const recorded = proof.environment;
  return DOCUMENT_CUTOVER_VERIFIED_ENVIRONMENT_FIELDS.filter(
    (field) => recorded[field] !== target[field],
  ).map((field) => ({
    code: "environment_mismatch",
    detail: `The proof's ${field} (${recorded[field]}) differs from the current target (${target[field]}).`,
  }));
}

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
  if (!proof.owner.ownerId.trim() || !proof.owner.ownerRole.trim()) {
    inconsistent("A clean proof requires a named owner identity and role.");
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
    if (
      !procedure.present ||
      !procedure.pinnedVersion.trim() ||
      !procedure.digest.trim()
    ) {
      inconsistent(
        `Procedure ${procedure.reference} must be present, version-pinned, and content-digested in a clean proof.`,
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
      if (typeof count === "number" && count !== 0) {
        inconsistent(
          count < 0
            ? `Evidence for ${evidence.surfaceKind}:${evidence.surfaceId} reports impossible negative ${key} (${count}).`
            : `Evidence for ${evidence.surfaceKind}:${evidence.surfaceId} reports ${count} ${key}.`,
        );
      }
    }
  }

  return failures;
}

/**
 * Detect any changed field or mismatched digest in a stored proof. Digest
 * recomputation catches byte-level tampering; a legacy self-declared
 * attestation is rejected; with `currentTarget`, the recorded environment must
 * equal the target's; the clean-outcome checks
 * additionally reject a proof whose digests are internally consistent but
 * whose content could never legitimately produce a clean outcome — including
 * a proof whose evidence no longer covers every planned surface, and a clean
 * proof recorded outside the bounded freshness window.
 */
export async function verifyDocumentCutoverEnvironmentProof(
  proof: DocumentCutoverEnvironmentProof,
  options: VerifyDocumentCutoverProofOptions = {},
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

  const { digest, ...body } = proof;
  const expectedProofDigest = await digestCanonicalValue(body);
  if (expectedProofDigest !== digest) {
    failures.push({
      code: "proof_digest_mismatch",
      detail: "The proof content does not match its whole-proof digest.",
    });
  }

  failures.push(...checkLegacyAttestation(proof));

  if (options.currentTarget) {
    failures.push(
      ...checkEnvironmentMatchesTarget(proof, options.currentTarget),
    );
  }

  if (proof.outcome === "clean_preproduction_proof") {
    for (const issue of validateDestructiveCutoverPlan(proof.plan)) {
      failures.push({
        code: "plan_invalid",
        detail: issue.explanation,
      });
    }

    for (const gap of checkPlanEvidenceCoverage(proof.plan, proof.evidence)) {
      failures.push({
        code: "plan_coverage_mismatch",
        detail: `A clean proof must carry evidence for every planned surface: ${gap}.`,
      });
    }

    failures.push(...checkCleanOutcomeConsistency(proof));

    const now = (options.now ?? (() => new Date()))();
    const maxAgeMs = options.maxProofAgeMs ?? DOCUMENT_CUTOVER_PROOF_MAX_AGE_MS;
    const recordedAtMs = Date.parse(proof.recordedAt);
    const ageMs = now.getTime() - recordedAtMs;
    if (!Number.isFinite(recordedAtMs) || ageMs < 0 || ageMs > maxAgeMs) {
      failures.push({
        code: "proof_stale",
        detail: `A clean proof authorizes work only within ${maxAgeMs}ms of recording; this proof is stale, future-dated, or carries an invalid timestamp. Rerun the assessment.`,
      });
    }
  }

  return { valid: failures.length === 0, failures };
}
