import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runPrePush } from "../../../scripts/git/pre-push.mjs";

const created: string[] = [];

function git(cwd: string, args: string[], env = process.env): string {
  const isolatedEnv = { ...env };
  const identityVariables = new Set([
    "GIT_AUTHOR_NAME",
    "GIT_AUTHOR_EMAIL",
    "GIT_COMMITTER_NAME",
    "GIT_COMMITTER_EMAIL",
  ]);
  for (const key of Object.keys(isolatedEnv)) {
    if (key.startsWith("GIT_") && !identityVariables.has(key)) {
      delete isolatedEnv[key];
    }
  }
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: isolatedEnv,
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

describe("feature branch handoffs", () => {
  afterEach(() => {
    for (const dir of created.splice(0))
      rmSync(dir, { recursive: true, force: true });
  });

  it("accepts unsigned mixed human and agent history without identity repair", () => {
    const cwd = mkdtempSync(path.join(os.tmpdir(), "core-handoffs-"));
    created.push(cwd);
    git(cwd, ["init", "-q"]);
    git(cwd, ["config", "commit.gpgsign", "false"]);
    const commits = [
      ["Human One", "one@example.test", "Human One", "one@example.test"],
      ["Agent A", "agent-a@example.test", "Human One", "one@example.test"],
      ["Human One", "one@example.test", "Agent A", "agent-a@example.test"],
      ["Agent B", "agent-b@example.test", "Agent C", "agent-c@example.test"],
    ];
    for (const [
      index,
      [author, authorEmail, committer, committerEmail],
    ] of commits.entries()) {
      writeFileSync(
        path.join(cwd, "change.txt"),
        `${author}:${committer}\n${index}`,
      );
      git(cwd, ["add", "change.txt"]);
      git(cwd, ["commit", "-q", "-m", "handoff"], {
        ...process.env,
        GIT_AUTHOR_NAME: author,
        GIT_AUTHOR_EMAIL: authorEmail,
        GIT_COMMITTER_NAME: committer,
        GIT_COMMITTER_EMAIL: committerEmail,
      });
    }
    const head = git(cwd, ["rev-parse", "HEAD"]);
    expect(git(cwd, ["log", "-4", "--format=%G?"]).replaceAll("\n", "")).toBe(
      "NNNN",
    );
    const runCommand = vi.fn(() => ({ status: 0 }));
    const result = runPrePush({
      input: `refs/heads/handoff ${head} refs/heads/handoff ${"0".repeat(40)}\n`,
      env: {},
      runCommand,
    });
    expect(result).toBe(0);
    expect(runCommand).toHaveBeenCalledWith(
      "bun",
      ["run", "ci:preflight"],
      expect.objectContaining({ env: {} }),
    );
  });
});
