import { describe, expect, it } from "vitest";

import {
  buildFixtureContestInput,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  HELD_BACK_CASE_IDS,
  OPEN_CASE_IDS,
  PHASE_18_OPERATIONAL_SUITES,
  PHASE_18_ABSOLUTE_BUDGETS,
  RendererCharterValidationError,
  buildRendererQualificationManifest,
  digestQualificationValue,
  freezeRendererQualificationCharter,
  validateRendererQualificationCharterInput,
  verifyRendererQualificationCharter,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  FrozenRendererQualificationCharter,
  RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

function mutated(
  mutate: (input: RendererQualificationCharterInput) => void,
): RendererQualificationCharterInput {
  const input = structuredClone(buildFixtureContestInput());
  mutate(input);
  return input;
}

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (item) => item.code,
  );
}

describe("freezeRendererQualificationCharter", () => {
  it("freezes a complete charter with exact candidates, corpus, gates, weights, and budgets", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    expect(charter.manifest_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(charter.candidates.map((item) => item.candidate_id)).toEqual([
      "P18-R-C",
      "P18-R-P",
      "P18-R-T",
    ]);
    expect(charter.open_corpus.map((item) => item.case_id)).toEqual([
      ...OPEN_CASE_IDS,
    ]);
    expect(charter.held_back_corpus.map((item) => item.case_id)).toEqual([
      ...HELD_BACK_CASE_IDS,
    ]);
    expect(charter.gates).toHaveLength(12);
    expect(
      charter.score_dimensions.reduce((total, item) => total + item.weight, 0),
    ).toBe(100);
    expect(
      charter.score_dimensions.map((item) => item.weight).sort((a, b) => b - a),
    ).toEqual([20, 20, 20, 15, 10, 10, 5]);

    const manifest = buildRendererQualificationManifest(charter);
    expect(manifest.digest_algorithm).toBe("sha256");
    expect(manifest.manifest_digest).toBe(charter.manifest_digest);

    expect(verifyRendererQualificationCharter(charter)).toEqual({
      valid: true,
      failures: [],
    });
  });

  it("is append-only after freeze: frozen fields cannot be mutated", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    expect(() => {
      (charter as { charter_version: string }).charter_version = "2";
    }).toThrow(TypeError);
    expect(() => {
      (charter.budgets as unknown as unknown[]).push({});
    }).toThrow(TypeError);
  });

  it("digests identically for reordered order-insensitive collections", () => {
    const base = freezeRendererQualificationCharter(buildFixtureContestInput());

    const shuffled = structuredClone(buildFixtureContestInput());
    shuffled.candidates = [...shuffled.candidates].reverse();
    shuffled.open_corpus = [...shuffled.open_corpus].reverse();
    shuffled.held_back_corpus = [...shuffled.held_back_corpus].reverse();
    shuffled.gates = [...shuffled.gates].reverse();
    shuffled.budgets = [...shuffled.budgets].reverse();
    shuffled.validators = [...shuffled.validators].reverse();
    shuffled.score_dimensions = [...shuffled.score_dimensions].reverse();

    expect(freezeRendererQualificationCharter(shuffled).manifest_digest).toBe(
      base.manifest_digest,
    );
  });

  it("changes the digest for order-sensitive protocol changes and frozen-field changes", () => {
    const base = freezeRendererQualificationCharter(buildFixtureContestInput());

    // The custodian access log is a genuinely order-sensitive record; its
    // order participates in the digest. (Tie-break order is now pinned to the
    // protocol, so reordering it is a validation error, not a new version.)
    const reorderedAccessLog = structuredClone(buildFixtureContestInput());
    reorderedAccessLog.held_back_seal = {
      ...reorderedAccessLog.held_back_seal,
      access_log: [
        ...reorderedAccessLog.held_back_seal.access_log,
        {
          actor: "custodian-quinn",
          at: "2026-07-22T11:30:00.000Z",
          reason: "re-verified the sealed digest",
        },
      ],
    };
    expect(
      freezeRendererQualificationCharter(reorderedAccessLog).manifest_digest,
    ).not.toBe(base.manifest_digest);
  });

  it("rejects wrong or missing candidates and versions", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.filter(
            (item) => item.candidate_id !== "P18-R-T",
          );
        }),
      ),
    ).toContain("candidate_register_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-P"
              ? { ...item, engine_version: "15.2" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-T"
              ? { ...item, engine_version: "0.16.0" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    // The control can never be promoted to a finalist.
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-C"
              ? { ...item, eligibility: "finalist" as const }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-P"
              ? { ...item, adapter_digest: " " }
              : item,
          );
        }),
      ),
    ).toContain("provenance_missing");
  });

  it("rejects an incomplete or leaking corpus", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.open_corpus = input.open_corpus.filter(
            (item) => item.case_id !== "O07",
          );
        }),
      ),
    ).toContain("corpus_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.filter(
            (item) => item.case_id !== "H11",
          );
        }),
      ),
    ).toContain("corpus_incomplete");

    // A held-back case carrying expected results is a leak, full stop.
    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.map((item) =>
            item.case_id === "H06"
              ? {
                  ...item,
                  expected: {
                    protected_facts: ["leaked"],
                    layout_assertions: [],
                  },
                }
              : item,
          );
        }),
      ),
    ).toContain("held_back_expectation_leaked");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.map((item) =>
            item.case_id === "H03"
              ? { ...item, sealed_expectation_digest: undefined }
              : item,
          );
        }),
      ),
    ).toContain("held_back_not_sealed");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            custodian: "operator-prince",
          };
        }),
      ),
    ).toContain("held_back_not_sealed");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            sealed_at: "2026-07-23T00:00:00.000Z",
          };
        }),
      ),
    ).toContain("held_back_not_sealed");

    expect(
      issueCodes(
        mutated((input) => {
          input.open_corpus = input.open_corpus.map((item) =>
            item.case_id === "O01"
              ? { ...item, title: "receipt for jane.donor@gmail.com" }
              : item,
          );
        }),
      ),
    ).toContain("corpus_not_synthetic");
  });

  it("rejects missing gates, wrong weights, and altered scoring rules", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.gates = input.gates.filter((item) => item.gate_id !== "G09");
        }),
      ),
    ).toContain("gates_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          input.score_dimensions = input.score_dimensions.map((item) =>
            item.dimension_id === "provider_portability"
              ? { ...item, weight: 10 }
              : item,
          );
        }),
      ),
    ).toContain("scoring_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.score_dimensions = input.score_dimensions.filter(
            (item) => item.dimension_id !== "international_text",
          );
        }),
      ),
    ).toContain("scoring_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.scoring_rules = {
            ...input.scoring_rules,
            material_lead_points: 1,
          };
        }),
      ),
    ).toContain("scoring_invalid");
  });

  it("rejects missing operational suites, unbounded budgets, and missing validators", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            concurrency_staircase: { steps: [1, 5, 10, 25] },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            mixed_batch: {
              ...input.operational_suites.mixed_batch,
              poison_items: 0,
            },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = input.budgets.filter(
            (item) => item.metric !== "max_cost_usd_per_thousand_documents",
          );
        }),
      ),
    ).toContain("budget_unbounded");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = input.budgets.map((item) =>
            item.metric === "max_queue_age_seconds"
              ? { ...item, limit: Number.POSITIVE_INFINITY }
              : item,
          );
        }),
      ),
    ).toContain("budget_unbounded");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = [
            ...input.budgets,
            {
              metric: "unregistered_metric",
              limit: 1,
              unit: "items",
              basis: "not part of the protocol",
            } as never,
          ];
        }),
      ),
    ).toContain("protocol_fixed_field_changed");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = input.budgets.map((item) =>
            item.metric === "batch_completion_minutes"
              ? { ...item, limit: 120 }
              : item,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");

    expect(
      issueCodes(
        mutated((input) => {
          input.validators = input.validators.filter(
            (item) => item.category !== "pdf_a_machine",
          );
        }),
      ),
    ).toContain("validator_missing");
  });

  it("rejects role collisions and missing approvals the protocol forbids", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.roles = {
            ...input.roles,
            corpus_custodian: "operator-typst",
          };
        }),
      ),
    ).toContain("role_collision");

    expect(
      issueCodes(
        mutated((input) => {
          input.roles = {
            ...input.roles,
            independent_reviewers: ["reviewer-avery", "reviewer-avery"],
          };
        }),
      ),
    ).toContain("role_collision");

    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = [];
        }),
      ),
    ).toContain("approval_missing");

    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = input.approvals.map((approval) => ({
            ...approval,
            approved_at: "not-a-timestamp",
          }));
        }),
      ),
    ).toContain("approval_missing");

    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = input.approvals.map((approval) => ({
            ...approval,
            approved_at: "2026-07-22T12:01:00.000Z",
          }));
        }),
      ),
    ).toContain("approval_missing");

    expect(
      issueCodes(
        mutated((input) => {
          input.remediation_policy = {
            ...input.remediation_policy,
            max_cycles: 3 as never,
          };
        }),
      ),
    ).toContain("charter_incomplete");
  });

  it("throws a typed error carrying every issue when freezing an invalid charter", () => {
    const input = mutated((draft) => {
      draft.gates = [];
      draft.budgets = [];
    });

    try {
      freezeRendererQualificationCharter(input);
      expect.unreachable("invalid charter must not freeze");
    } catch (error) {
      expect(error).toBeInstanceOf(RendererCharterValidationError);
      const codes = (error as RendererCharterValidationError).issues.map(
        (item) => item.code,
      );
      expect(codes).toContain("gates_incomplete");
      expect(codes).toContain("budget_unbounded");
    }
  });
});

describe("verifyRendererQualificationCharter", () => {
  function tamper(
    mutate: (charter: FrozenRendererQualificationCharter) => void,
  ): FrozenRendererQualificationCharter {
    const charter = structuredClone(
      freezeRendererQualificationCharter(buildFixtureContestInput()),
    );
    mutate(charter);
    return charter;
  }

  it("catches field, collection, fixture, and role tampering", () => {
    const mutations: Array<
      (charter: FrozenRendererQualificationCharter) => void
    > = [
      (charter) => {
        (charter.roles as { final_approver: string }).final_approver =
          "operator-prince";
      },
      (charter) => {
        (
          charter.open_corpus[0].fixture as { facts_digest: string }
        ).facts_digest = syntheticDigest("tampered");
      },
      (charter) => {
        (charter.gates[0] as { pass_rule: string }).pass_rule = "relaxed";
      },
      (charter) => {
        (charter.budgets[0] as { limit: number }).limit = 999_999;
      },
      (charter) => {
        (charter as { charter_version: string }).charter_version = "1.0.1";
      },
    ];

    for (const mutate of mutations) {
      const result = verifyRendererQualificationCharter(tamper(mutate));
      expect(result.valid).toBe(false);
      expect(result.failures.map((item) => item.code)).toContain(
        "digest_mismatch",
      );
    }
  });

  it("rejects a self-consistent charter that could never have legitimately frozen", async () => {
    const charter = structuredClone(
      freezeRendererQualificationCharter(buildFixtureContestInput()),
    );
    (charter as { gates: unknown }).gates = charter.gates.slice(0, 11);
    const { schema_version, manifest_digest: _old, ...frozenFields } = charter;
    (charter as { manifest_digest: string }).manifest_digest =
      digestQualificationValue({ schema_version, charter: frozenFields });

    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((item) => item.code)).toContain(
      "structure_invalid",
    );
  });

  it("rejects a self-consistent digest over non-normalized frozen fields", () => {
    const charter = structuredClone(
      freezeRendererQualificationCharter(buildFixtureContestInput()),
    );
    (charter as { budgets: typeof PHASE_18_ABSOLUTE_BUDGETS }).budgets = [
      ...charter.budgets,
    ].reverse();
    const { schema_version, manifest_digest: _old, ...frozenFields } = charter;
    (charter as { manifest_digest: string }).manifest_digest =
      digestQualificationValue({ schema_version, charter: frozenFields });

    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((item) => item.code)).toContain(
      "digest_mismatch",
    );
  });

  it("rejects unsupported schema versions", () => {
    const charter = tamper((draft) => {
      (draft as { schema_version: string }).schema_version = "999";
    });
    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((item) => item.code)).toContain(
      "schema_version_unsupported",
    );
  });
});

describe("the harness surface", () => {
  it("contains no winner-selection or production-renderer code path and never treats missing evidence as pass", async () => {
    const moduleExports =
      await import("../../../../packages/api/src/generated-documents/renderer-qualification");
    const exportNames = Object.keys(moduleExports).map((name) =>
      name.toLowerCase(),
    );

    for (const forbidden of ["select", "winner", "activate", "production"]) {
      expect(
        exportNames.filter((name) => name.includes(forbidden)),
        `no export may ${forbidden}`,
      ).toEqual([]);
    }

    // The unknown-evidence rule is frozen into every charter.
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    expect(charter.unknown_evidence_rule).toBe("fails_affected_gate");
  });
});

describe("protocol-fixed fields are pinned at freeze", () => {
  it("rejects an altered hard-gate pass rule", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.gates = input.gates.map((gate) =>
            gate.gate_id === "G01"
              ? { ...gate, pass_rule: "always passes" }
              : gate,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects altered tie-break criteria", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.scoring_rules = {
            ...input.scoring_rules,
            tie_break_order: ["vibes", "coin flip", "incumbency"],
          };
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects a substituted frozen validator", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.validators = input.validators.map((tool) =>
            tool.name === "veraPDF" ? { ...tool, version: "9.9.9" } : tool,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects a reduced requalification-trigger set", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.requalification_triggers = [
            input.requalification_triggers[0] ?? "only one trigger",
          ];
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects extra failure-matrix injections beyond the frozen eight", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            failure_matrix: {
              injections: [
                ...input.operational_suites.failure_matrix.injections,
                "surprise_injection",
              ],
            },
          };
        }),
      ),
    ).toContain("suite_invalid");
  });

  it("rejects duplicate or reordered order-sensitive operational suite entries", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            repeatability: {
              ...input.operational_suites.repeatability,
              case_ids: [
                ...PHASE_18_OPERATIONAL_SUITES.repeatability.case_ids,
              ].reverse(),
            },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            failure_matrix: {
              injections: [
                ...input.operational_suites.failure_matrix.injections,
                input.operational_suites.failure_matrix.injections[0] ?? "",
              ],
            },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            failure_matrix: {
              injections: [
                ...input.operational_suites.failure_matrix.injections,
              ].reverse(),
            },
          };
        }),
      ),
    ).toContain("suite_invalid");
  });

  it("rejects duplicate hard gates and validators", () => {
    expect(
      issueCodes(
        mutated((input) => {
          const duplicate = input.gates[0];
          if (duplicate) input.gates = [...input.gates, duplicate];
        }),
      ),
    ).toContain("gates_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          const duplicate = input.validators[0];
          if (duplicate) input.validators = [...input.validators, duplicate];
        }),
      ),
    ).toContain("validator_missing");
  });

  it("rejects protocol-fixed corpus metadata and open-case expectations changes", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.open_corpus = input.open_corpus.map((item) =>
            item.case_id === "O01"
              ? {
                  ...item,
                  expected: {
                    protected_facts: ["different protected fact"],
                    layout_assertions: item.expected?.layout_assertions ?? [],
                  },
                }
              : item,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.map((item) =>
            item.case_id === "H01"
              ? { ...item, title: "Different held-back case title" }
              : item,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("pins the Typst pipeline and the Chromium control lock", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-T"
              ? { ...item, pipeline: "typst-anywhere@latest" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-C"
              ? { ...item, pipeline: "puppeteer-freestyle" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-C"
              ? { ...item, engine_version: " " }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");
  });

  it("rejects a malformed held-back seal timestamp", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            sealed_at: "not-a-timestamp",
          };
        }),
      ),
    ).toContain("held_back_not_sealed");
  });
});
