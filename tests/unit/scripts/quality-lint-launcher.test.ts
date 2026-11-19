import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, expect, it } from "vitest";

import {
  bin,
  invoke,
  launcher,
  removeFixture,
  root,
  timeout,
} from "../../fixtures/quality/launcher.ts";
import { threadSettings } from "../../../tooling/quality/lint.mts";

let repo: string;
let script: string;
const run = (...args: string[]) => invoke(args, repo, script);
const config = (source: string) =>
  writeFileSync(join(repo, "oxlint.config.mts"), source);
const sample = (source: string) =>
  writeFileSync(join(repo, "sample.js"), source);
beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), "quality-launcher-"));
  script = join(repo, "tooling/quality/lint.mts");
  mkdirSync(join(repo, "tooling/quality"), { recursive: true });
  copyFileSync(launcher, script);
  const modules = join(repo, "node_modules");
  mkdirSync(join(modules, ".bin"), { recursive: true });
  symlinkSync(
    join(root, "node_modules/oxlint"),
    join(modules, "oxlint"),
    "junction",
  );
  if (process.platform === "win32") {
    for (const file of ["oxlint.exe", "oxlint.bunx"])
      copyFileSync(
        join(root, "node_modules/.bin", file),
        join(modules, ".bin", file),
      );
  } else
    symlinkSync(
      join(modules, "oxlint/bin/oxlint"),
      join(modules, ".bin/oxlint"),
    );
  config(
    'export default { ignorePatterns: ["node_modules/**"], rules: { "no-debugger": "error" } };',
  );
  sample("export const value = 1;\n");
});
afterEach(() => removeFixture(tmpdir(), repo));

it("returns 0 for a clean file", { timeout }, () => {
  const result = run("--format", "json", "sample.js");
  expect(result.status, result.output).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    diagnostics: [],
    number_of_files: 1,
  });
});
it(
  "defaults to its own repository even when started outside",
  { timeout },
  () => {
    sample("debugger;\n");
    const result = invoke(["--format", "json"], tmpdir(), script);
    expect(result.status, result.output).toBe(1);
    expect(JSON.parse(result.stdout).diagnostics).toContainEqual(
      expect.objectContaining({
        filename: "sample.js",
        code: "eslint(no-debugger)",
      }),
    );
  },
);
it("applies a safe fix only when --fix is requested", { timeout }, () => {
  config('export default { rules: { "object-shorthand": "error" } };');
  const original = "export function test(value) { return { value: value }; }\n";
  sample(original);
  expect(run("sample.js").status).toBe(1);
  expect(readFileSync(join(repo, "sample.js"), "utf8")).toBe(original);
  const result = run("--fix", "sample.js");
  expect(result.status, result.output).toBe(0);
  expect(readFileSync(join(repo, "sample.js"), "utf8")).toBe(
    original.replace("value: value", "value"),
  );
});
it.each(["warn", "error"])(
  "returns 1 for a %s finding",
  { timeout },
  (level) => {
    config(`export default { rules: { "no-debugger": "${level}" } };`);
    sample("debugger;\n");
    const result = run("sample.js");
    expect(result.status, result.output).toBe(1);
    expect(result.stdout).toContain("no-debugger");
  },
);
it.each([[], ["--format", "json"]].map((args) => ({ args })))(
  "returns 2 for a throwing JS plugin ($args)",
  { timeout },
  ({ args }) => {
    copyFileSync(
      join(root, "tests/fixtures/quality/throwing-plugin.mjs"),
      join(repo, "throw.mjs"),
    );
    config(
      'export default { jsPlugins: ["./throw.mjs"], rules: { "fault/crash": "error" } };',
    );
    const result = run(...args, "sample.js");
    expect(result.status, result.output).toBe(2);
    expect(result.output).toContain("Error running JS plugin");
    expect(result.output).toContain("fixture-plugin-crash");
  },
);
it("returns 2 with the config loader's error", { timeout }, () => {
  config('throw new Error("fixture config failure");');
  const result = run("sample.js");
  expect(result.status, result.output).toBe(2);
  expect(result.output).toContain("fixture config failure");
});
it("returns 2 when Oxlint cannot start", { timeout }, () => {
  unlinkSync(join(repo, "node_modules/.bin", bin("oxlint")));
  const result = run("sample.js");
  expect(result.status, result.output).toBe(2);
  expect(result.output).toMatch(/oxlint/i);
});
it("returns 2 when the selected typed backend is missing", { timeout }, () => {
  const result = invoke(
    ["--typed", "sample.js"],
    repo,
    script,
    join(repo, "missing-backend"),
  );
  expect(result.status, result.output).toBe(2);
  expect(result.output).toContain("missing-backend");
});
it("refuses implicit root suppressions", { timeout }, () => {
  writeFileSync(join(repo, "oxlint-suppressions.json"), "{}");
  const result = run("sample.js");
  expect(result.status, result.output).toBe(2);
  expect(result.stderr).toContain("oxlint-suppressions.json");
});
it.each([
  "--fix-suggestions",
  "--fix-dangerously",
  "--suppress-all",
  "--prune-suppressions",
  "-c",
  "-cother.json",
  "--config",
  "--config=other.json",
])("refuses %s with usage on one line", { timeout }, (flag) => {
  const result = run(flag, "sample.js");
  expect(result.status, result.output).toBe(2);
  expect(result.stderr.trim()).toMatch(
    /^.*node tooling\/quality\/lint\.mts.*$/,
  );
});
it("refuses a path outside the repository", { timeout }, () => {
  const result = run("..");
  expect(result.status, result.output).toBe(2);
  expect(result.stderr).toMatch(/outside/i);
});
it(
  "refuses paths through a directory link outside the repository",
  { timeout },
  () => {
    symlinkSync(tmpdir(), join(repo, "external"), "junction");
    const result = run("--fix", "external/would-create.js");
    expect(result.status, result.output).toBe(2);
    expect(result.stderr).toMatch(/outside/i);
  },
);
it(
  "uses the same bounded thread count for Oxlint and Rayon",
  { timeout },
  () => {
    expect(threadSettings(11, "1")).toEqual({
      argument: "--threads=2",
      rayon: "2",
    });
    expect(threadSettings(3, "1")).toEqual({
      argument: "--threads=1",
      rayon: "1",
    });
    expect(threadSettings(11, undefined)).toEqual({
      argument: "--threads=11",
      rayon: "11",
    });
  },
);
it(
  "ignores nested configs and tolerates unmatched explicit paths",
  { timeout },
  () => {
    const nested = join(repo, "nested");
    mkdirSync(nested);
    writeFileSync(
      join(nested, ".oxlintrc.json"),
      '{"rules":{"no-debugger":"off"}}',
    );
    writeFileSync(join(nested, "sample.js"), "debugger;\n");
    const result = invoke(["sample.js"], nested, script);
    expect(result.status, result.output).toBe(1);
    expect(result.stdout).toContain("no-debugger");
    expect(run("unmatched.js").status).toBe(0);
  },
);
