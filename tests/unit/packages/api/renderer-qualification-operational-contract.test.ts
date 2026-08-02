import { describe, expect, it } from "vitest";

import { buildFixtureContestInput } from "./renderer-qualification-test-fixture";
import {
  PHASE_18_OPERATIONAL_SUITES,
  RendererCharterValidationError,
  freezeRendererQualificationCharter,
  validateRendererQualificationCharterInput,
  type RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

type MutableRecord = Record<string, unknown>;

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (issue) => issue.code,
  );
}

describe("renderer qualification operational contract", () => {
  it("freezes the mixed-batch success and retry invariants", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    expect(charter.operational_suites.mixed_batch).toMatchObject({
      successful_item_policy: "remain_successful",
      ambiguous_item_policy: "do_not_rerun",
      retry_eligibility: "eligible_failures_only",
      retry_pin_policy: "reuse_exact_pins",
    });
  });

  it("freezes the heavy-long and interactive-short fairness shapes", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    expect(charter.operational_suites.fairness).toMatchObject({
      heavy_item_shape: "long_100_plus_pages",
      light_item_shape: "short_one_page",
    });
  });

  it.each([
    [
      "missing operational-suite root",
      (input: RendererQualificationCharterInput) => {
        const root = input as unknown as MutableRecord;
        delete root.operational_suites;
      },
    ],
    [
      "operational-suite root override",
      (input: RendererQualificationCharterInput) => {
        const suites = input.operational_suites as unknown as MutableRecord;
        suites.execution_override = "implementation_defined";
      },
    ],
    [
      "repeatability override",
      (input: RendererQualificationCharterInput) => {
        const repeatability = input.operational_suites
          .repeatability as MutableRecord;
        repeatability.run_override = "implementation_defined";
      },
    ],
    [
      "mixed-batch success override",
      (input: RendererQualificationCharterInput) => {
        const batch = input.operational_suites.mixed_batch as MutableRecord;
        batch.successful_item_policy = "retry_successes";
      },
    ],
    [
      "mixed-batch ambiguous-item override",
      (input: RendererQualificationCharterInput) => {
        const batch = input.operational_suites.mixed_batch as MutableRecord;
        batch.ambiguous_item_policy = "rerun";
      },
    ],
    [
      "mixed-batch retry override",
      (input: RendererQualificationCharterInput) => {
        const batch = input.operational_suites.mixed_batch as MutableRecord;
        batch.retry_eligibility = "retry_everything";
      },
    ],
    [
      "missing mixed-batch retry policy",
      (input: RendererQualificationCharterInput) => {
        const batch = input.operational_suites.mixed_batch as MutableRecord;
        delete batch.retry_eligibility;
      },
    ],
    [
      "mixed-batch retry-pin override",
      (input: RendererQualificationCharterInput) => {
        const batch = input.operational_suites.mixed_batch as MutableRecord;
        batch.retry_pin_policy = "repin_on_retry";
      },
    ],
    [
      "missing mixed-batch retry-pin policy",
      (input: RendererQualificationCharterInput) => {
        const batch = input.operational_suites.mixed_batch as MutableRecord;
        delete batch.retry_pin_policy;
      },
    ],
    [
      "mixed-batch undeclared override",
      (input: RendererQualificationCharterInput) => {
        const batch = input.operational_suites.mixed_batch as MutableRecord;
        batch.poison_retry_override = "allowed";
      },
    ],
    [
      "heavy fairness shape override",
      (input: RendererQualificationCharterInput) => {
        const fairness = input.operational_suites.fairness as MutableRecord;
        fairness.heavy_item_shape = "short_one_page";
      },
    ],
    [
      "light fairness shape override",
      (input: RendererQualificationCharterInput) => {
        const fairness = input.operational_suites.fairness as MutableRecord;
        fairness.light_item_shape = "long_100_plus_pages";
      },
    ],
    [
      "missing fairness shape",
      (input: RendererQualificationCharterInput) => {
        const fairness = input.operational_suites.fairness as MutableRecord;
        delete fairness.heavy_item_shape;
      },
    ],
    [
      "fairness undeclared override",
      (input: RendererQualificationCharterInput) => {
        const fairness = input.operational_suites.fairness as MutableRecord;
        fairness.workload_override = "implementation_defined";
      },
    ],
    [
      "concurrency-staircase override",
      (input: RendererQualificationCharterInput) => {
        const staircase = input.operational_suites
          .concurrency_staircase as MutableRecord;
        staircase.stop_override = "implementation_defined";
      },
    ],
    [
      "failure-matrix override",
      (input: RendererQualificationCharterInput) => {
        const matrix = input.operational_suites.failure_matrix as MutableRecord;
        matrix.application_override = "one_boundary_each";
      },
    ],
    [
      "outage-recovery override",
      (input: RendererQualificationCharterInput) => {
        const recovery = input.operational_suites
          .outage_recovery as MutableRecord;
        recovery.pipeline_override = "cross_engine";
      },
    ],
  ])("rejects %s", (_label, mutate) => {
    const input = structuredClone(buildFixtureContestInput());
    mutate(input);

    expect(issueCodes(input)).toContain("suite_invalid");
    expect(() => freezeRendererQualificationCharter(input)).toThrow(
      RendererCharterValidationError,
    );
  });

  it("already freezes the full failure-boundary cross-product contract", () => {
    const input = structuredClone(buildFixtureContestInput());
    expect(input.operational_suites.failure_matrix).toEqual(
      PHASE_18_OPERATIONAL_SUITES.failure_matrix,
    );
    expect(
      input.operational_suites.failure_matrix.durable_boundaries,
    ).toHaveLength(8);

    input.operational_suites.failure_matrix.durable_boundaries = [
      ...input.operational_suites.failure_matrix.durable_boundaries,
    ].reverse();
    expect(issueCodes(input)).toContain("suite_invalid");
  });

  it("already freezes the predeclared concurrency safety ceiling", () => {
    const input = structuredClone(buildFixtureContestInput());
    expect(
      input.operational_suites.concurrency_staircase
        .safety_ceiling_concurrent_attempts,
    ).toBe(50);

    input.operational_suites.concurrency_staircase.safety_ceiling_concurrent_attempts = 10;
    expect(issueCodes(input)).toContain("suite_invalid");
  });
});
