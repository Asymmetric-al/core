import { describe, expect, it } from "vitest";

import { buildFixtureContestInput } from "./renderer-qualification-test-fixture";
import {
  RendererCharterValidationError,
  freezeRendererQualificationCharter,
  validateRendererQualificationCharterInput,
  type RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

const EXPECTED_SELECTION_ORDER = [
  "neither_finalist_passes_every_hard_gate:no_winner",
  "exactly_one_finalist_passes_every_hard_gate:select_exact_passing_frozen_pipeline",
  "both_finalists_pass_and_one_has_material_lead:select_exact_material_leader",
  "both_finalists_pass_without_material_lead:compare_frozen_tie_break_evidence_in_order",
  "all_tie_break_steps_equivalent_or_uncertain:no_winner",
] as const;

const EXPECTED_DECISION_RECORD_FORMAT = "phase-18-protocol-decision-record/v1";

type MutableRecord = Record<string, unknown>;

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (issue) => issue.code,
  );
}

function mutableScoringRules(
  input: RendererQualificationCharterInput,
): MutableRecord {
  return input.scoring_rules as unknown as MutableRecord;
}

function mutableEvidenceRules(
  input: RendererQualificationCharterInput,
): MutableRecord {
  return input.evidence_rules as unknown as MutableRecord;
}

describe("renderer qualification frozen decision contract", () => {
  it("freezes the complete no-winner-capable decision policy as inert charter data", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const rules = mutableScoringRules(charter);

    expect(rules).toMatchObject({
      reviewer_count: 2,
      reviewer_method: "independent",
      score_above_three_requires_written_beyond_gate_evidence: true,
      scoring_eligibility: "both_finalists_pass_every_hard_gate",
      reviewer_total_aggregation: "mean",
      uncertainty_band_formula:
        "max_minimum_or_half_absolute_reviewer_total_difference",
      material_lead_rule:
        "mean_difference_at_least_threshold_and_strict_uncertainty_band_separation",
      tie_break_resolution_rule:
        "first_documented_material_advantage_else_no_winner",
      candidate_preference: "none",
    });
    expect(rules.selection_order).toEqual(EXPECTED_SELECTION_ORDER);
  });

  it.each([
    [
      "scoring before both finalists pass every hard gate",
      (rules: MutableRecord) => {
        rules.scoring_eligibility = "score_any_candidate_with_some_green_gates";
      },
    ],
    [
      "summing instead of averaging reviewer totals",
      (rules: MutableRecord) => {
        rules.reviewer_total_aggregation = "sum";
      },
    ],
    [
      "discarding the reviewer-disagreement uncertainty term",
      (rules: MutableRecord) => {
        rules.uncertainty_band_formula = "minimum_only";
      },
    ],
    [
      "selecting on mean difference without strict band separation",
      (rules: MutableRecord) => {
        rules.material_lead_rule = "mean_threshold_only";
      },
    ],
    [
      "selecting the highest mean before applying the ordered branches",
      (rules: MutableRecord) => {
        rules.selection_order = [
          "highest_mean_wins",
          ...EXPECTED_SELECTION_ORDER,
        ];
      },
    ],
    [
      "treating any tie-break edge as decisive",
      (rules: MutableRecord) => {
        rules.tie_break_resolution_rule = "first_nonzero_edge_wins";
      },
    ],
    [
      "preferring the incumbent candidate",
      (rules: MutableRecord) => {
        rules.candidate_preference = "incumbent";
      },
    ],
    [
      "allowing scores above three without written beyond-gate evidence",
      (rules: MutableRecord) => {
        rules.score_above_three_requires_written_beyond_gate_evidence = false;
      },
    ],
    [
      "adding an undeclared selection override",
      (rules: MutableRecord) => {
        rules.selection_override = { unresolved: "coin_flip" };
      },
    ],
  ])("rejects %s", (_name, mutateRules) => {
    const input = structuredClone(buildFixtureContestInput());
    mutateRules(mutableScoringRules(input));

    expect(issueCodes(input)).toContain("protocol_fixed_field_changed");
    expect(() => freezeRendererQualificationCharter(input)).toThrow(
      RendererCharterValidationError,
    );
  });

  it("closes each dimension rubric against after-results overrides", () => {
    const input = structuredClone(buildFixtureContestInput());
    const firstDimension = input.score_dimensions[0];
    if (!firstDimension) throw new Error("Fixture is missing score dimensions");

    Object.assign(firstDimension, {
      rubric_override: {
        reviewer_may_ignore_evidence_basis: true,
      },
    });

    expect(issueCodes(input)).toContain("protocol_fixed_field_changed");
  });

  it.each(["missing", "null"] as const)(
    "rejects a %s tie-break order through typed charter validation",
    (variant) => {
      const input = structuredClone(buildFixtureContestInput());
      const rules = mutableScoringRules(input);
      if (variant === "missing") {
        delete rules.tie_break_order;
      } else {
        rules.tie_break_order = null;
      }

      expect(() => issueCodes(input)).not.toThrow();
      expect(issueCodes(input)).toContain("scoring_invalid");
      expect(() => freezeRendererQualificationCharter(input)).toThrow(
        RendererCharterValidationError,
      );
    },
  );

  it("freezes and exact-validates the T6-owned decision-record format identifier", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    expect(mutableEvidenceRules(charter).decision_record_format).toBe(
      EXPECTED_DECISION_RECORD_FORMAT,
    );

    const changed = structuredClone(buildFixtureContestInput());
    mutableEvidenceRules(changed).decision_record_format =
      "after-results-custom-record/v1";
    expect(issueCodes(changed)).toContain("protocol_fixed_field_changed");

    const exception = structuredClone(buildFixtureContestInput());
    mutableEvidenceRules(exception).decision_record_exception = {
      signatures_optional: true,
    };
    expect(issueCodes(exception)).toContain("protocol_fixed_field_changed");
  });

  it("does not expose a scorer, selector, decision record, or runtime descriptor", async () => {
    const moduleExports =
      await import("../../../../packages/api/src/generated-documents/renderer-qualification");
    const forbiddenRuntimeNames = [
      "decide",
      "select",
      "winner",
      "descriptor",
      "activate",
      "production",
    ];

    for (const forbidden of forbiddenRuntimeNames) {
      expect(
        Object.keys(moduleExports).filter((name) =>
          name.toLowerCase().includes(forbidden),
        ),
      ).toEqual([]);
    }
  });
});
