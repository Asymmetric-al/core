import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  validateCompilerToolchain,
  verifyCompilerToolchain,
} from "../../../scripts/verify/typescript-toolchain.mjs";

const require = createRequire(import.meta.url);

describe("product compiler and JavaScript API boundary", () => {
  it("resolves every product compiler, root command, parser API and editor SDK to its owned context", () => {
    const snapshot = verifyCompilerToolchain();
    expect(snapshot.workspaces).toHaveLength(15);
    expect(
      snapshot.workspaces.some(
        (workspace: { path: string }) =>
          workspace.path === "apps/admin/package.json",
      ),
    ).toBe(true);
  });

  it.each([
    "old product compiler",
    "parser on native compiler",
    "missing editor SDK",
    "root binary shadowed",
  ])("rejects %s instead of accepting installation drift", (failure) => {
    const snapshot = structuredClone(verifyCompilerToolchain());
    if (failure === "old product compiler")
      snapshot.workspaces[0].installed = "6.0.3";
    if (failure === "parser on native compiler")
      snapshot.parser.version = "7.0.2";
    if (failure === "missing editor SDK") snapshot.api.hasEditorSdk = false;
    if (failure === "root binary shadowed")
      snapshot.native.rootCommandMatches = false;
    expect(() => validateCompilerToolchain(snapshot)).toThrow();
  });

  it("parses JSONC aliases and modern TSX with both the JavaScript API and ESLint parser", () => {
    const parsed = ts.parseConfigFileTextToJson(
      "fixture.json",
      '{ // alias\n "compilerOptions": { "paths": { "@/*": ["./*"], }, }, }',
    );
    expect(parsed.error).toBeUndefined();
    expect(parsed.config.compilerOptions.paths).toEqual({ "@/*": ["./*"] });
    const source =
      "export const view = <button disabled={false} /> satisfies JSX.Element;";
    const file = ts.createSourceFile(
      "fixture.tsx",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    expect(file.statements.some(ts.isVariableStatement)).toBe(true);
    const parser = require("@typescript-eslint/parser");
    const result = parser.parseForESLint(source, {
      filePath: "fixture.tsx",
      ecmaFeatures: { jsx: true },
    });
    expect(result.ast.body[0].type).toBe("ExportNamedDeclaration");
  });

  it("runs the actual native compiler and rejects a broken product type contract", () => {
    const temporary = mkdtempSync(
      path.join(os.tmpdir(), "core-native-compiler-"),
    );
    try {
      const manifest = require("@typescript/native/package.json");
      const compiler = path.join(
        path.dirname(require.resolve("@typescript/native/package.json")),
        manifest.bin.tsc,
      );
      const config = path.join(temporary, "tsconfig.json");
      const file = path.join(temporary, "fixture.ts");
      writeFileSync(
        config,
        JSON.stringify({
          compilerOptions: {
            strict: true,
            noEmit: true,
            types: [],
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "bundler",
          },
          files: ["fixture.ts"],
        }),
      );
      writeFileSync(
        file,
        'const amount = { currency: "USD", minorUnits: 100 } satisfies { currency: string; minorUnits: number };\nexport { amount };\n',
      );
      const run = () =>
        spawnSync(process.execPath, [compiler, "--project", config], {
          encoding: "utf8",
          timeout: 30_000,
        });
      const valid = run();
      expect(valid.status, valid.stdout + valid.stderr).toBe(0);
      writeFileSync(file, 'export const amount: number = "100";\n');
      const invalid = run();
      expect(invalid.status).not.toBe(0);
      expect(invalid.stdout).toContain("TS2322");
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});
