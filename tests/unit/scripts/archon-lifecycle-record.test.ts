import { describe, expect, it } from "vitest";

import {
  decideRound,
  normalizeRepair,
  repairRoute,
} from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";
import { normalizeRepair as sharedNormalizeRepair } from "../../../scripts/archon-factory/pack/deliver/scripts/repair-logic.mjs";

// record's decision, as a pure function of the round ledger, the engine's node
// outcomes and the work item it is about to settle.

const HEAD = "1".repeat(40);
const NEW_HEAD = "2".repeat(40);

function item(route: string, overrides: Record<string, unknown> = {}) {
  return {
    status: "active",
    route,
    head: HEAD,
    assignment: { endState: "PR_READY" },
    run: { id: "run-5", route, head: HEAD },
    ...overrides,
  };
}

const claimed = { claim: { proceed: true }, "claim-lease": { taken: true } };
const failedNode = (node_id: string) => ({
  node_id,
  state: "failed",
  error: `${node_id} exceeded its idle timeout`,
});

describe("executor capacity settlement", () => {
  it.each([
    { code: "check-capacity", mask: "failed-node" },
    { code: "check-capacity", mask: "claim" },
    { code: "check-capacity", mask: "repair" },
    { code: "check-cancelled", mask: "failed-node" },
    { code: "check-cancelled", mask: "claim" },
    { code: "check-cancelled", mask: "repair" },
  ])(
    "blocks $code before $mask routing without creating a repair",
    ({ code, mask }) => {
      const blocked = {
        code,
        detail: "The executor did not acquire a heavy slot",
        recovery: "Restore capacity, then retry the same route",
      };
      const decision = decideRound({
        ledger: {
          ...claimed,
          claim: {
            proceed: mask !== "claim",
            code: "install",
            reason: "Installation interrupted",
          },
          "executor-capacity": { blocked },
          "after-define": { acceptance: "rev-1" },
          freeze: {
            repair: { implementation: ["Do not route this as a code defect"] },
          },
        },
        nodes: mask === "failed-node" ? [failedNode("freeze")] : [],
        item: item("oracle"),
      });

      expect(decision).toMatchObject({
        outcome: "BLOCKED",
        blocker: { ...blocked, route: "oracle" },
      });
      expect(decision).not.toHaveProperty("repair");
      expect(decision).not.toHaveProperty("fingerprint");
    },
  );
});

describe("the route after a failed node (I1)", () => {
  it("re-runs the reviews when a node fails after a successful freeze", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        "after-define": { build: true, acceptance: "rev-1" },
        freeze: { review: true, candidate: NEW_HEAD },
      },
      nodes: [failedNode("luke")],
      item: item("initial", { head: NEW_HEAD }),
    });
    expect(decision).toMatchObject({
      outcome: "continue",
      route: "review",
      fingerprint: "failed:luke",
    });
  });

  it("goes to repair when a node fails before freeze and the acceptance tests are already committed", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        "after-define": { build: true, acceptance: "rev-1" },
      },
      nodes: [failedNode("build")],
      item: item("repair", { acceptance: { run: "run-2" } }),
    });
    expect(decision).toMatchObject({ outcome: "continue", route: "repair" });
  });

  // Only the run that recorded acceptance tests may commit them (freeze). A
  // round that defined acceptance and froze nothing therefore runs the
  // acceptance stage again; sent to Bezalel alone, its tests would be set
  // aside and the issue blocked `candidate-integrity`.
  it.each([
    ["initial", "initial"],
    ["oracle", "oracle"],
    ["repair", "oracle"],
  ])(
    "runs the acceptance stage again when a %s round defined acceptance and failed before freeze",
    (ran, next) => {
      const decision = decideRound({
        ledger: {
          ...claimed,
          context: { ok: true },
          "after-define": { build: true, acceptance: "rev-1" },
        },
        nodes: [failedNode("build")],
        item: item(ran, { acceptance: { run: "run-5" } }),
      });
      expect(decision).toMatchObject({ outcome: "continue", route: next });
    },
  );

  it("re-runs the reviews when freeze committed a new head and then failed", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        "after-define": { build: true, acceptance: "rev-1" },
      },
      nodes: [failedNode("freeze")],
      item: item("repair", { head: NEW_HEAD }),
    });
    expect(decision).toMatchObject({ outcome: "continue", route: "review" });
  });

  it("keeps the run's route for a failure before acceptance", () => {
    const decision = decideRound({
      ledger: { ...claimed, context: { ok: true } },
      nodes: [failedNode("scope")],
      item: item("initial"),
    });
    expect(decision).toMatchObject({ outcome: "continue", route: "initial" });
  });

  it("keeps a feedback round on feedback, whatever it recorded", () => {
    const decision = decideRound({
      ledger: { ...claimed, context: { ok: true } },
      nodes: [failedNode("readiness")],
      item: item("feedback", { head: NEW_HEAD }),
    });
    expect(decision).toMatchObject({ outcome: "continue", route: "feedback" });
  });

  it("keeps a review round on review when it fails before freeze", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        "after-define": { build: false, freeze: true, acceptance: "rev-1" },
      },
      nodes: [failedNode("freeze")],
      item: item("review"),
    });
    expect(decision).toMatchObject({ outcome: "continue", route: "review" });
  });

  it("ignores record's own node state", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        publish: { published: true, pr: 7 },
      },
      nodes: [failedNode("record")],
      item: item("initial"),
    });
    expect(decision).toMatchObject({ outcome: "continue", route: "feedback" });
  });
});

describe("repair shapes (I2)", () => {
  it("routes acceptance repairs to Ezra's oracle round, even with implementation items", () => {
    const repair = normalizeRepair(
      {
        acceptance: ["L1 oracle wrong"],
        implementation: ["M1 bug"],
        source: "after-assess",
      },
      "after-assess",
    );
    expect({ repair, route: repairRoute(repair) }).toEqual({
      repair: {
        acceptance: ["L1 oracle wrong"],
        implementation: ["M1 bug"],
        source: "after-assess",
      },
      route: "oracle",
    });
  });

  it("routes implementation-only repairs to Bezalel", () => {
    expect(
      repairRoute(
        normalizeRepair({ acceptance: [], implementation: ["M1"] }, "x"),
      ),
    ).toBe("repair");
  });

  it("routes an empty review-only repair to a review round", () => {
    const repair = normalizeRepair(
      {
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      },
      "readiness",
    );
    expect({ repair, route: repairRoute(repair) }).toEqual({
      repair: {
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      },
      route: "review",
    });
  });

  it.each([
    [
      { kind: "acceptance", items: ["fix the oracle"] },
      "oracle",
      { acceptance: ["fix the oracle"], implementation: [] },
    ],
    [
      { kind: "implementation", items: ["fix it"] },
      "repair",
      { acceptance: [], implementation: ["fix it"] },
    ],
    [
      { kind: "no-change", items: ["address the findings"] },
      "repair",
      { acceptance: [], implementation: ["address the findings"] },
    ],
    [
      { kind: "hooks", items: ["lint failed"] },
      "repair",
      { acceptance: [], implementation: ["lint failed"] },
    ],
  ])("accepts the legacy shape %j", (legacy, route, lists) => {
    const repair = normalizeRepair(legacy, "freeze");
    expect({ repair, route: repairRoute(repair) }).toEqual({
      repair: { ...lists, source: "freeze" },
      route,
    });
  });

  // One repair constructor (wave 1b): record reads every repair, legacy or
  // I2, exactly as repair-logic.mjs does, then only bounds it for the work
  // item and names the producing stage when the repair names none.
  it.each([
    { acceptance: ["L1"], implementation: ["M1"], source: "after-assess" },
    {
      acceptance: [],
      implementation: [],
      reviewOnly: true,
      source: "readiness",
    },
    { kind: "acceptance", items: ["fix the oracle"] },
    { kind: "context-change", items: ["Re-derive acceptance"] },
    { kind: "review-again", items: ["repeat the reviews"] },
    { kind: "integrate-base", items: ["merge conflicts"] },
    { kind: "hooks", items: ["lint failed"], reviewOnly: true },
  ])("reads %j with the shared repair constructor's lists", (repair) => {
    const shared = sharedNormalizeRepair(repair);
    const recorded = normalizeRepair(repair, "freeze");
    expect({
      acceptance: recorded?.acceptance,
      implementation: recorded?.implementation,
      reviewOnly: recorded?.reviewOnly ?? false,
    }).toEqual({
      acceptance: shared?.acceptance,
      implementation: shared?.implementation,
      reviewOnly: shared?.reviewOnly ?? false,
    });
  });

  // Flow request #0 / wiring-bugs#5: an in-flight legacy readiness
  // "review-again" is a review-only round, not a no-change repair for
  // Bezalel; a legacy after-scope "context-change" goes to Ezra.
  it("sends a legacy review-again repair to a review round with nothing for the writers", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        readiness: {
          verdict: "REPAIR",
          reason:
            "Base integration changed the candidate's own diff; reviews must be redone",
          repair: {
            kind: "review-again",
            items: [
              "The integrated candidate's own diff changed; repeat the reviews.",
            ],
          },
          fingerprint: "integrate-review",
        },
      },
      nodes: [],
      item: item("feedback"),
    });
    expect(decision).toMatchObject({
      outcome: "continue",
      route: "review",
      repair: {
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      },
    });
  });

  it("sends a legacy context-change repair to Ezra's oracle round", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        "after-scope": {
          repair: {
            kind: "context-change",
            items: ["Re-derive acceptance from the current request."],
          },
        },
      },
      nodes: [],
      item: item("review"),
    });
    expect(decision).toMatchObject({
      outcome: "continue",
      route: "oracle",
      repair: {
        acceptance: ["Re-derive acceptance from the current request."],
        implementation: [],
        source: "after-scope",
      },
    });
  });

  it("bounds what it stores: at most 64 items of 2000 characters and an 80-character source", () => {
    const repair = normalizeRepair(
      {
        acceptance: [],
        implementation: [
          " ",
          ...Array.from({ length: 70 }, () => "x".repeat(2500)),
        ],
        source: "s".repeat(120),
      },
      "freeze",
    );
    expect({
      count: repair?.implementation.length,
      longest: Math.max(
        ...(repair?.implementation ?? []).map((entry: string) => entry.length),
      ),
      source: repair?.source.length,
    }).toEqual({ count: 64, longest: 2000, source: 80 });
  });

  it("stores the normalized repair with the stage that produced it", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        freeze: { review: true },
        "after-assess": {
          repair: { kind: "implementation", items: ["[M1 P1] bug"] },
          fingerprint: "review:M1",
        },
      },
      nodes: [],
      item: item("initial"),
    });
    expect(decision).toEqual({
      outcome: "continue",
      route: "repair",
      repair: {
        acceptance: [],
        implementation: ["[M1 P1] bug"],
        source: "after-assess",
      },
      summary: "after-assess: 1 repair item(s) for Bezalel",
      fingerprint: "review:M1",
    });
  });

  it("routes readiness's review-only repair after a base integration to review", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        readiness: {
          verdict: "REPAIR",
          reason:
            "Base integration changed the candidate's own diff; reviews must be redone",
          repair: {
            acceptance: [],
            implementation: [],
            reviewOnly: true,
            source: "readiness",
          },
          fingerprint: "integrate-review",
        },
      },
      nodes: [],
      item: item("feedback"),
    });
    expect(decision).toMatchObject({
      outcome: "continue",
      route: "review",
      fingerprint: "integrate-review",
    });
  });

  it("blocks an empty repair that names nothing to do", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        publish: { repair: { kind: "implementation", items: [] } },
      },
      nodes: [],
      item: item("initial"),
    });
    expect(decision).toMatchObject({
      outcome: "BLOCKED",
      blocker: { code: "empty-repair" },
    });
  });

  it("turns a legacy readiness REPAIR without a repair record into implementation work", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        readiness: {
          verdict: "REPAIR",
          reason: "Required check ci-gate failed",
          repairs: ["ci-gate failed"],
        },
      },
      nodes: [],
      item: item("feedback"),
    });
    expect(decision).toMatchObject({
      outcome: "continue",
      route: "repair",
      repair: {
        acceptance: [],
        implementation: ["ci-gate failed"],
        source: "readiness",
      },
      fingerprint: "readiness:Required check ci-gate failed",
    });
  });
});

describe("merges (I3)", () => {
  it.each([
    ["external", true],
    ["factory", false],
  ])(
    "passes external for a merge readiness attributes to %s",
    (mergedBy, external) => {
      const decision = decideRound({
        ledger: {
          ...claimed,
          context: { ok: true },
          readiness: {
            verdict: "MERGED",
            reason: "PR #7 is merged",
            merged_by: mergedBy,
          },
        },
        nodes: [],
        item: item("feedback"),
      });
      expect(decision).toEqual({
        outcome: "MERGED",
        external,
        summary: "PR #7 is merged",
      });
    },
  );
});

describe("parking and stops (I4, lease-control#6)", () => {
  it("parks a round whose shared areas another issue holds", () => {
    const decision = decideRound({
      ledger: {
        ...claimed,
        context: { ok: true },
        "after-scope": {
          define: false,
          build: false,
          parked: {
            code: "area-reserved",
            areas: ["migrations"],
            holders: { migrations: 20 },
          },
        },
      },
      nodes: [],
      item: item("initial"),
    });
    expect(decision).toEqual({
      outcome: "parked",
      parked: { areas: ["migrations"], holders: { migrations: 20 } },
      summary:
        "Waiting for shared areas held by other issues: migrations (#20)",
    });
  });

  it("holds, rather than stops, a round that met a factory stop at context", () => {
    const decision = decideRound({
      ledger: { ...claimed, context: { ok: false, control: "factory-stop" } },
      nodes: [],
      item: item("feedback"),
    });
    expect(decision.outcome).toBe("held");
  });

  it.each([
    ["hold", "held"],
    ["stop", "stopped"],
  ])("maps a per-issue %s at context to %s", (control, outcome) => {
    const decision = decideRound({
      ledger: { ...claimed, context: { ok: false, control } },
      nodes: [],
      item: item("repair"),
    });
    expect(decision.outcome).toBe(outcome);
  });

  it("continues on the run's route when workspace preparation failed after the lease", () => {
    const decision = decideRound({
      ledger: {
        "claim-lease": { taken: true },
        claim: {
          proceed: false,
          leaseTaken: true,
          code: "dirty-workspace",
          reason: "dirty",
        },
      },
      nodes: [],
      item: item("repair"),
    });
    expect(decision).toMatchObject({
      outcome: "continue",
      route: "repair",
      fingerprint: "claim:dirty-workspace",
    });
  });
});
