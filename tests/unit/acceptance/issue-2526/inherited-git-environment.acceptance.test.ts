/**
 * #2526 regression: the unit suite must keep a pre-push hook's checkout-local
 * Git variables (githooks; `git rev-parse --local-env-vars`) away from tests,
 * whatever launches it.
 *
 * Each fixture case builds a throwaway outer repo with a linked worktree under
 * os.tmpdir(), then runs a child Vitest from this checkout with this
 * checkout's vitest.config.mts and the hook's variables pointing at that
 * worktree. The child runs `harness-probe.test.ts`, which exercises the
 * unedited #2253 harness `tempRepo()`. The outer repo must be untouched.
 * Every Git command here targets a temp repository, never this checkout.
 * Owned by Acceptance.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { devNull, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const REPO = fileURLToPath(new URL("../../../../", import.meta.url));
const VITEST_CLI = path.join(REPO, "node_modules", "vitest", "vitest.mjs");
const HERE = "tests/unit/acceptance/issue-2526";
const HARNESS_PROBE = `${HERE}/harness-probe.test.ts`;
const ENV_PROBE = `${HERE}/env-probe.test.ts`;
const SETUP_TIMEOUT = 300_000;

/** This process's environment without any Git or Vitest worker variables. */
function baseEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) => !name.startsWith("GIT_") && !name.startsWith("VITEST"),
    ),
  );
}

/** Git for building and inspecting fixtures: no inherited or user config. */
function git(cwd: string, args: string[]) {
  return spawnSync(
    "git",
    [
      "-c",
      "user.name=acc2526",
      "-c",
      "user.email=acc2526@example.test",
      "-c",
      "commit.gpgsign=false",
      "-c",
      "init.defaultBranch=main",
      ...args,
    ],
    {
      cwd,
      encoding: "utf8",
      env: {
        ...baseEnv(),
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: devNull,
      },
    },
  );
}

function gitOk(cwd: string, args: string[]) {
  const r = git(cwd, args);
  if (r.status !== 0)
    throw new Error(`fixture git ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
}

type Outer = {
  base: string;
  outer: string;
  worktree: string;
  worktreeGitDir: string;
  config: string;
};

const TRACKED = 30;

/** A throwaway outer repo with one commit and a linked worktree. */
function buildOuter(): Outer {
  const base = realpathSync(mkdtempSync(path.join(tmpdir(), "acc2526-")));
  const outer = path.join(base, "outer");
  const worktree = path.join(base, "outer-wt");
  mkdirSync(outer);
  gitOk(outer, ["init", "-q"]);
  for (let i = 0; i < TRACKED; i++)
    writeFileSync(
      path.join(outer, `tracked-${String(i).padStart(2, "0")}.txt`),
      `tracked ${i}\n`,
    );
  gitOk(outer, ["add", "-A"]);
  gitOk(outer, ["commit", "-q", "-m", "acc2526 fixture"]);
  gitOk(outer, ["worktree", "add", "-q", "-b", "outer-wt", worktree]);
  const worktreeGitDir = gitOk(worktree, ["rev-parse", "--absolute-git-dir"]);
  return {
    base,
    outer,
    worktree,
    worktreeGitDir,
    config: path.join(outer, ".git", "config"),
  };
}

type Snapshot = {
  config: string;
  bare: string;
  index: string;
  mainStatus: { status: number | null; porcelain: string; stderr: string };
};

function snapshot(o: Outer): Snapshot {
  const status = git(o.outer, ["status", "--porcelain"]);
  return {
    config: readFileSync(o.config, "utf8"),
    bare: git(o.outer, [
      "config",
      "--file",
      o.config,
      "--get",
      "core.bare",
    ]).stdout.trim(),
    index: git(o.worktree, ["ls-files", "--stage"]).stdout,
    mainStatus: {
      status: status.status,
      porcelain: status.stdout,
      stderr: status.stderr,
    },
  };
}

type Child = {
  status: number | null;
  success: boolean | undefined;
  passed: number | undefined;
  failed: number | undefined;
  output: string;
};

/** Runs one test file in a child Vitest from this checkout's root. */
function childVitest(file: string, env: NodeJS.ProcessEnv, dir: string): Child {
  const report = path.join(dir, `report-${path.basename(file)}.json`);
  const r = spawnSync(
    process.execPath,
    [
      VITEST_CLI,
      "run",
      file,
      "--config",
      path.join(REPO, "vitest.config.mts"),
      "--reporter=default",
      "--reporter=json",
      `--outputFile.json=${report}`,
    ],
    { cwd: REPO, env, encoding: "utf8", timeout: SETUP_TIMEOUT - 30_000 },
  );
  const json = existsSync(report)
    ? (JSON.parse(readFileSync(report, "utf8")) as {
        success?: boolean;
        numPassedTests?: number;
        numFailedTests?: number;
      })
    : {};
  return {
    status: r.status,
    success: json.success,
    passed: json.numPassedTests,
    failed: json.numFailedTests,
    output:
      `${r.stdout ?? ""}\n${r.stderr ?? ""}\n${r.error?.message ?? ""}`.slice(
        -6000,
      ),
  };
}

const childPassed = (child: Child, tests: number) =>
  expect(
    {
      status: child.status,
      success: child.success,
      passed: child.passed,
      failed: child.failed,
    },
    child.output,
  ).toEqual({ status: 0, success: true, passed: tests, failed: 0 });

/** Hook environments, as Git exports them from a linked worktree. */
const SCENARIOS: [string, (o: Outer) => Record<string, string>][] = [
  [
    "the observed pre-push shape: GIT_DIR=<common>/.git/worktrees/<name>, GIT_PREFIX=",
    (o) => ({ GIT_DIR: o.worktreeGitDir, GIT_PREFIX: "" }),
  ],
  [
    "hostile GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and GIT_PREFIX",
    (o) => ({
      GIT_DIR: o.worktreeGitDir,
      GIT_WORK_TREE: o.worktree,
      GIT_INDEX_FILE: path.join(o.worktreeGitDir, "index"),
      GIT_PREFIX: "",
    }),
  ],
];

describe.each(SCENARIOS)(
  "#2526 unit suite launched with %s",
  (_name, hostile) => {
    let o: Outer;
    let before: Snapshot;
    let after: Snapshot;
    let child: Child;

    beforeAll(() => {
      o = buildOuter();
      before = snapshot(o);
      // Preconditions: a real linked-worktree hook GIT_DIR on a healthy repo.
      if (o.worktreeGitDir.endsWith(`${path.sep}.git`))
        throw new Error(`worktree GIT_DIR ends in /.git: ${o.worktreeGitDir}`);
      if (before.bare !== "false" || before.mainStatus.status !== 0)
        throw new Error(`outer fixture unhealthy: ${JSON.stringify(before)}`);
      if (before.index.split("\n").filter(Boolean).length !== TRACKED)
        throw new Error(`worktree index fixture: ${before.index}`);
      child = childVitest(
        HARNESS_PROBE,
        { ...baseEnv(), ...hostile(o) },
        o.base,
      );
      after = snapshot(o);
    }, SETUP_TIMEOUT);

    afterAll(() => {
      if (o) rmSync(o.base, { recursive: true, force: true });
    });

    it("the child Vitest exits 0 and the harness probe passes", () => {
      childPassed(child, 1);
    });

    it("the shared config still has core.bare = false", () => {
      expect(after.bare).toBe("false");
    });

    it("the shared config file is byte-for-byte unchanged", () => {
      expect(after.config).toBe(before.config);
    });

    it("the linked worktree's index keeps its entries and content", () => {
      expect(after.index).toBe(before.index);
    });

    it("git status in the main checkout still works and stays clean", () => {
      expect(after.mainStatus).toEqual({
        status: 0,
        porcelain: "",
        stderr: "",
      });
    });
  },
);

describe("#2526 unit suite launched with every checkout-local Git variable set", () => {
  let base: string;
  let child: Child;

  beforeAll(() => {
    base = realpathSync(mkdtempSync(path.join(tmpdir(), "acc2526-env-")));
    const names = gitOk(base, ["rev-parse", "--local-env-vars"])
      .split("\n")
      .filter(Boolean);
    // Values point into the temp dir; nothing in this checkout is targeted.
    const hostile: Record<string, string> = Object.fromEntries(
      names.map((name) => [name, path.join(base, `hostile-${name}`)]),
    );
    Object.assign(hostile, {
      GIT_PREFIX: "",
      GIT_CONFIG_PARAMETERS: "'core.bare'='true'",
      GIT_CONFIG_COUNT: "2",
      GIT_CONFIG_KEY_0: "core.bare",
      GIT_CONFIG_VALUE_0: "true",
      GIT_CONFIG_KEY_1: "core.hooksPath",
      GIT_CONFIG_VALUE_1: path.join(base, "hostile-hooks"),
      GIT_CONFIG_KEY_12: "core.worktree",
      GIT_CONFIG_VALUE_12: path.join(base, "hostile-worktree"),
    });
    child = childVitest(
      ENV_PROBE,
      {
        ...baseEnv(),
        ...hostile,
        GIT_AUTHOR_NAME: "acc2526 keep",
        GIT_TERMINAL_PROMPT: "0",
        ACC2526_PROBE: "1",
      },
      base,
    );
  }, SETUP_TIMEOUT);

  afterAll(() => {
    if (base) rmSync(base, { recursive: true, force: true });
  });

  it("tests see none of them, while other GIT_* variables pass through", () => {
    childPassed(child, 2);
  });
});
