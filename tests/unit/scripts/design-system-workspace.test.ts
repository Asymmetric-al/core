import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import { lintInvocation } from "../../../tooling/eslint-config/lint.mjs";

const root = process.cwd();
const workspaces = [
  "apps/admin",
  "apps/donor",
  "apps/missionary",
  "packages/ui",
  "packages/missionary",
];

describe("workspace configuration under the root-cwd lint adapter", () => {
  for (const workspace of workspaces) {
    it(`preserves the parser root and old rules for ${workspace}`, async () => {
      const workspaceRoot = path.join(root, workspace);
      const invocation = lintInvocation({
        rootDir: root,
        cwd: workspaceRoot,
        args: ["."],
      });
      const eslint = new ESLint({
        cwd: invocation.cwd,
        overrideConfigFile: invocation.configFile,
      });
      const effective = await eslint.calculateConfigForFile(
        path.join(workspaceRoot, "components/new-consumer.tsx"),
      );
      expect(effective.languageOptions.parser.meta.name).toContain(
        "typescript-eslint",
      );
      expect(effective.languageOptions.parserOptions.projectService).toBe(true);
      expect(effective.languageOptions.parserOptions.tsconfigRootDir).toBe(
        workspaceRoot,
      );
      expect(effective.rules["no-restricted-imports"][0]).toBe(2);
      if (workspace.startsWith("apps/")) {
        expect(effective.rules["react-hooks/rules-of-hooks"][0]).toBe(2);
        expect(effective.rules["@next/next/no-img-element"][0]).toBeGreaterThan(
          0,
        );
      }
    });
  }

  for (const workspace of workspaces.filter((scope) =>
    scope.startsWith("apps/"),
  )) {
    it(`preserves generated exclusions in both cwd modes for ${workspace}`, async () => {
      const workspaceRoot = path.join(root, workspace);
      const invocation = lintInvocation({
        rootDir: root,
        cwd: workspaceRoot,
        args: ["."],
      });
      for (const cwd of [workspaceRoot, invocation.cwd]) {
        const eslint = new ESLint({
          cwd,
          overrideConfigFile: invocation.configFile,
        });
        for (const filename of [
          "next-env.d.ts",
          "out/generated.js",
          ".next/generated.js",
          "dist/generated.js",
        ]) {
          expect(
            await eslint.isPathIgnored(path.join(workspaceRoot, filename)),
            `${cwd}: ${filename}`,
          ).toBe(true);
        }
        expect(
          await eslint.isPathIgnored(path.join(workspaceRoot, "app/page.tsx")),
        ).toBe(false);
      }
    });
  }
});
