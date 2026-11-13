/**
 * Acceptance tests for #2239 (follow-up to #2223): `verify:e2e` must not report
 * success for a Playwright JSON report that contradicts itself, and must not
 * crash on a malformed nested shape, while consistent reports are unchanged.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Issue: https://github.com/Asymmetric-al/core/issues/2239
 */
import { readFileSync } from "node:fs";

import { describe, expect } from "vitest";

import {
  attempt,
  type Counters,
  itPosix as it,
  report,
  reportEntries,
  reportPathOf,
  type Run,
  spec,
  suite,
  summary,
  tcase,
  WRAPPER,
  wrapper,
} from "./harness";

import type { JSONReport, JSONReportSuite } from "@playwright/test/reporter";

const A = "a.spec.ts";
const B = "b.spec.ts";
const C = "c.spec.ts";
const passed = () => [attempt("passed")];

/**
 * A consistent multi-file, multi-level report: specs at file level and in
 * nested describes, several projects per spec, passing, skipped (with and
 * without a result), flaky and expected-failure cases. Counted by hand:
 * expected 4 (2 top-level + known bug + admin), flaky 2, skipped 2.
 */
function passingSuites(): JSONReportSuite[] {
  const skipped = { expectedStatus: "skipped" } as const;
  return [
    suite(A, A, {
      specs: [
        spec(
          A,
          "top-level pass",
          3,
          tcase("expected", passed()),
          tcase("expected", passed(), { project: "mobile-chrome" }),
        ),
      ],
      suites: [
        suite(A, "checkout", {
          line: 6,
          specs: [
            spec(A, "skipped no result", 7, tcase("skipped", [], skipped)),
            spec(
              A,
              "skipped with result",
              8,
              tcase("skipped", [attempt("skipped")], skipped),
            ),
          ],
          suites: [
            suite(A, "nested", {
              line: 10,
              specs: [
                spec(
                  A,
                  "flaky",
                  11,
                  tcase("flaky", [
                    attempt("failed", 0, "flake"),
                    attempt("passed", 1),
                  ]),
                  tcase(
                    "flaky",
                    [attempt("timedOut", 0, "slow"), attempt("passed", 1)],
                    { project: "mobile-chrome" },
                  ),
                ),
                spec(
                  A,
                  "known bug",
                  14,
                  tcase("expected", [attempt("failed", 0, "known bug")], {
                    expectedStatus: "failed",
                  }),
                ),
              ],
            }),
          ],
        }),
      ],
    }),
    suite(B, B, {
      suites: [
        suite(B, "admin", {
          line: 2,
          specs: [
            spec(
              B,
              "admin pass",
              3,
              tcase("expected", passed(), { project: "chromium-admin" }),
            ),
          ],
        }),
      ],
    }),
  ];
}
const PASSING_STATS: Counters = {
  expected: 4,
  unexpected: 0,
  flaky: 2,
  skipped: 2,
};
const passing = (stats: Counters = PASSING_STATS) =>
  report(passingSuites(), stats);

/** The passing report plus one real unexpected failure (retried once). */
const failingSuite = () =>
  suite(C, C, {
    suites: [
      suite(C, "billing", {
        line: 2,
        specs: [
          spec(
            C,
            "fails",
            4,
            tcase("unexpected", [
              attempt("failed", 0, "boom 1"),
              attempt("failed", 1, "boom 2"),
            ]),
          ),
        ],
      }),
    ],
  });
const FAILING_STATS: Counters = { ...PASSING_STATS, unexpected: 1 };
const failing = (stats: Counters = FAILING_STATS) =>
  report([...passingSuites(), failingSuite()], stats);

const INCOMPLETE = "Incomplete run: ";
const INVALID = "Invalid Playwright JSON report: ";

/** ok:false, wrapper exit 1, and at least one playwright-report entry. */
function expectReportFailure(r: Run) {
  const s = summary(r);
  expect([r.status, s.ok], r.stdout).toEqual([1, false]);
  const entries = reportEntries(s);
  expect(entries, JSON.stringify(s.failed)).not.toEqual([]);
  return entries.map((e) => e.message);
}

const set = (obj: object, key: string, value: unknown) => {
  (obj as Record<string, unknown>)[key] = value;
};

describe("#2239 positive controls: consistent reports behave exactly as before", () => {
  it("C4: consistent multi-suite report (pass, skipped, flaky, expected failure), exit 0 → ok:true, exit 0", () => {
    const r = wrapper(passing(), 0);
    const s = summary(r);
    expect([r.status, s.ok, s.failed], r.stdout + r.stderr).toEqual([
      0,
      true,
      [],
    ]);
    expect(s.artifacts).toEqual({ reportPath: reportPathOf(r) });
  });

  it("C4: the flaky note on stderr is unchanged for a consistent passing report", () => {
    const r = wrapper(passing(), 0);
    expect(r.stderr).toContain("verify:e2e: 2 flaky test(s) passed on retry");
  });

  it("C5: consistent report with one real failure, exit 1 → only that test's entry", () => {
    const r = wrapper(failing(), 1);
    const s = summary(r);
    expect([r.status, s.ok]).toEqual([1, false]);
    expect(s.failed).toEqual([
      {
        test: "c.spec.ts > billing > fails",
        message: "boom 2",
        file: C,
        line: 4,
      },
    ]);
  });

  it.each([
    ["no test cases", [] as JSONReportSuite[], 0],
    [
      "only skipped cases",
      [
        suite(A, A, {
          specs: [
            spec(
              A,
              "s1",
              3,
              tcase("skipped", [], { expectedStatus: "skipped" }),
            ),
            spec(
              A,
              "s2",
              4,
              tcase("skipped", [attempt("skipped")], {
                expectedStatus: "skipped",
              }),
            ),
          ],
        }),
      ],
      2,
    ],
  ] as const)(
    "C5: consistent %s, exit 0 → exactly the unchanged O9 entry, nothing else",
    (_l, suites, skipped) => {
      const rep = report([...suites], {
        expected: 0,
        unexpected: 0,
        flaky: 0,
        skipped,
      });
      const r = wrapper(rep, 0);
      const s = summary(r);
      expect([r.status, s.ok]).toEqual([1, false]);
      expect(s.failed).toEqual([
        {
          test: "playwright-report",
          message: `No tests executed (expected=0, flaky=0, skipped=${skipped})`,
          file: reportPathOf(r),
          line: 0,
        },
      ]);
    },
  );
});

describe("#2239 item 1: listed cases are reconciled with stats", () => {
  it("C1: suites: [] with stats.expected=1 at exit 0 → ok:false, exit 1, Incomplete run entry", () => {
    const rep = report([], {
      expected: 1,
      unexpected: 0,
      flaky: 0,
      skipped: 0,
    });
    const messages = expectReportFailure(wrapper(rep, 0));
    expect(
      messages.some((m) => m.startsWith(INCOMPLETE)),
      messages.join("|"),
    ).toBe(true);
  });

  it.each([
    ["expected", 1],
    ["expected", -1],
    ["flaky", 1],
    ["flaky", -1],
    ["skipped", 1],
    ["skipped", -1],
    ["unexpected", 1],
    ["unexpected", -1],
  ] as const)(
    "C2: stats.%s off by %i from the listed cases → Incomplete run entry",
    (key, delta) => {
      // expected/flaky/skipped: a passing report at exit 0 (a false success on base);
      // unexpected: the real-failure report at exit 1 so the counter can go down.
      const isUnexpected = key === "unexpected";
      const base = isUnexpected ? FAILING_STATS : PASSING_STATS;
      const stats = { ...base, [key]: base[key] + delta };
      const rep = isUnexpected ? failing(stats) : passing(stats);
      const messages = expectReportFailure(wrapper(rep, isUnexpected ? 1 : 0));
      expect(
        messages.some((m) => m.startsWith(INCOMPLETE)),
        messages.join("|"),
      ).toBe(true);
    },
  );

  it("C2: same total but a case counted under the wrong status (skipped → expected) → Incomplete run entry", () => {
    const stats = { ...PASSING_STATS, expected: 5, skipped: 1 };
    const messages = expectReportFailure(wrapper(passing(stats), 0));
    expect(
      messages.some((m) => m.startsWith(INCOMPLETE)),
      messages.join("|"),
    ).toBe(true);
  });
});

describe("#2239 item 2: impossible values are rejected", () => {
  it.each(["expected", "unexpected", "flaky", "skipped"] as const)(
    "C3: stats.%s = -1 → ok:false, exit 1, playwright-report entry",
    (key) => {
      // Two flaky cases keep expected+flaky > 0 so O9 alone cannot fire.
      const stats = { ...PASSING_STATS, [key]: -1 };
      expectReportFailure(wrapper(passing(stats), 0));
    },
  );

  it.each([
    ["interrupted", "interrupted"],
    ["passed", "passed"],
    ["failed", "failed"],
    ["timedOut", "timedOut"],
    ["(missing)", "passed"],
  ] as const)(
    "C3: a listed case with aggregate status %s (stats otherwise consistent), exit 0 → ok:false, exit 1, playwright-report entry",
    (status, attemptStatus) => {
      const odd = tcase("expected", [attempt(attemptStatus)]);
      if (status === "(missing)") delete (odd as { status?: unknown }).status;
      else set(odd, "status", status);
      const suites = passingSuites();
      suites[0]!.suites![0]!.suites![0]!.specs.push(spec(A, "odd", 20, odd));
      expectReportFailure(wrapper(report(suites, PASSING_STATS), 0));
    },
  );
});

describe("#2239 item 3: a non-array nested specs/suites/tests/results fails cleanly", () => {
  const cases: [string, string, (rep: JSONReport) => void][] = [
    [
      "nested describe specs: {}",
      "specs",
      (r) => set(r.suites[0]!.suites![0]!.suites![0]!, "specs", {}),
    ],
    ["file-level specs: {}", "specs", (r) => set(r.suites[0]!, "specs", {})],
    [
      'nested specs: "x"',
      "specs",
      (r) => set(r.suites[0]!.suites![0]!, "specs", "x"),
    ],
    [
      "nested suites: {}",
      "suites",
      (r) => set(r.suites[0]!.suites![0]!, "suites", {}),
    ],
    [
      "spec tests: {}",
      "tests",
      (r) => set(r.suites[1]!.suites![0]!.specs[0]!, "tests", {}),
    ],
    [
      "test results: {}",
      "results",
      (r) => set(r.suites[0]!.specs[0]!.tests[0]!, "results", {}),
    ],
  ];
  it.each(cases)(
    "C6: %s, exit 0 → one JSON line, ok:false, exit 1, Invalid Playwright JSON report naming %s",
    (_l, key, mutate) => {
      const rep = passing();
      mutate(rep);
      const messages = expectReportFailure(wrapper(rep, 0));
      const hit = messages.find((m) => m.startsWith(INVALID));
      expect(hit, messages.join("|")).toBeDefined();
      expect(hit!.slice(INVALID.length)).toContain(key);
    },
  );
});

describe("#2239 constraint: the wrapper stays dependency-free Node ESM", () => {
  it("C7: scripts/verify-e2e.mjs imports only node: builtins", () => {
    const src = readFileSync(WRAPPER, "utf8");
    const specifiers = [
      ...src.matchAll(/\bfrom\s+["']([^"']+)["']/g),
      ...src.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g),
      ...src.matchAll(/\brequire\s*\(\s*["']([^"']+)["']/g),
    ].map((m) => m[1]);
    expect(specifiers.length).toBeGreaterThan(0);
    expect(specifiers.filter((s) => !s!.startsWith("node:"))).toEqual([]);
  });
});
