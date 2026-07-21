import { describe, expect, it } from "vitest";

import {
  buildFixtureContestInput,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  InMemoryRendererQualificationStore,
  QualificationHarnessError,
  freezeRendererQualificationCharter,
  loadCandidateWorkPacket,
  recordRemediationCycle,
  sealCandidateSubmission,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type { FrozenRendererQualificationCharter } from "../../../../packages/api/src/generated-documents/renderer-qualification";

function frozenCharter(): FrozenRendererQualificationCharter {
  return freezeRendererQualificationCharter(buildFixtureContestInput());
}

describe("loadCandidateWorkPacket", () => {
  it("discloses open fixtures and held-back schemas but never held-back expectations", () => {
    const charter = frozenCharter();
    const packet = loadCandidateWorkPacket(
      charter,
      "P18-R-T",
      "operator-typst",
    );

    expect(packet.candidate_id).toBe("P18-R-T");
    expect(packet.manifest_digest).toBe(charter.manifest_digest);
    expect(packet.open_cases).toHaveLength(18);
    for (const openCase of packet.open_cases) {
      expect(openCase.expected).toBeDefined();
    }

    expect(packet.held_back_case_schemas).toHaveLength(12);
    for (const heldBack of packet.held_back_case_schemas) {
      expect(heldBack).toEqual({
        case_id: heldBack.case_id,
        title: heldBack.title,
        output_profile: heldBack.output_profile,
        bounds: heldBack.bounds,
      });
    }

    // Nothing in the serialized packet leaks a held-back expectation or seal.
    const serialized = JSON.stringify(packet);
    expect(serialized).not.toContain("sealed_expectation_digest");
    expect(serialized).not.toContain(syntheticDigest("sealed-H01"));
    expect(serialized).not.toContain(
      syntheticDigest("all-held-back-expectations"),
    );
  });

  it("enforces role access: only the registered operator, custodian, or owner", () => {
    const charter = frozenCharter();

    expect(() =>
      loadCandidateWorkPacket(charter, "P18-R-P", "operator-typst"),
    ).toThrow(QualificationHarnessError);
    expect(() =>
      loadCandidateWorkPacket(charter, "P18-R-P", "random-visitor"),
    ).toThrow(/role-scoped/);

    expect(
      loadCandidateWorkPacket(charter, "P18-R-P", "operator-prince")
        .candidate_id,
    ).toBe("P18-R-P");
    expect(
      loadCandidateWorkPacket(charter, "P18-R-P", "custodian-quinn")
        .candidate_id,
    ).toBe("P18-R-P");
  });

  it("rejects unknown candidates and never leaks expectations through errors", () => {
    const charter = frozenCharter();

    try {
      loadCandidateWorkPacket(charter, "P18-R-X", "operator-prince");
      expect.unreachable("unknown candidate must throw");
    } catch (error) {
      expect(error).toBeInstanceOf(QualificationHarnessError);
      expect((error as QualificationHarnessError).code).toBe(
        "candidate_unknown",
      );
      expect((error as Error).message).not.toContain(
        syntheticDigest("sealed-H01"),
      );
    }
  });
});

describe("sealCandidateSubmission", () => {
  it("seals a submission pinned to the exact charter and candidate lock digests", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    const submission = await sealCandidateSubmission({
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      source_digest: syntheticDigest("prince-source"),
      output_digest: syntheticDigest("prince-output"),
      store,
    });

    expect(submission.manifest_digest).toBe(charter.manifest_digest);
    expect(submission.candidate_lock_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(submission.remediation_cycle_ordinal).toBe(0);
    expect(await store.listSubmissions()).toHaveLength(1);

    // Evidence records are append-only.
    await expect(store.appendSubmission(submission)).rejects.toThrow(
      /append-only/,
    );
  });

  it("rejects sealing against the wrong charter digest, wrong actor, or invalid charter", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    await expect(
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: syntheticDigest("some-other-charter"),
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("s"),
        output_digest: syntheticDigest("o"),
        store,
      }),
    ).rejects.toMatchObject({ code: "charter_digest_mismatch" });

    await expect(
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-typst",
        source_digest: syntheticDigest("s"),
        output_digest: syntheticDigest("o"),
        store,
      }),
    ).rejects.toMatchObject({ code: "role_forbidden" });

    const tampered = structuredClone(charter);
    (tampered.roles as { final_approver: string }).final_approver =
      "someone-else";
    await expect(
      sealCandidateSubmission({
        charter: tampered,
        expected_manifest_digest: tampered.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("s"),
        output_digest: syntheticDigest("o"),
        store,
      }),
    ).rejects.toMatchObject({ code: "charter_invalid" });

    expect(await store.listSubmissions()).toHaveLength(0);
  });

  it("invalidates prior candidate work when any frozen field changes the charter digest", async () => {
    const charterA = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    const sealedAgainstA = await sealCandidateSubmission({
      charter: charterA,
      expected_manifest_digest: charterA.manifest_digest,
      candidate_id: "P18-R-T",
      actor: "operator-typst",
      source_digest: syntheticDigest("typst-source"),
      output_digest: syntheticDigest("typst-output"),
      store,
    });

    // A candidate substitution / frozen-field change is a new charter version.
    const changed = structuredClone(buildFixtureContestInput());
    changed.charter_version = "2.0.0";
    const charterB = freezeRendererQualificationCharter(changed);
    expect(charterB.manifest_digest).not.toBe(charterA.manifest_digest);

    // Old evidence no longer matches the new contest digest…
    expect(sealedAgainstA.manifest_digest).not.toBe(charterB.manifest_digest);

    // …and sealing "for" the new contest with the stale digest is rejected,
    // so both finalists must rerun under the new charter.
    await expect(
      sealCandidateSubmission({
        charter: charterB,
        expected_manifest_digest: charterA.manifest_digest,
        candidate_id: "P18-R-T",
        actor: "operator-typst",
        source_digest: syntheticDigest("typst-source"),
        output_digest: syntheticDigest("typst-output"),
        store,
      }),
    ).rejects.toMatchObject({ code: "charter_digest_mismatch" });
  });
});

describe("recordRemediationCycle", () => {
  it("meters both finalists equally: one initial attempt, two cycles, a third rejected", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    for (const [candidateId, actor] of [
      ["P18-R-P", "operator-prince"],
      ["P18-R-T", "operator-typst"],
    ] as const) {
      const first = await recordRemediationCycle({
        charter,
        candidate_id: candidateId,
        actor,
        hours_spent: 12,
        changes: ["fix table header repetition in the adapter"],
        affected_case_ids: ["O16"],
        store,
      });
      expect(first.ordinal).toBe(1);

      const second = await recordRemediationCycle({
        charter,
        candidate_id: candidateId,
        actor,
        hours_spent: 8,
        changes: ["fix bidi run ordering"],
        affected_case_ids: ["O15"],
        store,
      });
      expect(second.ordinal).toBe(2);

      await expect(
        recordRemediationCycle({
          charter,
          candidate_id: candidateId,
          actor,
          hours_spent: 1,
          changes: ["one more tweak"],
          affected_case_ids: ["O01"],
          store,
        }),
      ).rejects.toMatchObject({ code: "remediation_cycle_limit" });
    }
  });

  it("requires affected cases to rerun together with the entire held-back corpus", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    const cycle = await recordRemediationCycle({
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      hours_spent: 4,
      changes: ["adjust page-break keep hints"],
      affected_case_ids: ["O04", "O16"],
      store,
    });

    expect(cycle.affected_case_ids).toEqual(["O04", "O16"]);
    expect(cycle.required_rerun_case_ids).toEqual(
      [
        "O04",
        "O16",
        "H01",
        "H02",
        "H03",
        "H04",
        "H05",
        "H06",
        "H07",
        "H08",
        "H09",
        "H10",
        "H11",
        "H12",
      ].sort(),
    );
  });

  it("rejects the control, out-of-budget cycles, undocumented changes, and wrong actors", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-C",
        actor: "operator-control",
        hours_spent: 1,
        changes: ["tune the control"],
        affected_case_ids: ["O01"],
        store,
      }),
    ).rejects.toMatchObject({ code: "candidate_ineligible_for_remediation" });

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        hours_spent: 41,
        changes: ["huge rework"],
        affected_case_ids: ["O01"],
        store,
      }),
    ).rejects.toMatchObject({ code: "remediation_budget_exceeded" });

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        hours_spent: 1,
        changes: [],
        affected_case_ids: ["O01"],
        store,
      }),
    ).rejects.toMatchObject({ code: "remediation_incomplete" });

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-typst",
        hours_spent: 1,
        changes: ["cross-candidate tampering"],
        affected_case_ids: ["O01"],
        store,
      }),
    ).rejects.toMatchObject({ code: "role_forbidden" });

    expect(await store.listRemediationCycles()).toHaveLength(0);
  });
});
