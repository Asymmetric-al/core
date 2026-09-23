import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { lintInvocation } from "../../../tooling/eslint-config/lint.mjs";

const coreRoot = process.cwd();
const requireFromCore = createRequire(path.join(coreRoot, "package.json"));
const eslintCli = path.join(
  path.dirname(requireFromCore.resolve("eslint/package.json")),
  "bin/eslint.js",
);
const fixtures: string[] = [];
const rules = [
  "no-restyle",
  "no-raw-colors",
  "no-arbitrary-values",
  "no-inline-styles",
  "no-unknown-classes",
  "require-static-classes",
].map((rule) => `shadcn/${rule}`);
const legacyFile = "apps/donor/legacy.tsx";
const cleanSource =
  'export const Legacy = () => <div className="bg-background" />;';
const legacySource =
  'export const Legacy = () => <div className="bg-zinc-500" />;';

type Diagnostics = Array<{
  filePath: string;
  errorCount: number;
  messages: Array<{ ruleId: string | null }>;
  suppressedMessages: Array<{ ruleId: string | null }>;
}>;

function write(root: string, relative: string, source: string) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, source);
}

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "core-lint-suppression-"));
  fixtures.push(root);
  write(
    root,
    "package.json",
    JSON.stringify({ name: "core-suppression-fixture", private: true }),
  );
  write(
    root,
    "apps/donor/package.json",
    JSON.stringify({ name: "@asym/donor", private: true }),
  );
  write(
    root,
    "apps/donor/tsconfig.json",
    JSON.stringify({ compilerOptions: { jsx: "preserve" } }),
  );
  write(
    root,
    "apps/donor/globals.css",
    '@import "tailwindcss"; @theme { --color-background: #ffffff; }',
  );
  mkdirSync(path.join(root, "node_modules"));
  symlinkSync(
    path.join(coreRoot, "node_modules/tailwindcss"),
    path.join(root, "node_modules/tailwindcss"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const parser = pathToFileURL(
    requireFromCore.resolve("@typescript-eslint/parser"),
  ).href;
  const policy = pathToFileURL(
    path.join(coreRoot, "tooling/eslint-config/design-system.mjs"),
  ).href;
  const config = `
    import parser from ${JSON.stringify(parser)};
    import { designSystemConfig } from ${JSON.stringify(policy)};
    export default [
      { files: ["**/*.tsx"], languageOptions: { parser }, rules: { "no-debugger": "error" } },
      ...designSystemConfig({ workspace: "apps/donor", rootDir: ${JSON.stringify(root)} }),
    ];
  `;
  write(root, "eslint.config.mjs", config);
  write(root, "apps/donor/eslint.config.mjs", config);
  write(root, "tooling/eslint-config/suppressions.json", "{}\n");
  write(root, legacyFile, legacySource);
  return root;
}

function lint(
  root: string,
  targets = ["apps/donor"],
  extra: string[] = [],
  cwd = root,
) {
  const invocation = lintInvocation({
    args: [...extra, "--format", "json", ...targets],
    cwd,
    rootDir: root,
  });
  const result = spawnSync(process.execPath, [eslintCli, ...invocation.args], {
    cwd: invocation.cwd,
    encoding: "utf8",
    timeout: 20_000,
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    stderr: result.stderr,
    diagnostics: result.stdout.trim()
      ? (JSON.parse(result.stdout) as Diagnostics)
      : [],
  };
}

function baseline(root: string) {
  const args = [
    "--config",
    "eslint.config.mjs",
    "--suppressions-location",
    "tooling/eslint-config/suppressions.json",
    "--format",
    "json",
    ...rules.flatMap((rule) => ["--suppress-rule", rule]),
    "apps/donor",
  ];
  const result = spawnSync(process.execPath, [eslintCli, ...args], {
    cwd: root,
    encoding: "utf8",
    timeout: 20_000,
  });
  if (result.error) throw result.error;
  return result;
}

function suppressionText(root: string) {
  return readFileSync(
    path.join(root, "tooling/eslint-config/suppressions.json"),
    "utf8",
  );
}

afterEach(() => {
  for (const root of fixtures.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("native design-system suppressions", () => {
  it("records only the selected six rules and keeps unrelated errors blocking", () => {
    const root = fixture();
    write(root, legacyFile, `debugger; ${legacySource}`);
    const generated = baseline(root);
    expect(generated.status, generated.stderr).toBe(1);
    expect(JSON.parse(suppressionText(root))).toEqual({
      [legacyFile]: { "shadcn/no-raw-colors": { count: 1 } },
    });
    const result = lint(root);
    expect(result.status).toBe(1);
    expect(
      result.diagnostics.flatMap((file) =>
        file.messages.map((message) => message.ruleId),
      ),
    ).toEqual(["no-debugger"]);
  });

  it("accepts existing debt, rejects new files and count increases, and never expands normal lint", () => {
    const root = fixture();
    expect(baseline(root).status).toBe(0);
    const original = suppressionText(root);
    expect(lint(root).status).toBe(0);
    write(root, "apps/donor/new.tsx", legacySource);
    const newFile = lint(root);
    expect(newFile.status).toBe(1);
    expect(
      newFile.diagnostics.find((file) => file.filePath.endsWith("/new.tsx"))
        ?.messages,
    ).toEqual([expect.objectContaining({ ruleId: "shadcn/no-raw-colors" })]);
    write(root, "apps/donor/new.tsx", cleanSource);
    write(
      root,
      legacyFile,
      'export const Legacy = () => <div className="bg-zinc-500 text-red-500" />;',
    );
    const increased = lint(root);
    expect(increased.status).toBe(1);
    expect(
      increased.diagnostics
        .flatMap((file) => file.messages)
        .filter((message) => message.ruleId === "shadcn/no-raw-colors"),
    ).toHaveLength(2);
    expect(suppressionText(root)).toBe(original);
  });

  it("uses root-relative paths for root and workspace scoped runs without pruning other files", () => {
    const root = fixture();
    write(root, "apps/donor/other.tsx", legacySource);
    expect(baseline(root).status).toBe(0);
    const original = suppressionText(root);
    expect(lint(root, [legacyFile]).status).toBe(0);
    expect(
      lint(root, ["legacy.tsx"], [], path.join(root, "apps/donor")).status,
    ).toBe(0);
    expect(suppressionText(root)).toBe(original);
    write(root, legacyFile, cleanSource);
    const stale = lint(root, [legacyFile]);
    expect(stale.status).toBe(2);
    expect(stale.stderr).toContain("suppressions left");
    expect(
      lint(
        root,
        ["legacy.tsx"],
        ["--prune-suppressions"],
        path.join(root, "apps/donor"),
      ).status,
    ).toBe(0);
    expect(JSON.parse(suppressionText(root))).toEqual({
      "apps/donor/other.tsx": { "shadcn/no-raw-colors": { count: 1 } },
    });
    expect(lint(root).status).toBe(0);
  });

  it("documents the native count limitation: replacement debt in the same file is indistinguishable", () => {
    const root = fixture();
    expect(baseline(root).status).toBe(0);
    write(
      root,
      legacyFile,
      'export const Legacy = () => <div className="text-red-500" />;',
    );
    const result = lint(root);
    expect(result.status).toBe(0);
    expect(
      result.diagnostics.flatMap((file) => file.suppressedMessages),
    ).toEqual([expect.objectContaining({ ruleId: "shadcn/no-raw-colors" })]);
  });

  it("keeps normal entrypoints read-only and rejects baseline expansion and file caching flags", () => {
    const root = fixture();
    const invocation = lintInvocation({
      args: ["."],
      cwd: path.join(root, "apps/donor"),
      rootDir: root,
    });
    expect(invocation.args).not.toContain("--suppress-rule");
    expect(invocation.args).not.toContain("--suppress-all");
    expect(invocation.args).not.toContain("--prune-suppressions");
    for (const args of [
      ["--suppress-all"],
      ["--suppress-rule", "shadcn/no-raw-colors"],
      ["--cache"],
    ]) {
      expect(() =>
        lintInvocation({ args, cwd: root, rootDir: root }),
      ).toThrow();
    }
  });
});
