import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const apiSrc = path.join(repoRoot, "packages/api/src");
const scratch = mkdtempSync(path.join(tmpdir(), "core-principal-types-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const fixtureText = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

/** Type-checks one fixture with packages/api's compiler options (pattern: payload-collection-type-boundary.test.ts). */
function compile(fixture: string) {
  const source = path.join(scratch, fixture.replace(/\.txt$/, ""));
  writeFileSync(source, fixtureText(fixture).replaceAll("__API__", apiSrc));
  const config = path.join(scratch, `${path.basename(source)}.tsconfig.json`);
  writeFileSync(
    config,
    JSON.stringify({
      extends: path.join(repoRoot, "packages/api/tsconfig.json"),
      include: [source],
      compilerOptions: { noEmit: true, incremental: false, rootDir: "/" },
    }),
  );
  const result = spawnSync(
    "bun",
    ["run", "--cwd", "packages/api", "tsc", "--noEmit", "--project", config],
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
        .split("\n")
        .findIndex((l) => l.endsWith("// type error expected"));
      expect(marked).toBeGreaterThan(-1);
      const errorLines = [
        ...output.matchAll(/\((\d+),\d+\): error TS2322/g),
      ].map((m) => Number(m[1]));
      expect(errorLines, output).toEqual([marked + 1]);
    },
    40_000,
  );
});
