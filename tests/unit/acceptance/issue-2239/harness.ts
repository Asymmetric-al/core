/**
 * Harness for the #2239 acceptance tests. Copied from, not importing, the #2223
 * harness pattern: runs the real scripts/verify-e2e.mjs with process.execPath
 * in a temp cwd, with a POSIX fake `bun` first on PATH that writes the given
 * Playwright JSON report where Playwright would and exits with the given code.
 * Reports are inline objects typed by the installed @playwright/test JSONReport
 * types (shape from @playwright/test 1.64.1), with literal stats.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, expect, it } from "vitest";

import type {
  JSONReport,
  JSONReportSpec,
  JSONReportSuite,
  JSONReportTest,
  JSONReportTestResult,
} from "@playwright/test/reporter";

export const ROOT = process.cwd();
export const WRAPPER = path.join(ROOT, "scripts/verify-e2e.mjs");
/** PATH-shim subprocess cases are POSIX-only, like the #2223 harness. */
export const itPosix = process.platform === "win32" ? it.skip : it;

const FAKE = `
import fs from "node:fs";
import path from "node:path";
const dir = process.env.FAKE_BUN_DIR;
fs.appendFileSync(path.join(dir, "calls.jsonl"), JSON.stringify(process.argv.slice(2)) + "\\n");
const step = JSON.parse(fs.readFileSync(path.join(dir, "step.json"), "utf8"));
if (step.report !== undefined) {
  const out = process.env.PLAYWRIGHT_REPORT_DIR || "playwright-report";
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "results.json"), step.report);
}
process.stdout.write("FAKE-PLAYWRIGHT-STDOUT\\n");
process.exitCode = step.exit;
`;

const dirs: string[] = [];
afterAll(() =>
  dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })),
);

export type Run = {
  status: number | null;
  stdout: string;
  stderr: string;
  cwd: string;
};

/** Runs the real wrapper once; the fake bun writes `report` (raw text) and exits `exit`. */
export function wrapper(report: unknown, exit: number): Run {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), "acc-2239-")));
  dirs.push(cwd);
  const fake = path.join(cwd, ".fake-bun");
  const bin = path.join(fake, "bin");
  fs.mkdirSync(bin, { recursive: true });
  const text = typeof report === "string" ? report : JSON.stringify(report);
  fs.writeFileSync(
    path.join(fake, "step.json"),
    JSON.stringify({ report: text, exit }),
  );
  fs.writeFileSync(path.join(fake, "fake-bun.mjs"), FAKE);
  const shim = `#!/bin/sh\nexec "${process.execPath}" "${fake}/fake-bun.mjs" "$@"\n`;
  fs.writeFileSync(path.join(bin, "bun"), shim, { mode: 0o755 });
  const r = spawnSync(process.execPath, [WRAPPER], {
    cwd,
    env: { PATH: bin, FAKE_BUN_DIR: fake },
    encoding: "utf8",
    timeout: 60_000,
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, cwd };
}

export type Entry = {
  test: string;
  message: string;
  file: string;
  line: number;
  tracePath?: string;
  videoPath?: string;
};
export type Summary = {
  ok: boolean;
  failed: Entry[];
  artifacts: { reportPath: string; traces?: string[]; videos?: string[] };
};

/** stdout is exactly one JSON line with exactly the keys ok/failed/artifacts. */
export function summary(r: Run): Summary {
  const lines = r.stdout.split("\n");
  expect(lines, `stdout=${r.stdout}\nstderr=${r.stderr}`).toHaveLength(2);
  expect(lines[1]).toBe("");
  const s = JSON.parse(lines[0]!) as Summary;
  expect(Object.keys(s).sort()).toEqual(["artifacts", "failed", "ok"]);
  return s;
}

export const reportPathOf = (r: Run) =>
  path.join(r.cwd, "playwright-report", "results.json");

/** Entries the wrapper attributes to the report itself. */
export const reportEntries = (s: Summary) =>
  s.failed.filter((f) => f.test === "playwright-report");

// ---- Playwright JSON report builders ----

export function attempt(
  status: JSONReportTestResult["status"],
  retry = 0,
  message?: string,
): JSONReportTestResult {
  return {
    ...{ workerIndex: 0, parallelIndex: 0, status, duration: 5, retry },
    error: message ? { message } : undefined,
    errors: message ? [{ message }] : [],
    ...{ stdout: [], stderr: [], startTime: "2026-10-23T16:00:00.000Z" },
    attachments: [],
    annotations: [],
  };
}

export function tcase(
  status: JSONReportTest["status"],
  results: JSONReportTestResult[],
  o: {
    expectedStatus?: JSONReportTest["expectedStatus"];
    project?: string;
  } = {},
): JSONReportTest {
  const project = o.project ?? "chromium";
  return {
    ...{ timeout: 90_000, annotations: [] },
    expectedStatus: o.expectedStatus ?? "passed",
    ...{ projectName: project, projectId: project },
    results,
    status,
  };
}

export function spec(
  file: string,
  title: string,
  line: number,
  ...tests: JSONReportTest[]
): JSONReportSpec {
  const ok = tests.every((t) => t.status !== "unexpected");
  return {
    tags: [],
    title,
    ok,
    tests,
    id: `${file}:${line}`,
    file,
    line,
    column: 3,
  };
}

/** A suite; `suites` is omitted when absent, as Playwright's JSON reporter does. */
export function suite(
  file: string,
  title: string,
  o: {
    specs?: JSONReportSpec[];
    suites?: JSONReportSuite[];
    line?: number;
  } = {},
): JSONReportSuite {
  return {
    ...{ title, file, line: o.line ?? 0, column: 0 },
    specs: o.specs ?? [],
    ...(o.suites ? { suites: o.suites } : {}),
  };
}

export type Counters = {
  expected: number;
  unexpected: number;
  flaky: number;
  skipped: number;
};

/** A report with literal stats (no counting in the harness). */
export function report(suites: JSONReportSuite[], stats: Counters): JSONReport {
  const config = { projects: [] } as unknown as JSONReport["config"];
  return {
    config,
    suites,
    errors: [],
    stats: {
      ...{ startTime: "2026-10-23T16:00:00.000Z", duration: 10 },
      ...stats,
    },
  };
}
