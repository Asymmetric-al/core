import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import manifest from "../../../package.json";

const root = resolve(import.meta.dirname, "../../..");
const cohort = "ultracite@8.3.0";
const patchPath = "tooling/quality/patches/ultracite@8.3.0.patch";
const pluginPath = "config/oxlint/anti-slop/plugin.mjs";
const installed = join(root, "node_modules/ultracite", pluginPath);
const oxlint = join(root, "node_modules/oxlint/bin/oxlint");
const pristineHash =
  "9bfb19ea9e86908fdf930103d3f1ee0825e0e0eabdf016ac54bc96ab871884c4";
const bundleRevision = "13909c9e07590f5a85d93c62712259fe14a883f7";
const hasPatchEntry = Object.hasOwn(manifest.patchedDependencies, cohort);
// Each test starts several Oxlint processes; a loaded machine must not turn that into a timeout.
const testTimeoutMs = 120_000;
// A caller's type parameter that shares a name with an alias's own parameter: upstream reports a false finding.
const scopeCases = [
  { fixture: "dictionary", rule: "no-unsafe-dictionary-type" },
  { fixture: "widening", rule: "no-known-value-widening" },
];
// An alias that passes a wrapped parameter on (`Box<Readonly<T>>`): upstream overflows the stack, so the
// genuinely unsafe line in the same file is never reported.
const crashCases = [
  {
    fixture: "crash-dictionary",
    rule: "no-unsafe-dictionary-type",
    lines: [5],
  },
  { fixture: "crash-widening", rule: "no-known-value-widening", lines: [7] },
];

function hash(file: string) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function applyPatch(directory: string, reverse = false) {
  execFileSync(
    "git",
    [
      "-c",
      "core.autocrlf=false",
      "apply",
      ...(reverse ? ["--reverse"] : []),
      join(root, patchPath),
    ],
    {
      cwd: directory,
      env: { ...process.env, GIT_CEILING_DIRECTORIES: dirname(directory) },
      shell: false,
      timeout: 15_000,
    },
  );
}

function lint(
  directory: string,
  plugin: string,
  fixture: string,
  rule: string,
) {
  const filename = fixture + ".ts";
  copyFileSync(
    join(root, "tests/fixtures/quality/antislop", filename + ".txt"),
    join(directory, filename),
  );
  const config = {
    categories: { correctness: "off" },
    jsPlugins: [{ name: "anti-slop", specifier: plugin }],
    rules: { ["anti-slop/" + rule]: "error" },
  };
  writeFileSync(join(directory, "config.json"), JSON.stringify(config));
  const result = spawnSync(
    process.execPath,
    [
      oxlint,
      "-c",
      "config.json",
      "--format",
      "json",
      "--threads",
      "1",
      filename,
    ],
    { cwd: directory, encoding: "utf8", shell: false, timeout: 60_000 },
  );
  if (result.error) throw result.error;
  return { filename, result };
}

function check(
  directory: string,
  plugin: string,
  fixture: string,
  rule: string,
  lines: number[],
) {
  const { filename, result } = lint(directory, plugin, fixture, rule);
  expect(result.status, result.stderr + result.stdout).toBe(1);
  expect(result.stderr).toBe("");
  const report: unknown = JSON.parse(result.stdout);
  expect(report).toMatchObject({
    diagnostics: lines.map((line) => ({
      filename,
      code: "anti-slop(" + rule + ")",
      severity: "error",
      labels: [{ span: { line } }],
    })),
  });
}

describe("Ultracite anti-slop alias scopes", () => {
  let directory: string;
  let pristine: string;
  let patched: string;

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), "core-antislop-"));
    const pristineRoot = join(directory, "upstream");
    const patchedRoot = join(directory, "patched");
    pristine = join(pristineRoot, pluginPath);
    patched = join(patchedRoot, pluginPath);
    mkdirSync(dirname(pristine), { recursive: true });
    mkdirSync(dirname(patched), { recursive: true });
    copyFileSync(installed, pristine);
    if (hasPatchEntry && hash(pristine) !== pristineHash) {
      applyPatch(pristineRoot, true);
    }
    expect(hash(pristine), "unmodified upstream plugin").toBe(pristineHash);
    expect(readFileSync(pristine, "utf8")).toContain(
      "at commit " + bundleRevision + ".",
    );
    copyFileSync(pristine, patched);
    applyPatch(patchedRoot);
  });

  afterAll(() => {
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

  it.each(scopeCases)(
    "$rule respects the declaration scope",
    ({ fixture, rule }) => {
      check(directory, pristine, fixture, rule, [6, 8]);
      check(directory, patched, fixture, rule, [8]);
    },
    testTimeoutMs,
  );

  it.each(crashCases)(
    "$rule no longer overflows the stack on a wrapped alias",
    ({ fixture, rule, lines }) => {
      const { result } = lint(directory, pristine, fixture, rule);
      expect(result.status, result.stderr + result.stdout).toBe(1);
      expect(result.stdout).toContain("Error running JS plugin");
      expect(result.stdout).toContain("Maximum call stack size exceeded");
      // The upstream crash hides the real finding: that is why it cannot be left in place.
      expect(result.stdout).not.toContain("anti-slop(" + rule + ")");
      check(directory, patched, fixture, rule, lines);
    },
    testTimeoutMs,
  );

  it("removes both obsolete substitution helpers", () => {
    expect(readFileSync(patched, "utf8")).not.toMatch(
      /resolvedSubstitutionArgument|isUnappliedReferenceTo/,
    );
  });

  it.skipIf(!hasPatchEntry)(
    hasPatchEntry
      ? "matches the bytes installed by Bun"
      : "PENDING: Bun byte equality (manifest has no ultracite@8.3.0 patch entry)",
    () => {
      expect(manifest.patchedDependencies).toHaveProperty([cohort], patchPath);
      expect(readFileSync(installed).equals(readFileSync(patched))).toBe(true);
    },
  );
});
