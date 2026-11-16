import { describe, expect, it } from "vitest";

import {
  acceptanceTestFiles,
  afterDefineEntry,
  afterDefinePlan,
  briefAfterDefine,
  removedTestFiles,
  sourceOverlap,
} from "../../../scripts/archon-factory/pack/deliver/scripts/define-logic.mjs";
import { decideRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";
import {
  CONTEXT_CHANGE,
  bezalelRepairs,
  makeRepair,
} from "../../../scripts/archon-factory/pack/deliver/scripts/repair-logic.mjs";

const A = "tests/x/a.test.ts";
const B = "tests/x/b.test.ts";

describe("acceptance test files (independence#7)", () => {
  it("keeps tests from earlier rounds when Ezra edits only one of them", () => {
    // Round 1 committed a and b; the oracle round changes only a.
    expect(
      acceptanceTestFiles({
        candidates: [A],
        previous: [A, B],
        testGlobs: ["tests/x/**"],
      }),
    ).toEqual([A, B]);
  });

  it("keeps every test after a criteria-only correction", () => {
    expect(
      acceptanceTestFiles({
        candidates: [],
        previous: [A, B],
        testGlobs: ["tests/x/**"],
      }),
    ).toEqual([A, B]);
  });

  it("collects branch and working-tree test files, sorted and unique, and drops deleted ones", () => {
    const exists = (file: string) => file !== "tests/x/gone.test.ts";
    expect(
      acceptanceTestFiles({
        candidates: [B, "apps/x/src/a.ts", A, B, "tests/x/gone.test.ts"],
        previous: [],
        testGlobs: ["tests/x/**"],
        exists,
      }),
    ).toEqual([A, B]);
  });
});

describe("test files Ezra removed", () => {
  it("names tracked test files the working tree no longer holds", () => {
    const exists = (file: string) => file === "tests/x/back.test.ts";
    expect(
      removedTestFiles({
        status: [
          { code: " D", path: B },
          { code: "D ", path: A },
          { code: " D", path: "apps/x/src/gone.ts" },
          { code: " D", path: "tests/x/back.test.ts" },
          { code: " M", path: "tests/x/changed.test.ts" },
          { code: "??", path: "tests/x/new.test.ts" },
        ],
        testGlobs: ["tests/x/**"],
        exists,
      }),
    ).toEqual([A, B]);
  });
});

describe("test files inside source paths (independence#8)", () => {
  it("names recorded test files that a source glob also matches", () => {
    expect(
      sourceOverlap({
        files: ["apps/donor/src/lib/total.ts", "apps/donor/tests/a.test.ts"],
        sourceGlobs: ["apps/donor/src/lib/**"],
      }),
    ).toEqual(["apps/donor/src/lib/total.ts"]);
    expect(sourceOverlap({ files: [A], sourceGlobs: ["apps/x/**"] })).toEqual(
      [],
    );
  });
});

describe("after-define route outputs (I1)", () => {
  it("freezes the recorded head without a build on a review-only round", () => {
    expect(
      afterDefinePlan({
        route: "review",
        planned: "no",
        hasAcceptance: true,
        scopeStopped: false,
      }),
    ).toMatchObject({ build: false, freeze: true });
  });

  it("builds and freezes on a delivery round", () => {
    for (const route of ["initial", "repair", "oracle"])
      expect(
        afterDefinePlan({
          route,
          planned: "yes",
          hasAcceptance: true,
          scopeStopped: false,
        }),
      ).toMatchObject({ build: true, freeze: true });
  });

  it("stays quiet when after-scope already ended the round (parked, blocked or returned)", () => {
    const plan = afterDefinePlan({
      route: "initial",
      planned: "no",
      hasAcceptance: false,
      scopeStopped: true,
    });
    expect(plan).toMatchObject({ build: false, freeze: false });
    expect(plan.blocked).toBeUndefined();
  });

  it("blocks when no acceptance exists and does not freeze", () => {
    expect(
      afterDefinePlan({
        route: "review",
        planned: "no",
        hasAcceptance: false,
        scopeStopped: false,
      }),
    ).toMatchObject({
      build: false,
      freeze: false,
      blocked: { code: "no-acceptance" },
    });
  });
});

describe("criteria-only acceptance correction (S5.16)", () => {
  const oracle = (overrides: Record<string, unknown> = {}) => ({
    route: "oracle",
    planned: "yes",
    hasAcceptance: true,
    scopeStopped: false,
    defined: true,
    hasHead: true,
    implementationRepairs: 0,
    testsChanged: false,
    ...overrides,
  });

  it("sends the recorded head to a review-only round instead of an empty build", () => {
    // Verifier: Ezra changed no test file and nothing is left for Bezalel; the
    // build used to run, freeze found no change and the issue looped to no-progress.
    const plan = afterDefinePlan(oracle());
    expect(plan).toMatchObject({
      build: false,
      freeze: false,
      repair: {
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "after-define",
      },
    });
  });

  it("still builds when Ezra changed a test file or Bezalel has repairs", () => {
    expect(afterDefinePlan(oracle({ testsChanged: true }))).toMatchObject({
      build: true,
      freeze: true,
    });
    expect(afterDefinePlan(oracle({ implementationRepairs: 2 }))).toMatchObject(
      { build: true, freeze: true },
    );
    expect(
      afterDefinePlan(oracle({ testsChanged: true })).repair,
    ).toBeUndefined();
  });

  it("builds the first candidate even when Ezra wrote only criteria", () => {
    expect(afterDefinePlan(oracle({ route: "initial" }))).toMatchObject({
      build: true,
      freeze: true,
    });
    expect(afterDefinePlan(oracle({ hasHead: false }))).toMatchObject({
      build: true,
      freeze: true,
    });
  });
});

describe("after-define ledger entry (lifecycle request: record reads these fields)", () => {
  const REVISION = "a".repeat(64);
  const round = (entry: Record<string, unknown>, nodes: unknown[] = []) =>
    decideRound({
      ledger: {
        claim: { proceed: true, route: "oracle" },
        context: { ok: true },
        "after-define": entry,
      },
      nodes,
      item: { route: "oracle", run: { route: "oracle" } },
    });

  it("hands the S5.16 review-only repair to record, which starts a review round", () => {
    const entry = afterDefineEntry(
      afterDefinePlan({
        route: "oracle",
        planned: "yes",
        hasAcceptance: true,
        scopeStopped: false,
        defined: true,
        hasHead: true,
      }),
      { acceptance: REVISION },
    );
    expect(entry).toMatchObject({
      build: false,
      freeze: false,
      acceptance: REVISION,
      repair: {
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "after-define",
      },
      fingerprint: `oracle-review:${REVISION.slice(0, 16)}`,
    });
    expect(round(entry)).toMatchObject({
      outcome: "continue",
      route: "review",
    });
  });

  it("records the acceptance revision whenever acceptance exists, so a failed build goes to Bezalel (I1)", () => {
    const built = afterDefineEntry(
      afterDefinePlan({
        route: "oracle",
        planned: "yes",
        hasAcceptance: true,
        scopeStopped: false,
        defined: true,
        hasHead: true,
        testsChanged: true,
      }),
      { acceptance: REVISION, repairs: 0 },
    );
    expect(built).toMatchObject({
      build: true,
      freeze: true,
      acceptance: REVISION,
      repairs: 0,
    });
    expect(built.repair).toBeUndefined();
    expect(
      round(built, [{ node_id: "build", state: "failed", error: "timeout" }]),
    ).toMatchObject({ outcome: "continue", route: "repair" });
    expect(
      afterDefineEntry(
        afterDefinePlan({
          route: "review",
          planned: "no",
          hasAcceptance: true,
          scopeStopped: false,
        }),
        { acceptance: REVISION },
      ),
    ).toMatchObject({ freeze: true, reviewOnly: true, acceptance: REVISION });
    const stopped = afterDefineEntry(
      {
        build: false,
        freeze: false,
        reason: "Ezra could not define acceptance",
        blocked: { code: "acceptance-blocked", detail: "d" },
      },
      { acceptance: REVISION },
    );
    expect(stopped).toMatchObject({
      acceptance: REVISION,
      blocked: { code: "acceptance-blocked", detail: "d" },
    });
    expect(round(stopped)).toMatchObject({
      outcome: "BLOCKED",
      blocker: { code: "acceptance-blocked" },
    });
    expect(
      afterDefineEntry(
        afterDefinePlan({
          route: "initial",
          planned: "yes",
          hasAcceptance: false,
          scopeStopped: false,
        }),
        {},
      ),
    ).not.toHaveProperty("acceptance");
  });
});

describe("repairs after Ezra (I2, independence#2)", () => {
  const M1 = "[M1 P1] totals ignore refunds";
  const L1 = "[L1 P2] C2 asserts the wrong currency";

  it("hands the implementation part to Bezalel in the oracle round", () => {
    const brief = {
      summary: "s",
      repair: makeRepair({
        acceptance: [L1],
        implementation: [M1],
        source: "after-assess",
      }),
    };
    const next = briefAfterDefine(brief);
    expect(next.repair).toEqual({
      acceptance: [],
      implementation: [M1],
      source: "after-assess",
    });
    expect(bezalelRepairs(next.repair)).toEqual([M1]);
  });

  it("clears a handled context change but keeps Bezalel's repair", () => {
    const brief = {
      summary: "s",
      repair: {
        acceptance: [CONTEXT_CHANGE],
        implementation: [M1],
        source: "after-assess",
      },
    };
    expect(bezalelRepairs(briefAfterDefine(brief).repair)).toEqual([M1]);
    expect(
      briefAfterDefine({
        summary: "s",
        repair: { kind: "acceptance", items: [CONTEXT_CHANGE] },
      }).repair,
    ).toBeNull();
  });
});
