import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import { ownApiConfig } from "../../../tooling/eslint-config/own-api.mjs";

/**
 * The own-API lint rule on the tree (plan 12, WP2 exit: "The own-API lint
 * rule passes with no exemption"; AL-2675). The rule is wired into the lint
 * configuration of every product workspace, so `bun run lint` runs it, and
 * nothing in the tree switches it off.
 */

const root = process.cwd();
const RULE = "own-api/no-direct-call";

/**
 * The three product apps and the packages their pages import. The operator
 * Console (`apps/factory-console`) is not a product app: it has no tenant and
 * calls only its own console API on the factory VM.
 */
const PRODUCT_WORKSPACES = [
  { workspace: "apps/admin", file: "apps/admin/lib/admin-access.ts" },
  { workspace: "apps/donor", file: "apps/donor/lib/cms/client.ts" },
  {
    workspace: "apps/missionary",
    file: "apps/missionary/lib/route-policy.ts",
  },
  {
    workspace: "packages/database",
    file: "packages/database/query-keys.ts",
  },
  { workspace: "packages/ui", file: "packages/ui/lib/utils.ts" },
  { workspace: "packages/lib", file: "packages/lib/utils.ts" },
  { workspace: "packages/auth", file: "packages/auth/constants.ts" },
  {
    workspace: "packages/missionary",
    file: "packages/missionary/components/index.ts",
  },
] as const;

const OFFENDING_CALL =
  'export async function load() { return fetch("/api/admin/funds?limit=200"); }\n';

function trackedSourceFiles(): string[] {
  return execFileSync(
    "git",
    [
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      ...PRODUCT_WORKSPACES.map(({ workspace }) => workspace),
    ],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .filter((file) => /\.(?:[cm]?[jt]sx?)$/.test(file));
}

describe("the own-API lint rule in the repository's lint configuration", () => {
  it.each(PRODUCT_WORKSPACES)(
    "refuses a direct call to an own-API path in $workspace",
    async ({ workspace, file }) => {
      const eslint = new ESLint({ cwd: path.join(root, workspace) });
      const [result] = await eslint.lintText(OFFENDING_CALL, {
        filePath: path.join(root, file),
      });
      expect(
        result!.messages.filter((message) => message.ruleId === RULE),
      ).toHaveLength(1);
      expect(
        result!.messages.find((message) => message.ruleId === RULE)?.severity,
      ).toBe(2);
    },
    120_000,
  );

  it("passes on the tree: no product source calls an own-API path directly", async () => {
    // The rule follows an address within one module only, so a file that
    // never spells an own-API path cannot fail it; the rest are linted.
    const candidates = trackedSourceFiles().filter((file) =>
      readFileSync(path.join(root, file), "utf8").includes("/api"),
    );
    expect(candidates.length).toBeGreaterThan(50);

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ["**/*.{ts,tsx,mts,cts}"],
          languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
        },
        {
          files: ["**/*.{js,jsx,mjs,cjs}"],
          languageOptions: {
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
        },
        ...ownApiConfig,
      ],
      // The tree passes as it is, with no inline switch either.
      allowInlineConfig: false,
    });
    const results = await eslint.lintFiles(candidates);
    const findings = results.flatMap((result) =>
      result.messages
        .filter((message) => message.ruleId === RULE || message.fatal)
        .map(
          (message) =>
            `${path.relative(root, result.filePath)}:${message.line} ${message.message}`,
        ),
    );
    expect(findings).toEqual([]);
  }, 120_000);

  it("has no exemption: no inline switch, no suppression and no ignored path", () => {
    // `git grep` exits 1 when nothing matches.
    const grep = spawnSync(
      "git",
      ["grep", "-n", "-I", "-e", RULE, "--", "apps", "packages"],
      { cwd: root, encoding: "utf8" },
    );
    expect(grep.status, grep.stdout).toBe(1);
    expect(
      readFileSync(
        path.join(root, "tooling/eslint-config/suppressions.json"),
        "utf8",
      ),
    ).not.toContain(RULE);
    for (const block of ownApiConfig) {
      expect(block).not.toHaveProperty("ignores");
      expect(block.rules[RULE]).toBe("error");
    }
  });
});
