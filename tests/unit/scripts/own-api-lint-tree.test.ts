import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import {
  ownApiConfig,
  ownApiWorkspaces,
} from "../../../tooling/eslint-config/own-api.mjs";

/**
 * The own-API lint rule on the tree (plan 12, WP2 exit: "The own-API lint
 * rule passes with no exemption"; AL-2675). The rule is wired into the lint
 * configuration of every product workspace, so `bun run lint` runs it, and
 * nothing in the tree switches it off.
 */

const root = process.cwd();
const RULE = "own-api/no-direct-call";

/**
 * A file in each linted workspace (`ownApiWorkspaces.linted`), to resolve that
 * workspace's own lint config. Every other workspace is excluded by name with
 * its reason in `ownApiWorkspaces.excluded`.
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
      ...ownApiWorkspaces.linted,
    ],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .filter((file) => /\.(?:[cm]?[jt]sx?)$/.test(file));
}

/** Every workspace under `apps/` and `packages/`: a folder with a package.json. */
function everyWorkspace(): string[] {
  return ["apps", "packages"]
    .flatMap((parent) =>
      readdirSync(path.join(root, parent), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => `${parent}/${entry.name}`),
    )
    .filter((workspace) =>
      existsSync(path.join(root, workspace, "package.json")),
    )
    .sort();
}

describe("the own-API lint rule in the repository's lint configuration", () => {
  it("places every apps/* and packages/* workspace: linted, or excluded by name with a reason", () => {
    const linted = [...ownApiWorkspaces.linted].sort();
    const excluded = Object.keys(ownApiWorkspaces.excluded).sort();

    expect(linted.filter((workspace) => excluded.includes(workspace))).toEqual(
      [],
    );
    expect([...linted, ...excluded].sort()).toEqual(everyWorkspace());
    for (const [workspace, reason] of Object.entries(
      ownApiWorkspaces.excluded,
    )) {
      expect(
        reason.length,
        `the reason ${workspace} is excluded`,
      ).toBeGreaterThan(40);
    }
    // Each linted workspace is checked below through its own lint config.
    expect(PRODUCT_WORKSPACES.map(({ workspace }) => workspace).sort()).toEqual(
      linted,
    );
  });

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
    // A file can fail the rule in two ways: by reaching an address that
    // spells an own-API path, which the rule follows within one module, so
    // the file contains "/api"; or by using the global fetch as a value
    // (aliased, bound, handed over, or taken out of a global object: council
    // round 1, SB7, and round 2, BR5), so the file contains "fetch". Every
    // file with either is linted; a file with neither cannot fail it.
    const candidates = trackedSourceFiles().filter((file) => {
      const source = readFileSync(path.join(root, file), "utf8");
      return source.includes("/api") || source.includes("fetch");
    });
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
