import { execFileSync } from "node:child_process";
import {
  chmodSync,
  closeSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, expect, it, vi } from "vitest";

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
const git = (args: string[], input?: string) =>
  execFileSync("git", args, { cwd: repo, encoding: "utf8", input });
beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), "quality-launcher-"));
  git(["init", "--quiet"]);
  writeFileSync(join(repo, ".gitignore"), "node_modules/\n");
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
it.for(["default", "json"])(
  "returns 2 for a failed fix write (%s)",
  { timeout },
  (format, { skip }) => {
    const file = join(repo, "sample.js");
    config('export default { rules: { "object-shorthand": "error" } };');
    sample("export function test(value) { return { value: value }; }\n");
    chmodSync(file, 0o444);
    try {
      let writable = true;
      try {
        closeSync(openSync(file, "r+"));
      } catch (error) {
        if (!(
          error instanceof Error &&
          "code" in error &&
          ["EACCES", "EPERM"].includes(String(error.code))
        ))
          throw error;
        writable = false;
      }
      if (writable)
        skip("This user can still open a read-only file for writing");
      const result = run(
        "--fix",
        ...(format === "json" ? ["--format", "json"] : []),
        "sample.js",
      );
      expect(result.output).toContain("Failed to write file");
      expect(result.status, result.output).toBe(2);
    } finally {
      chmodSync(file, 0o644);
    }
  },
);
it(
  "does not classify a quoted plugin error in a source snippet as a crash",
  { timeout },
  () => {
    sample("debugger; // Error running JS plugin\n");
    const result = run("sample.js");
    expect(result.stdout).toContain("Error running JS plugin");
    expect(result.status, result.output).toBe(1);
  },
);
it.each([
  { args: [], ci: false },
  { args: ["--format", "json"], ci: false },
  { args: [], ci: true },
])(
  "returns 2 for a throwing JS plugin ($args, GitHub Actions: $ci)",
  { timeout },
  ({ args, ci }) => {
    // Under GitHub Actions Oxlint defaults to its `github` reporter; the launcher must still classify the crash.
    if (ci) vi.stubEnv("GITHUB_ACTIONS", "true");
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
it.each([
  { tracked: false, paths: ["parent"] },
  { tracked: true, paths: ["."] },
  { tracked: false, paths: [] },
])(
  "refuses an external directory link before starting a fix ($tracked, $paths)",
  { timeout },
  ({ tracked, paths }) => {
    const outside = mkdtempSync(join(tmpdir(), "quality-link-target-"));
    try {
      mkdirSync(join(repo, "parent"));
      symlinkSync(outside, join(repo, "parent/external"), "junction");
      if (tracked) {
        const blob = git(["hash-object", "-w", "--stdin"], outside).trim();
        git([
          "update-index",
          "--add",
          "--cacheinfo",
          `120000,${blob},parent/external`,
        ]);
      }
      unlinkSync(join(repo, "node_modules/.bin", bin("oxlint")));
      const result = run("--fix", ...paths);
      expect(result.status, result.output).toBe(2);
      expect(result.stderr).toMatch(/outside.*parent[/\\]external/i);
    } finally {
      removeFixture(tmpdir(), outside);
    }
  },
);
it(
  "fixes a selected directory without rejecting ignored or out-of-scope links",
  { timeout },
  () => {
    const outside = mkdtempSync(join(tmpdir(), "quality-link-target-"));
    try {
      mkdirSync(join(repo, "selected"));
      writeFileSync(
        join(repo, ".gitignore"),
        "node_modules/\nselected/ignored/\n",
      );
      mkdirSync(join(repo, "selected/ignored"));
      symlinkSync(outside, join(repo, "selected/ignored/link"), "junction");
      symlinkSync(outside, join(repo, "unselected"), "junction");
      config('export default { rules: { "object-shorthand": "error" } };');
      const file = join(repo, "selected/example.js");
      const original =
        "export function test(value) { return { value: value }; }\n";
      writeFileSync(file, original);
      const result = run("--fix", "selected");
      expect(result.status, result.output).toBe(0);
      expect(readFileSync(file, "utf8")).toBe(
        original.replace("value: value", "value"),
      );
    } finally {
      removeFixture(tmpdir(), outside);
    }
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
