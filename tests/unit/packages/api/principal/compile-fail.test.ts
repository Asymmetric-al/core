import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import { diagnosticLocations } from "../../../../setup/tsc-diagnostics";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const apiSrc = path.join(repoRoot, "packages/api/src");
const scratch = mkdtempSync(
  path.join(repoRoot, "node_modules", ".principal-types-"),
);
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const fixtureText = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

/** Type-checks one fixture with packages/api's compiler options (pattern: payload-collection-type-boundary.test.ts). */
function compile(fixture: string) {
  const source = path.join(scratch, fixture.replace(/\.txt$/, ""));
  const apiImport = path.relative(scratch, apiSrc).split(path.sep).join("/");
  writeFileSync(source, fixtureText(fixture).replaceAll("__API__", apiImport));
  const config = path.join(scratch, `${path.basename(source)}.tsconfig.json`);
  writeFileSync(
    config,
    JSON.stringify({
      extends: path.join(repoRoot, "packages/api/tsconfig.json"),
      files: [source],
      include: [],
      compilerOptions: { noEmit: true, incremental: false, rootDir: repoRoot },
    }),
  );
  const result = spawnSync(
    "bun",
    [
      "run",
      "--cwd",
      "packages/api",
      "tsc",
      "--noEmit",
      "--pretty",
      "false",
      "--project",
      config,
    ],
    { cwd: repoRoot, encoding: "utf8", shell: false, timeout: 30_000 },
  );
  expect(result.error).toBeUndefined();
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe("Principal union compile checks (criterion 1)", () => {
  it("the exhaustive four-kind switch and the mapper's projection type compile", () => {
    const { status, output } = compile("compile-ok.ts.txt");
    expect(status, output).toBe(0);
  }, 40_000);

  it.each([
    [
      "an ExternalPrincipal with activeAssignment",
      "compile-fail-external-assignment.ts.txt",
    ],
    ["an ExternalPrincipal with grants", "compile-fail-external-grant.ts.txt"],
    [
      "a switch that omits platform_operator",
      "compile-fail-switch-missing-kind.ts.txt",
    ],
  ])(
    "rejects %s, at the marked line only",
    (_name, fixture) => {
      const { status, output } = compile(fixture);
      expect(status, output).not.toBe(0);
      const marked = fixtureText(fixture)
        .split(/\r?\n/)
        .findIndex((l) => l.endsWith("// type error expected"));
      expect(marked).toBeGreaterThan(-1);
      expect(
        diagnosticLocations(output, path.dirname(apiSrc), scratch),
        output,
      ).toEqual([`${fixture.replace(/\.txt$/, "")}:${marked + 1} TS2322`]);
    },
    40_000,
  );
});
