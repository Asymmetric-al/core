/**
 * Acceptance tests for #2223 done criteria 1-5 (spec §1.1 outcomes O1-O13):
 * `verify:e2e` passes only when the child exit, report shape, runner errors,
 * terminal outcomes and execution completeness all agree.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2223#issuecomment-6369083832
 */
import path from "node:path";

import { describe, expect } from "vitest";

import {
  itPosix as it,
  json,
  PASSING,
  report,
  result,
  run,
  type Run,
  spec,
  SPEC_FILE,
  SPEC_LINE,
  type Step,
  test,
  titlePath,
  WRAPPER,
} from "./harness";

type Entry = {
  test: string;
  message: string;
  file: string;
  line: number;
  tracePath?: string;
  videoPath?: string;
};
type Summary = {
  ok: boolean;
  failed: Entry[];
  artifacts: { reportPath: string; traces?: string[]; videos?: string[] };
};

/** Criterion 5: stdout is exactly one JSON line with keys ok/failed/artifacts. */
function summary(r: Run): Summary {
  const lines = r.stdout.split("\n");
  expect(lines, r.stdout + r.stderr).toHaveLength(2);
  expect(lines[1]).toBe("");
  const s = JSON.parse(lines[0]!) as Summary;
  expect(Object.keys(s).sort()).toEqual(["artifacts", "failed", "ok"]);
  expect(r.stderr, "child stdout goes to stderr").toContain(
    "FAKE-PLAYWRIGHT-STDOUT",
  );
  return s;
}
const wrapper = (step: Step, env?: Record<string, string>) =>
  run(WRAPPER, { e2e: [step] }, { env });
const reportPath = (r: Run, dir = "playwright-report") =>
  path.join(r.cwd, dir, "results.json");
function expectPass(r: Run) {
  const s = summary(r);
  expect([r.status, s.ok, s.failed], r.stderr).toEqual([0, true, []]);
  return s;
}
function expectFail(r: Run, test: string, message: string, exit = 1) {
  const s = summary(r);
  expect([r.status, s.ok], r.stdout).toEqual([exit, false]);
  const hit = s.failed.find(
    (f) => f.test === test && f.message.startsWith(message),
  );
  expect(
    hit,
    `${test} / ${message} in ${JSON.stringify(s.failed)}`,
  ).toBeDefined();
  return { s, hit: hit! };
}

const failedAttempt = (
  status: "failed" | "timedOut" | "interrupted",
  n: number,
  retry = 0,
) =>
  result(
    status,
    {
      message: `boom ${n}`,
      trace: `/t/trace-${n}.zip`,
      video: `/t/video-${n}.webm`,
    },
    retry,
  );
const UNEXPECTED = () =>
  report([spec("fails", test("unexpected", [failedAttempt("failed", 1)]))]);
const UNEXPECTED_PASS = () =>
  report([
    spec("should fail", test("unexpected", [result("passed")], "failed")),
  ]);
const RUNNER_ERROR = () =>
  report([], {
    errors: [
      {
        message: "globalSetup failed",
        location: { file: "/r/global-setup.ts", line: 12, column: 3 },
      },
    ],
  });

describe("#2223 criterion 2: the reproduced false successes now fail; O1 control passes", () => {
  it.each([
    ["unexpected failed test", json(UNEXPECTED())],
    ["runner error", json(RUNNER_ERROR())],
    ["empty {} report", "{}"],
    ["unexpected pass", json(UNEXPECTED_PASS())],
  ])("%s with child exit 1 → ok:false, exit 1", (_l, rep) => {
    const r = wrapper({ report: rep, exit: 1 });
    expect([r.status, summary(r).ok]).toEqual([1, false]);
  });
  it("O1 positive control: passing + skipped tests, exit 0 → ok:true, exit 0", () => {
    const rep = report([
      spec("passes", test("expected", [result("passed")])),
      spec("skipped", test("skipped", [], "skipped")),
    ]);
    const r = wrapper({ report: json(rep), exit: 0 });
    expect(expectPass(r).artifacts).toEqual({ reportPath: reportPath(r) });
  });
});

describe("#2223 criteria 1, 3: outcome mapping O2-O13", () => {
  it.each(["failed", "timedOut", "interrupted"] as const)(
    "O2: unexpected with final attempt %s → entry from that attempt, with trace/video",
    (status) => {
      const rep = report([
        spec("fails", test("unexpected", [failedAttempt(status, 1)])),
      ]);
      const { s, hit } = expectFail(
        wrapper({ report: json(rep), exit: 1 }),
        titlePath("fails"),
        "boom 1",
      );
      expect(hit).toMatchObject({
        file: SPEC_FILE,
        line: SPEC_LINE,
        tracePath: "/t/trace-1.zip",
        videoPath: "/t/video-1.webm",
      });
      expect(s.artifacts).toMatchObject({
        traces: ["/t/trace-1.zip"],
        videos: ["/t/video-1.webm"],
      });
    },
  );
  it("O3: a valid expected failure passes and is not listed", () => {
    const t = test(
      "expected",
      [result("failed", { message: "known bug" })],
      "failed",
    );
    expectPass(wrapper({ report: json(report([spec("known", t)])), exit: 0 }));
  });
  it.each([0, 1])(
    "O4/O12: an unexpected pass fails (child exit %i)",
    (exit) => {
      expectFail(
        wrapper({ report: json(UNEXPECTED_PASS()), exit }),
        titlePath("should fail"),
        "Expected to fail, but passed.",
      );
    },
  );
  it("O5a: flaky (failed, then passed on retry) passes with a stderr note", () => {
    const t = test("flaky", [
      failedAttempt("failed", 1),
      result("passed", {}, 1),
    ]);
    const r = wrapper({ report: json(report([spec("flaky", t)])), exit: 0 });
    expectPass(r);
    expect(r.stderr).toContain("verify:e2e: 1 flaky test(s) passed on retry");
  });
  it("O5b: retries exhausted → the LAST failing attempt's message and trace (OQ-6)", () => {
    const t = test("unexpected", [
      failedAttempt("timedOut", 1),
      failedAttempt("failed", 2, 1),
      failedAttempt("failed", 3, 2),
    ]);
    const r = wrapper({ report: json(report([spec("retried", t)])), exit: 1 });
    const { s, hit } = expectFail(r, titlePath("retried"), "boom 3");
    expect([hit.tracePath, hit.videoPath]).toEqual([
      "/t/trace-3.zip",
      "/t/video-3.webm",
    ]);
    expect(
      s.failed.filter((f) => f.test === titlePath("retried")),
    ).toHaveLength(1);
  });
  it.each([0, 1])(
    "O6/O12: one playwright-runner entry per runner error (child exit %i)",
    (exit) => {
      const errors = [
        {
          message: "globalSetup failed",
          location: { file: "/r/global-setup.ts", line: 12, column: 3 },
        },
        { value: "thrown value" },
        { stack: "Error: from stack\n    at x" },
      ];
      const rep = report(
        [spec("passes", test("expected", [result("passed")]))],
        { errors },
      );
      const r = wrapper({ report: json(rep), exit });
      const { s } = expectFail(r, "playwright-runner", "globalSetup failed");
      const runner = s.failed.filter((f) => f.test === "playwright-runner");
      expect(runner.map((f) => [f.message, f.file, f.line])).toEqual([
        ["globalSetup failed", "/r/global-setup.ts", 12],
        ["thrown value", reportPath(r), 0],
        ["Error: from stack\n    at x", reportPath(r), 0],
      ]);
    },
  );
  const READ =
    "Failed to read JSON report. Check stderr for Playwright output.";
  it.each([
    ["missing report, exit 1", { exit: 1 }, 1],
    ["missing report, exit 0", { exit: 0 }, 1],
    ["missing report, exit 3 (exitCode passthrough)", { exit: 3 }, 3],
    ["invalid JSON, exit 0", { exit: 0, report: '{"suites": [' }, 1],
  ] as const)("O7: %s → playwright-report read failure", (_l, step, exit) => {
    const r = wrapper(step);
    const { s } = expectFail(r, "playwright-report", READ, exit);
    expect(s.failed).toEqual([
      {
        test: "playwright-report",
        message: READ,
        file: reportPath(r),
        line: 0,
      },
    ]);
  });
  const valid = PASSING();
  it.each([
    ["{}", {}],
    ["null", null],
    ["an array", []],
    ["non-array suites", { ...valid, suites: {} }],
    ["missing errors", { ...valid, errors: undefined }],
    ["missing stats", { ...valid, stats: undefined }],
    [
      "non-numeric stats.expected",
      { ...valid, stats: { ...valid.stats, expected: "1" } },
    ],
    [
      "missing stats.flaky",
      { ...valid, stats: { ...valid.stats, flaky: undefined } },
    ],
  ])(
    "O8/O12: valid JSON with invalid shape (%s), child exit 0 → fail",
    (_l, rep) => {
      expectFail(
        wrapper({ report: json(rep), exit: 0 }),
        "playwright-report",
        "Invalid Playwright JSON report: ",
      );
    },
  );
  it.each([
    [
      "no test cases",
      report([]),
      "No tests executed (expected=0, flaky=0, skipped=0)",
    ],
    [
      "all skipped (OQ-4)",
      report([
        spec("s1", test("skipped", [], "skipped")),
        spec("s2", test("skipped", [result("skipped")], "skipped")),
      ]),
      "No tests executed (expected=0, flaky=0, skipped=2)",
    ],
  ])("O9: %s, exit 0 → fail", (_l, rep, message) => {
    const { hit } = expectFail(
      wrapper({ report: json(rep), exit: 0 }),
      "playwright-report",
      message,
    );
    expect(hit.message).toBe(message);
  });
  it.each([
    [
      "a non-skipped case with zero results",
      report([
        spec("passes", test("expected", [result("passed")])),
        spec("never ran", test("expected", [])),
      ]),
    ],
    [
      "stats.unexpected with no unexpected case listed",
      report([spec("passes", test("expected", [result("passed")]))], {
        stats: { unexpected: 1 },
      }),
    ],
    [
      "stats.unexpected above the collected failures",
      report(
        [spec("fails", test("unexpected", [failedAttempt("failed", 1)]))],
        { stats: { expected: 1, unexpected: 2 } },
      ),
    ],
  ])("O10/O12: incomplete run (%s), exit 0 → fail", (_l, rep) => {
    expectFail(
      wrapper({ report: json(rep), exit: 0 }),
      "playwright-report",
      "Incomplete run: ",
    );
  });
  it.each([0, 1])(
    "O6/O9/O10 overlap (child exit %i): every condition adds its own entries",
    (exit) => {
      const rep = report([spec("never ran", test("expected", []))], {
        errors: [{ message: "setup broke" }, { value: "second error" }],
        stats: { expected: 0, unexpected: 1, flaky: 0, skipped: 0 },
      });
      const { s } = expectFail(
        wrapper({ report: json(rep), exit }),
        "playwright-runner",
        "setup broke",
      );
      const has = (t: string, m: string) =>
        s.failed.filter((f) => f.test === t && f.message.startsWith(m));
      expect(has("playwright-runner", "").map((f) => f.message)).toEqual([
        "setup broke",
        "second error",
      ]);
      expect(
        has(
          "playwright-report",
          "No tests executed (expected=0, flaky=0, skipped=0)",
        ),
        JSON.stringify(s.failed),
      ).toHaveLength(1);
      expect(
        has("playwright-report", "Incomplete run: ").length,
        JSON.stringify(s.failed),
      ).toBeGreaterThanOrEqual(2);
      expect(has("playwright-process", "")).toEqual([]);
    },
  );
  it.each([1, 2])(
    "O11: child exit %i with a clean passing report → playwright-process, exit 1",
    (code) => {
      const r = wrapper({ report: json(PASSING()), exit: code });
      const { s } = expectFail(
        r,
        "playwright-process",
        `Playwright exited with code ${code} but the report lists no failures`,
      );
      expect(s.failed).toHaveLength(1);
    },
  );
  it("O12: child exit 0 with an unexpected failure → fail (report wins)", () => {
    expectFail(
      wrapper({ report: json(UNEXPECTED()), exit: 0 }),
      titlePath("fails"),
      "boom 1",
    );
  });
  it("O12: child exit 0 with a runner error and no tests → fail", () => {
    expectFail(
      wrapper({ report: json(RUNNER_ERROR()), exit: 0 }),
      "playwright-runner",
      "globalSetup failed",
    );
  });
  it("O13: child killed by a signal after a clean report → O11 with code 1", () => {
    const r = wrapper({ report: json(PASSING()), signal: "SIGTERM" });
    expectFail(
      r,
      "playwright-process",
      "Playwright exited with code 1 but the report lists no failures",
    );
  });
  it("O13: child killed by a signal before writing a report → O7, exit 1", () => {
    expectFail(wrapper({ signal: "SIGKILL" }), "playwright-report", READ);
  });
  it("O13: bun cannot be spawned → O7, exit 1, no hang", () => {
    const r = run(WRAPPER, {}, { bun: false });
    expect(r.status).toBe(1);
    const s = JSON.parse(r.stdout) as Summary;
    expect([s.ok, s.failed[0]?.test, s.failed[0]?.message]).toEqual([
      false,
      "playwright-report",
      READ,
    ]);
  });
});

describe("#2223 criterion 4: a stale results.json is never read as this run's result", () => {
  it.each([
    ["default playwright-report/", "playwright-report", {}],
    [
      "PLAYWRIGHT_REPORT_DIR=custom-report (OQ-2)",
      "custom-report",
      { PLAYWRIGHT_REPORT_DIR: "custom-report" },
    ],
  ])("%s: stale passing report + child writes none → O7", (_l, dir, env) => {
    const files = { [`${dir}/results.json`]: json(PASSING()) };
    const r = run(WRAPPER, { e2e: [{ exit: 0 }] }, { env, files });
    const { s } = expectFail(
      r,
      "playwright-report",
      "Failed to read JSON report.",
    );
    expect(s.artifacts.reportPath).toBe(reportPath(r, dir));
  });
  it("PLAYWRIGHT_REPORT_DIR: the report Playwright writes there is the one read", () => {
    const r = wrapper(
      { report: json(PASSING()), exit: 0 },
      { PLAYWRIGHT_REPORT_DIR: "custom-report" },
    );
    expect(expectPass(r).artifacts.reportPath).toBe(
      reportPath(r, "custom-report"),
    );
  });
});

describe("#2223 criterion 5: CLI and project selection unchanged", () => {
  const FOUR = [
    "--project=chromium",
    "--project=mobile-chrome",
    "--project=chromium-donor",
    "--project=chromium-admin",
  ];
  it.each([
    ["unset", {}, ["run", "test:e2e", ...FOUR]],
    [
      "VERIFY_E2E_PROJECTS=chromium",
      { VERIFY_E2E_PROJECTS: "chromium" },
      ["run", "test:e2e", ...FOUR],
    ],
    [
      "VERIFY_E2E_PROJECTS=all",
      { VERIFY_E2E_PROJECTS: "all" },
      ["run", "test:e2e"],
    ],
  ])("%s → fake bun sees the expected argv, exactly once", (_l, env, argv) => {
    const r = wrapper({ report: json(PASSING()), exit: 0 }, env);
    expectPass(r);
    expect(r.calls.e2e).toEqual([argv]);
  });
  it.each(["relative", "symlink"] as const)(
    "main runs when invoked by a %s path (realpath main guard)",
    (via) => {
      const r = run(WRAPPER, { e2e: [{ report: json(PASSING()) }] }, { via });
      expectPass(r);
      expect(r.calls.e2e).toHaveLength(1);
    },
  );
});
