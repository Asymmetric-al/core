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
        expect(effective.settings.next.rootDir).toBe(workspaceRoot);
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
    it(`discovers the App Router root from either cwd for ${workspace}`, async () => {
      // The root route proves discovery without depending on upstream grouped-route parsing.
      const filePath = path.join(
        root,
        workspace,
        "app/native-link-policy-probe.tsx",
      );
      for (const cwd of [root, path.join(root, workspace)]) {
        const eslint = new ESLint({
          cwd,
          overrideConfigFile: path.join(root, workspace, "eslint.config.mjs"),
          overrideConfig: {
            languageOptions: { parserOptions: { projectService: false } },
          },
        });
        const [invalid] = await eslint.lintText(
          'export const View=()=> <a href="/">Home</a>;',
          { filePath },
        );
        expect(
          invalid.messages.filter(
            (message) => message.ruleId === "@next/next/no-html-link-for-pages",
          ).length,
          cwd,
        ).toBeGreaterThan(0);
        const [valid] = await eslint.lintText(
          'import Link from "next/link"; export const View=()=> <><Link href="/">Home</Link><a href="https://example.test">External</a></>;',
          { filePath },
        );
        expect(
          valid.messages.filter(
            (message) => message.ruleId === "@next/next/no-html-link-for-pages",
          ),
          cwd,
        ).toEqual([]);
      }
    });

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
