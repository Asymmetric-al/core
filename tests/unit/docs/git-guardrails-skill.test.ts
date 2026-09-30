import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const hookRelativePaths = [
  ".agents/skills/git-guardrails-claude-code/scripts/block-dangerous-git.sh",
  ".claude/skills/git-guardrails-claude-code/scripts/block-dangerous-git.sh",
  ".cursor/skills/git-guardrails-claude-code/scripts/block-dangerous-git.sh",
] as const;

const hookPath = path.join(repoRoot, hookRelativePaths[0]);

function runHook(payload: string) {
  return spawnSync("bash", [hookPath], {
    encoding: "utf8",
    input: payload,
    env: process.env,
  });
}

describe("git-guardrails Claude hook", () => {
  it("keeps the three runtime mirrors byte-identical", () => {
    const [canonical, ...mirrors] = hookRelativePaths.map((relativePath) =>
      readFileSync(path.join(repoRoot, relativePath), "utf8"),
    );

    for (const mirror of mirrors) {
      expect(mirror).toBe(canonical);
    }
  });

  it("blocks push and discard-all checkout or restore", () => {
    for (const command of [
      "git push origin develop",
      "git checkout -- .",
      "git checkout  .",
      "git restore -- .",
      "git restore .",
    ]) {
      const result = runHook(JSON.stringify({ tool_input: { command } }));
      expect(result.status, `${command}\n${result.stderr}`).toBe(2);
      expect(result.stderr).toContain("BLOCKED");
    }
  });

  it("fails closed when hook JSON cannot be parsed and allows git status", () => {
    const invalid = runHook("not-json");
    expect(invalid.status, invalid.stderr).toBe(2);
    expect(invalid.stderr).toContain("BLOCKED");

    const status = runHook(
      JSON.stringify({ tool_input: { command: "git status --short" } }),
    );
    expect(status.status, status.stderr).toBe(0);
    expect(status.stderr).toBe("");
  });
});
