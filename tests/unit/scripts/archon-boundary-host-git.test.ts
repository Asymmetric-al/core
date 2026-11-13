// Host-side Git on an issue clone must never execute commands configured
// by the clone itself: the check container can write that clone's .git.
// These cases use real Git in a temporary factory layout.
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import * as hostGit from "../../../scripts/archon-factory/pack/.shared/git.mjs";

const {
  HARDENED,
  createGit,
  ensureIssueRepo,
  fetchMirror,
  hardenedArgs,
  prepareBranch,
  statusPorcelain,
  trustIssueRepo,
  trustOutbox,
} = hostGit as Record<string, any>;

const gitExecutable =
  process.platform === "win32"
    ? execFileSync("where.exe", ["git.exe"], { encoding: "utf8" })
        .trim()
        .split(/\r?\n/)[0]
    : execFileSync("which", ["git"], { encoding: "utf8" }).trim();

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

const plain = (cwd: string, ...args: string[]) =>
  execFileSync(
    gitExecutable,
    ["-c", "core.hooksPath=", "-c", "core.autocrlf=false", ...args],
    {
      cwd,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "Fixture",
        GIT_AUTHOR_EMAIL: "fixture@example.invalid",
        GIT_COMMITTER_NAME: "Fixture",
        GIT_COMMITTER_EMAIL: "fixture@example.invalid",
      },
    },
  ).trim();

// A factory root with a mirror whose refs/remotes/origin/develop holds a
// base commit and a candidate commit, as fetchMirror leaves it.
function factory() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-boundary-git-")),
  ).replace(/\\/g, "/");
  roots.push(root);
  const upstream = `${root}/upstream`;
  mkdirSync(upstream);
  plain(upstream, "init", "--quiet", "--initial-branch", "develop");
  writeFileSync(`${upstream}/README.md`, "base\n");
  writeFileSync(`${upstream}/AGENTS.md`, "# Agents\n");
  plain(upstream, "add", ".");
  plain(upstream, "commit", "--quiet", "-m", "base");
  const base = plain(upstream, "rev-parse", "HEAD");
  writeFileSync(`${upstream}/README.md`, "candidate\n");
  plain(upstream, "commit", "--quiet", "-am", "candidate");
  const candidate = plain(upstream, "rev-parse", "HEAD");
  const paths = {
    root,
    mirror: `${root}/mirror.git`,
    issues: `${root}/issues`,
  };
  plain(root, "init", "--quiet", "--bare", paths.mirror);
  plain(
    root,
    "--git-dir",
    paths.mirror,
    "fetch",
    "--quiet",
    upstream,
    "+refs/heads/*:refs/remotes/origin/*",
  );
  const git = createGit({ executable: gitExecutable, issues: paths.issues });
  return { root, paths, git, base, candidate };
}

// A shell command that leaves evidence when Git runs it, then behaves.
const planted = (marker: string, then: string) =>
  `echo pwned > "${marker}"; ${then}`;

describe("host Git never runs commands from the issue clone's config", () => {
  it("does not run a planted remote.origin.uploadpack when the clone is fetched again", async () => {
    const { root, paths, git } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    const marker = `${root}/uploadpack-ran`;
    appendFileSync(
      `${where.repo}/.git/config`,
      `[remote "origin"]\n\tuploadpack = ${planted(marker, "git-upload-pack")}\n`,
    );

    await ensureIssueRepo({ git, paths, issue: 7 });

    expect(existsSync(marker)).toBe(false);
  });

  it("does not run a planted smudge filter selected by .git/info/attributes during checkout", async () => {
    const { root, paths, git, base } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    const marker = `${root}/smudge-ran`;
    appendFileSync(
      `${where.repo}/.git/config`,
      `[filter "evil"]\n\tsmudge = ${planted(marker, "cat")}\n\tclean = cat\n`,
    );
    mkdirSync(`${where.repo}/.git/info`, { recursive: true });
    writeFileSync(`${where.repo}/.git/info/attributes`, "* filter=evil\n");

    await prepareBranch({
      git,
      repo: where.repo,
      branch: "factory/7-x",
      head: null,
      base,
    });

    expect({
      ran: existsSync(marker),
      readme: readFileSync(`${where.repo}/README.md`, "utf8"),
    }).toEqual({ ran: false, readme: "base\n" });
  });

  it("does not run a planted diff driver when freeze diffs the candidate", async () => {
    const { root, paths, git, base, candidate } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    await prepareBranch({
      git,
      repo: where.repo,
      branch: "factory/7-x",
      head: candidate,
      base,
    });
    const marker = `${root}/diff-driver-ran`;
    appendFileSync(
      `${where.repo}/.git/config`,
      `[diff "evil"]\n\tcommand = ${planted(marker, "true")}\n\ttextconv = ${planted(marker, "cat")}\n`,
    );
    mkdirSync(`${where.repo}/.git/info`, { recursive: true });
    writeFileSync(`${where.repo}/.git/info/attributes`, "* diff=evil\n");

    const diff = await git.ok(
      ["diff", "--stat", "--patch", `${base}...${candidate}`],
      { cwd: where.repo },
    );

    expect({ ran: existsSync(marker), diff }).toEqual({
      ran: false,
      diff: expect.stringContaining("-base\n+candidate\n"),
    });
  });

  it("does not run a planted core.fsmonitor or include during status", async () => {
    const { root, paths, git, base } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    await prepareBranch({
      git,
      repo: where.repo,
      branch: "factory/7-x",
      head: null,
      base,
    });
    const marker = `${root}/fsmonitor-ran`;
    writeFileSync(
      `${where.repo}/evil.cfg`,
      `[core]\n\tfsmonitor = ${planted(marker, "true")}\n`,
    );
    appendFileSync(
      `${where.repo}/.git/config`,
      `[include]\n\tpath = ../evil.cfg\n[core]\n\tfsmonitor = ${planted(marker, "true")}\n`,
    );

    const status = await statusPorcelain({ git }, where.repo);

    expect({ ran: existsSync(marker), status }).toEqual({
      ran: false,
      status: [{ code: "??", path: "evil.cfg" }],
    });
  });

  it("re-derives trusted metadata for an existing clone without trusting its planted config", async () => {
    const { root, paths, git } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    rmSync(where.trust, { force: true });
    const marker = `${root}/legacy-uploadpack-ran`;
    appendFileSync(
      `${where.repo}/.git/config`,
      `[remote "origin"]\n\tuploadpack = ${planted(marker, "git-upload-pack")}\n[core]\n\tsshCommand = ${planted(marker, "true")}\n`,
    );

    await ensureIssueRepo({ git, paths, issue: 7 });

    const config = readFileSync(`${where.repo}/.git/config`, "utf8");
    expect({
      ran: existsSync(marker),
      trusted: existsSync(where.trust),
      planted: /uploadpack|sshCommand/i.test(config),
    }).toEqual({ ran: false, trusted: true, planted: false });
  });
});

describe("host Git restores the clone's metadata before every call", () => {
  it("restores config, alternates and hooks and removes attributes, worktree config and commondir", async () => {
    const { paths, git, base } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    const trusted = readFileSync(`${where.repo}/.git/config`, "utf8");
    const dotGit = `${where.repo}/.git`;
    appendFileSync(`${dotGit}/config`, "[core]\n\thooksPath = .evil\n");
    writeFileSync(`${dotGit}/config.worktree`, "[core]\n\tfsmonitor = x\n");
    writeFileSync(`${dotGit}/commondir`, "../evil\n");
    mkdirSync(`${dotGit}/info`, { recursive: true });
    writeFileSync(`${dotGit}/info/attributes`, "* filter=evil\n");
    mkdirSync(`${dotGit}/hooks`, { recursive: true });
    writeFileSync(`${dotGit}/hooks/post-checkout`, "#!/bin/sh\nexit 0\n");
    writeFileSync(`${dotGit}/objects/info/alternates`, "/somewhere/else\n");

    await prepareBranch({
      git,
      repo: where.repo,
      branch: "factory/7-x",
      head: null,
      base,
    });

    expect({
      config: readFileSync(`${dotGit}/config`, "utf8"),
      worktreeConfig: existsSync(`${dotGit}/config.worktree`),
      commondir: existsSync(`${dotGit}/commondir`),
      attributes: existsSync(`${dotGit}/info/attributes`),
      hooks: readdirSync(`${dotGit}/hooks`),
      alternates: readFileSync(`${dotGit}/objects/info/alternates`, "utf8"),
    }).toEqual({
      config: trusted,
      worktreeConfig: false,
      commondir: false,
      attributes: false,
      hooks: [],
      alternates: `${paths.mirror}/objects\n`,
    });
  });

  it("keeps the trusted copy outside the clone the container can write", async () => {
    const { paths, git } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    expect(path.posix.relative(where.repo, where.trust).startsWith("../")).toBe(
      true,
    );
  });

  it("refuses host Git when .git was replaced by a gitfile", async () => {
    const { root, paths, git } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    const elsewhere = `${root}/elsewhere`;
    plain(root, "init", "--quiet", elsewhere);
    rmSync(`${where.repo}/.git`, { recursive: true, force: true });
    writeFileSync(`${where.repo}/.git`, `gitdir: ${elsewhere}/.git\n`);

    await expect(statusPorcelain({ git }, where.repo)).rejects.toMatchObject({
      code: "untrusted-git-dir",
    });
  });

  it.skipIf(process.platform === "win32")(
    "refuses host Git when .git is a symlink",
    async () => {
      const { root, paths, git } = factory();
      const where = await ensureIssueRepo({ git, paths, issue: 7 });
      const elsewhere = `${root}/elsewhere`;
      plain(root, "init", "--quiet", elsewhere);
      rmSync(`${where.repo}/.git`, { recursive: true, force: true });
      symlinkSync(`${elsewhere}/.git`, `${where.repo}/.git`);

      await expect(statusPorcelain({ git }, where.repo)).rejects.toMatchObject({
        code: "untrusted-git-dir",
      });
    },
  );

  it.skipIf(process.platform === "win32")(
    "removes symlinks planted inside .git instead of writing through them",
    async () => {
      const { root, paths, git, base } = factory();
      const where = await ensureIssueRepo({ git, paths, issue: 7 });
      const victim = `${root}/victim.txt`;
      writeFileSync(victim, "keep\n");
      mkdirSync(`${where.repo}/.git/logs`, { recursive: true });
      rmSync(`${where.repo}/.git/logs/HEAD`, { force: true });
      symlinkSync(victim, `${where.repo}/.git/logs/HEAD`);
      rmSync(`${where.repo}/.git/config`);
      symlinkSync(victim, `${where.repo}/.git/config`);

      await prepareBranch({
        git,
        repo: where.repo,
        branch: "factory/7-x",
        head: null,
        base,
      });

      expect(readFileSync(victim, "utf8")).toBe("keep\n");
    },
  );

  it("restores the outbox's config and empties its hooks", async () => {
    const { paths, git } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    const trusted = readFileSync(`${where.outbox}/config`, "utf8");
    appendFileSync(
      `${where.outbox}/config`,
      "[uploadpack]\n\tpackObjectsHook = x\n",
    );
    writeFileSync(`${where.outbox}/hooks/post-update`, "#!/bin/sh\n");

    trustOutbox(where);

    expect({
      config: readFileSync(`${where.outbox}/config`, "utf8"),
      hooks: readdirSync(`${where.outbox}/hooks`),
    }).toEqual({ config: trusted, hooks: [] });
  });

  it("refuses an issue clone that has no trusted metadata", async () => {
    const { paths, git } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    rmSync(where.trust);
    expect(() => trustIssueRepo(where)).toThrow(
      expect.objectContaining({ code: "untrusted-git-dir" }),
    );
  });
});

describe("hardened host Git arguments", () => {
  it("keeps patch-producing diffs working and neutralizes drivers per call", () => {
    expect({
      external: HARDENED.some((arg) => arg.startsWith("diff.external")),
      attributes: HARDENED.includes("core.attributesFile=/dev/null"),
      uploadpack: HARDENED.includes("remote.origin.uploadpack=git-upload-pack"),
      diff: hardenedArgs(["-C", "/r", "diff", "--patch", "a...b"]).slice(
        HARDENED.length,
      ),
      fetch: hardenedArgs(["--git-dir", "/m", "fetch", "origin"]).slice(
        HARDENED.length,
      ),
      push: hardenedArgs(["-c", "credential.helper=x", "push", "o"]).slice(
        HARDENED.length,
      ),
    }).toEqual({
      external: false,
      attributes: true,
      uploadpack: true,
      diff: [
        "-C",
        "/r",
        "diff",
        "--no-ext-diff",
        "--no-textconv",
        "--patch",
        "a...b",
      ],
      fetch: [
        "--git-dir",
        "/m",
        "fetch",
        "--upload-pack=git-upload-pack",
        "origin",
      ],
      push: ["-c", "credential.helper=x", "push", "o"],
    });
  });

  it("runs every call without system or global config", async () => {
    const calls: { argv: string[]; env: Record<string, string> }[] = [];
    const git = createGit({
      executable: "/usr/bin/git",
      run: async (argv: string[], options: { env: Record<string, string> }) => {
        calls.push({ argv, env: options.env });
        return { code: 0, stdout: "", stderr: "" };
      },
    });
    await git.ok(["diff", "--patch", "a...b"], { cwd: "/tmp" });
    expect({
      nosystem: calls[0].env.GIT_CONFIG_NOSYSTEM,
      global: calls[0].env.GIT_CONFIG_GLOBAL,
      replace: calls[0].env.GIT_NO_REPLACE_OBJECTS,
      tail: calls[0].argv.slice(1 + HARDENED.length),
    }).toEqual({
      nosystem: "1",
      global: "/dev/null",
      replace: "1",
      tail: ["diff", "--no-ext-diff", "--no-textconv", "--patch", "a...b"],
    });
  });

  // The argv forms freeze (stray evidence), readiness (byte-identical diff
  // comparison) and reviewers' history reads pass to host Git.
  it("ignores a configured external diff and textconv on every patch-producing diff the factory runs", async () => {
    const { root, base, candidate } = factory();
    const repo = `${root}/upstream`;
    const marker = `${root}/external-ran`;
    appendFileSync(
      `${repo}/.git/config`,
      `[diff]\n\texternal = ${planted(marker, "true")}\n[diff "evil"]\n\ttextconv = ${planted(marker, "cat")}\n`,
    );
    mkdirSync(`${repo}/.git/info`, { recursive: true });
    writeFileSync(`${repo}/.git/info/attributes`, "* diff=evil\n");
    writeFileSync(`${repo}/README.md`, "stray\n");
    const git = createGit({ executable: gitExecutable });
    const run = (args: string[]) => git.ok(args, { cwd: repo });

    const outputs = {
      readiness: await run(["diff", "--no-color", base, candidate]),
      strays: await run([
        "--literal-pathspecs",
        "diff",
        "--binary",
        "HEAD",
        "--",
        "README.md",
      ]),
      show: await run(["show", "--format=", candidate]),
      log: await run(["log", "-p", "--format=", "-1", candidate]),
    };

    expect({ ran: existsSync(marker), outputs }).toEqual({
      ran: false,
      outputs: {
        readiness: expect.stringContaining("-base\n+candidate\n"),
        strays: expect.stringContaining("-candidate\n+stray\n"),
        show: expect.stringContaining("-base\n+candidate\n"),
        log: expect.stringContaining("-base\n+candidate\n"),
      },
    });
  });

  it("produces a patch for a real diff (no external diff dies)", async () => {
    const { paths, git, base, candidate } = factory();
    const where = await ensureIssueRepo({ git, paths, issue: 7 });
    const plainGit = createGit({ executable: gitExecutable });
    await expect(
      plainGit.ok(["diff", "--stat", "--patch", `${base}...${candidate}`], {
        cwd: where.repo,
      }),
    ).resolves.toContain("+candidate");
  });
});

// A build round commits and then records the commit. A round stopped between
// the two (or one whose hooks left files behind) leaves the clone ahead of the
// record. The next build round takes that commit back into the working tree,
// so its content goes through the hooks and the checks again.
describe("a build round's unrecorded commit", () => {
  const BRANCH = "factory/7-x";
  const started = async () => {
    const made = factory();
    const where = await ensureIssueRepo({
      git: made.git,
      paths: made.paths,
      issue: 7,
    });
    await prepareBranch({
      git: made.git,
      repo: where.repo,
      branch: BRANCH,
      head: null,
      base: made.base,
    });
    return { ...made, repo: where.repo as string };
  };
  const roundCommit = (repo: string) => {
    writeFileSync(`${repo}/README.md`, "implemented\n");
    writeFileSync(`${repo}/new.test.ts`, "acceptance\n");
    plain(repo, "add", "-A");
    plain(repo, "commit", "--quiet", "-m", "feat(#7): factory round 1");
    return plain(repo, "rev-parse", "HEAD");
  };
  const state = async (git: unknown, repo: string) => ({
    head: plain(repo, "rev-parse", "HEAD"),
    branch: plain(repo, "symbolic-ref", "--short", "HEAD"),
    status: await statusPorcelain({ git }, repo),
    readme: readFileSync(`${repo}/README.md`, "utf8"),
    test: existsSync(`${repo}/new.test.ts`),
  });

  it("returns to the working tree when the next build round starts", async () => {
    const { git, repo, base } = await started();
    const unrecorded = roundCommit(repo);

    const prepared = await prepareBranch({
      git,
      repo,
      branch: BRANCH,
      head: null,
      base,
      keepUnrecorded: true,
    });

    expect({ prepared, ...(await state(git, repo)) }).toEqual({
      prepared: {
        reused: true,
        restored: unrecorded,
        dirty: [
          { code: " M", path: "README.md" },
          { code: "??", path: "new.test.ts" },
        ],
      },
      head: base,
      branch: BRANCH,
      status: [
        { code: " M", path: "README.md" },
        { code: "??", path: "new.test.ts" },
      ],
      readme: "implemented\n",
      test: true,
    });
  });

  it("keeps the files hooks left behind after that commit", async () => {
    const { git, repo, base } = await started();
    const unrecorded = roundCommit(repo);
    writeFileSync(`${repo}/README.md`, "implemented, then rewritten\n");
    writeFileSync(`${repo}/leftover.txt`, "left by a hook\n");
    plain(repo, "add", "leftover.txt");

    const prepared = await prepareBranch({
      git,
      repo,
      branch: BRANCH,
      head: null,
      base,
      keepUnrecorded: true,
    });

    expect({
      restored: prepared.restored,
      ...(await state(git, repo)),
    }).toEqual({
      restored: unrecorded,
      head: base,
      branch: BRANCH,
      status: [
        { code: " M", path: "README.md" },
        { code: "??", path: "leftover.txt" },
        { code: "??", path: "new.test.ts" },
      ],
      readme: "implemented, then rewritten\n",
      test: true,
    });
  });

  it("returns to the working tree from the recorded head of an earlier round", async () => {
    const { git, repo, base } = await started();
    const recorded = roundCommit(repo);
    writeFileSync(`${repo}/README.md`, "repaired\n");
    plain(repo, "commit", "--quiet", "-am", "fix(#7): factory round 2");

    await prepareBranch({
      git,
      repo,
      branch: BRANCH,
      head: recorded,
      base,
      keepUnrecorded: true,
    });

    expect(await state(git, repo)).toEqual({
      head: recorded,
      branch: BRANCH,
      status: [{ code: " M", path: "README.md" }],
      readme: "repaired\n",
      test: true,
    });
  });

  it("is put back on the recorded commit by a round that commits nothing", async () => {
    const { git, repo, base } = await started();
    roundCommit(repo);

    const prepared = await prepareBranch({
      git,
      repo,
      branch: BRANCH,
      head: null,
      base,
    });

    expect({ prepared, ...(await state(git, repo)) }).toEqual({
      prepared: { reused: false, dirty: [] },
      head: base,
      branch: BRANCH,
      status: [],
      readme: "base\n",
      test: false,
    });
  });

  it("is not unwound when it is a merge", async () => {
    const { git, repo, base, candidate } = await started();
    writeFileSync(`${repo}/other.txt`, "branch work\n");
    plain(repo, "add", "-A");
    plain(repo, "commit", "--quiet", "-m", "branch work");
    plain(repo, "merge", "--quiet", "--no-ff", "--no-edit", candidate);
    writeFileSync(`${repo}/other.txt`, "uncommitted\n");

    await expect(
      prepareBranch({
        git,
        repo,
        branch: BRANCH,
        head: null,
        base,
        keepUnrecorded: true,
      }),
    ).rejects.toMatchObject({ code: "dirty-workspace" });
    expect(readFileSync(`${repo}/other.txt`, "utf8")).toBe("uncommitted\n");
  });

  it("is not unwound when the clone left the recorded history", async () => {
    const { git, repo, base, candidate } = await started();
    roundCommit(repo);
    writeFileSync(`${repo}/README.md`, "uncommitted\n");

    await expect(
      prepareBranch({
        git,
        repo,
        branch: BRANCH,
        head: candidate,
        base,
        keepUnrecorded: true,
      }),
    ).rejects.toMatchObject({ code: "dirty-workspace" });
    expect(readFileSync(`${repo}/README.md`, "utf8")).toBe("uncommitted\n");
  });
});

// Two rounds that start in the same pass both fetch into the one mirror. Git
// moves every remote-tracking ref with compare-and-swap, so the fetch that
// arrives second fails on each ref the first one already moved, although the
// mirror is current by then. On 13 November 2026 that cost issue 2370 a round.
describe("the shared mirror fetch", () => {
  const FETCH = ["fetch", "--prune", "--no-tags", "origin"];
  // What Git 2.50 printed on the factory when the race was lost.
  const LOST_RACE = [
    "From github.com:Asymmetric-al/core",
    "   8facb0881..208058f44  t3/archon-factory-vm100-commissioning -> origin/t3/archon-factory-vm100-commissioning",
    "error: fetching ref refs/remotes/origin/develop failed: incorrect old value provided",
  ].join("\n");
  const paths = { mirror: "/srv/core-factory/mirror.git" };
  const scripted = (...results: { code: number; stderr: string }[]) => {
    const calls: { args: string[]; gitDir?: string }[] = [];
    const pauses: number[] = [];
    return {
      calls,
      pauses,
      pause: async (ms: number) => void pauses.push(ms),
      git: {
        git: async (args: string[], options: { gitDir?: string } = {}) => {
          calls.push({ args, gitDir: options.gitDir });
          return {
            stdout: "",
            ...results[Math.min(calls.length, results.length) - 1],
          };
        },
      },
    };
  };
  const done = { code: 0, stderr: "" };

  it("runs again when another round's fetch moved the same refs first", async () => {
    const { git, calls, pauses, pause } = scripted(
      { code: 1, stderr: LOST_RACE },
      done,
    );

    await expect(fetchMirror({ git, paths, pause })).resolves.toEqual({
      attempts: 2,
    });
    expect({ calls, pauses: pauses.length }).toEqual({
      calls: [
        { args: FETCH, gitDir: paths.mirror },
        { args: FETCH, gitDir: paths.mirror },
      ],
      pauses: 1,
    });
  });

  it.each([
    "error: cannot lock ref 'refs/remotes/origin/develop': is at 208058f44b917513a61a29d54402d8aa80435605 but expected 8facb0881d0b1a4f5f0f1f6f3b5a1f6a55a1c2d3",
    "error: cannot lock ref 'refs/remotes/origin/new': reference already exists",
    "fatal: Unable to create '/srv/core-factory/mirror.git/packed-refs.lock': File exists.",
  ])(
    "runs again after the same race as older Git reports it: %s",
    async (stderr) => {
      const { git, calls, pause } = scripted({ code: 1, stderr }, done);

      await expect(fetchMirror({ git, paths, pause })).resolves.toEqual({
        attempts: 2,
      });
      expect(calls).toHaveLength(2);
    },
  );

  it("reports any other failure at once", async () => {
    const { git, calls, pauses, pause } = scripted({
      code: 128,
      stderr:
        "fatal: unable to access 'https://github.com/Asymmetric-al/core/': Could not resolve host: github.com",
    });

    await expect(fetchMirror({ git, paths, pause })).rejects.toThrow(
      /git fetch --prune failed \(128\): .*Could not resolve host/,
    );
    expect({ calls: calls.length, pauses }).toEqual({ calls: 1, pauses: [] });
  });

  it("gives up after four attempts when the race keeps being lost", async () => {
    const { git, calls, pauses, pause } = scripted({
      code: 1,
      stderr: LOST_RACE,
    });

    await expect(fetchMirror({ git, paths, pause })).rejects.toThrow(
      /git fetch --prune failed \(1\): .*incorrect old value provided/s,
    );
    expect({ calls: calls.length, pauses: pauses.length }).toEqual({
      calls: 4,
      pauses: 3,
    });
  });

  it("leaves the mirror current when two rounds fetch at the same moment (real Git)", async () => {
    const { root, paths: real, git } = factory();
    const upstream = `${root}/upstream`;
    plain(root, "--git-dir", real.mirror, "remote", "add", "origin", upstream);
    plain(
      root,
      "--git-dir",
      real.mirror,
      "config",
      "remote.origin.fetch",
      "+refs/heads/*:refs/remotes/origin/*",
    );
    const branches = Array.from({ length: 40 }, (_, index) => `lane-${index}`);
    const first = plain(upstream, "rev-parse", "HEAD~1");
    for (const branch of branches)
      plain(upstream, "update-ref", `refs/heads/${branch}`, first);
    await fetchMirror({ git, paths: real });
    const moved = plain(upstream, "rev-parse", "HEAD");
    for (const branch of branches)
      plain(upstream, "update-ref", `refs/heads/${branch}`, moved);
    const pause = () => new Promise((resolve) => setTimeout(resolve, 25));

    await Promise.all([
      fetchMirror({ git, paths: real, pause }),
      fetchMirror({ git, paths: real, pause }),
    ]);

    const refs = plain(
      root,
      "--git-dir",
      real.mirror,
      "for-each-ref",
      "--format=%(objectname)",
      "refs/remotes/origin/lane-*",
    ).split("\n");
    expect({ count: refs.length, heads: [...new Set(refs)] }).toEqual({
      count: branches.length,
      heads: [moved],
    });
  }, 60_000);
});
