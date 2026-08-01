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

async function sealInitialSubmission(
  charter: FrozenRendererQualificationCharter,
  store: InMemoryRendererQualificationStore,
  candidate_id: "P18-R-P" | "P18-R-T" = "P18-R-P",
): Promise<void> {
  const actor =
    candidate_id === "P18-R-P" ? "operator-prince" : "operator-typst";
  await sealCandidateSubmission({
    charter,
    expected_manifest_digest: charter.manifest_digest,
    candidate_id,
    actor,
    source_digest: syntheticDigest(`${candidate_id}-initial-source`),
    output_digest: syntheticDigest(`${candidate_id}-initial-output`),
    store,
  });
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
      expect(Object.keys(heldBack).sort()).toEqual([
        "bounds",
        "case_id",
        "output_profile",
      ]);
    }

    // Held-back titles encode each fixture's hidden variation, so the pre-seal
    // packet must not carry them in any form.
    const serializedPacket = JSON.stringify(packet);
    for (const heldBack of charter.held_back_corpus) {
      expect(serializedPacket).not.toContain(heldBack.title);
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

describe("sealCandidateSubmission clock ordering", () => {
  it("refuses to seal evidence dated before the charter froze", async () => {
    // A skewed or injected clock would otherwise produce a submission dated
    // before the contest existed, and that ordering is what makes the evidence
    // package auditable.
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    await expect(
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("early-source"),
        output_digest: syntheticDigest("early-output"),
        now: () => new Date("2026-07-22T11:59:59.000Z"),
        store,
      }),
    ).rejects.toMatchObject({ code: "submission_invalid" });

    expect(await store.listSubmissions()).toHaveLength(0);
  });

  it("refuses to record a remediation cycle dated before the charter froze", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealInitialSubmission(charter, store, "P18-R-P");

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        hours_spent: 4,
        changes: ["backdated cycle"],
        affected_case_ids: ["O01"],
        now: () => new Date("2026-07-22T11:00:00.000Z"),
        store,
      }),
    ).rejects.toMatchObject({ code: "remediation_incomplete" });

    expect(await store.listRemediationCycles()).toHaveLength(0);
  });
});

describe("remediation must change the candidate source", () => {
  it("rejects a remediation submission reusing the prior source digest", async () => {
    // A cycle spends part of the equal remediation budget. Permitted changes
    // are adapter/translation source only, so an unchanged source digest means
    // the cycle bought nothing while still consuming the allowance.
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealInitialSubmission(charter, store, "P18-R-P");
    await recordRemediationCycle({
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      hours_spent: 6,
      changes: ["fix table header repetition"],
      affected_case_ids: ["O16"],
      store,
    });

    await expect(
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        // Byte-identical to the initial attempt.
        source_digest: syntheticDigest("P18-R-P-initial-source"),
        output_digest: syntheticDigest("P18-R-P-remediated-output"),
        remediation_cycle_ordinal: 1,
        store,
      }),
    ).rejects.toMatchObject({ code: "remediation_incomplete" });
  });

  it("allows a changed source even when the rendered bytes are identical", async () => {
    // An isolation or sandbox fix can legitimately leave the PDF unchanged, so
    // only the source digest is required to move.
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealInitialSubmission(charter, store, "P18-R-P");
    await recordRemediationCycle({
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      hours_spent: 6,
      changes: ["tighten sandbox policy"],
      affected_case_ids: ["O17"],
      store,
    });

    const sealed = await sealCandidateSubmission({
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      source_digest: syntheticDigest("P18-R-P-remediated-source"),
      output_digest: syntheticDigest("P18-R-P-initial-output"),
      remediation_cycle_ordinal: 1,
      store,
    });

    expect(sealed.remediation_cycle_ordinal).toBe(1);
  });
});

describe("evidence record identity", () => {
  it("refuses a blank generated id", async () => {
    // The store rejects repeats, but the first blank id would be stored and
    // returned as if it identified something, collapsing the append-only
    // guarantee for every later record.
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    await expect(
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("s"),
        output_digest: syntheticDigest("o"),
        generateId: () => "  ",
        store,
      }),
    ).rejects.toMatchObject({ code: "submission_invalid" });

    expect(await store.listSubmissions()).toHaveLength(0);
  });
});

describe("recordRemediationCycle", () => {
  it("commits metered effort and attribution to the evidence digest", async () => {
    // hours_spent meters the equal remediation budget and recorded_at carries
    // attribution. Outside the digest, an exported record could be edited
    // without breaking its own seal.
    const digestFor = async (overrides: {
      hours_spent?: number;
      recordedAt?: string;
    }) => {
      const charter = frozenCharter();
      const store = new InMemoryRendererQualificationStore();
      await sealInitialSubmission(charter, store, "P18-R-P");
      const cycle = await recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        hours_spent: overrides.hours_spent ?? 12,
        changes: ["fix table header repetition in the adapter"],
        affected_case_ids: ["O16"],
        store,
        generateId: () => "fixed-cycle-id",
        now: () => new Date(overrides.recordedAt ?? "2026-07-22T13:00:00.000Z"),
      });
      return cycle.evidence_digest;
    };

    const baseline = await digestFor({});
    expect(await digestFor({})).toBe(baseline);
    expect(await digestFor({ hours_spent: 13 })).not.toBe(baseline);
    expect(
      await digestFor({ recordedAt: "2026-07-22T14:00:00.000Z" }),
    ).not.toBe(baseline);
  });

  it("meters both finalists equally: one initial attempt, two cycles, a third rejected", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    for (const [candidateId, actor] of [
      ["P18-R-P", "operator-prince"],
      ["P18-R-T", "operator-typst"],
    ] as const) {
      await sealInitialSubmission(charter, store, candidateId);
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

      await sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: candidateId,
        actor,
        source_digest: syntheticDigest(`${candidateId}-remediation-1-source`),
        output_digest: syntheticDigest(`${candidateId}-remediation-1-output`),
        remediation_cycle_ordinal: 1,
        store,
      });

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
    await sealInitialSubmission(charter, store);

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

  it("requires the prior submission before each remediation cycle can be recorded", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        hours_spent: 1,
        changes: ["fix before initial evidence"],
        affected_case_ids: ["O01"],
        store,
      }),
    ).rejects.toMatchObject({ code: "initial_submission_missing" });

    await sealInitialSubmission(charter, store);
    await recordRemediationCycle({
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      hours_spent: 1,
      changes: ["first remediation"],
      affected_case_ids: ["O01"],
      store,
    });

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        hours_spent: 1,
        changes: ["second remediation before first sealed rerun"],
        affected_case_ids: ["O04"],
        store,
      }),
    ).rejects.toMatchObject({ code: "initial_submission_missing" });
  });
});

describe("submission metering and integrity hardening", () => {
  it("rejects blank or malformed submission digests", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    for (const bad of ["", "   ", "not-hex", "abc123"]) {
      await expect(
        sealCandidateSubmission({
          charter,
          expected_manifest_digest: charter.manifest_digest,
          candidate_id: "P18-R-P",
          actor: "operator-prince",
          source_digest: bad,
          output_digest: syntheticDigest("output"),
          store,
        }),
      ).rejects.toMatchObject({ code: "submission_invalid" });
    }
    expect(await store.listSubmissions()).toHaveLength(0);
  });

  it("permits exactly one initial submission per candidate per charter", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    await sealCandidateSubmission({
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      source_digest: syntheticDigest("s1"),
      output_digest: syntheticDigest("o1"),
      store,
    });

    await expect(
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("s2"),
        output_digest: syntheticDigest("o2"),
        store,
      }),
    ).rejects.toMatchObject({ code: "submission_already_sealed" });
  });

  it("rejects runtime submission ordinals outside the frozen allowance", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    for (const ordinal of [-1, 3, Number.NaN]) {
      await expect(
        sealCandidateSubmission({
          charter,
          expected_manifest_digest: charter.manifest_digest,
          candidate_id: "P18-R-P",
          actor: "operator-prince",
          source_digest: syntheticDigest(`bad-ordinal-${ordinal}-source`),
          output_digest: syntheticDigest(`bad-ordinal-${ordinal}-output`),
          remediation_cycle_ordinal: ordinal as never,
          store,
        }),
      ).rejects.toMatchObject({ code: "submission_invalid" });
    }

    expect(await store.listSubmissions()).toHaveLength(0);
  });

  it("keeps concurrent seal attempts in one meter slot", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    const results = await Promise.allSettled([
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("concurrent-source-1"),
        output_digest: syntheticDigest("concurrent-output-1"),
        store,
        generateId: () => "concurrent-submission-1",
      }),
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        source_digest: syntheticDigest("concurrent-source-2"),
        output_digest: syntheticDigest("concurrent-output-2"),
        store,
        generateId: () => "concurrent-submission-2",
      }),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    expect(await store.listSubmissions()).toHaveLength(1);
  });

  it("requires a recorded remediation cycle before sealing its submission", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealInitialSubmission(charter, store, "P18-R-T");

    await expect(
      sealCandidateSubmission({
        charter,
        expected_manifest_digest: charter.manifest_digest,
        candidate_id: "P18-R-T",
        actor: "operator-typst",
        source_digest: syntheticDigest("s"),
        output_digest: syntheticDigest("o"),
        remediation_cycle_ordinal: 1,
        store,
      }),
    ).rejects.toMatchObject({ code: "remediation_cycle_missing" });

    await recordRemediationCycle({
      charter,
      candidate_id: "P18-R-T",
      actor: "operator-typst",
      hours_spent: 2,
      changes: ["bidi fix"],
      affected_case_ids: ["O15"],
      store,
    });

    const sealed = await sealCandidateSubmission({
      charter,
      expected_manifest_digest: charter.manifest_digest,
      candidate_id: "P18-R-T",
      actor: "operator-typst",
      source_digest: syntheticDigest("s"),
      output_digest: syntheticDigest("o"),
      remediation_cycle_ordinal: 1,
      store,
    });
    expect(sealed.remediation_cycle_ordinal).toBe(1);
  });
});

describe("remediation accounting hardening", () => {
  it("rejects unknown case ids outside the frozen corpus", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();

    await expect(
      recordRemediationCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        hours_spent: 1,
        changes: ["phantom fix"],
        affected_case_ids: ["O99" as never],
        store,
      }),
    ).rejects.toMatchObject({ code: "case_unknown" });
  });

  it("rejects non-finite remediation hours", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealInitialSubmission(charter, store);

    for (const hours of [Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(
        recordRemediationCycle({
          charter,
          candidate_id: "P18-R-P",
          actor: "operator-prince",
          hours_spent: hours,
          changes: ["fix"],
          affected_case_ids: ["O01"],
          store,
        }),
      ).rejects.toMatchObject({ code: "remediation_budget_exceeded" });
    }
  });

  it("scopes remediation allowances to the exact charter digest", async () => {
    const store = new InMemoryRendererQualificationStore();
    const charterA = frozenCharter();
    await sealInitialSubmission(charterA, store, "P18-R-T");

    for (const cycle of [1, 2]) {
      await recordRemediationCycle({
        charter: charterA,
        candidate_id: "P18-R-T",
        actor: "operator-typst",
        hours_spent: cycle,
        changes: [`fix ${cycle}`],
        affected_case_ids: ["O15"],
        store,
      });
      await sealCandidateSubmission({
        charter: charterA,
        expected_manifest_digest: charterA.manifest_digest,
        candidate_id: "P18-R-T",
        actor: "operator-typst",
        source_digest: syntheticDigest(`typst-cycle-${cycle}-source`),
        output_digest: syntheticDigest(`typst-cycle-${cycle}-output`),
        remediation_cycle_ordinal: cycle as 1 | 2,
        store,
      });
    }

    // A reset contest is a new digest; the finalist's fresh allowance starts
    // at ordinal 1 and old cycles never consume it.
    const changed = structuredClone(buildFixtureContestInput());
    changed.charter_version = "2.0.0";
    const charterB = freezeRendererQualificationCharter(changed);
    await sealInitialSubmission(charterB, store, "P18-R-T");

    const fresh = await recordRemediationCycle({
      charter: charterB,
      candidate_id: "P18-R-T",
      actor: "operator-typst",
      hours_spent: 1,
      changes: ["fresh start"],
      affected_case_ids: ["O15"],
      store,
    });
    expect(fresh.ordinal).toBe(1);
  });

  it("routes append-only conflicts through the typed error", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealInitialSubmission(charter, store);

    const cycle = await recordRemediationCycle({
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      hours_spent: 1,
      changes: ["fix"],
      affected_case_ids: ["O01"],
      store,
    });

    await expect(store.appendRemediationCycle(cycle)).rejects.toMatchObject({
      name: "QualificationHarnessError",
      code: "evidence_append_conflict",
    });

    // The duplicate cycle_id above is caught by identity alone. A fresh id
    // replaying the same ordinal is the case that actually exercises the
    // anti-replay guard, and it must be rejected too.
    await expect(
      store.appendRemediationCycle({ ...cycle, cycle_id: "replayed-cycle" }),
    ).rejects.toMatchObject({
      name: "QualificationHarnessError",
      code: "evidence_append_conflict",
    });
    expect(await store.listRemediationCycles()).toHaveLength(1);
  });
});
