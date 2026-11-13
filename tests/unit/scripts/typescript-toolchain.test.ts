import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  resolveRootCompilerCommand,
  validateCompilerToolchain,
  verifyCompilerToolchain,
} from "../../../scripts/verify/typescript-toolchain.mjs";

const require = createRequire(import.meta.url);

describe("product compiler and JavaScript API boundary", () => {
  it("resolves every product compiler, root command, parser API and editor SDK to its owned context", () => {
    const snapshot = verifyCompilerToolchain();
    expect(snapshot.workspaces).toHaveLength(16);
    for (const app of ["admin", "factory-console"])
      expect(
        snapshot.workspaces.some(
          (workspace: { path: string }) =>
            workspace.path === `apps/${app}/package.json`,
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

describe("Bun Windows compiler shim ownership", () => {
  it.each([
    "valid",
    "shadowed",
    "missing metadata",
    "truncated",
    "wrong version",
    "wrong launcher",
  ])(
    "checks %s shim metadata without accepting an arbitrary executable",
    (variant) => {
      const temporary = mkdtempSync(
        path.join(os.tmpdir(), "core-compiler-shim-"),
      );
      const modules = path.join(temporary, "node_modules");
      const bin = path.join(modules, ".bin", "tsc");
      const owned = path.join(modules, "native", "tsc");
      try {
        mkdirSync(path.dirname(bin), { recursive: true });
        mkdirSync(path.dirname(owned), { recursive: true });
        writeFileSync(owned, "owned compiler");
        writeFileSync(bin + ".exe", "wrapper");
        const target = Buffer.from(
          variant === "shadowed" ? "other\\tsc" : "native\\tsc",
          "utf16le",
        );
        const launcher = Buffer.from(
          variant === "wrong launcher" ? "bun  " : "node ",
          "utf16le",
        );
        const trailer = Buffer.alloc(10);
        trailer.writeUInt32LE(target.length, 0);
        trailer.writeUInt32LE(launcher.length, 4);
        trailer.writeUInt16LE((2739 << 4) | 7, 8);
        if (variant === "wrong version") trailer.writeUInt16LE(7, 8);
        let shim = Buffer.concat([
          target,
          Buffer.from('"\0', "utf16le"),
          launcher,
          trailer,
        ]);
        if (variant === "truncated") shim = shim.subarray(0, 8);
        if (variant === "shadowed") {
          mkdirSync(path.join(modules, "other"));
          writeFileSync(path.join(modules, "other", "tsc"), "other compiler");
        }
        if (variant !== "missing metadata") writeFileSync(bin + ".bunx", shim);
        const resolved = resolveRootCompilerCommand(temporary, "win32");
        if (variant === "valid") expect(resolved).toBe(realpathSync(owned));
        else expect(resolved).not.toBe(realpathSync(owned));
      } finally {
        rmSync(temporary, { recursive: true, force: true });
      }
    },
  );
});
