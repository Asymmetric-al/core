// Trusted container steps against an issue clone: shared cache access,
// run labels, clean dependency reinstall, and Core's hooks pinned and
// proven to have run.
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import * as gitModule from "../../../scripts/archon-factory/pack/.shared/git.mjs";
import * as publicationModule from "../../../scripts/archon-factory/pack/.shared/publication.mjs";
import * as roundModule from "../../../scripts/archon-factory/pack/.shared/round.mjs";
import { prepareRoleView } from "../../../scripts/archon-factory/pack/.shared/views.mjs";

vi.mock(
  "../../../scripts/archon-factory/pack/.shared/storage-policy.mjs",
  () => ({
    checkFactoryStorage: async () => ({ ok: true, code: "STORAGE_READY" }),
  }),
);

const { createGit, ensureIssueRepo } = gitModule as Record<string, any>;
const { ensureInstall, nodeModulesMounts, runInIssueRepo, sha256 } =
  roundModule as Record<string, any>;
const {
  crashedTool,
  hookEvidence,
  hookedGit,
  publishCandidate,
  restoreHookShims,
} = publicationModule as Record<string, any>;

const gitExecutable =
  process.platform === "win32"
    ? execFileSync("where.exe", ["git.exe"], { encoding: "utf8" })
        .trim()
        .split(/\r?\n/)[0]
    : execFileSync("which", ["git"], { encoding: "utf8" }).trim();
const RUN = "run-0123456789abcdef";
const IMAGE = `sha256:${"c".repeat(64)}`;

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

async function issueRound() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-boundary-round-")),
  ).replace(/\\/g, "/");
  roots.push(root);
  const upstream = `${root}/upstream`;
  mkdirSync(`${upstream}/.husky`, { recursive: true });
  plain(upstream, "init", "--quiet", "--initial-branch", "develop");
  writeFileSync(`${upstream}/bun.lock`, "{}\n");
  writeFileSync(`${upstream}/.husky/pre-commit`, "bunx lint-staged\n");
  writeFileSync(
    `${upstream}/.husky/pre-push`,
    "node scripts/git/pre-push.mjs\n",
  );
  plain(upstream, "add", ".");
  plain(upstream, "commit", "--quiet", "-m", "base");
  const paths = {
    root,
    mirror: `${root}/mirror.git`,
    issues: `${root}/issues`,
    cache: `${root}/cache`,
    runs: `${root}/runs`,
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
  const where = await ensureIssueRepo({ git, paths, issue: 7 });
  plain(
    where.repo,
    "checkout",
    "--quiet",
    "-B",
    "factory/7-x",
    "origin/develop",
  );
  const ledger: Record<string, unknown> = {};
  return {
    root,
    round: {
      runId: RUN,
      issue: 7,
      assignment: "A-7",
      where,
      paths,
      git,
      config: {
        executor: { docker: "/usr/bin/docker", image: IMAGE },
        git: {
          executable: gitExecutable,
          authorName: "Factory",
          authorEmail: "factory@example.invalid",
        },
        repository: {
          remote: "https://example.invalid/core.git",
          targetBranch: "develop",
        },
        github: { executable: "/usr/bin/gh", configDir: "/nonexistent" },
      },
      ledger: {
        write: (node: string, value: unknown) => (ledger[node] = value),
        read: (node: string) => ledger[node] ?? null,
      },
    },
    ledger,
  };
}

const passed = (stdout = "", overrides: Record<string, unknown> = {}) =>
  vi.fn(async () => ({
    status: "passed",
    exitCode: 0,
    containerId: "d".repeat(64),
    cleanupConfirmed: true,
    reusable: true,
    stdout,
    stderr: "",
    ...overrides,
  }));

type RoundFixture = Awaited<ReturnType<typeof issueRound>>["round"];
const lockDigest = (round: RoundFixture) =>
  sha256(readFileSync(`${round.where.repo}/bun.lock`, "utf8"));
// A completed seed: its directory plus the marker only trusted code writes.
function seedFor(round: RoundFixture) {
  const seed = `${round.paths.cache}/bun-seed/${lockDigest(round)}`;
  mkdirSync(seed, { recursive: true });
  writeFileSync(
    `${seed}.json`,
    JSON.stringify({ v: 1, lockDigest: lockDigest(round) }),
  );
  return seed;
}

describe("runInIssueRepo", () => {
  it("acquires shared capacity before trusted candidate code and records uncertain cleanup", async () => {
    const { round, ledger } = await issueRound();
    let original: any;
    const execute = vi.fn(async (input: any) => {
      const owner = JSON.parse(
        readFileSync(`${round.paths.root}/locks/check-slot-0/owner`, "utf8"),
      );
      expect(owner.attempt).toBe(input.attempt);
      original = {
        status: "passed",
        cleanupConfirmed: false,
        reusable: false,
        labels: {
          "core.archon.executor": "candidate-check",
          "core.archon.attempt": input.attempt,
          "core.archon.run": RUN,
          "core.archon.issue": "7",
        },
      };
      return original;
    });
    const error = await runInIssueRepo(
      round,
      { command: ["true"], timeoutMs: 1000 },
      { execute },
    ).catch((error: any) => error);
    expect(error.name).toBe("CheckCleanupError");
    expect(error.receipt).toBe(original);
    expect(ledger["executor-cleanup"]).toMatchObject({
      blocked: { code: "cleanup-unconfirmed" },
      cleanup: { receipt: original, runId: RUN, issue: 7, assignment: "A-7" },
    });
    expect(existsSync(`${round.paths.root}/locks/check-slot-0/owner`)).toBe(
      true,
    );
  });

  it("gives a step that runs candidate code a private view over the lockfile's read-only seed", async () => {
    const { round } = await issueRound();
    const seed = seedFor(round);
    const execute = passed();
    await runInIssueRepo(
      round,
      { command: ["git", "commit"], cache: true, timeoutMs: 1000 },
      { execute },
    );
    const input = execute.mock.calls[0][0];
    expect(input.mounts).toContainEqual({
      source: seed,
      target: "/bun-cache",
      readOnly: true,
    });
    // Bun must rename into its cache directory even offline, so the cache it
    // is given is a tmpfs directory of links into the read-only seed.
    expect(input.env.BUN_INSTALL_CACHE_DIR).toBe("/tmp/bun-cache");
    expect(input.command.slice(0, 2)).toEqual(["/bin/sh", "-c"]);
    expect(input.command[2]).toContain("ln -s -t /tmp/bun-cache");
    expect(input.command[2]).toContain('exec "$@"');
    expect(input.command.slice(4)).toEqual(["git", "commit"]);
  });

  it("gives an empty private cache when the lockfile has no completed seed", async () => {
    const { round } = await issueRound();
    // A seed directory without its completion marker is not trusted.
    mkdirSync(`${round.paths.cache}/bun-seed/${lockDigest(round)}`, {
      recursive: true,
    });
    const execute = passed();
    await runInIssueRepo(
      round,
      { command: ["git", "commit"], cache: true, timeoutMs: 1000 },
      { execute },
    );
    const input = execute.mock.calls[0][0];
    expect(
      input.mounts.find(
        (mount: { target: string }) => mount.target === "/bun-cache",
      ),
    ).toBeUndefined();
    expect(input.env.BUN_INSTALL_CACHE_DIR).toBe("/tmp/bun-install-cache");
    expect(input.command).toEqual(["git", "commit"]);
  });

  it("lets only the fixed no-scripts install write a lockfile's seed", async () => {
    const { round } = await issueRound();
    const execute = passed();
    await runInIssueRepo(
      round,
      {
        command: ["bun", "install", "--frozen-lockfile", "--ignore-scripts"],
        cache: "seed",
        timeoutMs: 1000,
      },
      { execute },
    );
    const input = execute.mock.calls[0][0];
    expect(input.mounts).toContainEqual({
      source: `${round.paths.cache}/bun-seed/${lockDigest(round)}`,
      target: "/bun-cache",
      readOnly: false,
    });
    expect(input.env.BUN_INSTALL_CACHE_DIR).toBe("/bun-cache");
    expect(input.command).toEqual([
      "bun",
      "install",
      "--frozen-lockfile",
      "--ignore-scripts",
    ]);

    for (const command of [
      ["bun", "install", "--frozen-lockfile"],
      ["sh", "-c", "bun install --frozen-lockfile --ignore-scripts; id"],
      ["git", "commit"],
    ]) {
      const refused = passed();
      await expect(
        runInIssueRepo(
          round,
          { command, cache: "seed", timeoutMs: 1000 },
          { execute: refused },
        ),
      ).rejects.toThrow(/seed-command-refused/);
      expect(refused).not.toHaveBeenCalled();
    }
  });

  it("labels the container with the run and issue", async () => {
    const { round } = await issueRound();
    const execute = passed();
    await runInIssueRepo(
      round,
      { command: ["true"], timeoutMs: 1000 },
      { execute },
    );
    expect(execute.mock.calls[0][0]).toMatchObject({ runId: RUN, issue: 7 });
  });

  it("restores the clone's trusted Git metadata before the container starts", async () => {
    const { round } = await issueRound();
    const config = `${round.where.repo}/.git/config`;
    const trusted = JSON.parse(
      readFileSync(round.where.trust, "utf8"),
    ).repoConfig;
    appendFileSync(config, '[merge "evil"]\n\tdriver = touch pwned\n');
    let seen = "";
    const execute = vi.fn(async () => {
      seen = readFileSync(config, "utf8");
      return {
        status: "passed",
        exitCode: 0,
        cleanupConfirmed: true,
        reusable: true,
        stdout: "",
        stderr: "",
      };
    });
    await runInIssueRepo(
      round,
      { command: ["git", "merge"], timeoutMs: 1000 },
      { execute },
    );
    expect(seen).toBe(trusted);
  });
});

describe("prepareRoleView", () => {
  it("restores the clone's trusted Git metadata before reading the candidate on the host", async () => {
    const { root, round } = await issueRound();
    const head = execFileSync(gitExecutable, ["rev-parse", "HEAD"], {
      cwd: round.where.repo,
      encoding: "utf8",
    }).trim();
    const trusted = JSON.parse(
      readFileSync(round.where.trust, "utf8"),
    ).repoConfig;
    appendFileSync(
      `${round.where.repo}/.git/config`,
      "[core]\n\tfsmonitor = touch pwned\n",
    );
    mkdirSync(`${root}/views`, { recursive: true });
    let context = { v: 1, runId: RUN, nodes: {} as Record<string, unknown> };
    const viewRound = {
      ...round,
      paths: { ...round.paths, views: `${root}/views` },
      materials: (role: string) => {
        const dir = `${root}/materials/${role}`;
        mkdirSync(dir, { recursive: true });
        return dir;
      },
      context: {
        read: () => context,
        write: (next: typeof context) => (context = next),
      },
    };

    await prepareRoleView(viewRound, {
      node: "final",
      role: "ezra-final",
      candidate: head,
      base: head,
    });

    expect(readFileSync(`${round.where.repo}/.git/config`, "utf8")).toBe(
      trusted,
    );
  });
});

// Observed on VM 100 (issue #2234, run cd44915c, 12 November 2026): final
// acceptance ended INCONCLUSIVE because its view has no Git metadata and it
// was given neither the changed paths nor the diff.
describe("prepareRoleView change evidence", () => {
  it("gives a read-only role the changed paths and the diff, computed from Git by the factory", async () => {
    const { root, round } = await issueRound();
    const base = execFileSync(gitExecutable, ["rev-parse", "HEAD"], {
      cwd: round.where.repo,
      encoding: "utf8",
    }).trim();
    mkdirSync(`${round.where.repo}/docs`, { recursive: true });
    writeFileSync(`${round.where.repo}/docs/guide.md`, "changed line" + "\n");
    plain(round.where.repo, "add", "docs/guide.md");
    plain(
      round.where.repo,
      "-c",
      "user.name=Factory",
      "-c",
      "user.email=factory@example.invalid",
      "-c",
      "core.hooksPath=",
      "commit",
      "--quiet",
      "-m",
      "candidate",
    );
    const candidate = execFileSync(gitExecutable, ["rev-parse", "HEAD"], {
      cwd: round.where.repo,
      encoding: "utf8",
    }).trim();
    mkdirSync(`${root}/views`, { recursive: true });
    let context = { v: 1, runId: RUN, nodes: {} as Record<string, unknown> };
    const viewRound = {
      ...round,
      paths: { ...round.paths, views: `${root}/views` },
      materials: (role: string) => {
        const dir = `${root}/materials/${role}`;
        mkdirSync(dir, { recursive: true });
        return dir;
      },
      context: {
        read: () => context,
        write: (next: typeof context) => (context = next),
      },
    };

    const prepared = await prepareRoleView(viewRound, {
      node: "final",
      role: "ezra-final",
      candidate,
      base,
      materialsRole: "ezra-final",
    });

    expect(prepared.changed).toEqual(["docs/guide.md"]);
    const materials = `${root}/materials/ezra-final`;
    expect(readFileSync(`${materials}/changed-files.txt`, "utf8")).toBe(
      "docs/guide.md" + "\n",
    );
    const diff = readFileSync(`${materials}/candidate.diff`, "utf8");
    expect(diff).toContain("docs/guide.md");
    expect(diff).toContain("+changed line");
    // The view itself still carries no Git metadata.
    expect(existsSync(`${prepared.view}/.git`)).toBe(false);
    expect(readFileSync(`${prepared.view}/docs/guide.md`, "utf8")).toBe(
      "changed line" + "\n",
    );
  });
});

describe("ensureInstall", () => {
  it.each([
    { cleanupConfirmed: false, reusable: false },
    { cleanupConfirmed: true, reusable: true, reusable: false },
    { cleanupConfirmed: false, reusable: true },
    { cleanupConfirmed: true },
  ])(
    "rejects passed installs without positive cleanup and reuse evidence: %j",
    async (flags) => {
      const { round } = await issueRound();
      const receipt = {
        status: "passed",
        exitCode: 0,
        ...flags,
        labels: {
          "core.archon.executor": "candidate-check",
          "core.archon.attempt": "attempt-1",
          "core.archon.run": RUN,
          "core.archon.issue": "7",
        },
        stdout: "complete stdout",
        stderr: "complete stderr",
      };
      const error = await ensureInstall(round, {
        clean: true,
        execute: vi.fn(async () => receipt),
      }).catch((value: unknown) => value);
      expect(error.name).toBe("CheckCleanupError");
      expect(error.receipt).toBe(receipt);
      expect(existsSync(`${round.where.root}/install.json`)).toBe(false);
    },
  );

  it("seeds the lockfile's cache without lifecycle scripts, then installs from a private view of it", async () => {
    const { round } = await issueRound();
    const repo = round.where.repo;
    for (const dir of [
      "node_modules/vitest",
      "apps/admin/node_modules/x",
      "tests/a,b/c/d/node_modules/y",
    ])
      mkdirSync(`${repo}/${dir}`, { recursive: true });
    writeFileSync(
      `${repo}/node_modules/vitest/vitest.mjs`,
      "process.exit(0)\n",
    );
    writeFileSync(
      `${round.where.root}/install.json`,
      JSON.stringify({ lockDigest: "x" }),
    );
    const present: string[][] = [];
    const execute = vi.fn(async () => {
      present.push(
        [
          "node_modules",
          "apps/admin/node_modules",
          "tests/a,b/c/d/node_modules",
        ].filter((dir) => existsSync(`${repo}/${dir}`)),
      );
      // Each install leaves a tree behind, as the real one does.
      mkdirSync(`${repo}/node_modules/left-by-install`, { recursive: true });
      return {
        status: "passed",
        exitCode: 0,
        containerId: "d".repeat(64),
        cleanupConfirmed: true,
        reusable: true,
        stdout: "",
        stderr: "",
      };
    });

    const result = await ensureInstall(round, { clean: true, execute });

    const seed = `${round.paths.cache}/bun-seed/${lockDigest(round)}`;
    const [seeding, install] = execute.mock.calls.map(([input]) => ({
      command: input.command,
      network: input.network,
      cache: input.mounts.find(
        (mount: { target: string }) => mount.target === "/bun-cache",
      ),
      cacheDirectory: input.env.BUN_INSTALL_CACHE_DIR,
    }));
    expect(execute).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ reused: false, seeded: true });
    // Neither install inherits a tree: not the writer's, not the seeding one.
    expect(present).toEqual([[], []]);
    expect(seeding).toEqual({
      command: ["bun", "install", "--frozen-lockfile", "--ignore-scripts"],
      network: "bridge",
      cache: { source: seed, target: "/bun-cache", readOnly: false },
      cacheDirectory: "/bun-cache",
    });
    expect(install.cache).toEqual({
      source: seed,
      target: "/bun-cache",
      readOnly: true,
    });
    expect(install.cacheDirectory).toBe("/tmp/bun-cache");
    expect(install.command.slice(4)).toEqual([
      "bun",
      "install",
      "--frozen-lockfile",
    ]);
    expect(JSON.parse(readFileSync(`${seed}.json`, "utf8"))).toMatchObject({
      lockDigest: lockDigest(round),
    });
  });

  it("installs straight from a seed another round already completed", async () => {
    const { round } = await issueRound();
    seedFor(round);
    const execute = passed();
    const result = await ensureInstall(round, { clean: true, execute });
    expect(execute).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ reused: false, seeded: false });
    expect(execute.mock.calls[0][0].command.slice(4)).toEqual([
      "bun",
      "install",
      "--frozen-lockfile",
    ]);
  });

  it("records no seed when the no-scripts install fails or its cleanup is unconfirmed", async () => {
    for (const receipt of [
      { status: "failed", exitCode: 1, cleanupConfirmed: true, reusable: true },
      {
        status: "passed",
        exitCode: 0,
        cleanupConfirmed: false,
        reusable: false,
      },
    ]) {
      const { round } = await issueRound();
      const execute = vi.fn(async () => ({
        ...receipt,
        labels: { "core.archon.attempt": "attempt-1" },
        stdout: "",
        stderr: "registry unavailable",
      }));
      await expect(
        ensureInstall(round, { clean: true, execute }),
      ).rejects.toThrow();
      expect(execute).toHaveBeenCalledOnce();
      expect(
        existsSync(`${round.paths.cache}/bun-seed/${lockDigest(round)}.json`),
      ).toBe(false);
      expect(existsSync(`${round.where.root}/install.json`)).toBe(false);
    }
  });
});

describe("nodeModulesMounts", () => {
  it("mounts comma-named dependency directories read-only (the executor quotes targets)", async () => {
    const { round } = await issueRound();
    mkdirSync(`${round.where.repo}/apps/a,b/node_modules`, { recursive: true });
    expect(nodeModulesMounts(round.where.repo, "/candidate")).toContainEqual({
      source: `${round.where.repo}/apps/a,b/node_modules`,
      target: "/candidate/apps/a,b/node_modules",
      readOnly: true,
    });
  });

  it.skipIf(process.platform === "win32")(
    "skips dependency directories whose names the executor cannot mount",
    async () => {
      const { round } = await issueRound();
      mkdirSync(`${round.where.repo}/apps/a"b/node_modules`, {
        recursive: true,
      });
      expect(
        nodeModulesMounts(round.where.repo, "/candidate").map(
          (mount: { target: string }) => mount.target,
        ),
      ).not.toContain('/candidate/apps/a"b/node_modules');
    },
  );
});

describe("Core hooks are pinned and must be seen to run", () => {
  it("writes trusted hook shims over whatever the candidate left in .husky/_", async () => {
    const { round } = await issueRound();
    const shims = `${round.where.repo}/.husky/_`;
    mkdirSync(shims, { recursive: true });
    writeFileSync(`${shims}/pre-commit`, "#!/bin/sh\nexit 0\n");
    writeFileSync(`${shims}/h`, "exit 0\n");

    const dir = restoreHookShims(round.where.repo);

    expect({
      dir,
      files: readdirSync(shims).sort(),
      runs: readFileSync(`${shims}/pre-commit`, "utf8").includes(
        'sh -e "$s" "$@"',
      ),
    }).toEqual({
      dir: shims,
      files: [".gitignore", "pre-commit", "pre-push"],
      runs: true,
    });
  });

  it.skipIf(process.platform === "win32")(
    "refuses to pin hooks through a symlinked .husky",
    async () => {
      const { root, round } = await issueRound();
      mkdirSync(`${root}/outside`);
      rmSync(`${round.where.repo}/.husky`, { recursive: true, force: true });
      symlinkSync(`${root}/outside`, `${round.where.repo}/.husky`);
      expect(() => restoreHookShims(round.where.repo)).toThrow(
        expect.objectContaining({ code: "hooks-unpinned" }),
      );
      expect(readdirSync(`${root}/outside`)).toEqual([]);
    },
  );

  it("pins core.hooksPath on the container's git command line", () => {
    expect(hookedGit("/srv/i/7/repo", ["commit", "-m", "x"])).toEqual([
      "git",
      "-c",
      "core.hooksPath=/srv/i/7/repo/.husky/_",
      "commit",
      "-m",
      "x",
    ]);
  });

  it.each([
    [
      "pre-commit",
      "core-factory: pre-commit hook started\n✔ Running tasks for staged files…\ncore-factory: pre-commit hook passed\n",
      true,
    ],
    ["pre-commit", "core-factory: pre-commit hook passed\n", false],
    ["pre-commit", "", false],
    [
      "pre-push",
      "==> PASS ci:preflight\ncore-factory: pre-push hook passed\n",
      true,
    ],
    ["pre-push", "core-factory: pre-push hook passed\n", false],
    ["pre-push", "==> PASS ci:preflight\n", false],
  ])("judges whether the %s hook ran from its receipt", (hook, stdout, ran) => {
    expect(hookEvidence(hook, { stdout, stderr: "" }).ran).toBe(ran);
  });

  it("pushes to the outbox through the pinned pre-push hook", async () => {
    const { round } = await issueRound();
    const execute = passed("");
    await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      { execute },
    );
    const input = execute.mock.calls[0][0];
    expect({
      command: input.command,
      cache: input.mounts.find(
        (mount: { target: string }) => mount.target === "/bun-cache",
      ),
    }).toEqual({
      command: [
        "git",
        "-c",
        `core.hooksPath=${round.where.repo}/.husky/_`,
        "push",
        "--porcelain",
        "--force",
        "/outbox",
        "HEAD:refs/heads/factory/7-x",
      ],
      cache: undefined,
    });
  });

  it("runs the pre-push hook against a private view of the lockfile's seed", async () => {
    const { round } = await issueRound();
    const seed = seedFor(round);
    const execute = passed("");
    await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      { execute },
    );
    const input = execute.mock.calls[0][0];
    expect(input.mounts).toContainEqual({
      source: seed,
      target: "/bun-cache",
      readOnly: true,
    });
    expect(input.env.BUN_INSTALL_CACHE_DIR).toBe("/tmp/bun-cache");
    expect(input.command.slice(4, 7)).toEqual([
      "git",
      "-c",
      `core.hooksPath=${round.where.repo}/.husky/_`,
    ]);
  });

  it("refuses to publish when the pre-push receipt does not show the hook and preflight ran", async () => {
    const { round, ledger } = await issueRound();
    const result = await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      { execute: passed("Everything up-to-date\n") },
    );
    expect({
      ok: result.ok,
      code: result.blocked?.code,
      ledger: (ledger["pre-push"] as { hooks: unknown }).hooks,
    }).toEqual({
      ok: false,
      code: "hooks-unverified",
      ledger: { ran: false, shim: false, tool: false },
    });
  });

  it("returns a failed pre-push as an implementation repair in the shared repair shape", async () => {
    const { round } = await issueRound();
    const result = await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      {
        execute: passed("==> CI preflight: lint\n", {
          status: "failed",
          exitCode: 1,
        }),
      },
    );
    expect(result.repair).toEqual({
      acceptance: [],
      implementation: [expect.stringContaining("ci:preflight")],
      source: "pre-push",
    });
  });

  const CRASHED =
    '==> CI preflight: format\nChecking formatting...\nerror: script "format:check" was terminated by signal SIGSEGV (Address boundary error)\n==> FAIL format (exit unknown)\n';

  it("runs the pre-push hook once more when a tool in it crashed", async () => {
    const { round, ledger } = await issueRound();
    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        status: "failed",
        exitCode: 1,
        stdout: CRASHED,
        stderr: "",
        cleanupConfirmed: true,
        reusable: true,
      })
      .mockResolvedValue({
        status: "passed",
        exitCode: 0,
        stdout: "Everything up-to-date\n",
        stderr: "",
        cleanupConfirmed: true,
        reusable: true,
      });
    const result = await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      { execute },
    );
    expect({
      runs: execute.mock.calls.length,
      // The second run passed without hook evidence: the usual refusal, so
      // the outcome is the second run's and not a repair for the crash.
      code: result.blocked?.code,
      repair: result.repair,
      crashed: (ledger["pre-push"] as { crashed?: unknown }).crashed,
    }).toEqual({
      runs: 2,
      code: "hooks-unverified",
      repair: undefined,
      crashed: { signal: "SIGSEGV", stage: "format", exitCode: 1 },
    });
  });

  it("returns a repair when the tool crashes again on the second run", async () => {
    const { round } = await issueRound();
    const execute = passed(CRASHED, { status: "failed", exitCode: 1 });
    const result = await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      { execute },
    );
    expect({
      runs: execute.mock.calls.length,
      source: result.repair?.source,
      fingerprint: result.fingerprint,
    }).toEqual({ runs: 2, source: "pre-push", fingerprint: "prepush:format" });
  });

  it("does not run a failed pre-push again when no tool crashed", async () => {
    const { round } = await issueRound();
    const execute = passed("==> CI preflight: lint\n", {
      status: "failed",
      exitCode: 1,
    });
    await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      { execute },
    );
    expect(execute.mock.calls.length).toBe(1);
  });

  it.each([
    [
      'error: script "format:check" was terminated by signal SIGSEGV',
      "SIGSEGV",
    ],
    [
      "Bun was terminated by signal SIGBUS (Misaligned address error)",
      "SIGBUS",
    ],
    ["terminated by signal SIGKILL (Forced quit)", "SIGKILL"],
    ["Segmentation fault (core dumped)", "SIGSEGV"],
    ["expected 'terminated by signal' to appear in the log", null],
    ["1 test failed", null],
  ])("reads a crashed tool from %j", (output, signal) => {
    expect(crashedTool(output)).toBe(signal);
  });

  it("records an uncertain host push as push-unknown instead of crashing", async () => {
    const { round, ledger } = await issueRound();
    const result = await publishCandidate(
      round,
      { branch: "factory/7-x", candidate: "a".repeat(40) },
      {
        execute: passed(
          "==> PASS ci:preflight\ncore-factory: pre-push hook passed\n",
        ),
      },
    );
    expect({
      ok: result.ok,
      code: result.blocked?.code,
      recorded: (ledger.push as { error?: string })?.error !== undefined,
    }).toEqual({ ok: false, code: "push-unknown", recorded: true });
  });

  it.each([["develop"], ["factory/8-other"], ["main"]])(
    "refuses to publish to %s",
    async (branch) => {
      const { round } = await issueRound();
      const execute = passed();
      const result = await publishCandidate(
        round,
        { branch, candidate: "a".repeat(40) },
        { execute },
      );
      expect({
        ok: result.ok,
        code: result.blocked?.code,
        executed: execute.mock.calls.length,
      }).toEqual({
        ok: false,
        code: "forbidden-target",
        executed: 0,
      });
    },
  );
});
