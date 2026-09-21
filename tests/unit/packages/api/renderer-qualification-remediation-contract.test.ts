import { describe, expect, it } from "vitest";

import {
  buildFixtureContestInput,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  InMemoryRendererQualificationStore,
  RendererCharterValidationError,
  freezeRendererQualificationCharter,
  recordRemediationCycle,
  sealCandidateSubmission,
  validateRendererQualificationCharterInput,
  type FrozenRendererQualificationCharter,
  type RecordRemediationCycleInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

type IdempotentRemediationInput = RecordRemediationCycleInput & {
  operation_key: string;
};

function frozenCharter(): FrozenRendererQualificationCharter {
  return freezeRendererQualificationCharter(buildFixtureContestInput());
}

async function sealSubmission(
  charter: FrozenRendererQualificationCharter,
  store: InMemoryRendererQualificationStore,
  ordinal: 0 | 1,
  sealedAt: string,
): Promise<void> {
  await sealCandidateSubmission({
    charter,
    expected_manifest_digest: charter.manifest_digest,
    candidate_id: "P18-R-P",
    actor: "operator-prince",
    source_digest: syntheticDigest(`source-${ordinal}`),
    output_digest: syntheticDigest(`output-${ordinal}`),
    remediation_cycle_ordinal: ordinal,
    now: () => new Date(sealedAt),
    store,
  });
}

function recordCycle(input: IdempotentRemediationInput) {
  return recordRemediationCycle(input);
}

describe("renderer qualification remediation contract", () => {
  it("rejects a remediation policy that permits answer-specific or manual edits", () => {
    const blank = structuredClone(buildFixtureContestInput());
    blank.remediation_policy.permitted_changes = "   ";
    expect(
      validateRendererQualificationCharterInput(blank).map(
        (issue) => issue.code,
      ),
    ).toContain("protocol_fixed_field_changed");

    const input = structuredClone(buildFixtureContestInput());
    input.remediation_policy.permitted_changes =
      "fixture-ID-specific branches and manual edits to generated PDFs are allowed";

    expect(
      validateRendererQualificationCharterInput(input).map(
        (issue) => issue.code,
      ),
    ).toContain("protocol_fixed_field_changed");
    expect(() => freezeRendererQualificationCharter(input)).toThrow(
      RendererCharterValidationError,
    );

    const exception = structuredClone(buildFixtureContestInput());
    Object.assign(exception.remediation_policy, {
      permitted_change_exceptions: ["manual edit for H07"],
    });
    expect(
      validateRendererQualificationCharterInput(exception).map(
        (issue) => issue.code,
      ),
    ).toContain("protocol_fixed_field_changed");
    expect(() => freezeRendererQualificationCharter(exception)).toThrow(
      RendererCharterValidationError,
    );
  });

  it("rejects blank remediation change descriptions before metering", async () => {
    const charter = frozenCharter();
    for (const [index, changes] of [
      ["   "],
      ["real fix", "\t\n"],
      ["real fix", null as unknown as string],
    ].entries()) {
      const store = new InMemoryRendererQualificationStore();
      await sealSubmission(charter, store, 0, "2026-07-22T13:00:00.000Z");

      await expect(
        recordCycle({
          charter,
          candidate_id: "P18-R-P",
          actor: "operator-prince",
          operation_key: `blank-change-cycle-${index}`,
          hours_spent: 1,
          changes,
          affected_case_ids: ["O01"],
          store,
        }),
      ).rejects.toMatchObject({ code: "remediation_incomplete" });
      expect(await store.listRemediationCycles()).toHaveLength(0);
    }
  });

  it("replays one logical remediation without consuming another ordinal", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealSubmission(charter, store, 0, "2026-07-22T13:00:00.000Z");

    const request: IdempotentRemediationInput = {
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      operation_key: "renderer-remediation-request-1",
      hours_spent: 2,
      changes: ["repair table header repetition"],
      affected_case_ids: ["O16"],
      now: () => new Date("2026-07-22T14:00:00.000Z"),
      generateId: () => "cycle-record-1",
      store,
    };
    const first = await recordCycle(request);
    await sealSubmission(charter, store, 1, "2026-07-22T15:00:00.000Z");

    const replay = await recordCycle({
      ...request,
      now: () => new Date("2026-07-22T16:00:00.000Z"),
      generateId: () => "cycle-record-from-delayed-retry",
    });

    expect(replay).toEqual(first);
    expect(await store.listRemediationCycles()).toEqual([first]);
  });

  it("rejects reuse of an operation key for different remediation evidence", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealSubmission(charter, store, 0, "2026-07-22T13:00:00.000Z");

    const first = {
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      operation_key: "renderer-remediation-request-1",
      hours_spent: 2,
      changes: ["repair table header repetition"],
      affected_case_ids: ["O16"],
      store,
    } satisfies IdempotentRemediationInput;
    await recordCycle(first);

    await expect(
      recordCycle({
        ...first,
        changes: ["change bidirectional ordering instead"],
      }),
    ).rejects.toMatchObject({ code: "evidence_append_conflict" });
    expect(await store.listRemediationCycles()).toHaveLength(1);
  });

  it("rejects non-string remediation operation keys at the runtime seam", async () => {
    const charter = frozenCharter();

    for (const operationKey of [
      undefined,
      null,
      7,
      true,
      new String("boxed-key"),
    ]) {
      const store = new InMemoryRendererQualificationStore();
      await sealSubmission(charter, store, 0, "2026-07-22T13:00:00.000Z");

      await expect(
        recordCycle({
          charter,
          candidate_id: "P18-R-P",
          actor: "operator-prince",
          operation_key: operationKey as string,
          hours_spent: 1,
          changes: ["repair pagination"],
          affected_case_ids: ["O04"],
          store,
        }),
      ).rejects.toMatchObject({ code: "remediation_incomplete" });
      expect(await store.listRemediationCycles()).toHaveLength(0);
    }
  });

  it("coalesces concurrent retries carrying the same operation key and evidence", async () => {
    const charter = frozenCharter();
    const store = new InMemoryRendererQualificationStore();
    await sealSubmission(charter, store, 0, "2026-07-22T13:00:00.000Z");

    const request = {
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      operation_key: "concurrent-remediation-request",
      hours_spent: 2,
      changes: ["repair table header repetition"],
      affected_case_ids: ["O16"],
      now: () => new Date("2026-07-22T14:00:00.000Z"),
      store,
    } satisfies IdempotentRemediationInput;
    const [first, second] = await Promise.all([
      recordCycle({ ...request, generateId: () => "concurrent-cycle-a" }),
      recordCycle({ ...request, generateId: () => "concurrent-cycle-b" }),
    ]);

    expect(second).toEqual(first);
    expect(await store.listRemediationCycles()).toEqual([first]);
  });

  it("orders each cycle after its prerequisite submission and each rerun seal after its cycle", async () => {
    const charter = frozenCharter();
    const earlyCycleStore = new InMemoryRendererQualificationStore();
    await sealSubmission(
      charter,
      earlyCycleStore,
      0,
      "2026-07-22T14:00:00.000Z",
    );

    await expect(
      recordCycle({
        charter,
        candidate_id: "P18-R-P",
        actor: "operator-prince",
        operation_key: "early-cycle",
        hours_spent: 1,
        changes: ["repair pagination"],
        affected_case_ids: ["O04"],
        now: () => new Date("2026-07-22T13:00:00.000Z"),
        store: earlyCycleStore,
      }),
    ).rejects.toMatchObject({ code: "remediation_incomplete" });

    const earlySealStore = new InMemoryRendererQualificationStore();
    await sealSubmission(
      charter,
      earlySealStore,
      0,
      "2026-07-22T13:00:00.000Z",
    );
    await recordCycle({
      charter,
      candidate_id: "P18-R-P",
      actor: "operator-prince",
      operation_key: "cycle-before-rerun-seal",
      hours_spent: 1,
      changes: ["repair pagination"],
      affected_case_ids: ["O04"],
      now: () => new Date("2026-07-22T15:00:00.000Z"),
      store: earlySealStore,
    });

    await expect(
      sealSubmission(charter, earlySealStore, 1, "2026-07-22T14:00:00.000Z"),
    ).rejects.toMatchObject({ code: "submission_invalid" });
    expect(await earlySealStore.listSubmissions()).toHaveLength(1);
  });
});
