/**
 * Acceptance tests for GitHub issue #2066 — tenant safety (DC5).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304}
 *
 * `--expect-project` / `--expect-env` are mismatch checks only; they never set
 * identity. A mismatch stops the run and any proof still carries the
 * server-resolved identity. The `--verify` environment-mismatch case is an
 * expected-fail (`it.fails`) linked to #2067, which owns that comparison.
 *
 * #2067 dependency: #2067 done criterion 8 requires the `it.fails` case below
 * (title prefix "#2067 verify-env-mismatch") to pass; #2067 flips it to `it`.
 * Keep the title prefix stable — #2067's acceptance suite locates it by name.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR
 * (except #2067 flipping `it.fails` to `it`, as its spec requires).
 */

import { describe, expect, it } from "vitest";

import {
  ACCEPTANCE_OWNER,
  LOCAL_TARGET_ENV,
  OTHER_TARGET_IDENTITY,
  buildCleanProof,
  runCommand,
  serializeProof,
  serverResolvedLocalIdentity,
  writeTempProofFile,
} from "./command-harness";
import {
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
} from "../../../../packages/api/src/document-cutover";
import {
  CLEAN_ENVIRONMENT,
  DocumentEnvironmentFixture,
  buildAssessmentInput,
  buildFixtureDetectors,
} from "../../packages/api/document-cutover-test-fixture";

const OPERATOR_PROJECT = "operatorsubstitutedproject";
const OPERATOR_ENV = "production";

describe("issue #2066 — DC5 tenant safety: caller-supplied identity cannot override server-resolved identity", () => {
  it.each([
    ["--expect-project", OPERATOR_PROJECT],
    ["--expect-env", OPERATOR_ENV],
  ])(
    "DC5: command — %s that disagrees with the resolved target stops the run and reports the server-resolved identity",
    async (flag, value) => {
      const store = new InMemoryDocumentCutoverProofStore();
      const resolved = serverResolvedLocalIdentity();

      const result = await runCommand({
        argv: [flag, value],
        env: LOCAL_TARGET_ENV,
        detectors: buildFixtureDetectors(new DocumentEnvironmentFixture()),
        store,
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stdout).toContain("environment_identity_mismatch");
      expect(result.stdout).toContain(`db=${resolved.databaseProjectId}`);
      expect(result.stdout).not.toContain(`db=${OPERATOR_PROJECT}`);
      for (const proof of await store.list()) {
        expect(proof.outcome).toBe("stop_the_line");
        expect(proof.environment?.databaseProjectId).toBe(
          resolved.databaseProjectId,
        );
        expect(proof.environment?.environmentLabel).toBe(
          resolved.environmentLabel,
        );
      }
    },
  );

  it("DC5: assessment + proof layer — a mismatching expectation stops the line and the proof's environment equals the server-resolved value", async () => {
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(new DocumentEnvironmentFixture(), {
        expectedEnvironment: {
          databaseProjectId: OPERATOR_PROJECT,
          environmentLabel: OPERATOR_ENV,
        },
      }),
    );

    expect(assessment.proposedOutcome).toBe("stop_the_line");
    expect(
      assessment.blockingReasons.filter(
        (reason) => reason.code === "environment_identity_mismatch",
      ),
    ).toHaveLength(2);
    expect(assessment.environment).toEqual(CLEAN_ENVIRONMENT);

    const store = new InMemoryDocumentCutoverProofStore();
    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: ACCEPTANCE_OWNER,
      approval: {
        approverId: "acceptance-approver",
        approvalStatement: "Acceptance #2066: recording the stopped state.",
        decision: "no_go",
      },
      attestation: {
        attestedBy: "acceptance-suite",
        attestationContext: "issue-2066",
      },
      store,
    });

    expect(proof.outcome).toBe("stop_the_line");
    expect(proof.environment).toEqual(CLEAN_ENVIRONMENT);
    expect(proof.environment?.databaseProjectId).not.toBe(OPERATOR_PROJECT);
    expect(proof.environment?.environmentLabel).not.toBe(OPERATOR_ENV);

    // A go on the mismatching assessment is rejected outright.
    await expect(
      recordDocumentCutoverApproval({
        assessment,
        owner: ACCEPTANCE_OWNER,
        approval: {
          approverId: "acceptance-approver",
          approvalStatement: "Acceptance #2066: attempted go.",
          decision: "go",
        },
        attestation: {
          attestedBy: "acceptance-suite",
          attestationContext: "issue-2066",
        },
        authorization: {
          allowedOwnerIds: [ACCEPTANCE_OWNER.ownerId],
          allowedApproverIds: ["acceptance-approver"],
        },
        store,
      }),
    ).rejects.toThrow();
  });

  // Linked to #2067 (which implements the --verify environment comparison in
  // verifyStoredProof). Flipped from `it.fails` to `it` by #2067.
  it("#2067 verify-env-mismatch: --verify rejects (exit non-zero) an otherwise valid clean proof recorded for a different environment than the target", async () => {
    const proof = await buildCleanProof(OTHER_TARGET_IDENTITY);
    const file = writeTempProofFile(serializeProof(proof));

    const result = await runCommand({
      argv: ["--verify", file],
      env: LOCAL_TARGET_ENV,
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).not.toBe(0);
  });
});
