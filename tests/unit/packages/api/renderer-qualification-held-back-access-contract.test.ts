import { describe, expect, it } from "vitest";

import {
  buildFixtureContestInput,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  InMemoryRendererQualificationStore,
  digestCandidateLock,
  digestQualificationValue,
  freezeRendererQualificationCharter,
  recordHeldBackEvaluationAccess,
  recordRemediationCycle,
  sealCandidateSubmission,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  FrozenRendererQualificationCharter,
  RendererCandidateId,
  SealedCandidateSubmission,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

const CANDIDATES = [
  ["P18-R-P", "operator-prince"],
  ["P18-R-T", "operator-typst"],
  ["P18-R-C", "operator-control"],
] as const;

function frozenCharter(): FrozenRendererQualificationCharter {
  return freezeRendererQualificationCharter(buildFixtureContestInput());
}

async function sealInitial(
  charter: FrozenRendererQualificationCharter,
  store: InMemoryRendererQualificationStore,
  candidateId: RendererCandidateId,
  actor: string,
  sealedAt = "2026-07-22T12:30:00.000Z",
): Promise<SealedCandidateSubmission> {
  return sealCandidateSubmission({
    charter,
    expected_manifest_digest: charter.manifest_digest,
    candidate_id: candidateId,
    actor,
    source_digest: syntheticDigest(`${candidateId}-source`),
    output_digest: syntheticDigest(`${candidateId}-output`),
    now: () => new Date(sealedAt),
    generateId: () => `${candidateId}-submission`,
    store,
  });
}

async function sealAllInitial(
  charter: FrozenRendererQualificationCharter,
  store: InMemoryRendererQualificationStore,
): Promise<void> {
  for (const [candidateId, actor] of CANDIDATES) {
    await sealInitial(charter, store, candidateId, actor);
  }
}

describe("post-seal held-back evaluation access", () => {
  it("records content-addressed disclosure evidence without changing the frozen charter", async () => {
    const charter = frozenCharter();
    const frozenCharterBytes = JSON.stringify(charter);
    const store = new InMemoryRendererQualificationStore();
    await sealAllInitial(charter, store);

    const access = await recordHeldBackEvaluationAccess({
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-prince-initial",
      now: () => new Date("2026-07-22T12:31:00.000Z"),
      generateId: () => "access-prince-initial",
      store,
    });

    expect(access).toMatchObject({
      access_id: "access-prince-initial",
      manifest_digest: charter.manifest_digest,
      sealed_expectations_digest:
        charter.held_back_seal.sealed_expectations_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      remediation_cycle_ordinal: 0,
      initial_submission_ids: {
        "P18-R-P": "P18-R-P-submission",
        "P18-R-T": "P18-R-T-submission",
        "P18-R-C": "P18-R-C-submission",
      },
      reason: "evaluate_sealed_candidate_submission",
      accessed_by: "custodian-quinn",
    });
    const { evidence_digest: evidenceDigest, ...payload } = access;
    expect(evidenceDigest).toBe(digestQualificationValue(payload));
    expect(JSON.stringify(charter)).toBe(frozenCharterBytes);
    expect(charter.held_back_seal.access_log).toHaveLength(1);
  });

  it("keeps the shared corpus closed until both finalists and the control seal", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    const request = {
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-before-ready",
      store,
    };

    await expect(recordHeldBackEvaluationAccess(request)).rejects.toMatchObject(
      { code: "held_back_access_not_ready" },
    );
    await sealInitial(charter, store, "P18-R-P", "operator-prince");
    await sealInitial(charter, store, "P18-R-T", "operator-typst");
    await expect(recordHeldBackEvaluationAccess(request)).rejects.toMatchObject(
      { code: "held_back_access_not_ready" },
    );
    expect(await store.listHeldBackEvaluationAccesses()).toHaveLength(0);

    await sealInitial(charter, store, "P18-R-C", "operator-control");
    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        now: () => new Date("2026-07-22T12:31:00.000Z"),
      }),
    ).resolves.toMatchObject({ candidate_id: "P18-R-P" });
  });

  it("ignores forged public store reads when enforcing the private seal gate", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    const forgedSubmissions: SealedCandidateSubmission[] = CANDIDATES.map(
      ([candidateId, actor]) => ({
        submission_id: `${candidateId}-forged-submission`,
        charter_id: charter.charter_id,
        manifest_digest: charter.manifest_digest,
        candidate_id: candidateId,
        candidate_lock_digest: digestCandidateLock(charter, candidateId),
        remediation_cycle_ordinal: 0,
        source_digest: syntheticDigest(`${candidateId}-forged-source`),
        output_digest: syntheticDigest(`${candidateId}-forged-output`),
        sealed_at: "2026-07-22T12:30:00.000Z",
        sealed_by: actor,
      }),
    );
    store.listSubmissions = async () => structuredClone(forgedSubmissions);

    await expect(
      recordHeldBackEvaluationAccess({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        submission_id: "P18-R-P-forged-submission",
        actor: "custodian-quinn",
        operation_key: "evaluate-forged-store-view",
        store,
      }),
    ).rejects.toMatchObject({ code: "held_back_access_not_ready" });
    expect(await store.listHeldBackEvaluationAccesses()).toHaveLength(0);
    expect(
      await InMemoryRendererQualificationStore.prototype.listSubmissions.call(
        store,
      ),
    ).toHaveLength(0);
  });

  it("rejects a pre-seal or invalid access clock without reserving the operation", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealInitial(
      charter,
      store,
      "P18-R-P",
      "operator-prince",
      "2026-07-22T12:30:00.000Z",
    );
    await sealInitial(
      charter,
      store,
      "P18-R-T",
      "operator-typst",
      "2026-07-22T12:31:00.000Z",
    );
    await sealInitial(
      charter,
      store,
      "P18-R-C",
      "operator-control",
      "2026-07-22T12:32:00.000Z",
    );
    const request = {
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-clock-order",
      store,
    };

    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        now: () => new Date("2026-07-22T12:31:59.999Z"),
      }),
    ).rejects.toMatchObject({ code: "held_back_access_invalid" });
    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        now: () => new Date(Number.NaN),
      }),
    ).rejects.toMatchObject({ code: "held_back_access_invalid" });
    expect(await store.listHeldBackEvaluationAccesses()).toHaveLength(0);

    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        now: () => new Date("2026-07-22T12:32:00.000Z"),
      }),
    ).resolves.toMatchObject({
      accessed_at: "2026-07-22T12:32:00.000Z",
    });
  });

  it("rejects the wrong actor, manifest, operation key, or submission relationship", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealAllInitial(charter, store);
    const request = {
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-validated-request",
      now: () => new Date("2026-07-22T12:31:00.000Z"),
      store,
    };

    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        actor: "operator-prince",
      }),
    ).rejects.toMatchObject({ code: "role_forbidden" });
    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        expected_manifest_digest: syntheticDigest("wrong-charter"),
      }),
    ).rejects.toMatchObject({ code: "charter_digest_mismatch" });
    await expect(
      recordHeldBackEvaluationAccess({ ...request, operation_key: "" }),
    ).rejects.toMatchObject({ code: "held_back_access_invalid" });
    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        submission_id: "missing-submission",
      }),
    ).rejects.toMatchObject({ code: "held_back_access_not_ready" });
    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        submission_id: "P18-R-T-submission",
      }),
    ).rejects.toMatchObject({ code: "held_back_access_invalid" });
    expect(await store.listHeldBackEvaluationAccesses()).toHaveLength(0);
  });

  it("replays exact operations, rejects changed evidence, and returns clones", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealAllInitial(charter, store);
    const request = {
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-idempotently",
      now: () => new Date("2026-07-22T12:31:00.000Z"),
      generateId: () => "access-original",
      store,
    };
    const original = await recordHeldBackEvaluationAccess(request);
    const replay = await recordHeldBackEvaluationAccess({
      ...request,
      now: () => new Date("2026-07-23T12:31:00.000Z"),
      generateId: () => "access-retry",
    });

    expect(replay).toEqual(original);
    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        candidate_id: "P18-R-T",
        submission_id: "P18-R-T-submission",
      }),
    ).rejects.toMatchObject({ code: "evidence_append_conflict" });

    const mutableOriginal = original as {
      accessed_by: string;
      initial_submission_ids: Record<RendererCandidateId, string>;
    };
    mutableOriginal.accessed_by = "mutated";
    mutableOriginal.initial_submission_ids["P18-R-P"] = "mutated";
    const listed = await store.listHeldBackEvaluationAccesses();
    listed[0]!.accessed_by = "also-mutated";

    expect(await store.listHeldBackEvaluationAccesses()).toEqual([replay]);
    expect("appendHeldBackEvaluationAccess" in store).toBe(false);
  });

  it("serializes concurrent retries into one append-only access record", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealAllInitial(charter, store);
    let generatedIds = 0;
    const request = {
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-concurrently",
      now: () => new Date("2026-07-22T12:31:00.000Z"),
      generateId: () => `concurrent-access-${(generatedIds += 1)}`,
      store,
    };

    const [left, right] = await Promise.all([
      recordHeldBackEvaluationAccess(request),
      recordHeldBackEvaluationAccess(request),
    ]);

    expect(left).toEqual(right);
    expect(await store.listHeldBackEvaluationAccesses()).toEqual([left]);
  });

  it("permits a candidate-scoped remediation evaluation only after its revised seal", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealAllInitial(charter, store);
    await recordRemediationCycle({
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      operation_key: "remediate-prince-one",
      hours_spent: 1,
      changes: ["Correct the bounded adapter translation."],
      affected_case_ids: ["H01"],
      now: () => new Date("2026-07-22T12:32:00.000Z"),
      generateId: () => "prince-cycle-one",
      store,
    });
    const accessRequest = {
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission-one",
      actor: "custodian-quinn",
      operation_key: "evaluate-prince-one",
      now: () => new Date("2026-07-22T12:34:00.000Z"),
      store,
    };

    await expect(
      recordHeldBackEvaluationAccess(accessRequest),
    ).rejects.toMatchObject({ code: "held_back_access_not_ready" });

    const revised = await sealCandidateSubmission({
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      remediation_cycle_ordinal: 1,
      source_digest: syntheticDigest("P18-R-P-revised-source"),
      output_digest: syntheticDigest("P18-R-P-revised-output"),
      now: () => new Date("2026-07-22T12:33:00.000Z"),
      generateId: () => "P18-R-P-submission-one",
      store,
    });
    const access = await recordHeldBackEvaluationAccess(accessRequest);

    expect(access).toMatchObject({
      candidate_id: "P18-R-P",
      submission_id: revised.submission_id,
      remediation_cycle_ordinal: 1,
    });
    expect(
      (await store.listSubmissions()).filter(
        (submission) => submission.remediation_cycle_ordinal === 1,
      ),
    ).toEqual([revised]);
  });

  it("restarts the disclosure gate for a new manifest", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealAllInitial(charter, store);
    await recordHeldBackEvaluationAccess({
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-old-charter",
      store,
    });

    const replacementInput = buildFixtureContestInput();
    replacementInput.charter_version = "1.0.1";
    const replacement = freezeRendererQualificationCharter(replacementInput);
    await expect(
      recordHeldBackEvaluationAccess({
        charter: replacement,
        expected_manifest_digest: replacement.manifest_digest,
        candidate_id: "P18-R-P",
        submission_id: "P18-R-P-submission",
        actor: "custodian-quinn",
        operation_key: "evaluate-new-charter",
        store,
      }),
    ).rejects.toMatchObject({ code: "held_back_access_not_ready" });
  });

  it("does not reserve failed generated IDs or operation keys", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealAllInitial(charter, store);
    const request = {
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      submission_id: "P18-R-P-submission",
      actor: "custodian-quinn",
      operation_key: "evaluate-generated-id",
      now: () => new Date("2026-07-22T12:31:00.000Z"),
      store,
    };

    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        generateId: () => " ",
      }),
    ).rejects.toMatchObject({ code: "held_back_access_invalid" });
    const first = await recordHeldBackEvaluationAccess({
      ...request,
      generateId: () => "access-shared-id",
    });
    await expect(
      recordHeldBackEvaluationAccess({
        ...request,
        operation_key: "evaluate-colliding-id",
        generateId: () => "access-shared-id",
      }),
    ).rejects.toMatchObject({ code: "evidence_append_conflict" });
    const second = await recordHeldBackEvaluationAccess({
      ...request,
      operation_key: "evaluate-colliding-id",
      generateId: () => "access-new-id",
    });

    expect(await store.listHeldBackEvaluationAccesses()).toEqual([
      first,
      second,
    ]);
  });
});
