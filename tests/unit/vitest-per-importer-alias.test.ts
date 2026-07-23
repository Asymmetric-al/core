import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import {
  discoverAtAliasWorkspaces,
  findWorkspaceForImporter,
} from "../../vitest.per-importer-alias";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const tempDirs: string[] = [];

function makeFixtureRoot(workspaces: Record<string, object | string>): string {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "at-alias-"));
  tempDirs.push(fixtureRoot);

  for (const [workspacePath, tsconfig] of Object.entries(workspaces)) {
    const workspaceDir = path.join(fixtureRoot, workspacePath);
    fs.mkdirSync(workspaceDir, { recursive: true });
    const content =
      typeof tsconfig === "string" ? tsconfig : JSON.stringify(tsconfig);
    fs.writeFileSync(path.join(workspaceDir, "tsconfig.json"), content);
  }

  return fixtureRoot;
}

afterAll(() => {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("discoverAtAliasWorkspaces", () => {
  it("discovers every repo workspace whose tsconfig maps @/*", () => {
    const roots = discoverAtAliasWorkspaces(repoRoot).map((workspace) =>
      path.relative(repoRoot, workspace.workspaceRoot).replaceAll("\\", "/"),
    );

    expect(roots).toEqual(
      expect.arrayContaining([
        "apps/admin",
        "apps/donor",
        "apps/missionary",
        "packages/missionary",
        "packages/ui",
      ]),
    );
  });

  it("maps the repo convention @/* -> ./* onto the workspace root", () => {
    const workspaces = discoverAtAliasWorkspaces(repoRoot);
    const ui = workspaces.find((workspace) =>
      workspace.workspaceRoot.endsWith(path.join("packages", "ui")),
    );

    expect(ui).toBeDefined();
    expect(ui?.aliasBaseDir).toBe(ui?.workspaceRoot);
  });

  it("honors a non-root paths target such as ./src/*", () => {
    const fixtureRoot = makeFixtureRoot({
      "apps/site": {
        compilerOptions: { paths: { "@/*": ["./src/*"] } },
      },
    });

    const workspaces = discoverAtAliasWorkspaces(fixtureRoot);

    expect(workspaces).toHaveLength(1);
    expect(workspaces[0]?.aliasBaseDir).toBe(
      path.join(fixtureRoot, "apps", "site", "src"),
    );
  });

  it("skips workspaces without an @/* mapping and tolerates JSONC without it", () => {
    const fixtureRoot = makeFixtureRoot({
      "apps/plain": { compilerOptions: { strict: true } },
      "packages/jsonc": '{\n  // no alias here\n  "compilerOptions": {}\n}',
    });

    expect(discoverAtAliasWorkspaces(fixtureRoot)).toEqual([]);
  });

  it("fails loudly when a tsconfig declaring @/* cannot be parsed", () => {
    const fixtureRoot = makeFixtureRoot({
      "apps/broken": '{ "compilerOptions": { "paths": { "@/*": ["./*"] } }, }',
    });

    expect(() => discoverAtAliasWorkspaces(fixtureRoot)).toThrowError(
      /Cannot parse .*apps[\\/]broken[\\/]tsconfig\.json/,
    );
  });
});

describe("findWorkspaceForImporter", () => {
  const outer = {
    workspaceRoot: path.join(repoRoot, "packages", "ui"),
    aliasBaseDir: path.join(repoRoot, "packages", "ui"),
  };
  const nested = {
    workspaceRoot: path.join(repoRoot, "packages", "ui", "nested"),
    aliasBaseDir: path.join(repoRoot, "packages", "ui", "nested"),
  };

  it("matches the workspace containing the importer", () => {
    const importer = path.join(outer.workspaceRoot, "lib", "utils.ts");

    expect(findWorkspaceForImporter([outer], importer)).toBe(outer);
  });

  it("prefers the most specific workspace when roots nest", () => {
    const importer = path.join(nested.workspaceRoot, "button.tsx");

    expect(findWorkspaceForImporter([outer, nested], importer)).toBe(nested);
    expect(findWorkspaceForImporter([nested, outer], importer)).toBe(nested);
  });

  it("ignores importer query strings", () => {
    const importer =
      path.join(outer.workspaceRoot, "lib", "utils.ts") + "?v=123";

    expect(findWorkspaceForImporter([outer], importer)).toBe(outer);
  });

  it("returns undefined for files outside every workspace", () => {
    const importer = path.join(repoRoot, "tests", "unit", "some.test.ts");

    expect(findWorkspaceForImporter([outer], importer)).toBeUndefined();
  });
});
