import { spawnSync, type SpawnSyncOptions } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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

  it("requires full preflight for an authorized production-targeting push", () => {
    const runCommand = vi.fn(() => ({ status: 0 }));
    const env = {
      ASYM_RELEASE_PRODUCTION_PUSH: "1",
      ASYM_RELEASE_PRODUCTION_REASON: "release checkpoint",
    };
    expect(
      runPrePush({
        input: `refs/heads/develop ${"a".repeat(40)} refs/heads/production ${"b".repeat(40)}\n`,
        env,
        runCommand,
      }),
    ).toBe(0);
    expect(runCommand).toHaveBeenCalledWith(
      "bun",
      ["run", "ci:preflight", "--", "--full"],
      expect.objectContaining({ env }),
    );
  });

  it("keeps inherited hook GIT_DIR from redirecting preflight fixture initialization", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-push-environment-"));
    created.push(root);
    const parent = path.join(root, "parent");
    const child = path.join(root, "child.git");
    mkdirSync(parent);
    mkdirSync(child);
    git(parent, ["init", "-q"]);
    const configPath = path.join(parent, ".git", "config");
    const configBefore = readFileSync(configPath, "utf8");
    const env = Object.freeze({
      ...process.env,
      GIT_DIR: path.join(parent, ".git"),
    });
    const runCommand = vi.fn(
      (_command: string, _args: string[], options: SpawnSyncOptions) =>
        // Exercise the child environment with real Git, never a full preflight.
        spawnSync("git", ["init", "--bare", "-q"], {
          ...options,
          cwd: child,
          stdio: "pipe",
        }),
    );

    expect(
      runPrePush({
        input: `refs/heads/fixture ${"a".repeat(40)} refs/heads/fixture ${"0".repeat(40)}\n`,
        env,
        runCommand,
      }),
    ).toBe(0);
    expect(readFileSync(configPath, "utf8")).toBe(configBefore);
    expect(git(parent, ["config", "--local", "--get", "core.bare"])).toBe(
      "false",
    );
    expect(git(child, ["rev-parse", "--is-bare-repository"])).toBe("true");
    expect(env.GIT_DIR).toBe(path.join(parent, ".git"));
  });

  it("isolates repository-local variables and config overrides while preserving release controls", () => {
    const cwd = mkdtempSync(path.join(os.tmpdir(), "core-push-controls-"));
    created.push(cwd);
    git(cwd, ["init", "-q"]);
    const localVariables = git(cwd, ["rev-parse", "--local-env-vars"]).split(
      "\n",
    );
    const env = Object.freeze({
      ...Object.fromEntries(localVariables.map((name) => [name, "hook-local"])),
      GIT_CONFIG_COUNT: "2",
      GIT_CONFIG_KEY_0: "core.bare",
      GIT_CONFIG_VALUE_0: "true",
      GIT_CONFIG_KEY_42: "core.hooksPath",
      GIT_CONFIG_VALUE_42: "/unused-fixture-hooks",
      GIT_TERMINAL_PROMPT: "0",
      PATH: "/fixture-bin",
      ASYM_RELEASE_PRODUCTION_PUSH: "1",
      ASYM_RELEASE_PRODUCTION_REASON: "isolated release fixture",
    });
    const runCommand = vi.fn(
      (_command: string, _args: string[], _options: SpawnSyncOptions) => ({
        status: 0,
      }),
    );

    expect(
      runPrePush({
        input: `refs/heads/develop ${"a".repeat(40)} refs/heads/production ${"b".repeat(40)}\n`,
        env,
        runCommand,
      }),
    ).toBe(0);
    expect(runCommand).toHaveBeenCalledWith(
      "bun",
      ["run", "ci:preflight", "--", "--full"],
      expect.objectContaining({
        env: {
          GIT_TERMINAL_PROMPT: "0",
          PATH: "/fixture-bin",
          ASYM_RELEASE_PRODUCTION_PUSH: "1",
          ASYM_RELEASE_PRODUCTION_REASON: "isolated release fixture",
        },
      }),
    );
    expect(env.GIT_CONFIG_COUNT).toBe("2");
    expect(env.GIT_CONFIG_KEY_42).toBe("core.hooksPath");
  });

  it("still blocks unauthorized production pushes before spawning preflight", () => {
    const runCommand = vi.fn(() => ({ status: 0 }));
    expect(
      runPrePush({
        input: `refs/heads/develop ${"a".repeat(40)} refs/heads/production ${"b".repeat(40)}\n`,
        env: { GIT_DIR: "/unused-hook-repository" },
        runCommand,
      }),
    ).toBe(1);
    expect(runCommand).not.toHaveBeenCalled();
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
      ["Agent C", "agent-c@example.test", "Agent D", "agent-d@example.test"],
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
    expect(git(cwd, ["log", "-5", "--format=%G?"]).replaceAll("\n", "")).toBe(
      "NNNNN",
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
