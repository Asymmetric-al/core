import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runBackup } from "../../../scripts/archon-factory/pack/.shared/backup.mjs";

// The daily factory backup, driven through runBackup with real Git issue
// clones in a temporary factory root. sqlite3 and tar are faked: they only
// create the files the backup records, and every call is kept for assertions.

type Call = {
  command: string;
  args: string[];
  input?: string;
  cwd?: string;
  env?: Record<string, string>;
};

const NOW = new Date("2026-11-11T03:30:00.000Z");
const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Factory Test",
  GIT_AUTHOR_EMAIL: "factory@example.invalid",
  GIT_COMMITTER_NAME: "Factory Test",
  GIT_COMMITTER_EMAIL: "factory@example.invalid",
  GIT_CONFIG_NOSYSTEM: "1",
};

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

// backup.mjs joins POSIX paths. On Windows the root keeps its drive letter
// with forward slashes ("C:/..."), which posix.join, Node and Git for Windows
// all accept; a drive-less "/Users/..." would be mapped under Git's own root.
function posixRoot() {
  const native = mkdtempSync(path.join(os.tmpdir(), "archon-ops-backup-"));
  roots.push(native);
  return native.split(path.sep).join("/");
}

function git(cwd: string, ...args: string[]) {
  return execFileSync("git", args, { cwd, encoding: "utf8", env: GIT_ENV });
}

function factory() {
  const root = posixRoot();
  for (const dir of [
    "backups",
    "control",
    "runs",
    "issues",
    "archon",
    "origin",
  ])
    mkdirSync(`${root}/${dir}`, { recursive: true });
  writeFileSync(`${root}/control/core-factory.json`, "{}\n");
  git(`${root}/origin`, "init", "-q", "-b", "develop");
  writeFileSync(`${root}/origin/readme.md`, "base\n");
  git(`${root}/origin`, "add", "readme.md");
  git(`${root}/origin`, "commit", "-q", "-m", "base");
  return root;
}

// The factory-owned copy of a clone's Git metadata (git.mjs), taken when the
// clone was created and kept outside it.
function trust(root: string, issue: number) {
  const repo = `${root}/issues/${issue}/repo`;
  writeFileSync(
    `${root}/issues/${issue}/git-trust.json`,
    JSON.stringify({
      v: 1,
      repoConfig: readFileSync(`${repo}/.git/config`, "utf8"),
      alternates: "",
      outboxConfig: ["[core]", "\tbare = true", ""].join("\n"),
    }),
  );
}

// An issue clone whose factory branch is fully contained in origin: right
// after claim, after publication, or once the PR merged.
function publishedClone(root: string, issue: number, { trusted = true } = {}) {
  const repo = `${root}/issues/${issue}/repo`;
  mkdirSync(path.posix.dirname(repo), { recursive: true });
  git(root, "clone", "-q", `${root}/origin`, repo);
  git(repo, "checkout", "-q", "-B", `factory/${issue}-x`, "origin/develop");
  if (trusted) trust(root, issue);
  return repo;
}

// An issue clone with an unpushed commit, a modified tracked file and an
// untracked file.
function unfinishedClone(root: string, issue: number, options = {}) {
  const repo = publishedClone(root, issue, options);
  writeFileSync(`${repo}/feature.ts`, "export const x = 1;\n");
  git(repo, "add", "feature.ts");
  git(repo, "commit", "-q", "-m", "candidate");
  writeFileSync(`${repo}/readme.md`, "base\nchanged\n");
  writeFileSync(`${repo}/notes.txt`, "untracked\n");
  return repo;
}

function config(root: string) {
  return {
    root,
    archon: { home: `${root}/archon` },
    git: { executable: "/usr/bin/git" },
  };
}

function runner(calls: Call[], { integrity = "ok" } = {}) {
  return (
    command: string,
    args: string[],
    options: {
      input?: string;
      cwd?: string;
      env?: Record<string, string>;
    } = {},
  ) => {
    calls.push({
      command,
      args,
      input: options.input,
      cwd: options.cwd,
      env: options.env,
    });
    if (command === "/usr/bin/git")
      return execFileSync("git", args, {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        ...options,
        // The backup's own Git environment wins; the platform basics come
        // from the test process.
        env: { ...GIT_ENV, ...(options.env ?? {}) },
      });
    if (command === "/usr/bin/tar") {
      writeFileSync(args[args.indexOf("-czf") + 1], "archive");
      return "";
    }
    if (command === "/usr/bin/sqlite3") {
      if (String(args[1]).startsWith(".backup")) {
        const copy = /'(.*)'/.exec(args[1])![1];
        writeFileSync(copy, readFileSync(args[0]));
        return "";
      }
      return `${integrity}\n`;
    }
    throw new Error(`unexpected command ${command}`);
  };
}

async function backup(root: string, calls: Call[] = [], options = {}) {
  return runBackup({
    config: config(root),
    now: () => NOW,
    run: runner(calls, options),
  });
}

function manifestOf(target: string) {
  return JSON.parse(readFileSync(`${target}/manifest.json`, "utf8"));
}

describe("factory backup: issue clones", () => {
  it("backs up every issue even when a clone has no unpushed commits", async () => {
    const root = factory();
    publishedClone(root, 12);
    unfinishedClone(root, 13);

    const { target } = await backup(root);

    const manifest = manifestOf(target);
    expect(
      manifest.issues.map((entry: { issue: string }) => entry.issue),
    ).toEqual(["12", "13"]);
    expect(manifest.complete).toBe(true);
    expect(manifest.failures).toEqual([]);
    expect(existsSync(`${target}/issue-12.bundle`)).toBe(false);
    expect(existsSync(`${target}/issue-13.bundle`)).toBe(true);
    const listed = git(
      root,
      "bundle",
      "list-heads",
      `${target}/issue-13.bundle`,
    );
    expect(listed).toContain("refs/heads/factory/13-x");
  });

  it("captures uncommitted work as a binary patch and untracked archive under hardened Git", async () => {
    const root = factory();
    unfinishedClone(root, 13);
    const calls: Call[] = [];

    const { target } = await backup(root, calls);

    const patch = readFileSync(`${target}/issue-13.worktree.patch`, "utf8");
    expect(patch).toContain("diff --git a/readme.md b/readme.md");
    expect(patch).toContain("+changed");
    const untracked = calls.find(
      (call) =>
        call.command === "/usr/bin/tar" &&
        call.args.includes(`${target}/issue-13.untracked.tgz`),
    );
    expect(untracked?.input).toBe("notes.txt");
    const entry = manifestOf(target).issues.find(
      (item: { issue: string }) => item.issue === "13",
    );
    expect(entry).toMatchObject({
      branch: "factory/13-x",
      untracked: 1,
      unpushed: ["refs/heads/factory/13-x"],
    });
  });

  it("records a clone that cannot be read and still backs up the others", async () => {
    const root = factory();
    mkdirSync(`${root}/issues/11/repo/.git`, { recursive: true });
    unfinishedClone(root, 13);

    const result = await backup(root);

    const manifest = manifestOf(result.target);
    expect(manifest.complete).toBe(false);
    expect(manifest.failures).toEqual([
      expect.objectContaining({ part: "issue-11" }),
    ]);
    expect(
      manifest.issues.map((entry: { issue: string }) => entry.issue),
    ).toEqual(["11", "13"]);
    expect(existsSync(`${result.target}/issue-13.bundle`)).toBe(true);
  });
});

describe("factory backup: host Git on candidate-writable clones", () => {
  const issueGit = (calls: Call[], repo: string) =>
    calls.filter(
      (call) =>
        call.command === "/usr/bin/git" &&
        (call.cwd === repo || call.args.includes(repo)),
    );

  it("restores trusted metadata first, so a filter planted in the clone never runs on the host", async () => {
    const root = factory();
    const repo = unfinishedClone(root, 13);
    // Candidate code in the check container can write .git and the worktree.
    const marker = `${root}/filter-ran`;
    git(repo, "config", "filter.x.clean", `echo ran > '${marker}'; cat`);
    git(repo, "config", "filter.x.smudge", "cat");
    git(repo, "config", "diff.external", `sh -c "echo ran > '${marker}'"`);
    writeFileSync(`${repo}/.gitattributes`, "* filter=x\n");
    const calls: Call[] = [];

    const { target, manifest } = await backup(root, calls);

    expect(existsSync(marker)).toBe(false);
    expect(readFileSync(`${repo}/.git/config`, "utf8")).not.toContain("filter");
    const patch = readFileSync(`${target}/issue-13.worktree.patch`, "utf8");
    expect(patch).toContain("+changed");
    expect(manifest.failures).toEqual([]);
  });

  it("runs host Git with the hardened environment and no external diff or textconv driver", async () => {
    const root = factory();
    const repo = unfinishedClone(root, 13);
    const calls: Call[] = [];

    await backup(root, calls);

    const used = issueGit(calls, repo);
    expect(used.length).toBeGreaterThan(0);
    for (const call of used) {
      expect(call.env).toMatchObject({
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_NO_REPLACE_OBJECTS: "1",
        GIT_OPTIONAL_LOCKS: "0",
        GIT_TERMINAL_PROMPT: "0",
      });
      expect(call.args).toEqual(
        expect.arrayContaining([
          "core.hooksPath=/dev/null",
          "core.fsmonitor=false",
        ]),
      );
    }
    const diff = used.find((call) => call.args.includes("diff"))!;
    expect(diff.args).toEqual(
      expect.arrayContaining(["--no-ext-diff", "--no-textconv", "--binary"]),
    );
  });

  it("records a clone without trusted metadata as a failure and never runs Git in it", async () => {
    const root = factory();
    const untrusted = unfinishedClone(root, 12, { trusted: false });
    unfinishedClone(root, 13);
    const calls: Call[] = [];

    const { target, manifest } = await backup(root, calls);

    expect(issueGit(calls, untrusted)).toEqual([]);
    expect(manifest.complete).toBe(false);
    expect(manifest.failures).toEqual([
      {
        part: "issue-12",
        error: expect.stringMatching(/trusted Git metadata/),
      },
    ]);
    expect(existsSync(`${target}/issue-12.worktree.patch`)).toBe(false);
    expect(existsSync(`${target}/issue-13.worktree.patch`)).toBe(true);
  });

  it("skips directories that are not issue numbers without running Git there", async () => {
    const root = factory();
    const stray = `${root}/issues/notes/repo`;
    mkdirSync(path.posix.dirname(stray), { recursive: true });
    git(root, "clone", "-q", `${root}/origin`, stray);
    unfinishedClone(root, 13);
    const calls: Call[] = [];

    const { manifest } = await backup(root, calls);

    expect(issueGit(calls, stray)).toEqual([]);
    expect(
      manifest.issues.map((entry: { issue: string }) => entry.issue),
    ).toEqual(["13"]);
    expect(manifest.warnings).toEqual([
      expect.stringContaining("issues/notes"),
    ]);
    expect(manifest.complete).toBe(true);
  });
});

describe("factory backup: command-line entry", () => {
  const SHARED = path.resolve("scripts/archon-factory/pack/.shared");

  it("runs the backup when started through a linked path instead of silently exiting", () => {
    const root = posixRoot();
    const link = `${root}/linked`;
    // A directory junction needs no privilege on Windows; a symlink elsewhere.
    symlinkSync(
      SHARED,
      link,
      process.platform === "win32" ? "junction" : "dir",
    );
    const missing = `${root}/no-such-config.json`;

    const result = spawnSync(process.execPath, [`${link}/backup.mjs`], {
      encoding: "utf8",
      env: { ...process.env, CORE_FACTORY_CONFIG: missing },
    });

    // It reached loadConfig: the missing configuration fails the unit.
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("no-such-config.json");
  });
});

describe("factory backup: engine store and run evidence", () => {
  it("archives the engine's round ledgers and frozen workflow sources without scratch", async () => {
    const root = factory();
    const project = `${root}/archon/workspaces/_folder/control`;
    mkdirSync(`${project}/artifacts/runs/r1/round`, { recursive: true });
    writeFileSync(`${project}/artifacts/runs/r1/round/claim-lease.json`, "{}");
    mkdirSync(`${project}/artifacts/runs/r1/.archon/scratch`, {
      recursive: true,
    });
    mkdirSync(`${project}/workflow-source/runs/r1`, { recursive: true });
    mkdirSync(`${project}/state`, { recursive: true });
    mkdirSync(`${project}/logs`, { recursive: true });
    const calls: Call[] = [];

    const { target } = await backup(root, calls);

    const engine = calls.find(
      (call) =>
        call.command === "/usr/bin/tar" &&
        call.args.includes(`${target}/engine-runs.tgz`),
    );
    expect(engine).toBeDefined();
    const args = engine!.args;
    expect(args.slice(args.indexOf("-C"), args.indexOf("-C") + 2)).toEqual([
      "-C",
      `${root}/archon`,
    ]);
    expect(args).toEqual(
      expect.arrayContaining([
        "workspaces/_folder/control/artifacts/runs",
        "workspaces/_folder/control/workflow-source",
        "workspaces/_folder/control/state",
        "--exclude=*/.archon/scratch",
      ]),
    );
    expect(args).not.toContain("workspaces/_folder/control/logs");
    expect(
      manifestOf(target).files.map((file: { path: string }) => file.path),
    ).toContain("engine-runs.tgz");
  });

  it("records a failed engine-store integrity check and still captures the rest", async () => {
    const root = factory();
    writeFileSync(`${root}/archon/archon.db`, "db");
    unfinishedClone(root, 13);

    const { target, manifest } = await backup(root, [], {
      integrity: "corrupt",
    });

    expect(manifest.complete).toBe(false);
    expect(manifest.failures).toEqual([
      expect.objectContaining({ part: "engine-store" }),
    ]);
    expect(existsSync(`${target}/manifest.json`)).toBe(true);
    expect(existsSync(`${target}/issue-13.bundle`)).toBe(true);
  });
});

describe("factory backup: retention", () => {
  function previous(root: string, day: number, manifest: object | null) {
    const name = `2026-10-${String(day).padStart(2, "0")}T03-30-00-000Z`;
    mkdirSync(`${root}/backups/${name}`, { recursive: true });
    if (manifest)
      writeFileSync(
        `${root}/backups/${name}/manifest.json`,
        JSON.stringify(manifest),
      );
    return name;
  }

  it("keeps the newest fourteen finished backups and drops older unfinished leftovers", async () => {
    const root = factory();
    const finished = Array.from({ length: 15 }, (_, index) =>
      previous(root, index + 1, { createdAt: "x" }),
    );
    const leftovers = [previous(root, 20, null), previous(root, 21, null)];

    const { target } = await backup(root);

    const kept = readdirSync(`${root}/backups`).sort();
    const expected = [
      ...finished.slice(-13),
      path.posix.basename(target),
    ].sort();
    expect(kept).toEqual(expected);
    for (const name of leftovers) expect(kept).not.toContain(name);
  });

  it("never prunes the newest complete backup while recent ones are partial", async () => {
    const root = factory();
    const complete = previous(root, 1, { complete: true });
    for (let day = 2; day <= 16; day += 1)
      previous(root, day, { complete: false, failures: [{ part: "issue-9" }] });

    await backup(root);

    const kept = readdirSync(`${root}/backups`);
    expect(kept).toContain(complete);
    expect(kept).toHaveLength(15);
  });
});
