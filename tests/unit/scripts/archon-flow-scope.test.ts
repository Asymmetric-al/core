import { describe, expect, it } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import {
  RESERVATIONS as SHARED_RESERVATIONS,
  planRelease,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";
import { scopeTask } from "../../../scripts/archon-factory/pack/deliver/scripts/context-logic.mjs";
import { decideRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";
import {
  CONTEXT_CHANGE,
  makeRepair,
} from "../../../scripts/archon-factory/pack/deliver/scripts/repair-logic.mjs";
import {
  PROTECTED_GLOBS,
  RESERVATIONS,
  globsOverlap,
  parkingStop,
  planReservation,
  acceptanceOnly,
  bezalelPaths,
  ezraPaths,
  hasScope,
  planScopeStages,
  protectedTouches,
  reserveAreas,
  validateScope,
} from "../../../scripts/archon-factory/pack/deliver/scripts/scope-logic.mjs";

const scope = (overrides: Record<string, unknown> = {}) => ({
  task_status: "DONE",
  decision: "proceed",
  brief: "b",
  source_paths: ["apps/donor/src/lib/**"],
  test_paths: ["apps/donor/tests/**"],
  docs_only: false,
  shared_areas: [],
  out_of_scope: [],
  sources: [],
  blocker: "",
  uncertainty: "",
  ...overrides,
});

describe("scope glob overlap (independence#8)", () => {
  it("finds the overlap when a broad test glob covers the source glob", () => {
    // Verifier: source apps/donor/src/lib/**, test apps/donor/** passed validation.
    expect(globsOverlap("apps/donor/src/lib/**", "apps/donor/**")).toBe(true);
    const result = validateScope(scope({ test_paths: ["apps/donor/**"] }));
    expect(result).toMatchObject({
      ok: false,
      blocked: { code: "scope-overlap" },
    });
  });

  it("compares what the globs can match, not their text", () => {
    expect(globsOverlap("apps/x/*.ts", "apps/x/*.test.ts")).toBe(true);
    expect(globsOverlap("**/*.md", "docs/**")).toBe(true);
    expect(globsOverlap("src/**/x.ts", "src/x.ts")).toBe(true);
    expect(globsOverlap("docs/a.md", "docs/a.md")).toBe(true);
    expect(globsOverlap("apps/donor/src/**", "apps/donor/tests/**")).toBe(
      false,
    );
    expect(globsOverlap("apps/x/src/*.ts", "apps/x/src/sub/*.ts")).toBe(false);
    expect(globsOverlap("src/?.ts", "src/ab.ts")).toBe(false);
    expect(
      globsOverlap("packages/api/src/**", "packages/api/tests/unit/**"),
    ).toBe(false);
  });

  it("accepts disjoint source and test globs", () => {
    expect(validateScope(scope())).toEqual({
      ok: true,
      sources: ["apps/donor/src/lib/**"],
      tests: ["apps/donor/tests/**"],
    });
  });
});

// Observed on VM 100 (issue #2234, 12 November 2026): an issue owned by
// Acceptance changes test files only. Samson scoped it with no implementation
// paths and the round was blocked with scope-paths.
describe("acceptance-only scope", () => {
  const ACCEPTANCE = ["tests/unit/acceptance/issue-2155/**"];
  const brief = (overrides: Record<string, unknown> = {}) => ({
    summary: "s",
    source_paths: [],
    test_paths: ACCEPTANCE,
    contextFingerprint: "f1",
    repair: null,
    ...overrides,
  });

  it("accepts test paths with no implementation paths", () => {
    expect(
      validateScope(scope({ source_paths: [], test_paths: ACCEPTANCE })),
    ).toEqual({ ok: true, sources: [], tests: ACCEPTANCE });
  });

  it("still refuses a scope with no path at all, or an invalid glob", () => {
    for (const paths of [
      { source_paths: [], test_paths: [] },
      { source_paths: [], test_paths: ["../outside/**"] },
      { source_paths: ["/absolute/**"], test_paths: ACCEPTANCE },
    ])
      expect(validateScope(scope(paths)), JSON.stringify(paths)).toMatchObject({
        ok: false,
        blocked: { code: "scope-paths" },
      });
  });

  it("still guards protected paths in an acceptance-only scope", () => {
    expect(
      validateScope(scope({ source_paths: [], test_paths: [".github/**"] })),
    ).toMatchObject({ ok: false, blocked: { code: "protected-path" } });
  });

  it("tells an acceptance-only brief from a full or an empty one", () => {
    expect(acceptanceOnly(brief())).toBe(true);
    expect(acceptanceOnly(brief({ source_paths: ["apps/x/**"] }))).toBe(false);
    expect(acceptanceOnly(brief({ test_paths: [] }))).toBe(false);
    expect(acceptanceOnly(null)).toBe(false);
    expect(hasScope(brief())).toBe(true);
    expect(
      hasScope(brief({ source_paths: ["apps/x/**"], test_paths: [] })),
    ).toBe(true);
    expect(hasScope(brief({ test_paths: [] }))).toBe(false);
    expect(hasScope(undefined)).toBe(false);
  });

  it("sends every repair of an acceptance-only issue to Ezra", () => {
    const plan = planScopeStages({
      route: "repair",
      brief: brief({
        repair: makeRepair({
          acceptance: ["Count every Root cause line"],
          implementation: ["The helper still filters the legacy line"],
          source: "after-assess",
        }),
      }),
      contextChanged: false,
      fingerprint: "f1",
    });
    expect(plan).toMatchObject({
      define: true,
      build: true,
      briefChanged: true,
    });
    expect(plan.brief.repair).toMatchObject({
      acceptance: [
        "Count every Root cause line",
        "The helper still filters the legacy line",
      ],
      implementation: [],
      source: "after-assess",
    });
  });

  it("leaves the repairs of a scope with implementation paths where they are", () => {
    const repair = makeRepair({
      implementation: ["Fix the handler"],
      source: "after-assess",
    });
    const plan = planScopeStages({
      route: "repair",
      brief: brief({ source_paths: ["apps/x/**"], repair }),
      contextChanged: false,
      fingerprint: "f1",
    });
    expect(plan).toMatchObject({
      define: false,
      build: true,
      briefChanged: false,
    });
    expect(plan.brief.repair).toEqual(repair);
  });

  it("keeps a review-only repair review-only", () => {
    const plan = planScopeStages({
      route: "review",
      brief: brief({
        repair: makeRepair({ reviewOnly: true, source: "readiness" }),
      }),
      contextChanged: false,
      fingerprint: "f1",
    });
    expect(plan).toMatchObject({
      define: false,
      build: false,
      briefChanged: false,
    });
  });

  it("tells each writer what an acceptance-only issue means for them", () => {
    expect(ezraPaths(brief())).toBe(
      [
        `You may write acceptance tests only under: ${ACCEPTANCE[0]}`,
        "Implementation paths: none. This issue changes acceptance tests only: nothing else in the repository will change, so the tests must pass against the code as it is. Show what the change now catches (for example a case the previous check let through).",
      ].join("\n"),
    );
    expect(bezalelPaths(brief())).toBe(
      [
        "You may edit: nothing. This issue changes acceptance tests only and Ezra has made that change.",
        `Acceptance tests (read-only for you): ${ACCEPTANCE[0]}`,
        "Run the acceptance tests with run_check against the unchanged code and report the outcome. If they need an implementation change or are wrong, say so in oracle_requests.",
      ].join("\n"),
    );
    const full = brief({ source_paths: ["apps/x/**"], test_paths: [] });
    expect(ezraPaths(full)).toBe(
      "You may write acceptance tests only under: (none: use documentary checks)\nImplementation paths (read-only for you): apps/x/**",
    );
    expect(bezalelPaths(full)).toBe(
      "You may edit only: apps/x/**\nAcceptance tests (read-only for you): none",
    );
  });

  it("tells Samson when implementation paths may be empty", () => {
    expect(scopeTask("/repo")).toContain(
      "source_paths may be empty only when the issue changes acceptance tests alone; test_paths then lists every path to change.",
    );
  });
});

describe("protected paths (boundary-shell-secrets#11)", () => {
  it("blocks a scope glob that can touch CI, hooks or factory policy", () => {
    for (const glob of [
      ".github/workflows/ci.yml",
      "**/*.yml",
      "scripts/**",
      "scripts/archon-factory/pack/deliver/**",
      ".husky/pre-push",
      ".claude/settings.json",
      ".archon/x",
      "bunfig.toml",
      "*.toml",
      ".npmrc",
      "scripts/verify/ci-preflight.mjs",
    ]) {
      const result = validateScope(
        scope({ source_paths: [glob], test_paths: ["apps/donor/tests/**"] }),
      );
      expect(result, glob).toMatchObject({
        ok: false,
        blocked: { code: "protected-path" },
      });
      expect(
        (result as { blocked: { recovery: string } }).blocked.recovery,
      ).toMatch(/allowProtected/);
    }
    const tests = validateScope(scope({ test_paths: [".github/**"] }));
    expect(tests).toMatchObject({
      ok: false,
      blocked: { code: "protected-path" },
    });
  });

  it("protects the root package.json that the hooks and CI gates resolve through", () => {
    // Verifier: pre-push runs `bun run ci:preflight` and pre-commit runs lint-staged,
    // both resolved from the root package.json.
    for (const glob of ["package.json", "*.json", "**/package.json", "**"]) {
      const result = validateScope(
        scope({ source_paths: [glob], test_paths: ["apps/donor/tests/**"] }),
      );
      expect(result, glob).toMatchObject({
        ok: false,
        blocked: { code: "protected-path" },
      });
    }
    expect(
      protectedTouches(["apps/donor/package.json", "packages/*/package.json"]),
    ).toEqual([]);
    expect(
      validateScope(scope({ source_paths: ["package.json", "bun.lock"] }), {
        allowProtected: ["package.json"],
      }),
    ).toMatchObject({ ok: true });
  });

  it("leaves ordinary product paths alone", () => {
    expect(
      protectedTouches([
        "apps/donor/**",
        "packages/api/src/**",
        "supabase/migrations/**",
        "docs/ops/*.md",
      ]),
    ).toEqual([]);
  });

  it("allows protected paths only with the operator's allow-list for this issue", () => {
    expect(
      validateScope(scope({ source_paths: [".github/workflows/ci.yml"] }), {
        allowProtected: true,
      }),
    ).toMatchObject({ ok: true });
    expect(
      validateScope(scope({ source_paths: [".github/workflows/ci.yml"] }), {
        allowProtected: [".github/**"],
      }),
    ).toMatchObject({ ok: true });
    expect(
      validateScope(scope({ source_paths: ["scripts/**"] }), {
        allowProtected: [".github/**"],
      }),
    ).toMatchObject({ ok: false, blocked: { code: "protected-path" } });
    for (const invalid of [false, "yes", 1, {}, null])
      expect(
        validateScope(scope({ source_paths: [".github/x"] }), {
          allowProtected: invalid,
        }),
      ).toMatchObject({ ok: false });
    expect(PROTECTED_GLOBS).toEqual(
      expect.arrayContaining([
        ".github/**",
        ".husky/**",
        "scripts/archon-factory/**",
        ".archon/**",
        ".claude/**",
        "bunfig.toml",
        ".npmrc",
      ]),
    );
  });
});

describe("shared-area reservations (I4)", () => {
  const doc = (areas: Record<string, number> | null, revision = 3) => ({
    name: "core/reservations",
    revision,
    value: areas === null ? null : { v: 1, areas },
  });

  it("parks the issue when another issue holds an area and writes nothing", () => {
    expect(
      planReservation(doc({ "supabase/migrations": 7 }), {
        issue: 12,
        areas: ["supabase/migrations", "bun.lock"],
      }),
    ).toEqual({
      kind: "parked",
      areas: ["supabase/migrations", "bun.lock"],
      holders: { "supabase/migrations": 7 },
    });
  });

  it("reserves free areas with a conditional write", () => {
    expect(
      planReservation(doc({ "packages/ui": 9 }), {
        issue: 12,
        areas: [" bun.lock ", "bun.lock", "supabase/migrations", ""],
      }),
    ).toEqual({
      kind: "write",
      areas: ["bun.lock", "supabase/migrations"],
      ifRevision: 3,
      value: {
        v: 1,
        areas: { "packages/ui": 9, "bun.lock": 12, "supabase/migrations": 12 },
      },
    });
    expect(
      planReservation(doc(null, 0), { issue: 12, areas: ["bun.lock"] }),
    ).toMatchObject({
      kind: "write",
      ifRevision: 0,
      value: { v: 1, areas: { "bun.lock": 12 } },
    });
  });

  it("does not write when the issue already holds exactly its areas", () => {
    expect(
      planReservation(doc({ "bun.lock": 12 }), {
        issue: 12,
        areas: ["bun.lock"],
      }),
    ).toEqual({ kind: "held", areas: ["bun.lock"] });
    expect(planReservation(doc({}), { issue: 12, areas: [] })).toEqual({
      kind: "held",
      areas: [],
    });
  });

  it("releases areas a re-scope no longer needs", () => {
    expect(
      planReservation(doc({ "bun.lock": 12, "packages/ui": 12 }), {
        issue: 12,
        areas: ["bun.lock"],
      }),
    ).toMatchObject({
      kind: "write",
      value: { v: 1, areas: { "bun.lock": 12 } },
    });
  });

  const fakeArchon = (documents: unknown[], conflicts: number) => {
    const writes: unknown[] = [];
    let reads = 0;
    let failures = conflicts;
    return {
      writes,
      archon: {
        async get(name: string) {
          expect(name).toBe("core/reservations");
          return documents[Math.min(reads++, documents.length - 1)];
        },
        async put(
          name: string,
          value: unknown,
          options: { ifRevision: number },
        ) {
          if (failures-- > 0) throw new StateConflict("conflict", null);
          writes.push({ name, value, options });
          return { name, revision: options.ifRevision + 1, value };
        },
      },
    };
  };

  it("retries a conflicting write and re-plans from the current document", async () => {
    const { archon, writes } = fakeArchon(
      [doc({}, 1), doc({}, 2), doc({}, 3)],
      2,
    );
    await expect(
      reserveAreas(archon, { issue: 12, areas: ["bun.lock"] }),
    ).resolves.toMatchObject({ kind: "reserved", areas: ["bun.lock"] });
    expect(writes).toEqual([
      {
        name: "core/reservations",
        value: { v: 1, areas: { "bun.lock": 12 } },
        options: { ifRevision: 3 },
      },
    ]);
  });

  it("parks when the area was taken between attempts", async () => {
    const { archon, writes } = fakeArchon(
      [doc({}, 1), doc({ "bun.lock": 30 }, 2)],
      1,
    );
    await expect(
      reserveAreas(archon, { issue: 12, areas: ["bun.lock"] }),
    ).resolves.toMatchObject({ kind: "parked", holders: { "bun.lock": 30 } });
    expect(writes).toEqual([]);
  });

  it("fails closed when conflicts persist past four retries", async () => {
    const { archon } = fakeArchon([doc({})], 10);
    await expect(
      reserveAreas(archon, { issue: 12, areas: ["bun.lock"] }),
    ).rejects.toThrow(/reservations/);
  });

  it("succeeds on the fourth retry", async () => {
    const { archon, writes } = fakeArchon([doc({}, 1)], 4);
    await expect(
      reserveAreas(archon, { issue: 12, areas: ["bun.lock"] }),
    ).resolves.toMatchObject({ kind: "reserved" });
    expect(writes).toHaveLength(1);
  });

  it("uses the reservation document record releases (lifecycle request)", () => {
    expect(RESERVATIONS).toBe(SHARED_RESERVATIONS);
    const written = planReservation(doc({ "packages/ui": 9 }), {
      issue: 12,
      areas: ["bun.lock"],
    });
    expect(written.kind).toBe("write");
    const reserved = {
      name: RESERVATIONS,
      revision: 4,
      value: (written as { value: unknown }).value,
    };
    expect(planRelease(reserved, 12)).toMatchObject({
      ifRevision: 4,
      value: { v: 1, areas: { "packages/ui": 9 } },
    });
  });

  it("writes the parking entry that record turns into a parked outcome (I4)", () => {
    const stop = parkingStop({
      kind: "parked",
      areas: ["supabase/migrations", "bun.lock"],
      holders: { "supabase/migrations": 7 },
    });
    expect(stop.ledger).toEqual({
      define: false,
      build: false,
      parked: {
        code: "area-reserved",
        areas: ["supabase/migrations", "bun.lock"],
        holders: { "supabase/migrations": 7 },
      },
    });
    expect(stop.reason).toMatch(/supabase\/migrations \(#7\)/);
    const decision = decideRound({
      ledger: {
        claim: { proceed: true, route: "initial" },
        context: { ok: true },
        "after-scope": { ...stop.ledger, stopped: true, reason: stop.reason },
      },
      nodes: [],
      item: { route: "initial", run: { route: "initial" } },
    });
    expect(decision).toMatchObject({
      outcome: "parked",
      parked: {
        areas: ["supabase/migrations", "bun.lock"],
        holders: { "supabase/migrations": 7 },
      },
    });
  });
});

describe("round stages after scope (I1, I2)", () => {
  const M1 = "[M1 P1] totals ignore refunds";
  const L1 = "[L1 P2] C2 asserts the wrong currency";
  const brief = (repair: unknown) => ({
    summary: "s",
    source_paths: ["apps/x/**"],
    test_paths: ["tests/x/**"],
    contextFingerprint: "f0",
    repair,
  });

  it("passes a review-only round through without any AI stage", () => {
    const plan = planScopeStages({
      route: "review",
      brief: brief({
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      }),
      contextChanged: false,
      fingerprint: "f0",
    });
    expect(plan).toMatchObject({
      kind: "proceed",
      define: false,
      build: false,
      briefChanged: false,
    });
  });

  it("adds a context change to pending repairs instead of replacing them", () => {
    // wiring-bugs#6: the context change used to replace Bezalel's repair.
    const plan = planScopeStages({
      route: "repair",
      brief: brief(
        makeRepair({ implementation: [M1], source: "after-assess" }),
      ),
      contextChanged: true,
      fingerprint: "f1",
    });
    expect(plan).toMatchObject({
      kind: "proceed",
      define: true,
      build: true,
      briefChanged: true,
      stage: "oracle_repair",
    });
    expect(plan.brief.repair).toEqual({
      acceptance: [CONTEXT_CHANGE],
      implementation: [M1],
      source: "after-assess",
    });
    expect(plan.brief.contextFingerprint).toBe("f1");
  });

  it("tells Ezra about a context change in an oracle round too", () => {
    const plan = planScopeStages({
      route: "oracle",
      brief: brief(
        makeRepair({
          acceptance: [L1],
          implementation: [M1],
          source: "after-assess",
        }),
      ),
      contextChanged: true,
      fingerprint: "f1",
    });
    expect(plan.brief.repair).toEqual({
      acceptance: [L1, CONTEXT_CHANGE],
      implementation: [M1],
      source: "after-assess",
    });
    expect(plan).toMatchObject({ define: true, build: true });
  });

  it("never drops acceptance corrections on a repair route", () => {
    const plan = planScopeStages({
      route: "repair",
      brief: brief({ kind: "acceptance", items: [L1] }),
      contextChanged: false,
      fingerprint: "f0",
    });
    expect(plan).toMatchObject({ define: true, build: true });
  });

  it("builds without Ezra on a plain repair round", () => {
    expect(
      planScopeStages({
        route: "repair",
        brief: brief(makeRepair({ implementation: [M1], source: "publish" })),
        contextChanged: false,
        fingerprint: "f0",
      }),
    ).toMatchObject({ define: false, build: true, briefChanged: false });
  });

  it("lets a review round whose context changed continue and records the change for the next build round (I1)", () => {
    // I1: on route review after-scope runs no AI stage, emits define=no and lets
    // the round continue. The context change waits in brief.repair for Ezra.
    const plan = planScopeStages({
      route: "review",
      brief: brief({
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      }),
      contextChanged: true,
      fingerprint: "f1",
    });
    expect(plan).toMatchObject({
      kind: "proceed",
      define: false,
      build: false,
      briefChanged: true,
      stage: null,
    });
    expect(plan.brief).toMatchObject({
      contextFingerprint: "f1",
      repair: {
        acceptance: [CONTEXT_CHANGE],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      },
    });
  });
});
