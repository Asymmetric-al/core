import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { parseAttemptCount } from "../../../scripts/verify-e2e-loop.mjs";
import { summarizeRun } from "../../../scripts/verify-e2e.mjs";

import type {
  JSONReport,
  JSONReportTest,
  JSONReportTestResult,
} from "@playwright/test/reporter";

const repoRoot = process.cwd();
const wrapperPath = path.join(repoRoot, "scripts", "verify-e2e.mjs");
const loopPath = path.join(repoRoot, "scripts", "verify-e2e-loop.mjs");
const REPORT = "/r/playwright-report/results.json";
const CASE = "a.spec.ts > case";
const PR = "playwright-report";
// The PATH-shim subprocess cases are POSIX-only, like bun-version.test.ts.
const itPosix = process.platform === "win32" ? it.skip : it;

const attempt = (
  status: JSONReportTestResult["status"],
  message?: string,
  trace?: string,
) =>
  ({
    status,
    error: message ? { message } : undefined,
    attachments: trace
      ? [{ name: "trace", path: trace, contentType: "application/zip" }]
      : [],
  }) as JSONReportTestResult;

const testCase = (
  status: JSONReportTest["status"],
  results: JSONReportTestResult[],
  expectedStatus: JSONReportTest["expectedStatus"] = "passed",
) => ({ status, expectedStatus, results }) as JSONReportTest;

function report(
  tests: JSONReportTest[],
  extra: { errors?: JSONReport["errors"]; unexpected?: number } = {},
) {
  const count = (s: JSONReportTest["status"]) =>
    tests.filter((t) => t.status === s).length;
  const specs = [{ title: "case", file: "a.spec.ts", line: 4, tests }];
  return JSON.stringify({
    suites: [{ title: "a.spec.ts", specs }],
    errors: extra.errors ?? [],
    stats: {
      expected: count("expected"),
      unexpected: extra.unexpected ?? count("unexpected"),
      flaky: count("flaky"),
      skipped: count("skipped"),
    },
  });
}

const PASSED = testCase("expected", [attempt("passed")]);
const PASS = report([PASSED]);
const FAILED = report([
  testCase("unexpected", [
    attempt("failed", "first", "/t/1.zip"),
    attempt("timedOut", "last", "/t/2.zip"),
  ]),
]);
const EXPECTED_FAILURE = report([
  testCase("expected", [attempt("failed", "known")], "failed"),
]);
const UNEXPECTED_PASS = report([
  testCase("unexpected", [attempt("passed")], "failed"),
]);
const FLAKY = report([
  testCase("flaky", [attempt("failed", "x"), attempt("passed")]),
]);
const RUNNER_ERROR = report([], { errors: [{ message: "setup broke" }] });
const ALL_SKIPPED = report([testCase("skipped", [], "skipped")]);
const NO_RESULTS = report([PASSED, testCase("expected", [])]);
const STATS_MISMATCH = report([PASSED], { unexpected: 1 });

const run = (exitCode: number, reportText: string | null) =>
  summarizeRun({ exitCode, reportText, reportPath: REPORT });

describe("summarizeRun", () => {
  it.each([
    ["O1 passed", PASS],
    ["O3 expected failure", EXPECTED_FAILURE],
    ["O5a flaky", FLAKY],
  ])("%s with exit 0 passes", (_label, reportText) => {
    const { summary, exit } = run(0, reportText);
    expect([summary.ok, exit, summary.failed]).toEqual([true, 0, []]);
    expect(Object.keys(summary).sort()).toEqual(["artifacts", "failed", "ok"]);
  });

  it.each([
    ["O2/O5b", 1, FAILED, CASE, "last"],
    ["O4", 1, UNEXPECTED_PASS, CASE, "Expected to fail, but passed."],
    ["O6", 1, RUNNER_ERROR, "playwright-runner", "setup broke"],
    ["O7 invalid JSON", 0, "{", PR, "Failed to read JSON report."],
    ["O8", 1, "{}", PR, "Invalid Playwright JSON report: suites"],
    ["O8 null", 0, "null", PR, "Invalid Playwright JSON report: (root)"],
    ["O9", 0, ALL_SKIPPED, PR, "No tests executed (expected=0, flaky=0"],
    ["O10 no results", 0, NO_RESULTS, PR, "Incomplete run: 1 test(s)"],
    ["O10 stats", 0, STATS_MISMATCH, PR, "Incomplete run: stats.unex"],
    ["O11", 2, PASS, "playwright-process", "Playwright exited with code 2"],
    ["O12", 0, FAILED, CASE, "last"],
  ] as const)("%s fails with exit 1", (_l, exitCode, text, test, message) => {
    const { summary, exit } = run(exitCode, text);
    expect([summary.ok, exit]).toEqual([false, 1]);
    const hit = summary.failed.find((f) => f.test === test);
    const prefix = hit?.message.slice(0, message.length);
    expect(prefix, JSON.stringify(summary.failed)).toBe(message);
  });

  it("O7: an unreadable report keeps the exitCode || 1 passthrough", () => {
    expect(run(3, null).exit).toBe(3);
    expect(run(0, null).exit).toBe(1);
    expect(run(0, null).summary.failed[0]?.test).toBe(PR);
  });

  it("Q4: causes are cumulative, one entry each; O11 only when none apply", () => {
    const failing = testCase("unexpected", [attempt("failed", "boom")]);
    const text = report([failing], {
      errors: [{ message: "setup broke" }, { value: "second" }],
      unexpected: 2,
    });
    const { summary } = run(1, text);
    expect(
      summary.failed.map((f) => [f.test, f.message.split(" (")[0]]),
    ).toEqual([
      ["playwright-runner", "setup broke"],
      ["playwright-runner", "second"],
      [CASE, "boom"],
      [PR, "No tests executed"],
      [PR, "Incomplete run: stats.unexpected=2 but 1 test(s) listed"],
    ]);
  });

  it("O5b: one entry with the last failing attempt's trace; flaky is counted", () => {
    const { summary } = run(1, FAILED);
    expect(summary.failed.filter((f) => f.test === CASE)).toHaveLength(1);
    expect(summary.artifacts).toEqual({
      reportPath: REPORT,
      traces: ["/t/2.zip"],
    });
    expect(run(0, FLAKY).flaky).toBe(1);
  });
});

describe("parseAttemptCount", () => {
  it.each([
    [undefined, 3],
    ["", 3],
    ["1", 1],
    ["03", 3],
    ["1000000", 1000000],
    ["9007199254740991", Number.MAX_SAFE_INTEGER],
  ])("accepts %j as %i", (raw, count) => {
    expect(parseAttemptCount(raw)).toBe(count);
  });

  const invalid = ["0", "-1", "+3", "2.5", "3abc", "1e3", " 3", "abc"];
  it.each([...invalid, "NaN", "Infinity", "9007199254740993"])(
    "rejects %j",
    (raw) => expect(parseAttemptCount(raw)).toBeNull(),
  );
});

describe("verify:e2e scripts as subprocesses (fake bun on PATH)", () => {
  const roots: string[] = [];
  afterEach(() => {
    for (const r of roots.splice(0))
      rmSync(r, { recursive: true, force: true });
  });

  type Step = { exit: number; report?: string; stdout?: string };
  // Each fake-bun call logs its argv, takes the next step and writes the
  // report where Playwright would.
  const FAKE_BUN = `import fs from "node:fs";
fs.appendFileSync("calls.jsonl", JSON.stringify(process.argv.slice(2)) + "\\n");
const n = fs.readFileSync("calls.jsonl", "utf8").trim().split("\\n").length;
const steps = JSON.parse(fs.readFileSync("steps.json", "utf8"));
const step = steps[Math.min(n, steps.length) - 1];
const dir = process.env.PLAYWRIGHT_REPORT_DIR || "playwright-report";
if (step.report) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + "/results.json", step.report);
}
process.stdout.write(step.stdout ?? "");
process.exitCode = step.exit;
`;

  function runScript(
    script: string,
    steps: Step[],
    opts: {
      args?: string[];
      env?: Record<string, string>;
      cwd?: string;
      via?: "relative" | "symlink";
    } = {},
  ) {
    const cwd =
      opts.cwd ?? realpathSync(mkdtempSync(path.join(tmpdir(), "verify-e2e-")));
    if (!opts.cwd) roots.push(cwd);
    mkdirSync(path.join(cwd, "bin"), { recursive: true });
    writeFileSync(path.join(cwd, "steps.json"), JSON.stringify(steps));
    writeFileSync(path.join(cwd, "fake-bun.mjs"), FAKE_BUN);
    const shim = `#!/bin/sh\nexec "${process.execPath}" "${cwd}/fake-bun.mjs" "$@"\n`;
    writeFileSync(path.join(cwd, "bin", "bun"), shim, { mode: 0o755 });
    let argv1 = script;
    if (opts.via === "relative") argv1 = path.relative(cwd, script);
    if (opts.via === "symlink") {
      argv1 = `linked-${path.basename(script)}`;
      symlinkSync(script, path.join(cwd, argv1));
    }
    const result = spawnSync(process.execPath, [argv1, ...(opts.args ?? [])], {
      cwd,
      env: { PATH: path.join(cwd, "bin"), ...opts.env },
      encoding: "utf8",
    });
    const log = path.join(cwd, "calls.jsonl");
    const lines = existsSync(log) ? readFileSync(log, "utf8").trim() : "";
    const calls = lines ? lines.split("\n").map((l) => JSON.parse(l)) : [];
    return { ...result, cwd, calls };
  }

  itPosix(
    "a failing run exits 1 with one JSON line and the default argv",
    () => {
      const r = runScript(wrapperPath, [{ exit: 1, report: FAILED }]);
      expect(r.status).toBe(1);
      expect(r.stdout.split("\n")).toHaveLength(2);
      expect(JSON.parse(r.stdout)).toMatchObject({ ok: false });
      const projects = ["chromium", "mobile-chrome", "chromium-donor"];
      expect(r.calls).toEqual([
        [
          "run",
          "test:e2e",
          ...[...projects, "chromium-admin"].map((p) => `--project=${p}`),
        ],
      ]);
    },
  );

  itPosix("a stale report in PLAYWRIGHT_REPORT_DIR is never read", () => {
    const env = { PLAYWRIGHT_REPORT_DIR: "custom" };
    const first = runScript(wrapperPath, [{ exit: 0, report: PASS }], { env });
    expect(first.status).toBe(0);
    const cwd = first.cwd;
    const rerun = runScript(wrapperPath, [{ exit: 0 }], { env, cwd });
    expect(rerun.status).toBe(1);
    expect(JSON.parse(rerun.stdout).failed[0]).toMatchObject({
      test: PR,
      file: path.join(cwd, "custom", "results.json"),
    });
  });

  itPosix("the loop rejects an invalid count before spawning bun", () => {
    const r = runScript(loopPath, [{ exit: 0, stdout: '{"ok":true}' }], {
      args: ["0"],
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(
      'verify:e2e:loop: attempt count must be a positive integer, got "0"',
    );
    expect(r.calls).toEqual([]);
  });

  itPosix.each([
    ["wrapper", "relative"],
    ["wrapper", "symlink"],
    ["loop", "relative"],
    ["loop", "symlink"],
  ] as const)("Q7: the %s runs main() via a %s argv[1]", (name, via) => {
    const script = name === "wrapper" ? wrapperPath : loopPath;
    const step = { exit: 0, report: PASS, stdout: '{"ok":true,"failed":[]}' };
    const r = runScript(script, [step], { via });
    expect([r.status, r.calls.length], r.stderr).toEqual([0, 1]);
    expect(JSON.parse(r.stdout)).toMatchObject({ ok: true });
  });

  itPosix.each(["[]", '[{"ok":true}]'])(
    "the loop exits 1 on array stdout %s without retrying",
    (stdout) => {
      const ok = { exit: 0, stdout: '{"ok":true}' };
      const r = runScript(loopPath, [{ exit: 0, stdout }, ok]);
      expect([r.status, r.calls.length]).toEqual([1, 1]);
    },
  );

  itPosix("the loop retries exit 1 with ok:true and reports the retry", () => {
    const ok = '{"ok":true,"failed":[]}';
    const r = runScript(loopPath, [
      { exit: 1, stdout: ok },
      { exit: 0, stdout: ok },
    ]);
    expect([r.status, r.calls.length]).toEqual([0, 2]);
    expect(r.stderr).toContain(
      "verify:e2e exited 1 with ok=true; treating attempt as failed",
    );
    expect(r.stderr).toContain(
      "Passed on attempt 2/3 after 1 failed attempt(s)",
    );
  });
});
