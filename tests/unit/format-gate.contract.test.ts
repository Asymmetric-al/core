import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const PACKAGE_JSON_PATH = "package.json";
const PRE_COMMIT_HOOK_PATH = ".husky/pre-commit";

type PackageJson = {
  scripts: Record<string, string>;
  "lint-staged": Record<string, string[]>;
};

const packageJson = JSON.parse(
  readFileSync(PACKAGE_JSON_PATH, "utf8"),
) as PackageJson;

const lintStagedConfig = packageJson["lint-staged"];
const preCommitHook = readFileSync(PRE_COMMIT_HOOK_PATH, "utf8");

function isPrettierCommand(command: string): boolean {
  return command.split(" ")[0] === "prettier";
}

function globsRunningPrettier(): string[] {
  return Object.entries(lintStagedConfig)
    .filter(([, commands]) => commands.some(isPrettierCommand))
    .map(([glob]) => glob);
}

function prettierCommandsFor(glob: string): string[] {
  return (lintStagedConfig[glob] ?? []).filter(isPrettierCommand);
}

describe("format gate contract", () => {
  /**
   * The pre-push gate runs `prettier . --check` over the whole repo, so the
   * pre-commit hook has to format with the same scope. An enumerated glob
   * allowlist drifts: files under `tests/`, `scripts/`, `openspec/`, and
   * repo-root dotfiles used to commit cleanly and then fail the push gate.
   * Matching every staged file leaves `.prettierignore` / `.gitignore` as the
   * single source of truth for exclusions.
   */
  it("runs Prettier over every staged file, not an enumerated allowlist", () => {
    expect(globsRunningPrettier()).toEqual(["*"]);
  });

  it("ignores staged files Prettier cannot parse instead of failing the commit", () => {
    const commands = prettierCommandsFor("*");

    expect(commands).toHaveLength(1);
    expect(commands[0]).toContain("--ignore-unknown");
    expect(commands[0]).toContain("--write");
  });

  it("keeps the pre-push format gate repo-wide", () => {
    expect(packageJson.scripts["format:check"]).toBe("prettier . --check");
    expect(packageJson.scripts.format).toBe("prettier . --write");
  });

  /**
   * The ESLint and Prettier globs both match code under `apps/`, `packages/`,
   * and `tooling/`. lint-staged runs task chains for separate globs
   * concurrently by default, which would let `eslint --fix` and
   * `prettier --write` write the same file at once.
   */
  it("runs lint-staged tasks sequentially so ESLint and Prettier cannot race", () => {
    expect(preCommitHook).toContain("--concurrent false");
  });
});
