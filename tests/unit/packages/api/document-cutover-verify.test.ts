import { describe, expect, it } from "vitest";

import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
} from "./document-cutover-test-fixture";
import {
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  canonicalStringify,
  digestCanonicalValue,
  recordDocumentCutoverApproval,
  verifyDocumentCutoverEnvironmentProof,
} from "../../../../packages/api/src/document-cutover";

import type { DocumentCutoverEnvironmentProof } from "../../../../packages/api/src/document-cutover";

async function cleanProof(): Promise<DocumentCutoverEnvironmentProof> {
  const assessment = await assessDocumentCutoverEnvironment(
    buildAssessmentInput(new DocumentEnvironmentFixture()),
  );
  return recordDocumentCutoverApproval({
    assessment,
    owner: { ownerId: "owner-blake", ownerRole: "platform_owner" },
    approval: {
      approverId: "approver-blake",
      approvalStatement: "Approved for the exact plan digest.",
      decision: "go",
    },
    attestation: { attestedBy: "test-suite", attestationContext: "unit" },
    store: new InMemoryDocumentCutoverProofStore(),
  });
}

describe("canonical serialization and digests", () => {
  it("produces identical digests for logically identical values regardless of key order", async () => {
    const left = { b: 2, a: 1, nested: { y: [1, 2], x: "v" } };
    const right = { a: 1, nested: { x: "v", y: [1, 2] }, b: 2 };

    expect(canonicalStringify(left)).toBe(canonicalStringify(right));
    expect(await digestCanonicalValue(left)).toBe(
      await digestCanonicalValue(right),
    );
  });

  it("produces a different digest for any semantic change", async () => {
    const base = { a: 1, b: [1, 2, 3] };
    expect(await digestCanonicalValue(base)).not.toBe(
      await digestCanonicalValue({ a: 1, b: [1, 2, 4] }),
    );
    expect(await digestCanonicalValue(base)).not.toBe(
      await digestCanonicalValue({ a: 1, b: [1, 2, 3], c: null }),
    );
  });

  it("pins a deterministic digest vector so serializer changes are caught", async () => {
    expect(
      await digestCanonicalValue({ outcome: "clean_preproduction_proof" }),
    ).toBe(
      await digestCanonicalValue({ outcome: "clean_preproduction_proof" }),
    );
    // A stable, precomputed vector: sha256 of {"a":1}
    expect(await digestCanonicalValue({ a: 1 })).toBe(
      "015abd7f5cc57a2dd94b7590f04ad8084273905ee33ec5cebeae62276a97f862",
    );
  });
});

describe("verifyDocumentCutoverEnvironmentProof", () => {
  it("verifies an untouched proof", async () => {
    const proof = await cleanProof();
    expect(await verifyDocumentCutoverEnvironmentProof(proof)).toEqual({
      valid: true,
      failures: [],
    });
  });

  it("fails when one byte of the plan changes", async () => {
    const proof = structuredClone(await cleanProof());
    proof.plan.surfaces[0].surfaceId = `${proof.plan.surfaces[0].surfaceId}x`;

    const result = await verifyDocumentCutoverEnvironmentProof(proof);
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "plan_digest_mismatch",
    );
  });

  it("fails when one byte of any evidence record changes", async () => {
    const proof = structuredClone(await cleanProof());
    proof.evidence[3].detectorQuery = `${proof.evidence[3].detectorQuery} `;

    const result = await verifyDocumentCutoverEnvironmentProof(proof);
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "evidence_digest_mismatch",
    );
  });

  it("fails when the procedure references, owner, outcome, or approval change", async () => {
    const mutations: Array<(proof: DocumentCutoverEnvironmentProof) => void> = [
      (proof) => {
        proof.procedures.resetRebuild.pinnedVersion = "2";
      },
      (proof) => {
        proof.owner.ownerId = "someone-else";
      },
      (proof) => {
        proof.approval.approvalStatement = "reworded";
      },
      (proof) => {
        proof.recordedAt = new Date(0).toISOString();
      },
    ];

    for (const mutate of mutations) {
      const proof = structuredClone(await cleanProof());
      mutate(proof);
      const result = await verifyDocumentCutoverEnvironmentProof(proof);
      expect(result.valid).toBe(false);
      expect(result.failures.map((failure) => failure.code)).toContain(
        "proof_digest_mismatch",
      );
    }
  });

  it("rejects a forged clean proof whose digests are consistent but whose content is unsafe", async () => {
    const proof = structuredClone(await cleanProof());

    // Forge: inject reliance, then recompute every digest so byte checks pass.
    const forgedEvidenceBody = {
      surfaceKind: proof.evidence[0].surfaceKind,
      surfaceId: proof.evidence[0].surfaceId,
      detectorId: proof.evidence[0].detectorId,
      detectorVersion: proof.evidence[0].detectorVersion,
      completeness: proof.evidence[0].completeness,
      relianceCounts: { rows: 12, tenants: 3 },
      inventoryFindings: proof.evidence[0].inventoryFindings,
      externalReferenceSummaries: proof.evidence[0].externalReferenceSummaries,
      detectorQuery: proof.evidence[0].detectorQuery,
      failure: undefined,
    };
    proof.evidence[0] = {
      ...forgedEvidenceBody,
      evidenceDigest: await digestCanonicalValue(forgedEvidenceBody),
    };
    const { proofDigest: _ignored, ...body } = proof;
    proof.proofDigest = await digestCanonicalValue(body);

    const result = await verifyDocumentCutoverEnvironmentProof(proof);
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "outcome_inconsistent",
    );
  });

  it("rejects unsupported proof schema versions", async () => {
    const proof = structuredClone(await cleanProof());
    proof.proofSchemaVersion = "999";

    const result = await verifyDocumentCutoverEnvironmentProof(proof);
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "schema_version_unsupported",
    );
  });
});
