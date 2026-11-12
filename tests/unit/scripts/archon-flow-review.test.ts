import { describe, expect, it } from "vitest";

import {
  ASSESSMENT_CHOICES,
  planAdjudication,
  planAssessment,
  sealDecision,
  sealReview,
} from "../../../scripts/archon-factory/pack/deliver/scripts/review-logic.mjs";

const binding = { candidate: "c0ffee", acceptanceRevision: "rev1" };
const finding = (
  severity: string,
  condition: string,
  owner = "implementation",
) => ({
  severity,
  condition,
  interaction: "i",
  consequence: `${condition} breaks totals`,
  location: `apps/x/${condition}.ts:3`,
  evidence: `run_check ${condition}`,
  correction: `fix ${condition}`,
  owner,
});
const review = (
  decision: string,
  findings: ReturnType<typeof finding>[] = [],
  extra: Record<string, unknown> = {},
) => ({
  task_status: "DONE",
  decision,
  candidate_sha: "c0ffee",
  acceptance_revision: "rev1",
  scope: "all files",
  findings,
  checks_run: ["bun test"],
  limitations: [],
  ...extra,
});
const sealed = (
  micaiah: ReturnType<typeof review> | null,
  luke: ReturnType<typeof review> | null,
) => {
  const reports = {
    micaiah: sealReview("Micaiah", micaiah, binding),
    luke: sealReview("Luke", luke, binding),
  };
  return { reports, ...sealDecision(reports) };
};
const assess = (dispositions: [string, string][]) => ({
  task_status: "DONE",
  dispositions: dispositions.map(([id, action]) => ({
    finding: id,
    action,
    reason: `Samson on ${id}`,
  })),
  summary: "s",
});

describe("seal (independence#6)", () => {
  it("treats a CLEAR review that lists P0/P1 findings as FINDINGS and sends them to Samson", () => {
    const seal = sealed(
      review("CLEAR", [finding("P1", "refunds")]),
      review("CLEAR"),
    );
    expect(seal.reports.micaiah.decision).toBe("FINDINGS");
    expect(seal.bothClear).toBe(false);
    expect(seal.findings).toEqual([
      expect.objectContaining({ id: "M1", severity: "P1" }),
    ]);
  });

  it("keeps CLEAR with only P2/P3 notes but still has Samson assess them", () => {
    const seal = sealed(
      review("CLEAR", [finding("P3", "naming")]),
      review("CLEAR"),
    );
    expect(seal.reports.micaiah.decision).toBe("CLEAR");
    expect(seal.bothClear).toBe(false);
    expect(seal.findings).toHaveLength(1);
  });

  it("is clear only when both reviews are CLEAR with no findings", () => {
    expect(sealed(review("CLEAR"), review("CLEAR")).bothClear).toBe(true);
    expect(sealed(review("CLEAR"), null).bothClear).toBe(false);
    expect(
      sealed(review("CLEAR"), review("CLEAR", [], { candidate_sha: "other" }))
        .reports.luke.decision,
    ).toBe("INCONCLUSIVE");
  });
});

describe("INCONCLUSIVE first-pass gate on the adjudication path (independence#3)", () => {
  it("blocks before sending disputes to Agabus when a review is INCONCLUSIVE and nothing needs repair", () => {
    // Verifier: Micaiah INCONCLUSIVE, Luke one P2 finding that Samson sends to adjudication.
    const seal = sealed(
      review("INCONCLUSIVE", [], { scope: "could not run checks" }),
      review("FINDINGS", [finding("P2", "rounding")]),
    );
    const plan = planAssessment({
      findings: seal.findings,
      assess: assess([["L1", "adjudicate"]]),
      reports: seal.reports,
    });
    expect(plan).toMatchObject({
      kind: "blocked",
      blocked: { code: "review-inconclusive" },
    });
  });

  it("blocks after Agabus rejects every claim while a review is INCONCLUSIVE", () => {
    const seal = sealed(
      review("INCONCLUSIVE"),
      review("FINDINGS", [finding("P1", "refunds")]),
    );
    const plan = {
      implementation: [],
      acceptance: [],
      disputes: [
        {
          claim: "D1",
          finding: "L1",
          owner: "implementation",
          severity: "P1",
          statement: "refunds",
          proposed: "fix",
        },
      ],
    };
    const agabus = {
      task_status: "DONE",
      rulings: [
        { claim: "D1", ruling: "REJECT", reason: "no", correction: "" },
      ],
      checks_run: [],
      limitations: [],
    };
    expect(
      planAdjudication({
        agabus,
        plan,
        plannedFinal: "no",
        reports: seal.reports,
      }),
    ).toMatchObject({
      kind: "blocked",
      blocked: { code: "review-inconclusive" },
    });
  });

  it("re-checks the sealed reports when after-assess planned final acceptance", () => {
    const seal = sealed(review("INCONCLUSIVE"), review("CLEAR"));
    expect(
      planAdjudication({
        agabus: null,
        plan: null,
        plannedFinal: "yes",
        reports: seal.reports,
      }),
    ).toMatchObject({ kind: "blocked" });
    const clear = sealed(review("CLEAR"), review("CLEAR"));
    expect(
      planAdjudication({
        agabus: null,
        plan: null,
        plannedFinal: "yes",
        reports: clear.reports,
      }),
    ).toMatchObject({ kind: "pass", final: true });
  });

  it("still repairs (a new candidate gets fresh reviews) when a review is INCONCLUSIVE", () => {
    const seal = sealed(
      review("INCONCLUSIVE"),
      review("FINDINGS", [finding("P1", "refunds"), finding("P2", "rounding")]),
    );
    const plan = planAssessment({
      findings: seal.findings,
      assess: assess([
        ["L1", "repair-implementation"],
        ["L2", "adjudicate"],
      ]),
      reports: seal.reports,
    });
    expect(plan).toMatchObject({ kind: "adjudicate", final: false });
  });
});

describe("neutral claim ids for Agabus (independence#5)", () => {
  const disputed = (first: string, second: string) => {
    const seal = sealed(
      review("FINDINGS", [finding("P1", first)]),
      review("FINDINGS", [finding("P2", second)]),
    );
    return planAssessment({
      findings: seal.findings,
      assess: assess([
        ["M1", "adjudicate"],
        ["L1", "adjudicate"],
      ]),
      reports: seal.reports,
    });
  };

  it("numbers disputes D1..Dn and strips anything naming the reviewer", () => {
    const plan = disputed("refunds", "rounding");
    expect(plan.kind).toBe("adjudicate");
    expect(plan.claims.map((claim: { claim: string }) => claim.claim)).toEqual([
      "D1",
      "D2",
    ]);
    const text = JSON.stringify(plan.claims);
    expect(text).not.toMatch(
      /"(M|L)\d+"|micaiah|luke|"finding"|"owner"|"severity"/i,
    );
  });

  it("rewrites Samson's references to reviewers and finding ids in the counter-argument", () => {
    const seal = sealed(
      review("FINDINGS", [finding("P1", "refunds")]),
      review("FINDINGS", [finding("P2", "rounding")]),
    );
    const samson = {
      task_status: "DONE",
      dispositions: [
        {
          finding: "M1",
          action: "adjudicate",
          reason: "Luke's L1 contradicts this; Micaiah ran no check",
        },
        { finding: "L1", action: "adjudicate", reason: "Conflicts with M1" },
      ],
      summary: "s",
    };
    const plan = planAssessment({
      findings: seal.findings,
      assess: samson,
      reports: seal.reports,
    });
    const ids = Object.fromEntries(
      plan.plan.disputes.map((entry: { finding: string; claim: string }) => [
        entry.finding,
        entry.claim,
      ]),
    );
    const counters = Object.fromEntries(
      plan.claims.map((claim: { claim: string; counter: string }) => [
        claim.claim,
        claim.counter,
      ]),
    );
    expect(counters[ids.M1]).toBe(
      `a reviewer's ${ids.L1} contradicts this; a reviewer ran no check`,
    );
    expect(counters[ids.L1]).toBe(`Conflicts with ${ids.M1}`);
  });

  it("orders claims by content, not by which reviewer raised them", () => {
    const strip = (plan: { claims: Record<string, unknown>[] }) =>
      plan.claims.map(({ counter, ...claim }) => claim);
    expect(strip(disputed("refunds", "rounding"))).toEqual(
      strip(disputed("rounding", "refunds")),
    );
  });

  it("keeps the D-to-finding map in the trusted plan and translates rulings back", () => {
    const seal = sealed(
      review("FINDINGS", [finding("P1", "refunds")]),
      review("FINDINGS", [finding("P2", "rounding", "acceptance")]),
    );
    const plan = planAssessment({
      findings: seal.findings,
      assess: assess([
        ["M1", "adjudicate"],
        ["L1", "adjudicate"],
      ]),
      reports: seal.reports,
    });
    const byFinding = Object.fromEntries(
      plan.plan.disputes.map((entry: { finding: string; claim: string }) => [
        entry.finding,
        entry.claim,
      ]),
    );
    expect(Object.keys(byFinding).sort()).toEqual(["L1", "M1"]);
    const agabus = {
      task_status: "DONE",
      rulings: [
        {
          claim: byFinding.M1,
          ruling: "ACCEPT",
          reason: "reproduced",
          correction: "subtract refunds",
        },
        {
          claim: byFinding.L1,
          ruling: "ACCEPT",
          reason: "oracle wrong",
          correction: "assert USD",
        },
      ],
      checks_run: [],
      limitations: [],
    };
    const result = planAdjudication({
      agabus,
      plan: plan.plan,
      plannedFinal: plan.final ? "yes" : "no",
      reports: seal.reports,
    });
    expect(result.kind).toBe("repair");
    expect(result.repair.implementation).toEqual([
      expect.stringContaining("[M1 P1]"),
    ]);
    expect(result.repair.implementation[0]).toContain("subtract refunds");
    // S5.7: an accepted acceptance-owned claim goes to Ezra.
    expect(result.repair.acceptance).toEqual([
      expect.stringContaining("[L1 P2]"),
    ]);
    expect(result.repair.source).toBe("after-adjudicate");
  });

  it("asks for evidence when a claim has no ruling", () => {
    const plan = disputed("refunds", "rounding");
    const agabus = {
      task_status: "DONE",
      rulings: [
        { claim: "D1", ruling: "REJECT", reason: "no", correction: "" },
      ],
      checks_run: [],
      limitations: [],
    };
    const reports = sealed(review("CLEAR"), review("CLEAR")).reports;
    expect(
      planAdjudication({
        agabus,
        plan: plan.plan,
        plannedFinal: "yes",
        reports,
      }),
    ).toMatchObject({ kind: "blocked", blocked: { code: "needs-evidence" } });
  });
});

describe("repairs from assessment (I2, independence#2)", () => {
  it("keeps implementation and acceptance repairs apart", () => {
    const seal = sealed(
      review("FINDINGS", [finding("P1", "refunds")]),
      review("FINDINGS", [finding("P2", "currency", "acceptance")]),
    );
    const plan = planAssessment({
      findings: seal.findings,
      assess: assess([
        ["M1", "repair-implementation"],
        ["L1", "repair-acceptance"],
      ]),
      reports: seal.reports,
    });
    expect(plan.kind).toBe("repair");
    expect(plan.repair).toEqual({
      acceptance: [expect.stringContaining("[L1 P2]")],
      implementation: [expect.stringContaining("[M1 P1]")],
      source: "after-assess",
    });
  });
});

describe("adjudication needs its trusted plan (verifier new defect)", () => {
  const agabus = (claims: [string, string][]) => ({
    task_status: "DONE",
    rulings: claims.map(([claim, ruling]) => ({
      claim,
      ruling,
      reason: "r",
      correction: "c",
    })),
    checks_run: [],
    limitations: [],
  });
  const clear = sealed(review("CLEAR"), review("CLEAR")).reports;
  const plan = {
    implementation: [],
    acceptance: [],
    disputes: [
      {
        claim: "D1",
        finding: "M1",
        owner: "implementation",
        severity: "P1",
        statement: "refunds",
        proposed: "fix",
      },
    ],
  };

  it("blocks instead of passing to final when the assess-plan ledger is missing", () => {
    // Verifier probe: rulings present, plan null -> used to return kind 'final'.
    for (const missing of [null, {}, { disputes: [] }, { disputes: "D1" }])
      expect(
        planAdjudication({
          agabus: agabus([["D1", "ACCEPT"]]),
          plan: missing,
          plannedFinal: "yes",
          reports: clear,
        }),
        JSON.stringify(missing),
      ).toMatchObject({
        kind: "blocked",
        blocked: { code: "adjudication-plan-missing" },
      });
  });

  it("blocks when Agabus rules on a claim the plan does not contain", () => {
    expect(
      planAdjudication({
        agabus: agabus([
          ["D1", "REJECT"],
          ["D7", "ACCEPT"],
        ]),
        plan,
        plannedFinal: "yes",
        reports: clear,
      }),
    ).toMatchObject({
      kind: "blocked",
      blocked: { code: "adjudication-mismatch" },
    });
  });

  it("blocks when disputes were planned but Agabus returned nothing", () => {
    expect(
      planAdjudication({
        agabus: null,
        plan,
        plannedFinal: "yes",
        reports: clear,
      }),
    ).toMatchObject({
      kind: "blocked",
      blocked: { code: "adjudication-missing" },
    });
  });

  it("still clears disputes Agabus rejected on the evidence", () => {
    expect(
      planAdjudication({
        agabus: agabus([["D1", "REJECT"]]),
        plan,
        plannedFinal: "yes",
        reports: clear,
      }),
    ).toMatchObject({ kind: "final", rejected: 1 });
  });
});

describe("acceptance corrections pending from a review round (I1, I2)", () => {
  const CHANGE =
    "The governing issue context changed after acceptance was defined. Re-derive acceptance from the current request.";

  it("sends a clear candidate back to Ezra instead of final acceptance while a correction is pending", () => {
    const seal = sealed(review("CLEAR"), review("CLEAR"));
    expect(
      planAssessment({
        findings: seal.findings,
        assess: null,
        reports: seal.reports,
        bothClear: seal.bothClear,
        pending: [CHANGE],
      }),
    ).toMatchObject({
      kind: "repair",
      repair: {
        acceptance: [CHANGE],
        implementation: [],
        source: "after-assess",
      },
    });
  });

  it("goes to final acceptance when both reviews are clear and nothing is pending", () => {
    const seal = sealed(review("CLEAR"), review("CLEAR"));
    expect(
      planAssessment({
        findings: seal.findings,
        assess: null,
        reports: seal.reports,
        bothClear: seal.bothClear,
      }),
    ).toMatchObject({ kind: "final" });
    expect(
      planAssessment({
        findings: seal.findings,
        assess: null,
        reports: seal.reports,
        bothClear: seal.bothClear,
        pending: [],
      }),
    ).toMatchObject({ kind: "final" });
  });

  it("keeps the pending correction next to the round's own repairs", () => {
    const seal = sealed(
      review("FINDINGS", [finding("P1", "refunds")]),
      review("CLEAR"),
    );
    const plan = planAssessment({
      findings: seal.findings,
      assess: assess([["M1", "repair-implementation"]]),
      reports: seal.reports,
      bothClear: seal.bothClear,
      pending: [CHANGE],
    });
    expect(plan).toMatchObject({ kind: "repair" });
    expect(plan.repair.acceptance).toEqual([CHANGE]);
    expect(plan.repair.implementation).toEqual([
      expect.stringContaining("[M1 P1]"),
    ]);
  });

  it("returns to Ezra rather than final after Agabus rejects every dispute", () => {
    const seal = sealed(
      review("FINDINGS", [finding("P2", "rounding")]),
      review("CLEAR"),
    );
    const plan = planAssessment({
      findings: seal.findings,
      assess: assess([["M1", "adjudicate"]]),
      reports: seal.reports,
      bothClear: seal.bothClear,
      pending: [CHANGE],
    });
    expect(plan).toMatchObject({ kind: "adjudicate", final: false });
    const agabus = {
      task_status: "DONE",
      rulings: [
        { claim: "D1", ruling: "REJECT", reason: "no", correction: "" },
      ],
      checks_run: [],
      limitations: [],
    };
    expect(
      planAdjudication({
        agabus,
        plan: plan.plan,
        plannedFinal: "no",
        reports: seal.reports,
      }),
    ).toMatchObject({
      kind: "repair",
      repair: { acceptance: [CHANGE], implementation: [] },
    });
  });

  it("treats a pending correction as a repair when a review is INCONCLUSIVE (fresh reviews follow)", () => {
    const seal = sealed(review("INCONCLUSIVE"), review("CLEAR"));
    // The next round re-derives acceptance and re-reviews; the INCONCLUSIVE
    // review never reaches final acceptance.
    expect(
      planAssessment({
        findings: seal.findings,
        assess: assess([]),
        reports: seal.reports,
        bothClear: seal.bothClear,
        pending: [CHANGE],
      }),
    ).toMatchObject({ kind: "repair" });
  });
});

describe("Samson's assessment choices", () => {
  it("keeps an optional finding from starting a repair round", () => {
    expect(ASSESSMENT_CHOICES).toContain("not-material");
    expect(ASSESSMENT_CHOICES).toMatch(
      /optional, non-blocking or a follow-up[^.]*not-material/,
    );
    expect(ASSESSMENT_CHOICES).toContain(
      "Never choose a repair only to obtain a new review",
    );
  });

  it("still never lets Samson dismiss a P0 or P1 finding", () => {
    expect(ASSESSMENT_CHOICES).toContain(
      "P0/P1 findings are never dismissed by you",
    );
  });
});
