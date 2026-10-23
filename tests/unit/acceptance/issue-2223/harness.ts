/**
 * Shared harness for the #2223 acceptance tests. Runs the real
 * scripts/verify-e2e.mjs and scripts/verify-e2e-loop.mjs with process.execPath
 * in a temp cwd, with a fake `bun` shim first on PATH (spec §5, OQ-8: POSIX-only,
 * following tests/unit/scripts/bun-version.test.ts). Reports are inline objects
 * typed by the installed @playwright/test JSONReport types, not by the scripts.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import type {
  JSONReport,
  JSONReportSpec,
  JSONReportTest,
  JSONReportTestResult,
  TestError,
} from "@playwright/test/reporter";
import { afterAll, it } from "vitest";

export const ROOT = process.cwd();
export const WRAPPER = path.join(ROOT, "scripts/verify-e2e.mjs");
export const LOOP = path.join(ROOT, "scripts/verify-e2e-loop.mjs");
/** OQ-8: PATH-shim subprocess cases are POSIX-only (bun-version.test.ts:109). */
export const itPosix = process.platform === "win32" ? it.skip : it;

/** One fake-bun invocation: write a report, print, then exit or self-signal. */
export type Step = {
  exit?: number;
  report?: string;
  stdout?: string;
  signal?: NodeJS.Signals;
  /** Loop only: run the real wrapper as `bun run verify:e2e` would. */
  wrapper?: boolean;
};
export type Plan = { e2e?: Step[]; loop?: Step[] };

const FAKE = `
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const dir = process.env.FAKE_BUN_DIR;
const argv = process.argv.slice(2);
const kind = argv[1] === "verify:e2e" ? "loop" : "e2e";
const log = path.join(dir, kind + ".jsonl");
fs.appendFileSync(log, JSON.stringify(argv) + "\\n");
const n = fs.readFileSync(log, "utf8").trim().split("\\n").length;
const steps = JSON.parse(fs.readFileSync(path.join(dir, "plan.json"), "utf8"))[kind] ?? [{}];
const step = steps[Math.min(n, steps.length) - 1];
if (step.report !== undefined) {
  const out = process.env.PLAYWRIGHT_REPORT_DIR || "playwright-report";
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "results.json"), step.report);
}
if (kind === "e2e") process.stdout.write("FAKE-PLAYWRIGHT-STDOUT\\n");
if (step.stdout !== undefined) process.stdout.write(step.stdout);
if (step.wrapper) {
  const r = spawnSync(process.execPath, [${JSON.stringify(WRAPPER)}], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}
if (step.signal) process.kill(process.pid, step.signal);
else process.exitCode = step.exit ?? 0;
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
  calls: { e2e: string[][]; loop: string[][] };
};

/** Runs `script` (wrapper or loop) with `args`; `bun: false` leaves no bun on PATH. */
export function run(
  script: string,
  plan: Plan,
  opts: {
    args?: string[];
    env?: Record<string, string>;
    bun?: boolean;
    files?: Record<string, string>;
  } = {},
): Run {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), "acc-2223-")));
  dirs.push(cwd);
  const fake = path.join(cwd, ".fake-bun");
  const bin = path.join(fake, "bin");
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(path.join(fake, "plan.json"), JSON.stringify(plan));
  fs.writeFileSync(path.join(fake, "fake-bun.mjs"), FAKE);
  if (opts.bun !== false) {
    const shim = `#!/bin/sh\nexec "${process.execPath}" "${fake}/fake-bun.mjs" "$@"\n`;
    fs.writeFileSync(path.join(bin, "bun"), shim, { mode: 0o755 });
  }
  for (const [rel, body] of Object.entries(opts.files ?? {})) {
    fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
    fs.writeFileSync(path.join(cwd, rel), body);
  }
  const r = spawnSync(process.execPath, [script, ...(opts.args ?? [])], {
    cwd,
    env: { PATH: bin, FAKE_BUN_DIR: fake, ...opts.env },
    encoding: "utf8",
    timeout: 60_000,
  });
  const calls = (kind: string) => {
    const f = path.join(fake, `${kind}.jsonl`);
    if (!fs.existsSync(f)) return [];
    const lines = fs.readFileSync(f, "utf8").trim().split("\n");
    return lines.map((l) => JSON.parse(l) as string[]);
  };
  return {
    status: r.status,
    stdout: r.stdout,
    stderr: r.stderr,
    cwd,
    calls: { e2e: calls("e2e"), loop: calls("loop") },
  };
}

// ---- Playwright JSON report builders (shape from @playwright/test 1.64.1) ----

type ResultOpts = {
  message?: string;
  stack?: string;
  trace?: string;
  video?: string;
};
export function result(
  status: JSONReportTestResult["status"],
  o: ResultOpts = {},
  retry = 0,
): JSONReportTestResult {
  const error: TestError | undefined =
    o.message || o.stack ? { message: o.message, stack: o.stack } : undefined;
  const attach = (name: string, p: string | undefined, contentType: string) =>
    p ? [{ name, path: p, contentType }] : [];
  return {
    ...{ workerIndex: 0, parallelIndex: 0, status, duration: 5, error, retry },
    errors: o.message ? [{ message: o.message }] : [],
    ...{ stdout: [], stderr: [], startTime: "2026-10-23T16:00:00.000Z" },
    attachments: [
      ...attach("trace", o.trace, "application/zip"),
      ...attach("video", o.video, "video/webm"),
    ],
    annotations: [],
  };
}

export function test(
  status: JSONReportTest["status"],
  results: JSONReportTestResult[],
  expectedStatus: JSONReportTest["expectedStatus"] = "passed",
): JSONReportTest {
  const base = { timeout: 90_000, annotations: [], expectedStatus };
  return {
    ...base,
    projectName: "chromium",
    projectId: "chromium",
    results,
    status,
  };
}

export const SPEC_FILE = "a.spec.ts";
export const SPEC_LINE = 7;
/** Title path the wrapper reports for a spec: file suite > describe > spec. */
export const titlePath = (title: string) => `${SPEC_FILE} > group > ${title}`;

export function spec(
  title: string,
  ...tests: JSONReportTest[]
): JSONReportSpec {
  const ok = tests.every((t) => t.status !== "unexpected");
  const loc = { file: SPEC_FILE, line: SPEC_LINE, column: 3 };
  return { tags: [], title, ok, tests, id: title, ...loc };
}

type Stats = Partial<Omit<JSONReport["stats"], "startTime" | "duration">>;
/** A report whose stats are counted independently from the test outcomes. */
export function report(
  specs: JSONReportSpec[],
  o: { errors?: TestError[]; stats?: Stats } = {},
): JSONReport {
  const all = specs.flatMap((s) => s.tests);
  const count = (s: JSONReportTest["status"]) =>
    all.filter((t) => t.status === s).length;
  const stats = {
    ...{ startTime: "2026-10-23T16:00:00.000Z", duration: 10 },
    ...{ expected: count("expected"), unexpected: count("unexpected") },
    ...{ flaky: count("flaky"), skipped: count("skipped") },
    ...o.stats,
  };
  const group = { title: "group", file: SPEC_FILE, line: 3, column: 1, specs };
  const fileSuite = {
    title: SPEC_FILE,
    file: SPEC_FILE,
    line: 0,
    column: 0,
    specs: [],
  };
  const config = { projects: [] } as unknown as JSONReport["config"];
  return {
    config,
    suites: [{ ...fileSuite, suites: [group] }],
    errors: o.errors ?? [],
    stats,
  };
}

export const PASSING = () =>
  report([spec("passes", test("expected", [result("passed")]))]);
export const json = (r: unknown) => JSON.stringify(r);
