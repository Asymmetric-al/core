import { describe, expect, it } from "vitest";

import {
  FIXTURE_BUDGETS,
  buildFixtureContestInput,
} from "./renderer-qualification-test-fixture";
import {
  PHASE_18_BUDGET_DEFINITIONS,
  REQUIRED_BUDGET_METRICS,
  freezeRendererQualificationCharter,
  loadCandidateWorkPacket,
  validateRendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  AbsoluteBudget,
  RendererQualificationCharterInput,
  RequiredBudgetMetric,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

const EXPECTED_BUDGET_METRICS = [
  "short_item_latency_p50_ms",
  "short_item_latency_p95_ms",
  "short_item_latency_p99_ms",
  "medium_item_latency_p50_ms",
  "medium_item_latency_p95_ms",
  "medium_item_latency_p99_ms",
  "long_item_latency_p50_ms",
  "long_item_latency_p95_ms",
  "long_item_latency_p99_ms",
  "batch_completion_minutes",
  "throughput_items_per_minute",
  "max_attempt_deadline_ms",
  "max_queue_age_seconds",
  "max_resident_memory_mb",
  "max_hostile_input_cpu_time_ms",
  "max_artifact_bytes",
  "min_capacity_headroom_percent",
  "max_error_rate_percent",
  "max_retry_rate_percent",
  "max_provider_requests_per_hour",
  "short_item_cost_usd_per_thousand_documents",
  "medium_item_cost_usd_per_thousand_documents",
  "long_item_cost_usd_per_thousand_documents",
  "max_cost_usd_per_thousand_documents",
  "recovery_time_objective_minutes",
] as const;

function issueCodes(
  input: RendererQualificationCharterInput,
  pathPrefix: "approvals" | "budgets",
): string[] {
  return validateRendererQualificationCharterInput(input)
    .filter((entry) => entry.path.startsWith(pathPrefix))
    .map((entry) => entry.code);
}

function replaceBudget(
  input: RendererQualificationCharterInput,
  metric: RequiredBudgetMetric,
  patch: Partial<AbsoluteBudget>,
): void {
  input.budgets = input.budgets.map((budget) =>
    budget.metric === metric ? { ...budget, ...patch } : budget,
  );
}

describe("renderer qualification budget contract", () => {
  it("registers complete per-shape latency, cost, and hostile-input CPU metrics", () => {
    expect(REQUIRED_BUDGET_METRICS).toEqual(EXPECTED_BUDGET_METRICS);
  });

  it("freezes the exported metric inventory so callers cannot weaken validation", () => {
    expect(Object.isFrozen(REQUIRED_BUDGET_METRICS)).toBe(true);
    expect(() =>
      (REQUIRED_BUDGET_METRICS as unknown as string[]).pop(),
    ).toThrow(TypeError);
  });

  it("keeps numeric limits out of the protocol-owned definitions", () => {
    expect(PHASE_18_BUDGET_DEFINITIONS).toHaveLength(
      EXPECTED_BUDGET_METRICS.length,
    );
    expect(
      PHASE_18_BUDGET_DEFINITIONS.every(
        (definition) => !("limit" in definition),
      ),
    ).toBe(true);
    for (const definition of PHASE_18_BUDGET_DEFINITIONS) {
      expect(Object.keys(definition).sort()).toEqual([
        "basis",
        "metric",
        "unit",
      ]);
    }
  });

  it("propagates caller-supplied limits without providing a numeric default", () => {
    const suppliedBudgets = FIXTURE_BUDGETS.map((budget) =>
      budget.metric === "batch_completion_minutes"
        ? { ...budget, limit: budget.limit + 1 }
        : budget,
    );
    const input = buildFixtureContestInput({ budgets: suppliedBudgets });

    expect(input.budgets).toEqual(suppliedBudgets);
    expect(issueCodes(input, "budgets")).not.toContain(
      "protocol_fixed_field_changed",
    );
  });

  it("fails closed when runtime input omits the required budget register", () => {
    const input = buildFixtureContestInput({ budgets: undefined as never });

    expect(input.budgets).toEqual([]);
    expect(issueCodes(input, "budgets")).toContain("budget_unbounded");
  });

  it("changes the manifest digest when owners change a coherent limit", () => {
    const base = freezeRendererQualificationCharter(buildFixtureContestInput());
    const changedInput = buildFixtureContestInput();
    replaceBudget(changedInput, "batch_completion_minutes", { limit: 91 });
    const changed = freezeRendererQualificationCharter(changedInput);

    expect(changed.manifest_digest).not.toBe(base.manifest_digest);
  });

  it("gives both finalists the same immutable frozen budget register", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const prince = loadCandidateWorkPacket(
      charter,
      "P18-R-P",
      "operator-prince",
    );
    const typst = loadCandidateWorkPacket(charter, "P18-R-T", "operator-typst");

    expect(prince.budgets).toEqual(charter.budgets);
    expect(typst.budgets).toEqual(prince.budgets);
    expect(Object.isFrozen(charter.budgets)).toBe(true);
  });

  it.each(EXPECTED_BUDGET_METRICS)("rejects a missing %s budget", (metric) => {
    const input = buildFixtureContestInput();
    input.budgets = input.budgets.filter((budget) => budget.metric !== metric);

    expect(issueCodes(input, "budgets")).toContain("budget_unbounded");
  });

  it("rejects duplicate and extra metrics", () => {
    const duplicate = buildFixtureContestInput();
    duplicate.budgets = [...duplicate.budgets, duplicate.budgets[0]!];
    expect(issueCodes(duplicate, "budgets")).toContain("budget_unbounded");

    const extra = buildFixtureContestInput();
    extra.budgets = [
      ...extra.budgets,
      {
        metric: "undeclared_metric",
        limit: 1,
        unit: "items",
        basis: "not registered",
      } as never,
    ];
    expect(issueCodes(extra, "budgets")).toContain(
      "protocol_fixed_field_changed",
    );
  });

  it("rejects a non-array or non-object budget register", () => {
    const nonArray = buildFixtureContestInput();
    nonArray.budgets = "not-an-array" as never;
    expect(issueCodes(nonArray, "budgets")).toContain("budget_unbounded");

    const nonObject = buildFixtureContestInput();
    nonObject.budgets = [
      ...nonObject.budgets.slice(1),
      "not-an-object" as never,
    ];
    expect(issueCodes(nonObject, "budgets")).toContain("budget_unbounded");
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, "100"])(
    "rejects the invalid runtime limit %s",
    (limit) => {
      const input = buildFixtureContestInput();
      replaceBudget(input, "max_queue_age_seconds", {
        limit: limit as number,
      });

      expect(issueCodes(input, "budgets")).toContain("budget_unbounded");
    },
  );

  it("rejects undeclared fields on a budget record", () => {
    const input = buildFixtureContestInput();
    input.budgets = input.budgets.map((budget) =>
      budget.metric === "batch_completion_minutes"
        ? ({ ...budget, source: "not frozen" } as typeof budget)
        : budget,
    );

    expect(issueCodes(input, "budgets")).toContain(
      "protocol_fixed_field_changed",
    );

    const missingField = buildFixtureContestInput();
    missingField.budgets = missingField.budgets.map((budget) => {
      if (budget.metric !== "batch_completion_minutes") return budget;
      const { basis: _basis, ...withoutBasis } = budget;
      return withoutBasis as typeof budget;
    });
    expect(issueCodes(missingField, "budgets")).toContain(
      "protocol_fixed_field_changed",
    );
  });

  it.each(["unit", "basis"] as const)(
    "rejects a changed protocol-owned %s",
    (field) => {
      const input = buildFixtureContestInput();
      replaceBudget(input, "max_hostile_input_cpu_time_ms", {
        [field]: "rewritten after results",
      });

      expect(issueCodes(input, "budgets")).toContain(
        "protocol_fixed_field_changed",
      );
    },
  );

  it("pins the hostile-input CPU and per-shape cost measurement bases", () => {
    const definitions = new Map(
      PHASE_18_BUDGET_DEFINITIONS.map((definition) => [
        definition.metric,
        definition,
      ]),
    );

    expect(definitions.get("max_hostile_input_cpu_time_ms")).toEqual({
      metric: "max_hostile_input_cpu_time_ms",
      unit: "CPU ms",
      basis:
        "CPU time summed across all cores for one hostile or malformed attempt at maximum admitted bounds",
    });
    for (const shape of ["short", "medium", "long"] as const) {
      expect(
        definitions.get(`${shape}_item_cost_usd_per_thousand_documents`)?.unit,
      ).toBe("USD per 1,000 documents");
    }
  });

  it("rejects incoherent percentile ordering", () => {
    const input = buildFixtureContestInput();
    input.budgets = input.budgets.map((budget) =>
      budget.metric === "short_item_latency_p50_ms"
        ? { ...budget, limit: 11_000 }
        : budget,
    );

    expect(issueCodes(input, "budgets")).toContain("budget_incoherent");
  });

  it.each([
    ["short_item_latency_p50_ms", 203],
    ["short_item_latency_p95_ms", 304],
    ["short_item_latency_p99_ms", 1_011],
    ["medium_item_latency_p50_ms", 506],
    ["medium_item_latency_p95_ms", 607],
    ["medium_item_latency_p99_ms", 1_011],
    ["long_item_latency_p50_ms", 809],
    ["long_item_latency_p95_ms", 910],
    ["long_item_latency_p99_ms", 1_011],
  ] as const)("rejects incoherent %s ordering", (metric, limit) => {
    const input = buildFixtureContestInput();
    replaceBudget(input, metric, { limit });

    expect(issueCodes(input, "budgets")).toContain("budget_incoherent");
  });

  it.each(["product_budget_owner", "operations_budget_owner"] as const)(
    "requires exactly one valid %s approval",
    (role) => {
      const missing = buildFixtureContestInput();
      missing.approvals = missing.approvals.filter(
        (approval) => approval.role !== role,
      );
      expect(issueCodes(missing, "approvals")).toContain("approval_missing");

      const wrongActor = buildFixtureContestInput();
      wrongActor.approvals = wrongActor.approvals.map((approval) =>
        approval.role === role
          ? { ...approval, actor: "unassigned-budget-approver" }
          : approval,
      );
      expect(issueCodes(wrongActor, "approvals")).toContain("approval_missing");

      const duplicate = buildFixtureContestInput();
      const approval = duplicate.approvals.find(
        (entry) => entry.role === role,
      )!;
      duplicate.approvals = [...duplicate.approvals, approval];
      expect(issueCodes(duplicate, "approvals")).toContain(
        "approval_duplicate",
      );
      expect(issueCodes(duplicate, "approvals")).toContain("approval_missing");
    },
  );

  it("requires budget approvals before the final approval at full precision", () => {
    const input = buildFixtureContestInput();
    input.approvals = input.approvals.map((approval) =>
      approval.role === "operations_budget_owner"
        ? { ...approval, approved_at: "2026-07-22T11:59:00.0001Z" }
        : approval,
    );

    expect(issueCodes(input, "approvals")).toContain("approval_invalid");
  });

  it("accepts equivalent explicit-offset budget and final approval instants", () => {
    const input = buildFixtureContestInput();
    input.approvals = input.approvals.map((approval) =>
      approval.role === "operations_budget_owner"
        ? { ...approval, approved_at: "2026-07-22T18:59:00+07:00" }
        : approval,
    );

    expect(issueCodes(input, "approvals")).toEqual([]);
  });

  it("allows one actor to record separate budget and final approvals", () => {
    const input = buildFixtureContestInput();
    const actor = input.roles.accountable_owner;
    input.roles = {
      ...input.roles,
      operations_reviewer: actor,
      final_approver: actor,
    };
    input.approvals = input.approvals.map((approval) =>
      ["operations_budget_owner", "final_approver"].includes(approval.role)
        ? { ...approval, actor }
        : approval,
    );

    expect(issueCodes(input, "approvals")).toEqual([]);
  });
});
