// Freeze decisions with real Git: the candidate diff path, the integrity
// checks that stop a writer from changing acceptance tests or committing
// off-scope work, and the review-only route's preconditions.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createGit } from "../../../scripts/archon-factory/pack/.shared/git.mjs";
import {
  hookEvidence,
  hookedGit,
  restoreHookShims,
} from "../../../scripts/archon-factory/pack/.shared/publication.mjs";
import { sha256 } from "../../../scripts/archon-factory/pack/.shared/round.mjs";
import * as claimLogic from "../../../scripts/archon-factory/pack/deliver/scripts/claim-logic.mjs";
import * as defineLogic from "../../../scripts/archon-factory/pack/deliver/scripts/define-logic.mjs";
import * as freezeLogic from "../../../scripts/archon-factory/pack/deliver/scripts/freeze-logic.mjs";
import * as recordLogic from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";

const {
  acceptanceRevision,
  buildReport,
  candidateDiff,
  freezeCandidate,
  freshTestDrift,
  pendingRemovals,
  repairOf,
  reviewRouteProblem,
  setAsideStrays,
  stagingScope,
  verifyCandidate,
} = freezeLogic as Record<string, any>;

const gitExecutable =
  process.platform === "win32"
    ? execFileSync("where.exe", ["git.exe"], { encoding: "utf8" })
        .trim()
        .split(/\r?\n/)[0]
    : execFileSync("which", ["git"], { encoding: "utf8" }).trim();
const RUN = "run-0123456789abcdef";
const EARLIER = "run-fedcba9876543210";
const blob = (text: string) =>
  createHash("sha1")
    .update(`blob ${Buffer.byteLength(text)}\0`)
    .update(text)
    .digest("hex");
const BRIEF = {
  source_paths: ["packages/api/src/**"],
  test_paths: ["tests/x/**"],
};
const TEST = "tests/x/a.test.ts";
const TEST_TEXT = "expect(total).toBe(100);\n";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function repository() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-boundary-freeze-")),
  ).replace(/\\/g, "/");
  roots.push(root);
  const repo = `${root}/repo`;
  mkdirSync(`${repo}/packages/api/src`, { recursive: true });
  mkdirSync(`${repo}/tests/x`, { recursive: true });
  mkdirSync(`${repo}/docs`, { recursive: true });
  const run = (...args: string[]) =>
    execFileSync(
      gitExecutable,
      ["-c", "core.hooksPath=", "-c", "core.autocrlf=false", ...args],
      {
        cwd: repo,
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
  run("init", "--quiet");
  writeFileSync(
    `${repo}/packages/api/src/total.ts`,
    "export const total = 99;\n",
  );
  writeFileSync(`${repo}/${TEST}`, TEST_TEXT);
  writeFileSync(`${repo}/docs/readme.md`, "docs\n");
  run("add", ".");
  run("commit", "--quiet", "-m", "base");
  const base = run("rev-parse", "HEAD");
  const commit = (
    files: Record<string, string | null>,
    message = "candidate",
  ) => {
    for (const [file, text] of Object.entries(files)) {
      if (text === null) rmSync(`${repo}/${file}`);
      else {
        mkdirSync(path.posix.dirname(`${repo}/${file}`), { recursive: true });
        writeFileSync(`${repo}/${file}`, text);
      }
    }
    run("add", "-A");
    run("commit", "--quiet", "-m", message);
    return run("rev-parse", "HEAD");
  };
  return {
    repo,
    base,
    commit,
    run,
    git: createGit({ executable: gitExecutable }),
  };
}

const acceptance = (
  run: string,
  tests: [string, string][] = [[TEST, blob(TEST_TEXT)]],
) => ({
  revision: "r".repeat(64),
  criteria: [{ id: "AC1", statement: "total is 100" }],
  tests,
  run,
});

describe("candidateDiff", () => {
  it("produces the reviewers' stat and patch with real Git", async () => {
    const { repo, base, commit, git } = repository();
    const candidate = commit({
      "packages/api/src/total.ts": "export const total = 100;\n",
    });

    const diff = await candidateDiff({ git, repo, base, candidate });

    expect(diff).toContain(
      "-export const total = 99;\n+export const total = 100;\n",
    );
  });
});

describe("verifyCandidate", () => {
  it("accepts a repair that changes only assigned source paths", async () => {
    const { repo, base, commit, git } = repository();
    const candidate = commit({
      "packages/api/src/total.ts": "export const total = 100;\n",
    });

    const result = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
    });

    expect(result).toEqual({
      violations: [],
      changed: ["packages/api/src/total.ts"],
      tests: [[TEST, blob(TEST_TEXT)]],
      rewritten: [],
    });
  });

  it("refuses a candidate in which a writer changed a recorded acceptance test", async () => {
    const { repo, base, commit, git } = repository();
    const weakened = "expect(total).toBeDefined();\n";
    const candidate = commit({
      "packages/api/src/total.ts": "export const total = 100;\n",
      [TEST]: weakened,
    });

    const { violations } = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
    });

    expect(violations).toEqual([
      `${TEST} is a test path Ezra did not record this round`,
      `acceptance test ${TEST} changed (recorded ${blob(TEST_TEXT).slice(0, 12)}, candidate ${blob(weakened).slice(0, 12)})`,
    ]);
  });

  it("refuses committed changes outside the assigned paths, including the old side of a rename", async () => {
    const { repo, base, commit, git } = repository();
    const candidate = commit({
      "docs/readme.md": null,
      "packages/api/src/readme.md": "docs\n",
      ".github/workflows/ci.yml": "on: push\n",
    });

    const { violations } = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
    });

    expect(violations).toEqual([
      ".github/workflows/ci.yml is outside the assigned paths",
      "docs/readme.md is outside the assigned paths",
    ]);
  });

  it("refuses a new test-path file on a round where Ezra recorded nothing", async () => {
    const { repo, base, commit, git } = repository();
    const candidate = commit({ "tests/x/extra.test.ts": "it.skip('x');\n" });

    const { violations } = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
    });

    expect(violations).toEqual([
      "tests/x/extra.test.ts is a test path Ezra did not record this round",
    ]);
  });

  it("refuses a candidate that lost a recorded acceptance test", async () => {
    const { repo, base, commit, git } = repository();
    const candidate = commit({
      [TEST]: null,
      "packages/api/src/total.ts": "x\n",
    });

    const { violations } = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
    });

    expect(violations).toEqual([
      `${TEST} is a test path Ezra did not record this round`,
      `acceptance test ${TEST} is missing from the candidate`,
    ]);
  });

  it("refuses a candidate that still holds a test Ezra removed", async () => {
    const { repo, base, commit, git } = repository();
    const candidate = commit({ "packages/api/src/total.ts": "x\n" });

    const verified = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: { ...acceptance(EARLIER, []), removed: [TEST] },
      runId: RUN,
    });

    expect(verified.violations).toEqual([
      `removed acceptance test ${TEST} is still in the candidate`,
    ]);
  });

  it("accepts a candidate that removes the test Ezra removed", async () => {
    const { repo, base, commit, git } = repository();
    const candidate = commit({
      "packages/api/src/total.ts": "x\n",
      [TEST]: null,
    });

    const verified = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: { ...acceptance(EARLIER, []), removed: [TEST] },
      runId: RUN,
    });

    expect(verified.violations).toEqual([]);
  });

  it("requires acceptance-owner approval even for formatting hook rewrites", async () => {
    const { repo, base, commit, git } = repository();
    const recorded = "expect(total).toBe( 100 )\n";
    const formatted = "expect(total).toBe(100);\n";
    const fresh = "tests/x/new.test.ts";
    const candidate = commit({
      [fresh]: formatted,
      "packages/api/src/total.ts": "x\n",
    });

    const result = await verifyCandidate({
      git,
      repo,
      previousHead: base,
      candidate,
      brief: BRIEF,
      acceptance: acceptance(RUN, [[fresh, blob(recorded)]]),
      runId: RUN,
    });

    expect(result).toEqual({
      violations: [
        `acceptance test ${fresh} changed (recorded ${blob(recorded).slice(0, 12)}, candidate ${blob(formatted).slice(0, 12)})`,
      ],
      changed: ["packages/api/src/total.ts", fresh],
      tests: [[fresh, blob(recorded)]],
      rewritten: [],
    });
  });

  it("checks nothing new on a review-only round but still requires the recorded tests", async () => {
    const { repo, commit, git } = repository();
    const candidate = commit({ "packages/api/src/total.ts": "x\n" });

    const result = await verifyCandidate({
      git,
      repo,
      previousHead: candidate,
      candidate,
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
    });

    expect(result).toEqual({
      violations: [],
      changed: [],
      tests: [[TEST, blob(TEST_TEXT)]],
      rewritten: [],
    });
  });
});

describe("freshTestDrift", () => {
  it("reports Ezra's recorded tests that a writer changed or deleted before the commit", () => {
    const { repo } = repository();
    writeFileSync(`${repo}/tests/x/b.test.ts`, "b\n");
    writeFileSync(`${repo}/${TEST}`, "expect(total).toBeDefined();\n");
    const recorded = acceptance(RUN, [
      [TEST, blob(TEST_TEXT)],
      ["tests/x/b.test.ts", blob("b\n")],
      ["tests/x/c.test.ts", blob("c\n")],
    ]);

    expect(freshTestDrift({ repo, acceptance: recorded, runId: RUN })).toEqual([
      `${TEST} changed after Ezra recorded it`,
      "tests/x/c.test.ts was deleted",
    ]);
  });

  it("does not apply to acceptance recorded in an earlier run (the commit check covers it)", () => {
    const { repo } = repository();
    writeFileSync(`${repo}/${TEST}`, "changed\n");
    expect(
      freshTestDrift({ repo, acceptance: acceptance(EARLIER), runId: RUN }),
    ).toEqual([]);
  });

  it("applies to an earlier run's recorded test that no commit holds yet", () => {
    const { repo } = repository();
    writeFileSync(`${repo}/${TEST}`, "changed\n");
    expect(
      freshTestDrift({
        repo,
        acceptance: acceptance(EARLIER),
        runId: RUN,
        pending: new Set([TEST]),
      }),
    ).toEqual([`${TEST} changed after Ezra recorded it`]);
  });

  it("reports a test Ezra removed that exists again", () => {
    const { repo } = repository();
    expect(
      freshTestDrift({
        repo,
        acceptance: acceptance(EARLIER, []),
        runId: RUN,
        removals: new Set([TEST, "tests/x/gone.test.ts"]),
      }),
    ).toEqual([`${TEST} was removed by Ezra and exists again`]);
  });
});

describe("pendingRemovals", () => {
  it("names the removed tests the candidate's base still holds", async () => {
    const { repo, base, git } = repository();
    expect([
      ...(await pendingRemovals({
        git,
        repo,
        previousHead: base,
        acceptance: {
          ...acceptance(RUN, []),
          removed: [TEST, "tests/x/never.test.ts"],
        },
      })),
    ]).toEqual([TEST]);
  });
});

describe("stagingScope", () => {
  it("stages source paths, and test paths only for files Ezra recorded this round", () => {
    const fresh = stagingScope({
      brief: BRIEF,
      acceptance: acceptance(RUN),
      runId: RUN,
    });
    const later = stagingScope({
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
    });
    expect({
      source: [fresh("packages/api/src/a.ts"), later("packages/api/src/a.ts")],
      recorded: [fresh(TEST), later(TEST)],
      unrecorded: [
        fresh("tests/x/other.test.ts"),
        later("tests/x/other.test.ts"),
      ],
      outside: [fresh("docs/readme.md"), later("docs/readme.md")],
    }).toEqual({
      source: [true, true],
      recorded: [true, false],
      unrecorded: [false, false],
      outside: [false, false],
    });
  });

  it("stages the removal of a test Ezra removed, and of no other test", () => {
    const scope = stagingScope({
      brief: BRIEF,
      acceptance: acceptance(EARLIER, []),
      runId: RUN,
      removals: new Set([TEST]),
    });
    expect([scope(TEST), scope("tests/x/other.test.ts")]).toEqual([
      true,
      false,
    ]);
  });

  it("also stages a recorded test no commit holds yet, whichever run recorded it", () => {
    const later = stagingScope({
      brief: BRIEF,
      acceptance: acceptance(EARLIER),
      runId: RUN,
      pending: new Set([TEST]),
    });
    expect([later(TEST), later("tests/x/other.test.ts")]).toEqual([
      true,
      false,
    ]);
  });
});

describe("reviewRouteProblem", () => {
  const head = "a".repeat(40);
  it.each([
    [{ status: [], head, recorded: head }, null],
    [
      { status: [], head, recorded: null },
      "No recorded candidate to review again",
    ],
    [
      { status: [], head: "b".repeat(40), recorded: head },
      `HEAD bbbbbbbbbbbb is not the recorded candidate aaaaaaaaaaaa`,
    ],
    [
      { status: [{ code: " M", path: "x.ts" }], head, recorded: head },
      "The working tree has uncommitted changes: x.ts",
    ],
  ])("judges %j", (input, problem) => {
    expect(reviewRouteProblem(input)).toBe(problem);
  });
});

describe("acceptance records", () => {
  it("recomputes the revision exactly as after-define does", () => {
    const criteria = [{ id: "AC1", statement: "x" }];
    const tests = [[TEST, blob(TEST_TEXT)]];
    expect(acceptanceRevision(criteria, tests)).toBe(
      sha256({ criteria, tests }),
    );
  });

  it("returns repairs in the shared repair shape", () => {
    expect(repairOf(["fix it"])).toEqual({
      acceptance: [],
      implementation: ["fix it"],
      source: "freeze",
    });
  });
});

// I1 and the oracle-request gap (S5.4/A.5), exercised through the freeze
// decision with real Git. The commit step is the only injected part:
// production commits through Core's hooks in the executor; here it is a
// plain `git commit` in the same clone.
describe("freezeCandidate", () => {
  const ORACLE =
    "AC1 must expect 101: the issue says the total includes the fee";
  const built = (extra: Record<string, unknown> = {}) => ({
    task_status: "DONE",
    changed_paths: ["packages/api/src/total.ts"],
    checks_run: ["bun run test:unit tests/x (passed)"],
    gaps: [],
    oracle_requests: [],
    questions: [],
    ...extra,
  });
  const MESSAGE = "fix(#7): factory round 2";

  function setup() {
    const fixture = repository();
    const entries: Record<string, unknown> = {};
    const ledger = {
      entries,
      write: (name: string, entry: unknown) => {
        entries[name] = entry;
      },
    };
    const commit = vi.fn(async (files: string[], message: string) => {
      fixture.run("--literal-pathspecs", "add", "-A", "--", ...files);
      fixture.run("commit", "--quiet", "-m", message);
      return {
        status: "passed",
        exitCode: 0,
        stdout: "",
        stderr: "",
        receipt: { status: "passed", ran: true },
      };
    });
    const freeze = (input: Record<string, unknown>) =>
      freezeCandidate({
        git: fixture.git,
        repo: fixture.repo,
        runId: RUN,
        message: MESSAGE,
        evidenceDir: `${path.posix.dirname(fixture.repo)}/strays`,
        ledger,
        commit,
        ...input,
      });
    const count = () => fixture.run("rev-list", "--count", "HEAD");
    return {
      ...fixture,
      commitFiles: fixture.commit,
      ledger,
      commit,
      freeze,
      count,
    };
  }

  it.each([
    {
      scenario: "retains unchanged acceptance",
      hookTest: TEST_TEXT,
      accepted: true,
    },
    {
      scenario: "refuses semantic assertion weakening",
      hookTest: "expect(total).toBeDefined();\n",
      accepted: false,
    },
  ])(
    "$scenario after running the normal hook shim and dependency",
    async ({ hookTest, accepted }) => {
      const fixture = setup();
      const base = fixture.commitFiles({
        ".gitignore": "node_modules/\n.husky/_/\n",
        ".husky/pre-commit": `"${process.execPath.replace(/\\/g, "/")}" node_modules/lint-staged/fixture.cjs\n`,
      });
      fixture.run("config", "user.name", "Fixture");
      fixture.run("config", "user.email", "fixture@example.invalid");
      const recorded = acceptance(RUN);
      writeFileSync(
        `${fixture.repo}/packages/api/src/total.ts`,
        "export const total = 100;\n",
      );
      mkdirSync(`${fixture.repo}/node_modules/lint-staged`, {
        recursive: true,
      });
      writeFileSync(
        `${fixture.repo}/node_modules/lint-staged/fixture.cjs`,
        `require("node:fs").writeFileSync(${JSON.stringify(TEST)}, ${JSON.stringify(hookTest)});\n` +
          `require("node:child_process").execFileSync(${JSON.stringify(gitExecutable)}, ["add", "--", ${JSON.stringify(TEST)}]);\n` +
          'console.log("Running tasks for staged files");\n',
      );
      const receipts: Record<string, unknown>[] = [];

      const result = await fixture.freeze({
        route: "initial",
        value: { base, brief: BRIEF, acceptance: recorded },
        build: built(),
        commit: async (files: string[], message: string) => {
          fixture.run("--literal-pathspecs", "add", "-A", "--", ...files);
          restoreHookShims(fixture.repo);
          const child = spawnSync(
            gitExecutable,
            hookedGit(fixture.repo, ["commit", "--quiet", "-m", message]).slice(
              1,
            ),
            { cwd: fixture.repo, encoding: "utf8" },
          );
          expect(child.status).toBe(0);
          const receipt = {
            status: "passed",
            exitCode: child.status,
            stdout: child.stdout,
            stderr: child.stderr,
          };
          const evidence = {
            ...receipt,
            ...hookEvidence("pre-commit", receipt),
          };
          receipts.push(evidence);
          return { ...receipt, receipt: evidence };
        },
      });

      expect(receipts).toEqual([expect.objectContaining({ ran: true })]);
      expect(fixture.run("show", `HEAD:${TEST}`)).toBe(hookTest.trim());
      if (accepted) {
        expect(result.stop).toBeUndefined();
        expect(result.fields).toMatchObject({
          head: fixture.run("rev-parse", "HEAD"),
        });
        expect(result.fields).not.toHaveProperty("acceptance");
      } else {
        expect(result).toMatchObject({
          stop: { entry: { blocked: { code: "candidate-integrity" } } },
        });
        expect(result.fields).toBeUndefined();
      }
      expect(recorded.tests).toEqual([[TEST, blob(TEST_TEXT)]]);
    },
  );

  describe("review-only route", () => {
    const RECOVERY =
      "Inspect the issue clone (nothing was committed); once its HEAD is the recorded head and its tree is clean, retry the issue";
    it("adopts the recorded head as the candidate without committing and without a build", async () => {
      const { base, commitFiles, run, freeze, commit, count } = setup();
      const head = commitFiles({
        "packages/api/src/total.ts": "export const total = 100;\n",
      });
      const commits = count();

      const result = await freeze({
        route: "review",
        value: { base, head, brief: BRIEF, acceptance: acceptance(EARLIER) },
        build: null,
      });

      expect({
        result,
        head: run("rev-parse", "HEAD"),
        commits: count(),
        committed: commit.mock.calls.length,
        status: run("status", "--porcelain"),
      }).toEqual({
        result: {
          candidate: head,
          previousHead: head,
          hooks: { preCommit: "earlier-round" },
          fields: { head, reviews: null, final: null },
          verified: {
            violations: [],
            changed: [],
            tests: [[TEST, blob(TEST_TEXT)]],
            rewritten: [],
          },
          report: null,
        },
        head,
        commits,
        committed: 0,
        status: "",
      });
    });

    it.each([
      ["a modified tracked file", "packages/api/src/total.ts"],
      ["an untracked file", "packages/api/src/extra.ts"],
    ])(
      "refuses a dirty working tree (%s) and leaves it untouched",
      async (_case, file) => {
        const { base, commitFiles, repo, run, freeze, commit } = setup();
        const head = commitFiles({
          "packages/api/src/total.ts": "export const total = 100;\n",
        });
        writeFileSync(`${repo}/${file}`, "uncommitted\n");

        const result = await freeze({
          route: "review",
          value: { base, head, brief: BRIEF, acceptance: acceptance(EARLIER) },
          build: null,
        });

        expect({
          result,
          kept: readFileSync(`${repo}/${file}`, "utf8"),
          head: run("rev-parse", "HEAD"),
          committed: commit.mock.calls.length,
        }).toEqual({
          result: {
            stop: {
              reason: "The recorded candidate cannot be reviewed again",
              entry: {
                blocked: {
                  code: "review-precondition",
                  detail: `The working tree has uncommitted changes: ${file}`,
                  recovery: RECOVERY,
                },
                build: null,
              },
            },
          },
          kept: "uncommitted\n",
          head,
          committed: 0,
        });
      },
    );

    it("refuses when HEAD moved away from the recorded head", async () => {
      const { base, commitFiles, freeze, commit } = setup();
      const moved = commitFiles({
        "packages/api/src/total.ts": "export const total = 100;\n",
      });

      const result = await freeze({
        route: "review",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: acceptance(EARLIER),
        },
        build: null,
      });

      expect({ result, committed: commit.mock.calls.length }).toEqual({
        result: {
          stop: {
            reason: "The recorded candidate cannot be reviewed again",
            entry: {
              blocked: {
                code: "review-precondition",
                detail: `HEAD ${moved.slice(0, 12)} is not the recorded candidate ${base.slice(0, 12)}`,
                recovery: RECOVERY,
              },
              build: null,
            },
          },
        },
        committed: 0,
      });
    });

    it("still verifies the recorded head against the recorded acceptance", async () => {
      const { base, commitFiles, freeze } = setup();
      const head = commitFiles({
        [TEST]: null,
        "packages/api/src/total.ts": "export const total = 100;\n",
      });

      const result = await freeze({
        route: "review",
        value: { base, head, brief: BRIEF, acceptance: acceptance(EARLIER) },
        build: null,
      });

      expect(result.stop.entry.blocked).toEqual({
        code: "candidate-integrity",
        detail: `acceptance test ${TEST} is missing from the candidate`,
      });
    });
  });

  it("fails closed on any other route that has no build result", async () => {
    const { base, freeze, commit } = setup();

    const result = await freeze({
      route: "repair",
      value: {
        base,
        head: base,
        brief: BRIEF,
        acceptance: acceptance(EARLIER),
      },
      build: null,
    });

    expect({ result, committed: commit.mock.calls.length }).toEqual({
      result: {
        stop: {
          reason: "Bezalel did not complete the build",
          entry: {
            blocked: { code: "build-blocked", detail: "No build result" },
            build: null,
          },
        },
      },
      committed: 0,
    });
  });

  describe("Bezalel's oracle requests", () => {
    it("commits finished work, then returns the requests as an acceptance repair with the build report", async () => {
      const { base, repo, run, freeze, commit } = setup();
      writeFileSync(
        `${repo}/packages/api/src/total.ts`,
        "export const total = 100;\n",
      );

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: acceptance(EARLIER),
        },
        build: built({ oracle_requests: [ORACLE], gaps: ["fee rounding"] }),
      });

      const candidate = run("rev-parse", "HEAD");
      expect({
        candidate: result.candidate,
        fields: result.fields,
        repair: result.repair,
        report: result.report,
        commits: commit.mock.calls,
        status: run("status", "--porcelain"),
      }).toEqual({
        candidate,
        fields: { head: candidate, reviews: null, final: null },
        repair: { acceptance: [ORACLE], implementation: [], source: "freeze" },
        report: {
          task_status: "DONE",
          oracle_requests: [ORACLE],
          gaps: ["fee rounding"],
          checks_run: ["bun run test:unit tests/x (passed)"],
        },
        commits: [[["packages/api/src/total.ts"], MESSAGE]],
        status: "",
      });
      expect(candidate).not.toBe(base);
    });

    it("asks Ezra without committing when Bezalel changed nothing because the acceptance is wrong", async () => {
      const { base, freeze, commit, count } = setup();
      const commits = count();

      const result = await freeze({
        route: "initial",
        value: { base, brief: BRIEF, acceptance: acceptance(EARLIER) },
        build: built({ changed_paths: [], oracle_requests: [ORACLE] }),
      });

      expect({
        result,
        commits: count(),
        committed: commit.mock.calls.length,
      }).toEqual({
        result: {
          stop: {
            reason:
              "Bezalel asked for acceptance changes before the candidate can be reviewed",
            entry: {
              repair: {
                acceptance: [ORACLE],
                implementation: [],
                source: "freeze",
              },
              fingerprint: `oracle:${ORACLE}`,
              build: {
                task_status: "DONE",
                oracle_requests: [ORACLE],
                gaps: [],
                checks_run: ["bun run test:unit tests/x (passed)"],
              },
            },
          },
        },
        commits,
        committed: 0,
      });
    });

    it("sends a BLOCKED build's requests to Ezra and the unfinished work back to Bezalel, keeping the work", async () => {
      const { base, repo, freeze, commit } = setup();
      writeFileSync(`${repo}/packages/api/src/total.ts`, "partial\n");

      const result = await freeze({
        route: "initial",
        value: { base, brief: BRIEF, acceptance: acceptance(EARLIER) },
        build: built({
          task_status: "BLOCKED",
          oracle_requests: [ORACLE],
          gaps: ["the fee is not in the API"],
          questions: ["which fee table?"],
        }),
      });

      expect({
        repair: result.stop.entry.repair,
        blocked: result.stop.entry.blocked,
        kept: readFileSync(`${repo}/packages/api/src/total.ts`, "utf8"),
        committed: commit.mock.calls.length,
      }).toEqual({
        repair: {
          acceptance: [ORACLE],
          implementation: [
            "Bezalel stopped BLOCKED before finishing (the fee is not in the API; which fee table?). Finish the implementation against the corrected acceptance.",
          ],
          source: "freeze",
        },
        blocked: undefined,
        kept: "partial\n",
        committed: 0,
      });
    });

    it("keeps a BLOCKED build without requests blocked", async () => {
      const { base, freeze } = setup();

      const result = await freeze({
        route: "initial",
        value: { base, brief: BRIEF, acceptance: acceptance(EARLIER) },
        build: built({ task_status: "BLOCKED", gaps: ["no fee table"] }),
      });

      expect(result.stop.entry.blocked).toEqual({
        code: "build-blocked",
        detail: "no fee table",
      });
    });

    it("adds the requests to the implementation repair when the hooks reject the commit", async () => {
      const { base, repo, freeze, commit } = setup();
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");
      commit.mockResolvedValueOnce({
        status: "failed",
        exitCode: 1,
        stdout: "",
        stderr: "lint failed",
        receipt: { status: "failed", ran: true },
      });

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: acceptance(EARLIER),
        },
        build: built({ oracle_requests: [ORACLE] }),
      });

      expect(result.stop.entry.repair).toEqual({
        acceptance: [ORACLE],
        implementation: [
          "The pre-commit hooks rejected the change (exit 1). Output tail:\nlint failed",
        ],
        source: "freeze",
      });
    });

    // A round that defined acceptance can end before its first commit (an
    // interruption, a failed step, rejected hooks). The tests Ezra recorded
    // are then in the workspace and in no commit, and a later run commits
    // them: what counts is the recorded content, not which run recorded it.
    it("commits acceptance tests an earlier run recorded and never committed", async () => {
      const { base, repo, run, freeze } = setup();
      const NEW = "tests/x/new.test.ts";
      const NEW_TEXT = "expect(total).toBe(101);\n";
      writeFileSync(`${repo}/${NEW}`, NEW_TEXT);
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: null,
          brief: BRIEF,
          acceptance: acceptance(EARLIER, [
            [TEST, blob(TEST_TEXT)],
            [NEW, blob(NEW_TEXT)],
          ]),
        },
        build: built(),
      });

      expect(result.stop).toBeUndefined();
      expect(run("rev-parse", `${result.candidate}:${NEW}`)).toBe(
        blob(NEW_TEXT),
      );
      expect(
        run("diff", "--name-only", base, result.candidate).split("\n").sort(),
      ).toEqual(["packages/api/src/total.ts", NEW]);
    });

    it("commits Ezra's removal of an acceptance test with its replacement", async () => {
      const { base, repo, run, freeze } = setup();
      const NEW = "tests/x/renamed.test.ts";
      const NEW_TEXT = "expect(total).toBe(101);\n";
      rmSync(`${repo}/${TEST}`);
      writeFileSync(`${repo}/${NEW}`, NEW_TEXT);
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "oracle",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: {
            ...acceptance(RUN, [[NEW, blob(NEW_TEXT)]]),
            removed: [TEST],
          },
        },
        build: built(),
      });

      expect(result.stop).toBeUndefined();
      expect(
        run("diff", "--no-renames", "--name-status", base, result.candidate)
          .split("\n")
          .sort(),
      ).toEqual([`A\t${NEW}`, `D\t${TEST}`, "M\tpackages/api/src/total.ts"]);
    });

    it("commits a removal an earlier run recorded and never committed", async () => {
      const { base, repo, run, freeze } = setup();
      rmSync(`${repo}/${TEST}`);
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: { ...acceptance(EARLIER, []), removed: [TEST] },
        },
        build: built(),
      });

      expect(result.stop).toBeUndefined();
      expect(
        run("ls-tree", "--name-only", "-r", result.candidate).split("\n"),
      ).not.toContain(TEST);
    });

    it("stops when a test Ezra removed is back before the commit", async () => {
      const { base, repo, freeze, count } = setup();
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: { ...acceptance(EARLIER, []), removed: [TEST] },
        },
        build: built(),
      });

      expect(result.stop?.entry?.blocked).toMatchObject({
        code: "acceptance-tampered",
        detail: `${TEST} was removed by Ezra and exists again`,
      });
      expect(count()).toBe("1");
    });

    it("puts back a test a writer deleted when Ezra did not remove it", async () => {
      const { base, repo, run, freeze } = setup();
      rmSync(`${repo}/${TEST}`);
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: acceptance(EARLIER),
        },
        build: built(),
      });

      expect(result.stop).toBeUndefined();
      expect(run("rev-parse", `${result.candidate}:${TEST}`)).toBe(
        blob(TEST_TEXT),
      );
    });

    it("refuses an uncommitted recorded test that no longer holds what Ezra recorded", async () => {
      const { base, repo, freeze, count } = setup();
      const NEW = "tests/x/new.test.ts";
      writeFileSync(`${repo}/${NEW}`, "expect(total).toBeDefined();\n");
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: null,
          brief: BRIEF,
          acceptance: acceptance(EARLIER, [
            [TEST, blob(TEST_TEXT)],
            [NEW, blob("expect(total).toBe(101);\n")],
          ]),
        },
        build: built(),
      });

      expect(result.stop?.entry?.blocked?.code).toBe("acceptance-tampered");
      expect(count()).toBe("1");
    });

    it("still sets aside a writer's change to a test the candidate's base already holds", async () => {
      const { base, repo, run, freeze } = setup();
      writeFileSync(`${repo}/${TEST}`, "expect(total).toBeDefined();\n");
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: acceptance(EARLIER),
        },
        build: built(),
      });

      expect(result.stop).toBeUndefined();
      expect(run("rev-parse", `${result.candidate}:${TEST}`)).toBe(
        blob(TEST_TEXT),
      );
      expect(readFileSync(`${repo}/${TEST}`, "utf8")).toBe(TEST_TEXT);
    });

    it("freezes for review as usual when there are no requests", async () => {
      const { base, repo, freeze } = setup();
      writeFileSync(`${repo}/packages/api/src/total.ts`, "x\n");

      const result = await freeze({
        route: "repair",
        value: {
          base,
          head: base,
          brief: BRIEF,
          acceptance: acceptance(EARLIER),
        },
        build: built(),
      });

      expect({
        stop: result.stop,
        repair: result.repair,
        hooks: result.hooks,
      }).toEqual({
        stop: undefined,
        repair: undefined,
        hooks: { preCommit: [{ status: "passed", ran: true }] },
      });
    });
  });
});

// The stages around freeze, chained through their real decision functions:
// a review-only repair must reach the reviewers without BLOCKED, and freeze's
// oracle repair must send the next round to Ezra.
describe("freeze between record, claim and after-define", () => {
  const stopEntry = (result: { stop: { reason: string; entry: object } }) => ({
    review: false,
    reason: result.stop.reason,
    ...result.stop.entry,
  });

  it("takes a review-again repair through claim and after-define to a frozen recorded head", async () => {
    const { decideRound } = recordLogic as Record<string, any>;
    const { roundStages } = claimLogic as Record<string, any>;
    const { afterDefinePlan } = defineLogic as Record<string, any>;
    const { repo, base, commit, git, run } = repository();
    const head = commit({ "packages/api/src/total.ts": "x\n" });

    const decided = decideRound({
      ledger: { seal: { repair: { kind: "review-again", items: [] } } },
      item: { run: { route: "repair", head }, head },
    });
    const stages = roundStages(decided.route);
    const plan = afterDefinePlan({
      route: decided.route,
      planned: "no",
      hasAcceptance: true,
      hasHead: true,
    });
    const frozen = await freezeCandidate({
      git,
      repo,
      route: decided.route,
      value: { base, head, brief: BRIEF, acceptance: acceptance(EARLIER) },
      build: plan.build ? {} : null,
      runId: RUN,
      message: "unused",
      evidenceDir: `${path.posix.dirname(repo)}/strays`,
      ledger: { write: () => undefined },
      commit: async () => {
        throw new Error("a review-only round must not commit");
      },
    });

    expect({
      route: decided.route,
      stages,
      plan: { build: plan.build, freeze: plan.freeze },
      stop: frozen.stop,
      candidate: frozen.candidate,
      head: run("rev-parse", "HEAD"),
    }).toEqual({
      route: "review",
      stages: {
        do_scope: "no",
        do_define: "no",
        do_build: "yes",
        do_feedback: "no",
      },
      plan: { build: false, freeze: true },
      stop: undefined,
      candidate: head,
      head,
    });
  });

  it("sends the round after freeze's oracle request to Ezra", async () => {
    const { decideRound } = recordLogic as Record<string, any>;
    const { repo, base, git } = repository();
    const request = "AC1 must expect 101";
    const result = await freezeCandidate({
      git,
      repo,
      route: "initial",
      value: { base, brief: BRIEF, acceptance: acceptance(EARLIER) },
      build: {
        task_status: "DONE",
        changed_paths: [],
        checks_run: [],
        gaps: [],
        oracle_requests: [request],
        questions: [],
      },
      runId: RUN,
      message: "unused",
      evidenceDir: `${path.posix.dirname(repo)}/strays`,
      ledger: { write: () => undefined },
      commit: async () => {
        throw new Error("nothing to commit");
      },
    });

    const decided = decideRound({
      ledger: { freeze: stopEntry(result) },
      item: { run: { route: "initial" } },
    });

    expect({
      outcome: decided.outcome,
      route: decided.route,
      repair: decided.repair,
    }).toEqual({
      outcome: "continue",
      route: "oracle",
      repair: { acceptance: [request], implementation: [], source: "freeze" },
    });
  });
});

describe("buildReport", () => {
  it("keeps Bezalel's oracle requests, gaps and checks for the freeze ledger", () => {
    expect({
      done: buildReport({
        task_status: "DONE",
        changed_paths: ["a.ts"],
        checks_run: ["bun run test:unit (passed)"],
        gaps: ["g"],
        oracle_requests: ["o", "", 7],
        questions: ["q"],
      }),
      skipped: buildReport(null),
    }).toEqual({
      done: {
        task_status: "DONE",
        oracle_requests: ["o"],
        gaps: ["g"],
        checks_run: ["bun run test:unit (passed)"],
      },
      skipped: null,
    });
  });
});

describe("setAsideStrays", () => {
  // A file that was staged and is in no commit (a rejected commit leaves its
  // index behind) cannot be restored from HEAD: it is unstaged and kept as
  // evidence like an untracked file.
  it("sets aside a stray that is staged and in no commit", async () => {
    const { repo, git, run } = repository();
    const evidence = `${path.posix.dirname(repo)}/strays`;
    writeFileSync(`${repo}/docs/new.md`, "new\n");
    run("add", "docs/new.md");
    writeFileSync(`${repo}/docs/new.md`, "new, edited after staging\n");

    const strays = await setAsideStrays({
      git,
      repo,
      inScope: () => false,
      evidenceDir: evidence,
      ledger: { write: () => {} },
    });

    expect({
      strays: { tracked: strays.tracked, untracked: strays.untracked },
      moved: readFileSync(`${evidence}/untracked/docs/new.md`, "utf8"),
      status: run("status", "--porcelain"),
    }).toEqual({
      strays: { tracked: [], untracked: ["docs/new.md"] },
      moved: "new, edited after staging\n",
      status: "",
    });
  });

  it("keeps changes outside the staging scope as evidence and restores the tree, ignoring a configured external diff", async () => {
    const { repo, git, run } = repository();
    const evidence = `${path.posix.dirname(repo)}/strays`;
    const marker = `${path.posix.dirname(repo)}/external-diff-ran`;
    appendFileSync(
      `${repo}/.git/config`,
      `[diff]\n\texternal = echo pwned > "${marker}"\n`,
    );
    writeFileSync(`${repo}/docs/readme.md`, "changed\n");
    writeFileSync(`${repo}/docs/new.md`, "new\n");
    writeFileSync(`${repo}/packages/api/src/total.ts`, "kept\n");
    const entries: Record<string, unknown> = {};

    const strays = await setAsideStrays({
      git,
      repo,
      inScope: stagingScope({
        brief: BRIEF,
        acceptance: acceptance(EARLIER),
        runId: RUN,
      }),
      evidenceDir: evidence,
      ledger: {
        write: (name: string, entry: unknown) => {
          entries[name] = entry;
        },
      },
    });

    expect({
      strays,
      ledger: entries,
      patch: readFileSync(`${evidence}/tracked.patch`, "utf8"),
      moved: readFileSync(`${evidence}/untracked/docs/new.md`, "utf8"),
      restored: readFileSync(`${repo}/docs/readme.md`, "utf8"),
      externalRan: existsSync(marker),
      status: run("status", "--porcelain"),
    }).toEqual({
      strays: {
        tracked: ["docs/readme.md"],
        untracked: ["docs/new.md"],
        evidence,
      },
      ledger: {
        "freeze-strays": {
          tracked: ["docs/readme.md"],
          untracked: ["docs/new.md"],
          evidence,
        },
      },
      patch: expect.stringContaining("-docs\n+changed\n"),
      moved: "new\n",
      restored: "docs\n",
      externalRan: false,
      status: "M packages/api/src/total.ts",
    });
  });
});
