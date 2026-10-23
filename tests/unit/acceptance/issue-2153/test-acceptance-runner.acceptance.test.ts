/**
 * Acceptance tests for #2153 done criterion 3: `bun run test:acceptance`
 * (scripts/verify/acceptance-tests.mjs) fails closed. Each case copies the
 * runner into a throwaway fixture repo, so the real suite is never re-entered.
 * Addendum 1 A2: it runs the Vitest CLI from node_modules as a child process
 * and reads the JSON reporter summary (--outputFile or stdout), never the API.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2153#issuecomment-6367102223
 * Addendum 1: https://github.com/Asymmetric-al/core/issues/2153#issuecomment-6367610407
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ACC = "tests/unit/acceptance";
const T = (body: string) => `import { expect, it } from "vitest";\n${body}\n`;
const PASS = T('it("passes", () => expect(1).toBe(1));');
const FAIL = T('it("fails", () => expect(1).toBe(2));');
const SKIP = T('it.skip("skipped", () => {});\nit.todo("todo");');
const P1 = `${ACC}/issue-1/pass.test.ts`;
const RUNNER = "scripts/verify/acceptance-tests.mjs";
const OTHER = "tests/unit/other/pass.test.ts";
type Summary = "none" | "corrupt" | "valid";
type Modules = "real" | "none" | { exit: number; summary: Summary };
const dirs: string[] = [];
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true })));
const write = (file: string, body: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
};

/** Minimal Vitest JSON report: one passing acceptance file, one test. */
const report = (dir: string) => ({
  ...{ numTotalTestSuites: 1, numPassedTestSuites: 1, numFailedTestSuites: 0 },
  ...{ numTotalTests: 1, numPassedTests: 1, numFailedTests: 0 },
  ...{ numPendingTests: 0, numTodoTests: 0, success: true },
  testResults: [
    {
      ...{ name: path.join(dir, P1), status: "passed" },
      assertionResults: [{ title: "passes", status: "passed" }],
    },
  ],
});
/** Stand-in Vitest CLI: records argv, writes `body` to --outputFile (else stdout). */
const fakeCli = (exit: number, body: string) => `
const a = process.argv.slice(2);
const fs = await import("node:fs");
fs.writeFileSync(new URL("argv.json", import.meta.url), JSON.stringify(a));
const i = a.findIndex((x) => /^--outputFile(\\.json)?(=|$)/.test(x));
const out = i < 0 ? undefined
  : a[i].includes("=") ? a[i].split("=").slice(1).join("=") : a[i + 1];
const body = ${JSON.stringify(body)};
if (body && out) fs.writeFileSync(out, body);
else if (body) console.log(body);
process.exit(${exit});
`;

function fixture(files: Record<string, string>, modules: Modules) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), "acc-2153-"));
  dirs.push(dir);
  const to = (rel: string) => path.join(dir, rel);
  const opts = { recursive: true };
  fs.cpSync(path.join(ROOT, "scripts/verify"), to("scripts/verify"), opts);
  fs.cpSync(path.join(ROOT, "package.json"), to("package.json"));
  const include = '["tests/unit/**/*.test.ts"]';
  const config = `export default { cacheDir: ".vite", test: { include: ${include} } };`;
  write(to("vitest.config.mts"), config);
  fs.mkdirSync(to(ACC), opts);
  for (const [rel, body] of Object.entries(files)) write(to(rel), body);
  if (modules === "real") {
    fs.symlinkSync(path.join(ROOT, "node_modules"), to("node_modules"), "dir");
  } else if (modules !== "none") {
    const { exit, summary } = modules;
    const valid = JSON.stringify(report(dir));
    const corrupt = '{"numTotalTests": 1, "testRes';
    const body = { none: "", corrupt, valid }[summary];
    write(to("node_modules/vitest/vitest.mjs"), fakeCli(exit, body));
    const pkg = { name: "vitest", type: "module", bin: "vitest.mjs" };
    write(to("node_modules/vitest/package.json"), JSON.stringify(pkg));
    fs.mkdirSync(to("node_modules/.bin"));
    fs.symlinkSync("../vitest/vitest.mjs", to("node_modules/.bin/vitest"));
  }
  const strip = /^(VITEST|NODE_OPTIONS|NODE_V8_COVERAGE|TEST$)/;
  const env = Object.entries(process.env).filter(([k]) => !strip.test(k));
  const run = spawnSync(process.execPath, [RUNNER], {
    ...{ cwd: dir, env: Object.fromEntries(env) },
    ...{ encoding: "utf8", timeout: 120_000 },
  });
  const out = `${run.stdout}\n${run.stderr}`;
  const argvFile = to("node_modules/vitest/argv.json");
  const read = () => fs.readFileSync(argvFile, "utf8");
  const cliArgv = fs.existsSync(argvFile)
    ? (JSON.parse(read()) as string[])
    : null;
  return { status: run.status, out, cliArgv };
}

const LINE =
  /acceptance-tests: (\d+) files, (\d+) passed, (\d+) skipped, (\d+) failed/;

describe("#2153 criterion 3: test:acceptance fails closed", () => {
  it("passes a run with executed tests and prints the summary line", () => {
    const r = fixture(
      { [P1]: PASS, [`${ACC}/issue-2/s.test.ts`]: SKIP },
      "real",
    );
    expect(r.status, r.out).toBe(0);
    const [, files, passed, , failed] = LINE.exec(r.out) ?? [];
    expect([files, passed, failed], r.out).toEqual(["2", "1", "0"]);
  });
  it("fails when any acceptance test fails, in any issue directory", () => {
    const r = fixture(
      { [P1]: PASS, [`${ACC}/issue-2/f.test.ts`]: FAIL },
      "real",
    );
    expect(r.status, r.out).not.toBe(0);
    expect(LINE.exec(r.out)?.[4], r.out).toBe("1");
  });
  it("fails with zero acceptance test files, even if other tests pass", () => {
    const r = fixture({ [OTHER]: PASS }, "real");
    expect(r.status, r.out).not.toBe(0);
  });
  it("fails when zero tests execute (all skipped/todo), even if others pass", () => {
    const r = fixture(
      { [`${ACC}/issue-1/s.test.ts`]: SKIP, [OTHER]: PASS },
      "real",
    );
    expect(r.status, r.out).not.toBe(0);
  });
  it("fails, without hanging, when Vitest is missing (spawn/resolve error)", () => {
    const r = fixture({ [P1]: PASS }, "none");
    expect(r.status, r.out).not.toBe(0);
    expect(r.status, "killed or timed out").not.toBeNull();
  });
  it("A2: runs the node_modules Vitest CLI as a child (JSON reporter), not the API", () => {
    const r = fixture({ [P1]: PASS }, { exit: 0, summary: "valid" });
    expect(r.status, r.out).toBe(0);
    expect(r.cliArgv, "stand-in CLI never ran").not.toBeNull();
    expect(r.cliArgv).toContain("run");
    expect(r.cliArgv?.join(" ")).toMatch(/--reporter[= ]json|--json/);
    const src = fs.readFileSync(path.join(ROOT, RUNNER), "utf8");
    expect(src).toMatch(/node:child_process/);
    const api = /["']vitest(\/node)?["']|\b(startVitest|createVitest)\b/;
    expect(src, "Vitest programmatic API").not.toMatch(api);
  });
  it.each([
    ["Vitest exits 0 but writes no summary", 0, "none"],
    ["Vitest exits 0 with a corrupt summary", 0, "corrupt"],
    ["Vitest exits non-zero despite a passing summary", 1, "valid"],
  ] as const)("fails when %s", (_label, exit, summary) => {
    const r = fixture({ [P1]: PASS }, { exit, summary });
    expect(r.status, r.out).not.toBe(0);
  });
});
