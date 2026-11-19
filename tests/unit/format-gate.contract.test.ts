import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const PACKAGE_JSON_PATH = "package.json";
const PRE_COMMIT_HOOK_PATH = ".husky/pre-commit";

type PackageJson = {
  scripts: Record<string, string>;
  "lint-staged": Record<string, string[]>;
};

function isPrettierCommand(command: string): boolean {
  return command.split(" ")[0] === "prettier";
}

const packageJson = JSON.parse(
  readFileSync(PACKAGE_JSON_PATH, "utf8"),
) as PackageJson;
const lintStagedConfig = packageJson["lint-staged"];
const preCommitHook = readFileSync(PRE_COMMIT_HOOK_PATH, "utf8");

const globsRunningPrettier = Object.entries(lintStagedConfig)
  .filter(([, commands]) => commands.some(isPrettierCommand))
  .map(([glob]) => glob);

describe("format gate contract", () => {
  // The full preflight profile and the required CI `format` job run
  // `prettier . --check` over the whole repo (a push checks only changed
  // files), so an enumerated allowlist lets files under tests/, scripts/, and
  // repo-root paths commit unformatted and fail later.
  it("runs Prettier over every staged file, not an enumerated allowlist", () => {
    expect(globsRunningPrettier).toEqual(["*"]);
  });

  it("ignores staged files Prettier cannot parse instead of failing the commit", () => {
    const commands = lintStagedConfig["*"].filter(isPrettierCommand);

    expect(commands).toHaveLength(1);
    expect(commands[0]).toContain("--ignore-unknown");
    expect(commands[0]).toContain("--write");
  });

  it("keeps the full-profile and CI format check repo-wide", () => {
    expect(packageJson.scripts["format:check"]).toBe("prettier . --check");
    expect(packageJson.scripts.format).toBe("prettier . --write");
  });

  // Both globs match code under apps/, packages/, and tooling/, and lint-staged
  // runs separate globs concurrently by default.
  it("runs lint-staged tasks sequentially so ESLint and Prettier cannot race", () => {
    expect(preCommitHook).toContain("--concurrent false");
  });
});
