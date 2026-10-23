import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ACCEPTANCE_DIR,
  buildVitestInvocation,
  runAcceptanceTests,
} from "../../../scripts/verify/acceptance-tests.mjs";

type SpawnResult = { status: number | null; error?: Error };
type Report = (root: string) => string | undefined;

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

/** One Vitest JSON report file entry with the given per-test statuses. */
const file = (root: string, rel: string, statuses: string[]) => ({
  name: path.join(root, rel),
  status: statuses.includes("failed") ? "failed" : "passed",
  assertionResults: statuses.map((status) => ({ status })),
});

const report =
  (files: [string, string[]][]): Report =>
  (root) => {
    const testResults = files.map(([rel, s]) => file(root, rel, s));
    const tests = testResults.flatMap((f) => f.assertionResults);
    const failed = tests.filter((t) => t.status === "failed").length;
    return JSON.stringify({
      numFailedTestSuites: 0,
      numTotalTests: tests.length,
      numFailedTests: failed,
      success: testResults.length > 0 && failed === 0,
      testResults,
    });
  };

const ACC_PASS = `${ACCEPTANCE_DIR}/issue-1/pass.acceptance.test.ts`;
const ACC_SKIP = `${ACCEPTANCE_DIR}/issue-2/skip.acceptance.test.ts`;
const OTHER = "tests/unit/other/pass.test.ts";

/**
 * Runs the runner against a throwaway root with a stand-in spawn. The stub
 * writes the report (if any) to the --outputFile.json path it was given.
 */
function run(
  result: SpawnResult,
  body: Report = () => undefined,
  { cli: withCli = true } = {},
) {
  const root = mkdtempSync(path.join(os.tmpdir(), "acceptance-tests-unit-"));
  roots.push(root);
  const cli = path.join(root, "node_modules/vitest/vitest.mjs");
  if (withCli) {
    mkdirSync(path.dirname(cli), { recursive: true });
    writeFileSync(cli, "");
  }
  const spawn = vi.fn((_command: string, args: string[]) => {
    const flag = "--outputFile.json=";
    const output = args.find((arg) => arg.startsWith(flag));
    const text = body(root);
    if (output && text !== undefined)
      writeFileSync(output.slice(flag.length), text);
    return { signal: null, ...result };
  });
  const log = vi.fn();
  const logError = vi.fn();
  const status = runAcceptanceTests({ spawn, cli, root, log, logError });
  const out = [...log.mock.calls, ...logError.mock.calls].flat().join("\n");
  return { status, out, spawn, cli, root };
}

describe("acceptance-tests runner invocation", () => {
  it("runs the Vitest CLI with the JSON reporter over the acceptance suite", () => {
    const invocation = buildVitestInvocation("/r/report.json", "/x/vitest.mjs");
    expect(invocation).toEqual({
      command: process.execPath,
      args: [
        "/x/vitest.mjs",
        "run",
        `${ACCEPTANCE_DIR}/`,
        "--reporter=default",
        "--reporter=json",
        "--outputFile.json=/r/report.json",
        "--no-fsModuleCache",
      ],
    });
  });

  it("spawns the CLI from the repository root without a shell", () => {
    const { spawn, cli, root } = run(
      { status: 0 },
      report([[ACC_PASS, ["passed"]]]),
    );
    expect(spawn).toHaveBeenCalledOnce();
    const [command, args, options] = spawn.mock.calls[0]!;
    expect(command).toBe(process.execPath);
    expect(args[0]).toBe(cli);
    expect(options).toMatchObject({ cwd: root, shell: false });
  });
});

describe("acceptance-tests runner passes", () => {
  it("passes when acceptance tests executed and none failed, and prints the summary", () => {
    const r = run(
      { status: 0 },
      report([
        [ACC_PASS, ["passed", "passed"]],
        [ACC_SKIP, ["skipped", "todo"]],
      ]),
    );
    expect(r.status, r.out).toBe(0);
    expect(r.out).toContain(
      "acceptance-tests: 2 files, 2 passed, 2 skipped, 0 failed",
    );
  });
});

describe("acceptance-tests runner fails closed", () => {
  it("fails when any acceptance test failed", () => {
    const r = run({ status: 1 }, report([[ACC_PASS, ["passed", "failed"]]]));
    expect(r.status).toBe(1);
    expect(r.out).toContain("1 passed, 0 skipped, 1 failed");
  });

  it("fails on a failed test even if Vitest exits 0", () => {
    const r = run({ status: 0 }, report([[ACC_PASS, ["failed"]]]));
    expect(r.status).toBe(1);
    expect(r.out).toContain("acceptance tests failed");
  });

  it("fails with zero acceptance test files, even if other tests passed", () => {
    const r = run({ status: 0 }, report([[OTHER, ["passed"]]]));
    expect(r.status).toBe(1);
    expect(r.out).toContain("acceptance-tests: 0 files");
    expect(r.out).toContain("no test files were collected");
  });

  it("fails when zero acceptance tests executed (all skipped or todo)", () => {
    const r = run(
      { status: 0 },
      report([
        [ACC_SKIP, ["skipped", "todo"]],
        [OTHER, ["passed"]],
      ]),
    );
    expect(r.status).toBe(1);
    expect(r.out).toContain("no acceptance tests executed");
  });

  it("fails when Vitest exits 0 but writes no summary", () => {
    const r = run({ status: 0 });
    expect(r.status).toBe(1);
    expect(r.out).toContain("summary is missing or unreadable");
  });

  it("fails when the summary is corrupt", () => {
    const r = run({ status: 0 }, () => '{"numTotalTests": 1, "testRes');
    expect(r.status).toBe(1);
    expect(r.out).toContain("summary is missing or unreadable");
  });

  it("fails when the summary is valid JSON without test results", () => {
    const r = run({ status: 0 }, () => JSON.stringify({ success: true }));
    expect(r.status).toBe(1);
    expect(r.out).toContain("summary is missing or unreadable");
  });

  it("fails when Vitest exits non-zero despite a passing summary", () => {
    const r = run({ status: 1 }, report([[ACC_PASS, ["passed"]]]));
    expect(r.status).toBe(1);
    expect(r.out).toContain("Vitest exited with status 1");
  });

  it("fails when Vitest is killed by a signal", () => {
    const r = run({ status: null }, report([[ACC_PASS, ["passed"]]]));
    expect(r.status).toBe(1);
  });

  it("fails when Vitest cannot be spawned", () => {
    const error = Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" });
    const r = run({ status: null, error });
    expect(r.status).toBe(1);
    expect(r.out).toContain("Vitest could not be spawned: spawn ENOENT");
  });

  it("fails without spawning when the Vitest CLI is missing", () => {
    const r = run({ status: 0 }, report([[ACC_PASS, ["passed"]]]), {
      cli: false,
    });
    expect(r.status).toBe(1);
    expect(r.spawn).not.toHaveBeenCalled();
    expect(r.out).toContain("Vitest CLI not found");
  });
});
