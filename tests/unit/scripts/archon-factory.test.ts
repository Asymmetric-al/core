import { describe, expect, it } from "vitest";

import {
  evaluateEligibility,
  type EligibilityInput,
  type WorkItem,
} from "../../../scripts/archon-factory/pack/.shared/eligibility";
import { validateSamsonSelection } from "../../../scripts/archon-factory/pack/.shared/selection";

function item(id: string): WorkItem {
  return {
    id,
    contextRevision: "context-1",
    eligibleSinceMs: 0,
    dependenciesReconciled: true,
    dependencies: [],
    evidence: [],
    admission: {
      hold: "clear",
      owner: "clear",
      sharedArea: "clear",
      resources: "clear",
    },
  };
}

function input(items: WorkItem[]): EligibilityInput {
  return {
    scope: { revision: "scope-1", approvedIssueIds: ["core#1", "core#2"] },
    items: Object.fromEntries(
      items.map((work) => [work.id, { status: "found", value: work }]),
    ),
  };
}

function selection() {
  return {
    issueIds: ["core#1"],
    scopeRevision: "scope-1",
    contextRevision: "context-1",
    ranking: {
      roadmapPriority: 4,
      unlockValue: 3,
      repairValue: 2,
      agingBonus: 5,
      tieBreakKey: "core#1",
    },
    reason: {
      summary: "Unblocks the approved work",
      sources: ["roadmap:revision-1"],
      expectedBenefit: "Restore progress",
      affectedAreas: ["factory-policy"],
      uncertainty: "None reported",
    },
  };
}

const policy = { nowMs: 100_000, agingIntervalMs: 1000, maxAgingBonus: 5 };

describe("Archon trusted eligibility", () => {
  it("admits only the explicit approved scope in stable identity order", () => {
    const result = evaluateEligibility(
      input([item("core#3"), item("core#2"), item("core#1")]),
    );
    expect(result.eligible.map((work) => work.id)).toEqual([
      "core#1",
      "core#2",
    ]);
    expect(result.scopeRevision).toBe("scope-1");
  });

  it.each(["implementation", "dispatch", "qualification", "release"] as const)(
    "requires actual %s evidence rather than lifecycle labels",
    (kind) => {
      const work = item("core#1");
      const prerequisite = {
        ...item("core#9"),
        state: "closed",
        deliveryState: "PR_READY",
      };
      const dependencies = {
        implementation: {
          kind: "implementation",
          targetId: prerequisite.id,
          requires: "integrated",
        },
        dispatch: {
          kind: "dispatch",
          targetId: prerequisite.id,
          requires: "dispatch-ready",
        },
        qualification: {
          kind: "qualification",
          targetId: prerequisite.id,
          requires: "qualified",
          gatesAdmission: true,
        },
        release: {
          kind: "release",
          targetId: prerequisite.id,
          requires: "released",
          gatesAdmission: true,
        },
      } as const;
      work.dependencies = [dependencies[kind]];
      const snapshot = input([work, prerequisite, item("core#2")]);
      expect(
        evaluateEligibility(snapshot).eligible.map((candidate) => candidate.id),
      ).toEqual(["core#2"]);
      prerequisite.evidence.push({
        condition: dependencies[kind].requires,
        source: "artifact:verified",
        revision: "sha-1",
        contextRevision: "context-1",
      });
      expect(
        evaluateEligibility(snapshot).eligible.map((candidate) => candidate.id),
      ).toEqual(["core#1", "core#2"]);
    },
  );

  it("distinguishes missing dependencies from unavailable or absent observations", () => {
    const work = item("core#1");
    work.dependencies = [
      { kind: "implementation", targetId: "core#9", requires: "integrated" },
    ];
    const snapshot = input([work, item("core#2")]);
    for (const status of ["missing", "unavailable"] as const) {
      snapshot.items["core#9"] = { status };
      expect(evaluateEligibility(snapshot).blocked[0]?.reasons).toContainEqual({
        issueId: "core#1",
        dependencyId: "core#9",
        code: status === "missing" ? "missing-issue" : "api-unavailable",
      });
    }
    delete snapshot.items["core#9"];
    expect(evaluateEligibility(snapshot).blocked[0]?.reasons[0]?.code).toBe(
      "api-unavailable",
    );
  });

  it("does not turn optional references or later qualification/release gates into blockers", () => {
    const work = item("core#1");
    work.dependencies = [
      { kind: "optional", targetId: "core#missing" },
      { kind: "informational", targetId: work.id },
      {
        kind: "qualification",
        targetId: "core#missing",
        requires: "qualified",
        gatesAdmission: false,
      },
      {
        kind: "release",
        targetId: "core#missing",
        requires: "released",
        gatesAdmission: false,
      },
    ];
    expect(
      evaluateEligibility(input([work])).eligible.map(
        (candidate) => candidate.id,
      ),
    ).toEqual([work.id]);
  });

  it.each(["hold", "owner", "sharedArea", "resources"] as const)(
    "fails closed on conflicting or unknown %s observations",
    (gate) => {
      for (const status of ["conflict", "unavailable", undefined]) {
        const work = item("core#1");
        Object.assign(work.admission, { [gate]: status });
        const result = evaluateEligibility(input([work, item("core#2")]));
        expect(result.eligible.map((candidate) => candidate.id)).toEqual([
          "core#2",
        ]);
        expect(result.blocked[0]?.reasons[0]?.code).toBe(
          `${gate}-${status === "conflict" ? "conflict" : "unavailable"}`,
        );
      }
    },
  );

  it.each(["self", "cycle", "malformed"])(
    "limits a %s hard dependency blocker to affected work",
    (shape) => {
      const first = item("core#1");
      const other = item("core#9");
      first.dependencies = [
        {
          kind: "implementation",
          targetId: shape === "self" ? first.id : other.id,
          requires: "integrated",
        },
      ];
      if (shape === "cycle")
        other.dependencies = [
          {
            kind: "implementation",
            targetId: first.id,
            requires: "integrated",
          },
        ];
      if (shape === "malformed")
        other.dependencies = [{ kind: "unknown" } as never];
      const result = evaluateEligibility(input([first, other, item("core#2")]));
      expect(result.eligible.map((candidate) => candidate.id)).toEqual([
        "core#2",
      ]);
      expect(
        result.blocked[0]?.reasons.some(
          (reason) =>
            reason.code ===
            (shape === "self"
              ? "self-dependency"
              : shape === "cycle"
                ? "cyclic-dependency"
                : "malformed-dependency"),
        ),
      ).toBe(true);
    },
  );

  it("rejects stale or unsourced evidence and unreconciled dependency sources", () => {
    const work = item("core#1");
    const prerequisite = item("core#9");
    work.dependencies = [
      {
        kind: "implementation",
        targetId: prerequisite.id,
        requires: "integrated",
      },
    ];
    prerequisite.evidence = [
      {
        condition: "integrated",
        source: "",
        revision: "sha",
        contextRevision: "context-1",
      },
      {
        condition: "integrated",
        source: "artifact:proof",
        revision: "sha",
        contextRevision: "stale",
      },
    ];
    expect(evaluateEligibility(input([work, prerequisite])).eligible).toEqual(
      [],
    );
    work.dependenciesReconciled = false;
    work.dependencies = [];
    expect(
      evaluateEligibility(input([work])).blocked[0]?.reasons[0]?.code,
    ).toBe("unreconciled-dependencies");
  });

  it("requires own admission observations rather than inherited clearances", () => {
    const work = item("core#1");
    work.admission = Object.create(work.admission);
    expect(evaluateEligibility(input([work])).eligible).toEqual([]);
  });

  it("requires the exact implementation condition, including transitive evidence", () => {
    const work = item("core#1");
    const prerequisite = item("core#9");
    work.dependencies = [
      {
        kind: "implementation",
        targetId: prerequisite.id,
        requires: "integrated",
      },
    ];
    prerequisite.evidence = [
      {
        condition: "implemented",
        source: "artifact:tested",
        revision: "sha",
        contextRevision: "context-1",
      },
    ];
    expect(evaluateEligibility(input([work, prerequisite])).eligible).toEqual(
      [],
    );
    prerequisite.evidence[0]!.condition = "integrated";
    prerequisite.dependencies = [
      { kind: "dispatch", targetId: "core#10", requires: "dispatch-ready" },
    ];
    expect(evaluateEligibility(input([work, prerequisite])).eligible).toEqual(
      [],
    );
    const transitive = item("core#10");
    transitive.evidence = [
      {
        condition: "dispatch-ready",
        source: "artifact:ready",
        revision: "sha",
        contextRevision: "context-1",
      },
    ];
    expect(
      evaluateEligibility(input([work, prerequisite, transitive])).eligible.map(
        (candidate) => candidate.id,
      ),
    ).toEqual([work.id]);
  });

  it.each([
    null,
    {},
    { kind: "dispatch", targetId: "core#9", requires: "integrated" },
    { kind: "release", targetId: "core#9", requires: "released" },
  ])("blocks malformed hard edges without throwing", (edge) => {
    const work = item("core#1");
    work.dependencies = [edge as never];
    expect(
      evaluateEligibility(input([work])).blocked[0]?.reasons[0]?.code,
    ).toBe("malformed-dependency");
  });

  it("isolates malformed issue records and never mutates the snapshot", () => {
    const snapshot = input([item("core#1"), item("core#2")]);
    snapshot.items["core#1"] = {
      status: "found",
      value: { ...item("wrong-id"), dependencies: null } as never,
    };
    const before = structuredClone(snapshot);
    expect(
      evaluateEligibility(snapshot).eligible.map((candidate) => candidate.id),
    ).toEqual(["core#2"]);
    expect(snapshot).toEqual(before);
    expect(evaluateEligibility(snapshot).blocked[0]?.reasons[0]?.code).toBe(
      "malformed-issue",
    );
  });

  it("requires explicit unique scope and permits an intentionally empty scope", () => {
    const snapshot = input([item("core#1")]);
    snapshot.scope.approvedIssueIds = [];
    expect(evaluateEligibility(snapshot).eligible).toEqual([]);
    snapshot.scope.approvedIssueIds = ["core#1", "core#1"];
    expect(() => evaluateEligibility(snapshot)).toThrow(TypeError);
    expect(() => evaluateEligibility({} as never)).toThrow(TypeError);
  });
});

describe("deep dependency inventories", () => {
  it("does not let a deep affected chain prevent independent admission", () => {
    const inventory = Array.from({ length: 6000 }, (_, index) =>
      item(`deep#${index}`),
    );
    for (const [index, work] of inventory.entries()) {
      work.evidence = [
        {
          condition: "integrated",
          source: "artifact:proof",
          revision: "sha",
          contextRevision: "context-1",
        },
      ];
      work.dependencies = [
        {
          kind: "implementation",
          targetId: inventory[index + 1]?.id ?? work.id,
          requires: "integrated",
        },
      ];
    }
    const snapshot = input([...inventory, item("core#2")]);
    snapshot.scope.approvedIssueIds = ["deep#0", "core#2"];
    expect(
      evaluateEligibility(snapshot).eligible.map((work) => work.id),
    ).toEqual(["core#2"]);
  });
});

describe("Samson selection validation", () => {
  it("validates one eligible issue and derives bounded aging from trusted time", () => {
    const result = validateSamsonSelection(
      input([item("core#1")]),
      selection(),
      policy,
    );
    expect(result).toMatchObject({
      ok: true,
      issueId: "core#1",
      aging: { waitedMs: 100_000, bonus: 5, tieBreakKey: "core#1" },
    });
  });

  it.each(
    [[], ["core#1", "core#2"], ["core#1", "core#1"], [9]].map((issueIds) => ({
      issueIds,
    })),
  )("rejects selections that are not exactly one issue", ({ issueIds }) => {
    expect(
      validateSamsonSelection(
        input([item("core#1")]),
        { ...selection(), issueIds },
        policy,
      ),
    ).toEqual({ ok: false, code: "malformed-selection" });
  });

  it("recomputes eligibility and rejects unauthorized, held, missing or stale selections", () => {
    const snapshot = input([item("core#1"), item("core#3")]);
    expect(
      validateSamsonSelection(
        snapshot,
        { ...selection(), issueIds: ["core#3"] },
        policy,
      ),
    ).toEqual({ ok: false, code: "ineligible-issue" });
    expect(
      validateSamsonSelection(
        snapshot,
        { ...selection(), scopeRevision: "stale" },
        policy,
      ),
    ).toEqual({ ok: false, code: "stale-scope" });
    expect(
      validateSamsonSelection(
        snapshot,
        { ...selection(), contextRevision: "stale" },
        policy,
      ),
    ).toEqual({ ok: false, code: "stale-context" });
    snapshot.items["core#1"] = {
      status: "found",
      value: {
        ...item("core#1"),
        admission: { ...item("core#1").admission, hold: "conflict" },
      },
    };
    expect(validateSamsonSelection(snapshot, selection(), policy)).toEqual({
      ok: false,
      code: "ineligible-issue",
    });
    snapshot.items["core#1"] = { status: "missing" };
    expect(validateSamsonSelection(snapshot, selection(), policy)).toEqual({
      ok: false,
      code: "ineligible-issue",
    });
  });

  it.each([0, 99, -1, Infinity, NaN, 1.5])(
    "rejects fabricated or invalid aging bonus %s",
    (agingBonus) => {
      const proposal = selection();
      proposal.ranking.agingBonus = agingBonus;
      expect(
        validateSamsonSelection(input([item("core#1")]), proposal, policy).ok,
      ).toBe(false);
    },
  );

  it("uses integer aging buckets and rejects future readiness timestamps", () => {
    const proposal = selection();
    proposal.ranking.agingBonus = 0;
    expect(
      validateSamsonSelection(input([item("core#1")]), proposal, {
        ...policy,
        nowMs: 999,
      }),
    ).toMatchObject({ ok: true, aging: { bonus: 0 } });
    proposal.ranking.agingBonus = 1;
    expect(
      validateSamsonSelection(input([item("core#1")]), proposal, {
        ...policy,
        nowMs: 1000,
      }),
    ).toMatchObject({ ok: true, aging: { bonus: 1 } });
    const work = item("core#1");
    work.eligibleSinceMs = policy.nowMs + 1;
    expect(validateSamsonSelection(input([work]), proposal, policy)).toEqual({
      ok: false,
      code: "invalid-aging",
    });
  });

  it("accepts the chosen issue named without its leading number sign, and records the trusted id", () => {
    const frontier = {
      scope: { revision: "scope-1", approvedIssueIds: ["#2526", "#2422"] },
      items: {
        "#2526": { status: "found", value: { ...item("core#1"), id: "#2526" } },
        "#2422": { status: "found", value: { ...item("core#2"), id: "#2422" } },
      },
    } as EligibilityInput;
    const proposal = selection();
    proposal.issueIds = [" 2526 "];
    proposal.ranking.tieBreakKey = "2526";

    expect(validateSamsonSelection(frontier, proposal, policy)).toMatchObject({
      ok: true,
      issueId: "#2526",
      aging: { tieBreakKey: "#2526" },
    });

    proposal.ranking.tieBreakKey = "2422";
    expect(validateSamsonSelection(frontier, proposal, policy)).toEqual({
      ok: false,
      code: "invalid-tie-break",
    });
    proposal.issueIds = ["25260"];
    expect(validateSamsonSelection(frontier, proposal, policy)).toEqual({
      ok: false,
      code: "ineligible-issue",
    });
  });

  it("requires stable identity tie metadata and bounded, sourced reasoning", () => {
    const proposal = selection();
    proposal.ranking.tieBreakKey = "model-choice";
    expect(
      validateSamsonSelection(input([item("core#1")]), proposal, policy),
    ).toEqual({ ok: false, code: "invalid-tie-break" });
    for (const invalid of [
      null,
      {},
      { ...selection(), reason: { ...selection().reason, sources: [] } },
      {
        ...selection(),
        ranking: { ...selection().ranking, roadmapPriority: 101 },
      },
    ]) {
      expect(
        validateSamsonSelection(input([item("core#1")]), invalid, policy),
      ).toEqual({ ok: false, code: "malformed-selection" });
    }
  });

  it.each([
    { nowMs: NaN },
    { agingIntervalMs: 0 },
    { agingIntervalMs: -1 },
    { maxAgingBonus: Infinity },
    { maxAgingBonus: 101 },
  ])("rejects invalid trusted policy %j", (overrides) => {
    expect(
      validateSamsonSelection(input([item("core#1")]), selection(), {
        ...policy,
        ...overrides,
      }),
    ).toEqual({ ok: false, code: "invalid-policy" });
  });
});
