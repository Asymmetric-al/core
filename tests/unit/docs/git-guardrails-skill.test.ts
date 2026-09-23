import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const hookRelativePath =
  ".agents/skills/git-guardrails-claude-code/scripts/block-dangerous-git.sh";
const overlayRelativePath =
  "scripts/refresh-overlays/git-guardrails-block-dangerous-git.sh";
const hookPath = path.join(repoRoot, hookRelativePath);
const overlayPath = path.join(repoRoot, overlayRelativePath);

function runHook(payload: string) {
  return spawnSync("bash", [hookPath], {
    encoding: "utf8",
    input: payload,
    env: process.env,
  });
}

describe("git-guardrails Claude hook", () => {
  it("keeps the fail-closed parser and workspace-reset regexes", () => {
    expect(existsSync(hookPath)).toBe(true);
    const hook = readFileSync(hookPath, "utf8");

    expect(hook).toContain("failed to parse Claude hook input");
    expect(hook).toContain("python3");
    expect(hook).toContain(
      "git[[:space:]]+checkout[[:space:]]+(--[[:space:]]+)?\\.",
    );
    expect(hook).toContain(
      "git[[:space:]]+restore[[:space:]]+(--[[:space:]]+)?\\.",
    );
    expect(hook).not.toMatch(/COMMAND=\$\(echo "\$INPUT" \| jq -r /);
    expect(readFileSync(overlayPath, "utf8")).toBe(hook);
    expect(
      readFileSync(
        path.join(repoRoot, "scripts/refresh-upstream-skills.mjs"),
        "utf8",
      ),
    ).toContain("ensureGitGuardrailsFailClosed");
  });

  it("blocks git push, git checkout -- ., and git restore -- .", () => {
    chmodSync(hookPath, 0o755);

    const push = runHook(
      JSON.stringify({ tool_input: { command: "git push origin develop" } }),
    );
    expect(push.status, push.stderr).toBe(2);
    expect(push.stderr).toContain("BLOCKED");

    const checkout = runHook(
      JSON.stringify({ tool_input: { command: "git checkout -- ." } }),
    );
    expect(checkout.status, checkout.stderr).toBe(2);
    expect(checkout.stderr).toContain("BLOCKED");

    const restore = runHook(
      JSON.stringify({ tool_input: { command: "git restore -- ." } }),
    );
    expect(restore.status, restore.stderr).toBe(2);
    expect(restore.stderr).toContain("BLOCKED");
  });

  it("fails closed on invalid hook JSON and allows git status", () => {
    const invalid = runHook("not-json");
    expect(invalid.status, invalid.stderr).toBe(2);
    expect(invalid.stderr).toContain("BLOCKED");

    const status = runHook(
      JSON.stringify({ tool_input: { command: "git status" } }),
    );
    expect(status.status, status.stderr).toBe(0);
    expect(status.stderr).toBe("");
  });
});
