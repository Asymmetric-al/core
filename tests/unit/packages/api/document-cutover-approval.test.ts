import { describe, expect, it } from "vitest";

import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
} from "./document-cutover-test-fixture";
import {
  DocumentCutoverApprovalError,
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
  verifyDocumentCutoverEnvironmentProof,
} from "../../../../packages/api/src/document-cutover";

import type { DocumentCutoverAssessment } from "../../../../packages/api/src/document-cutover";

const OWNER = { ownerId: "owner-blake", ownerRole: "platform_owner" };
const ATTESTATION = {
  attestedBy: "test-suite",
  attestationContext: "unit",
};
const AUTHORIZATION = {
  allowedOwnerIds: [OWNER.ownerId],
  allowedApproverIds: ["approver-blake"],
};

function goApproval() {
  return {
    approverId: "approver-blake",
    approvalStatement:
      "I approve the destructive plan digest named by this clean assessment.",
    decision: "go" as const,
  };
}

async function cleanAssessment(): Promise<DocumentCutoverAssessment> {
  return assessDocumentCutoverEnvironment(
    buildAssessmentInput(new DocumentEnvironmentFixture()),
  );
}

async function stoppedAssessment(): Promise<DocumentCutoverAssessment> {
  const fixture = new DocumentEnvironmentFixture();
  fixture.seedRow("pdf_templates", { id: "t1", tenant_id: "tenant-1" });
  return assessDocumentCutoverEnvironment(buildAssessmentInput(fixture));
}

describe("recordDocumentCutoverApproval", () => {
  it("yields clean proof only after an authorized owner approves the exact plan digest", async () => {
    const assessment = await cleanAssessment();
    const store = new InMemoryDocumentCutoverProofStore();

    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: OWNER,
      approval: goApproval(),
      attestation: ATTESTATION,
      authorization: AUTHORIZATION,
      store,
    });

    expect(proof.outcome).toBe("clean_preproduction_proof");
    expect(proof.planDigest).toBe(assessment.planDigest);
    expect(proof.owner).toEqual(OWNER);
    expect(proof.approval.decision).toBe("go");
    expect(proof.approval.approvedAt).toBeTruthy();
    expect(proof.proofDigest).toMatch(/^[0-9a-f]{64}$/);

    const verification = await verifyDocumentCutoverEnvironmentProof(proof);
    expect(verification).toEqual({ valid: true, failures: [] });

    expect(await store.getById(proof.proofId)).toEqual(proof);
  });

  it("rejects go approval of a stopped assessment server-side even if the caller claims authorization", async () => {
    const assessment = await stoppedAssessment();
    const store = new InMemoryDocumentCutoverProofStore();

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store,
      }),
    ).rejects.toMatchObject({
      name: "DocumentCutoverApprovalError",
      code: "unsafe_assessment",
    });

    expect(await store.list()).toEqual([]);
  });

  it("rejects go approval of an incomplete assessment", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        resolveEnvironment: async () => {
          throw new Error("unreachable");
        },
      }),
    );

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toMatchObject({ code: "unsafe_assessment" });
  });

  it("rejects a stale assessment beyond the freshness bound", async () => {
    const assessment = await cleanAssessment();

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
        now: () =>
          new Date(Date.parse(assessment.completedAt) + 61 * 60 * 1000),
      }),
    ).rejects.toMatchObject({ code: "assessment_stale" });
  });

  it("requires a named accountable owner and an explicit approval statement", async () => {
    const assessment = await cleanAssessment();
    const store = new InMemoryDocumentCutoverProofStore();

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: { ownerId: "  ", ownerRole: "platform_owner" },
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store,
      }),
    ).rejects.toMatchObject({ code: "owner_missing" });

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: { ...goApproval(), approvalStatement: "" },
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store,
      }),
    ).rejects.toMatchObject({ code: "approval_invalid" });
  });

  it("rejects an assessment whose evidence was altered after digesting", async () => {
    const assessment = await cleanAssessment();
    const tampered: DocumentCutoverAssessment = structuredClone(assessment);
    tampered.evidence[0] = {
      ...tampered.evidence[0],
      relianceCounts: { ...tampered.evidence[0].relianceCounts, rows: 0 },
      detectorQuery: "tampered query",
    };

    await expect(
      recordDocumentCutoverApproval({
        assessment: tampered,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toMatchObject({ code: "assessment_tampered" });
  });

  it("always records a no-go decision as an immutable stop-the-line proof", async () => {
    const assessment = await stoppedAssessment();
    const store = new InMemoryDocumentCutoverProofStore();

    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: OWNER,
      approval: {
        approverId: "approver-blake",
        approvalStatement: "Stopping the line: prototype tables carry rows.",
        decision: "no_go",
      },
      attestation: ATTESTATION,
      store,
    });

    expect(proof.outcome).toBe("stop_the_line");
    expect(proof.blockingReasons.length).toBeGreaterThan(0);

    const verification = await verifyDocumentCutoverEnvironmentProof(proof);
    expect(verification.valid).toBe(true);
  });

  it("keeps earlier proofs immutable: reruns append new records and ids never collide", async () => {
    const assessment = await cleanAssessment();
    const store = new InMemoryDocumentCutoverProofStore();

    const first = await recordDocumentCutoverApproval({
      assessment,
      owner: OWNER,
      approval: goApproval(),
      attestation: ATTESTATION,
      authorization: AUTHORIZATION,
      store,
    });
    const second = await recordDocumentCutoverApproval({
      assessment: await cleanAssessment(),
      owner: OWNER,
      approval: goApproval(),
      attestation: ATTESTATION,
      authorization: AUTHORIZATION,
      store,
    });

    expect(second.proofId).not.toBe(first.proofId);
    expect(await store.list()).toHaveLength(2);

    // Store rejects any overwrite of an existing proof id.
    await expect(store.append(first)).rejects.toThrow(/append-only/);

    // Mutating a read copy never affects the stored record.
    const copy = await store.getById(first.proofId);
    if (copy) copy.outcome = "stop_the_line";
    expect((await store.getById(first.proofId))?.outcome).toBe(
      "clean_preproduction_proof",
    );
  });

  it("throws instead of clean-proofing when an operator substitutes tenant or environment identity", async () => {
    const fixture = new DocumentEnvironmentFixture();
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(fixture, {
        expectedEnvironment: { databaseProjectId: "different-project" },
      }),
    );

    expect(assessment.proposedOutcome).toBe("stop_the_line");
    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toBeInstanceOf(DocumentCutoverApprovalError);
  });
});

describe("approval re-derives safety from primitive evidence", () => {
  it("rejects a forged assessment that claims clean over a production classification", async () => {
    const assessment = await cleanAssessment();
    const forged = structuredClone(assessment);
    if (forged.environment) {
      forged.environment.productionClassification = "production";
    }
    // Summary fields still claim clean; evidence digests remain valid.
    expect(forged.proposedOutcome).toBe("clean_preproduction_proof");
    expect(forged.blockingReasons).toEqual([]);

    await expect(
      recordDocumentCutoverApproval({
        assessment: forged,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toMatchObject({ code: "unsafe_assessment" });
  });

  it("rejects a forged assessment whose evidence no longer covers every plan surface", async () => {
    const assessment = await cleanAssessment();
    const forged = structuredClone(assessment);
    forged.evidence = forged.evidence.slice(1);

    await expect(
      recordDocumentCutoverApproval({
        assessment: forged,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toMatchObject({ code: "unsafe_assessment" });
  });

  it("rejects a forged assessment with a missing or unpinned procedure", async () => {
    const assessment = await cleanAssessment();
    const forged = structuredClone(assessment);
    forged.procedures.resetRebuild.present = false;

    await expect(
      recordDocumentCutoverApproval({
        assessment: forged,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toMatchObject({ code: "unsafe_assessment" });
  });

  it("fails closed on malformed or future assessment timestamps", async () => {
    const assessment = await cleanAssessment();

    const malformed = structuredClone(assessment);
    malformed.completedAt = "not-a-timestamp";
    await expect(
      recordDocumentCutoverApproval({
        assessment: malformed,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toMatchObject({ code: "assessment_stale" });

    const future = structuredClone(assessment);
    future.completedAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await expect(
      recordDocumentCutoverApproval({
        assessment: future,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: AUTHORIZATION,
        store: new InMemoryDocumentCutoverProofStore(),
      }),
    ).rejects.toMatchObject({ code: "assessment_stale" });
  });

  it("rejects go when owner/approver allowlists are missing, empty, or exclude the caller", async () => {
    const store = new InMemoryDocumentCutoverProofStore();
    const assessment = await cleanAssessment();

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        store,
      }),
    ).rejects.toMatchObject({ code: "approver_unauthorized" });

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: { allowedOwnerIds: [], allowedApproverIds: [] },
        store,
      }),
    ).rejects.toMatchObject({ code: "approver_unauthorized" });

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: { allowedOwnerIds: ["someone-else"] },
        store,
      }),
    ).rejects.toMatchObject({ code: "approver_unauthorized" });

    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: OWNER,
        approval: goApproval(),
        attestation: ATTESTATION,
        authorization: {
          allowedOwnerIds: [OWNER.ownerId],
          allowedApproverIds: ["someone-else"],
        },
        store,
      }),
    ).rejects.toMatchObject({ code: "approver_unauthorized" });

    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: OWNER,
      approval: goApproval(),
      attestation: ATTESTATION,
      authorization: AUTHORIZATION,
      store,
    });
    expect(proof.outcome).toBe("clean_preproduction_proof");
  });
});
