import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  invoke,
  removeFixture,
  root,
  timeout,
} from "../../fixtures/quality/launcher.ts";

const fixtures = join(root, "tests/fixtures/quality/query");
const oxlintRules = [
  "exhaustive-deps",
  "no-unstable-deps",
  "stable-query-client",
  "infinite-query-property-order",
  "mutation-property-order",
];
const bridgeCases = [
  { file: "imported-void.ts", rule: "no-void-query-fn" },
  { file: "inline-void.ts", rule: "no-void-query-fn" },
  { file: "union-undefined.ts", rule: "no-void-query-fn" },
  { file: "wrapped-void.ts", rule: "no-void-query-fn" },
  { file: "direct-rest.tsx", rule: "no-rest-destructuring" },
  { file: "wrapped-rest.tsx", rule: "no-rest-destructuring" },
];

let directory: string;
beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), "quality-query-"));
  symlinkSync(
    join(root, "node_modules"),
    join(directory, "node_modules"),
    "junction",
  );
  // Exercise the public launcher with the full policy, including rules that still have pending repairs.
  for (const file of [
    "oxlint.config.mts",
    "tooling/quality/lint.mts",
    "tooling/quality/eslint-parity.json",
    "scripts/verify/lint-pending.mts",
    "tests/fixtures/base-ui-compliance/tsconfig.json",
  ]) {
    mkdirSync(dirname(join(directory, file)), { recursive: true });
    copyFileSync(join(root, file), join(directory, file));
  }
});
afterAll(() => removeFixture(tmpdir(), directory));

describe.each(["fail", "clean"])("%s Query controls", (tree) => {
  it(
    "exercises the five JS plugin rules through the launcher",
    { timeout },
    () => {
      const scope = "oxlint-" + tree;
      mkdirSync(join(directory, scope));
      for (const rule of oxlintRules) {
        copyFileSync(
          join(fixtures, tree, rule + ".ts.txt"),
          join(directory, scope, rule + ".ts"),
        );
      }
      const result = invoke(
        ["--format", "json", scope],
        directory,
        join(directory, "tooling/quality/lint.mts"),
      );
      expect(result.status, result.output).toBe(tree === "fail" ? 1 : 0);
      const report: unknown = JSON.parse(result.stdout);
      const diagnostics =
        tree === "fail"
          ? oxlintRules.map((rule) =>
              expect.objectContaining({
                filename: expect.stringMatching(
                  new RegExp(`[/\\\\]${rule}\\.ts$`),
                ),
                code: `query(${rule})`,
                severity: "error",
              }),
            )
          : [];
      expect(report).toMatchObject({
        number_of_files: oxlintRules.length,
        diagnostics: expect.arrayContaining(diagnostics),
      });
      expect(report, result.stdout).toHaveProperty(
        "diagnostics.length",
        diagnostics.length,
      );
    },
  );

  it(
    "exercises the two typed rules from a Query workspace",
    { timeout },
    () => {
      const workspace = join(directory, "packages", tree);
      mkdirSync(workspace, { recursive: true });
      symlinkSync(
        join(root, "packages/database/node_modules"),
        join(workspace, "node_modules"),
        "junction",
      );
      writeFileSync(
        join(workspace, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            module: "esnext",
            moduleResolution: "bundler",
            target: "es2022",
            strict: true,
          },
          include: ["*.ts", "*.tsx"],
        }),
      );
      copyFileSync(
        join(fixtures, "loaders.ts.txt"),
        join(workspace, "loaders.ts"),
      );
      for (const { file } of bridgeCases) {
        copyFileSync(
          join(fixtures, tree, file + ".txt"),
          join(workspace, file),
        );
      }
      const result = invoke(
        [
          "--config",
          join(root, "tooling/quality/eslint-query.config.mjs"),
          "--no-inline-config",
          "--exit-on-fatal-error",
          "--max-warnings",
          "0",
          "--format",
          "json",
          "**/*.{ts,tsx}",
        ],
        workspace,
        join(root, "node_modules/eslint/bin/eslint.js"),
      );
      expect(result.status, result.output).toBe(tree === "fail" ? 1 : 0);
      const report: unknown = JSON.parse(result.stdout);
      const expected = bridgeCases.map(({ file, rule }) =>
        expect.objectContaining({
          filePath: join(workspace, file),
          messages:
            tree === "fail"
              ? [
                  expect.objectContaining({
                    ruleId: "@tanstack/query/" + rule,
                    severity: 2,
                  }),
                ]
              : [],
        }),
      );
      expected.push(
        expect.objectContaining({
          filePath: join(workspace, "loaders.ts"),
          messages: [],
        }),
      );
      expect(report).toHaveLength(expected.length);
      expect(report).toEqual(expect.arrayContaining(expected));
    },
  );
});
