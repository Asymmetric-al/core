import { describe, expect, it } from "vitest";

import {
  buildFixtureContestInput,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  InMemoryRendererQualificationStore,
  freezeRendererQualificationCharter,
  recordRemediationCycle,
  sealCandidateSubmission,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  FrozenRendererQualificationCharter,
  RendererCandidateId,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

function charterPairWithConflictingManifests(): readonly [
  FrozenRendererQualificationCharter,
  FrozenRendererQualificationCharter,
] {
  const originalInput = buildFixtureContestInput();
  const conflictingInput = structuredClone(originalInput);
  conflictingInput.frozen_at = "2026-07-22T12:01:00.000Z";

  const original = freezeRendererQualificationCharter(originalInput);
  const conflicting = freezeRendererQualificationCharter(conflictingInput);
  expect(conflicting.charter_id).toBe(original.charter_id);
  expect(conflicting.charter_version).toBe(original.charter_version);
  expect(conflicting.manifest_digest).not.toBe(original.manifest_digest);
  return [original, conflicting];
}

function sealInitialSubmission(
  charter: FrozenRendererQualificationCharter,
  store: InMemoryRendererQualificationStore,
  candidateId: RendererCandidateId = "P18-R-P",
) {
  const actor =
    candidateId === "P18-R-P" ? "operator-prince" : "operator-typst";
  return sealCandidateSubmission({
    charter,
    expected_manifest_digest: charter.manifest_digest,
    candidate_id: candidateId,
    actor,
    source_digest: syntheticDigest(
      `${charter.manifest_digest}-${candidateId}-source`,
    ),
    output_digest: syntheticDigest(
      `${charter.manifest_digest}-${candidateId}-output`,
    ),
    now: () => new Date("2026-07-22T12:30:00.000Z"),
    store,
  });
}

describe("renderer qualification charter identity binding", () => {
  it("rejects a second manifest under the same charter ID and version", async () => {
    const [original, conflicting] = charterPairWithConflictingManifests();
    const store = new InMemoryRendererQualificationStore();

    await sealInitialSubmission(original, store);
    await expect(
      sealInitialSubmission(conflicting, store),
    ).rejects.toMatchObject({ code: "charter_identity_conflict" });

    expect(await store.listSubmissions()).toHaveLength(1);
  });

  it("binds conflicting concurrent initial submissions atomically", async () => {
    const [original, conflicting] = charterPairWithConflictingManifests();
    const store = new InMemoryRendererQualificationStore();

    const results = await Promise.allSettled([
      sealInitialSubmission(original, store),
      sealInitialSubmission(conflicting, store),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.find((result) => result.status === "rejected"),
    ).toMatchObject({
      status: "rejected",
      reason: { code: "charter_identity_conflict" },
    });
    expect(await store.listSubmissions()).toHaveLength(1);
  });

  it("retains per-candidate allowances for the bound manifest", async () => {
    const [charter] = charterPairWithConflictingManifests();
    const store = new InMemoryRendererQualificationStore();

    await sealInitialSubmission(charter, store, "P18-R-P");
    await sealInitialSubmission(charter, store, "P18-R-T");

    expect(await store.listSubmissions()).toHaveLength(2);
  });

  it("allows a new manifest when the charter version changes", async () => {
    const original = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const nextInput = structuredClone(buildFixtureContestInput());
    nextInput.charter_version = "2.0.0";
    const next = freezeRendererQualificationCharter(nextInput);
    const store = new InMemoryRendererQualificationStore();

    await sealInitialSubmission(original, store);
    await sealInitialSubmission(next, store);

    expect(await store.listSubmissions()).toHaveLength(2);
  });

  it("does not bind an invalid request that never appends evidence", async () => {
    const [original, conflicting] = charterPairWithConflictingManifests();
    const store = new InMemoryRendererQualificationStore();

    await expect(
      sealCandidateSubmission({
        charter: conflicting,
        expected_manifest_digest: conflicting.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-typst",
        source_digest: syntheticDigest("invalid-request-source"),
        output_digest: syntheticDigest("invalid-request-output"),
        store,
      }),
    ).rejects.toMatchObject({ code: "role_forbidden" });

    await expect(sealInitialSubmission(original, store)).resolves.toBeDefined();
  });

  it("rejects conflicting later lifecycle calls before digest-scoped prerequisite reads", async () => {
    const [original, conflicting] = charterPairWithConflictingManifests();
    const store = new InMemoryRendererQualificationStore();
    await sealInitialSubmission(original, store);

    await expect(
      sealCandidateSubmission({
        charter: conflicting,
        expected_manifest_digest: conflicting.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("conflicting-ordinal-source"),
        output_digest: syntheticDigest("conflicting-ordinal-output"),
        remediation_cycle_ordinal: 1,
        now: () => new Date("2026-07-22T12:45:00.000Z"),
        store,
      }),
    ).rejects.toMatchObject({ code: "charter_identity_conflict" });

    await expect(
      recordRemediationCycle({
        charter: conflicting,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        operation_key: "conflicting-charter-remediation",
        hours_spent: 1,
        changes: ["attempted conflicting fix"],
        affected_case_ids: ["O01"],
        now: () => new Date("2026-07-22T12:45:00.000Z"),
        store,
      }),
    ).rejects.toMatchObject({ code: "charter_identity_conflict" });
  });
});
