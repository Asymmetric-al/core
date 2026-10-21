/**
 * Acceptance tests for GitHub issue #2067 — freshness bounds (DC9).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 *
 * Pins DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS === 3_600_000 and
 * DOCUMENT_CUTOVER_PROOF_MAX_AGE_MS === 86_400_000 (Q2a, ratified) and checks
 * the approval boundary: rejected at 1h+1ms. The `--verify` 24h boundary is in
 * ./verify.acceptance.test.ts.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import { allowlistedOwner } from "./command-harness";
import {
  DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS,
  DOCUMENT_CUTOVER_PROOF_MAX_AGE_MS,
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
} from "../../../../packages/api/src/document-cutover";
import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
} from "../../packages/api/document-cutover-test-fixture";

const COMPLETED_AT = new Date("2026-10-20T12:00:00.000Z");

async function cleanAssessment() {
  return assessDocumentCutoverEnvironment(
    buildAssessmentInput(new DocumentEnvironmentFixture(), {
      now: () => COMPLETED_AT,
    }),
  );
}

/** Approve a clean assessment `ageMs` after it completed; resolves to the rejection (or null). */
async function approveAt(ageMs: number): Promise<unknown> {
  const assessment = await cleanAssessment();
  const owner = allowlistedOwner();
  // Loosely typed: the approval input shape changes in #2067 (no approver
  // flag, provenance instead of attestation); only the freshness rule is
  // under test here.
  const input = {
    assessment,
    owner: { ownerId: owner.id, ownerRole: owner.role },
    approval: {
      approverId: owner.id,
      approvalStatement: "Acceptance #2067 freshness boundary.",
      decision: "go",
    },
    authorization: {
      allowedOwnerIds: [owner.id],
      allowedApproverIds: [owner.id],
    },
    store: new InMemoryDocumentCutoverProofStore(),
    now: () => new Date(COMPLETED_AT.getTime() + ageMs),
  } as unknown as Parameters<typeof recordDocumentCutoverApproval>[0];
  try {
    await recordDocumentCutoverApproval(input);
    return null;
  } catch (error) {
    return error;
  }
}

function isStaleRejection(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { code, message } = error as { code?: unknown; message?: unknown };
  return (
    code === "assessment_stale" ||
    (typeof message === "string" && /stale|freshness/i.test(message))
  );
}

describe("issue #2067 — DC9 freshness bounds", () => {
  it("DC9: pins DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS === 3_600_000 (1h)", () => {
    expect(DOCUMENT_CUTOVER_ASSESSMENT_MAX_AGE_MS).toBe(3_600_000);
  });

  it("DC9: pins DOCUMENT_CUTOVER_PROOF_MAX_AGE_MS === 86_400_000 (24h)", () => {
    expect(DOCUMENT_CUTOVER_PROOF_MAX_AGE_MS).toBe(86_400_000);
  });

  it("precondition: the shared fixture's assessment is clean (covers every plan surface)", async () => {
    const assessment = await cleanAssessment();
    expect(assessment.proposedOutcome).toBe("clean_preproduction_proof");
  });

  it("DC9: approval is rejected as stale at 1h + 1ms after the assessment completed", async () => {
    expect(isStaleRejection(await approveAt(3_600_001))).toBe(true);
  });

  it("DC9 control: approval is not rejected as stale at exactly 1h", async () => {
    expect(isStaleRejection(await approveAt(3_600_000))).toBe(false);
  });
});
