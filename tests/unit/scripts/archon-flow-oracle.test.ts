import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { createGit } from "../../../scripts/archon-factory/pack/.shared/git.mjs";
import { sha256 } from "../../../scripts/archon-factory/pack/.shared/round.mjs";
import { createAssignment } from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";
import { freezeCandidate } from "../../../scripts/archon-factory/pack/deliver/scripts/freeze-logic.mjs";
import { decideRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";

const PACK = path.resolve("scripts/archon-factory/pack");
const RUN = "run-0123456789abcdef";
const ORACLE = "Correct AC1 to use the new formula.";
const gitExecutable = execFileSync(
  process.platform === "win32" ? "where.exe" : "which",
  [process.platform === "win32" ? "git.exe" : "git"],
  { encoding: "utf8" },
)
  .trim()
  .split(/\r?\n/)[0];
const roots: string[] = [];

function acceptanceCallers({
  root,
  repo,
  value,
  git,
  write,
}: {
  root: string;
  repo: string;
  value: Record<string, unknown>;
  git: (...args: string[]) => string;
  write: (file: string, text: string) => void;
}) {
  const stateFile = `${root}/state.json`;
  const roundModule = pathToFileURL(path.join(PACK, ".shared/round.mjs")).href;
  const gitModule = pathToFileURL(path.join(PACK, ".shared/git.mjs")).href;
  const shim = `${root}/round-transport.mjs`;
  writeFileSync(
    stateFile,
    JSON.stringify({
      document: { revision: 1, lease: { runId: RUN }, value },
      inputs: {},
      ledger: {
        claim: { route: "oracle" },
        context: { changed: false, fingerprint: "fixture-context" },
      },
      runContext: { nodes: { define: {}, build: {} } },
    }),
  );
  writeFileSync(
    shim,
    `
    import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
    import { createGit } from ${JSON.stringify(gitModule)};
    export * from ${JSON.stringify(roundModule)};
    const stateFile = ${JSON.stringify(stateFile)};
    const state = JSON.parse(readFileSync(stateFile, "utf8"));
    export const input = name => state.inputs[name];
    export const workItem = async () => state.document;
    export const writeWorkItem = async (_round, plan) => { state.document = { ...state.document, value: plan.value, revision: state.document.revision + 1 }; };
    export const emit = output => { writeFileSync(stateFile, JSON.stringify(state)); process.stdout.write(JSON.stringify(output)); };
    export const openRound = () => ({
      runId: ${JSON.stringify(RUN)}, assignment: "assignment-oracle", issue: 23, where: { repo: ${JSON.stringify(repo)} },
      git: createGit({ executable: ${JSON.stringify(gitExecutable)} }), now: () => "2026-11-12T00:00:00.000Z",
      archon: { get: async () => ({ revision: 0, value: {} }), put: async (_name, document) => ({ revision: 1, value: document.value }) },
      ledger: { read: name => state.ledger[name] ?? null, write: (name, entry) => { state.ledger[name] = entry; } },
      context: { read: () => state.runContext, write: context => { state.runContext = context; } },
      materials: role => { const dir = ${JSON.stringify(root)} + "/materials/" + role; mkdirSync(dir, { recursive: true }); writeFileSync(dir + "/request.md", "Implement the new formula."); return dir; },
    });
  `,
  );
  const state = () => JSON.parse(readFileSync(stateFile, "utf8"));
  const runStage = (stage: string, inputs: Record<string, unknown> = {}) => {
    writeFileSync(stateFile, JSON.stringify({ ...state(), inputs }));
    const source = path.join(PACK, "deliver/scripts", `${stage}.ts`);
    const script = stripTypeScriptTypes(readFileSync(source, "utf8")).replace(
      /(from\s+)(["'])(\.[^"']+)\2/g,
      (_match, from, quote, specifier) => {
        const target =
          specifier === "../../.shared/round.mjs"
            ? shim
            : path.resolve(path.dirname(source), specifier);
        return `${from}${quote}${pathToFileURL(target).href}${quote}`;
      },
    );
    const entry = `${root}/${stage}.mjs`;
    writeFileSync(entry, script);
    return JSON.parse(
      execFileSync(process.execPath, [entry], { encoding: "utf8" }),
    );
  };
  const define = () =>
    runStage("after-define", {
      planned: "yes",
      define: {
        task_status: "DONE",
        criteria: [{ id: "AC1", statement: "value equals 3" }],
        gaps: [],
        questions: [],
        checks_run: [],
      },
    });
  return { repo, root, git, write, state, runStage, define };
}

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

async function oracleRound() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-flow-oracle-")),
  ).replace(/\\/g, "/");
  roots.push(root);
  const repo = `${root}/repo`;
  const write = (file: string, text: string) => {
    mkdirSync(path.posix.dirname(`${repo}/${file}`), { recursive: true });
    writeFileSync(`${repo}/${file}`, text);
  };
  mkdirSync(repo);
  const git = (...args: string[]) =>
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
  git("init", "--quiet", "--initial-branch", "factory-oracle");
  write("src/value.js", "export const value = 1;\n");
  write("src/remove.js", "export const obsolete = true;\n");
  write("tests/value.test.js", "expect(value).toBe(2);\n");
  write("docs/note.md", "Original note.\n");
  git("add", ".");
  git("commit", "--quiet", "-m", "fixture base");
  const base = git("rev-parse", "HEAD");
  const criteria = [{ id: "AC1", statement: "value equals 2" }];
  const tests = [
    ["tests/value.test.js", git("rev-parse", "HEAD:tests/value.test.js")],
  ];
  const value = {
    ...createAssignment({
      issue: 23,
      assignmentId: "assignment-oracle",
      owner: "fixture",
      profileDigest: "a".repeat(64),
      scopeRevision: "b".repeat(64),
      policyRevision: "c".repeat(64),
      endState: "PR_READY",
      by: "fixture",
      now: "2026-11-12T00:00:00.000Z",
    }),
    branch: "factory-oracle",
    base,
    head: base,
    run: { id: RUN, route: "oracle" },
    brief: {
      summary: "Compute the new formula",
      source_paths: ["src/**"],
      test_paths: ["tests/**"],
      shared_areas: [],
      out_of_scope: [],
      repair: null as unknown,
    },
    acceptance: {
      revision: sha256({ criteria, tests }),
      criteria,
      tests,
      run: "run-earlier000",
    },
  };
  write("src/value.js", "export const value = 2;\n");
  git("add", "src/value.js");
  write(
    "src/value.js",
    "export const value = 2;\nexport const pending = true;\n",
  );
  write("src/partial.js", "export const unfinished = true;\n");
  rmSync(`${repo}/src/remove.js`);
  const frozen = await freezeCandidate({
    git: createGit({ executable: gitExecutable }),
    repo,
    value,
    route: "initial",
    runId: RUN,
    message: "unused",
    evidenceDir: `${root}/strays`,
    ledger: { write: () => undefined },
    build: {
      task_status: "BLOCKED",
      changed_paths: ["src/value.js", "src/partial.js", "src/remove.js"],
      checks_run: [],
      gaps: ["Need the formula"],
      oracle_requests: [ORACLE],
      questions: [],
    },
    commit: async () => {
      throw new Error(
        "A BLOCKED build must preserve its dirty work without committing",
      );
    },
  });
  const decision = decideRound({
    ledger: { freeze: frozen.stop.entry },
    item: { run: { route: "initial" } },
  });
  expect(decision).toMatchObject({
    outcome: "continue",
    route: "oracle",
    repair: {
      acceptance: [ORACLE],
      implementation: [expect.stringContaining("Finish the implementation")],
    },
  });
  value.brief.repair = decision.repair;
  return acceptanceCallers({ root, repo, value, git, write });
}

describe("oracle continuation through the real acceptance callers", () => {
  it("rejects renaming an out-of-test file into the allowed test paths", async () => {
    const fixture = await oracleRound();
    fixture.runStage("after-scope");
    fixture.git("mv", "docs/note.md", "tests/note.md");
    const result = fixture.define();
    expect(result).toMatchObject({ build: "no", freeze: "no" });
    expect(fixture.state().ledger["after-define"].blocked).toMatchObject({
      code: "acceptance-strays",
      detail: "docs/note.md",
    });
  });

  it.each([true, false])(
    "preserves a BLOCKED build's dirty implementation and finish repair after Ezra (test correction: %s)",
    async (correctTests) => {
      const fixture = await oracleRound();
      const before = fixture.git(
        "status",
        "--porcelain=v1",
        "--untracked-files=all",
      );
      const stagedBefore = fixture.git("diff", "--cached", "--binary");
      const assignment = fixture.runStage("after-scope");
      expect(assignment).toMatchObject({ define: "yes", build: "yes" });
      expect(assignment.ezra_assignment).toContain(ORACLE);
      if (correctTests)
        fixture.write("tests/value.test.js", "expect(value).toBe(3);\n");
      const result = fixture.define();
      expect(result).toMatchObject({ build: "yes", freeze: "yes" });
      expect(result.bezalel_assignment).toContain(
        "Finish the implementation against the corrected acceptance.",
      );
      expect(result.bezalel_assignment).toContain("value equals 3");
      const accepted = fixture.state();
      expect(
        Object.keys(
          accepted.ledger["after-scope"].acceptanceBaseline.files,
        ).sort(),
      ).toEqual(["src/partial.js", "src/remove.js", "src/value.js"]);
      expect(accepted.ledger["after-define"].blocked).toBeUndefined();
      expect(accepted.document.value.brief.repair).toMatchObject({
        acceptance: [],
        implementation: [expect.stringContaining("Finish the implementation")],
      });
      expect(
        fixture
          .git("status", "--porcelain=v1", "--untracked-files=all")
          .replace(/^.*tests\/value\.test\.js\r?\n?/m, ""),
      ).toBe(before);
      expect(fixture.git("diff", "--cached", "--binary")).toBe(stagedBefore);
      expect(readFileSync(`${fixture.repo}/src/value.js`, "utf8")).toBe(
        "export const value = 2;\nexport const pending = true;\n",
      );
    },
  );

  it.each([
    {
      name: "editing retained tracked source without changing its Git status",
      file: "src/value.js",
      mutate: (fixture: Awaited<ReturnType<typeof oracleRound>>) =>
        fixture.write("src/value.js", "export const value = 999;\n"),
    },
    {
      name: "editing retained untracked source",
      file: "src/partial.js",
      mutate: (fixture: Awaited<ReturnType<typeof oracleRound>>) =>
        fixture.write("src/partial.js", "export const unfinished = false;\n"),
    },
    {
      name: "deleting retained untracked source",
      file: "src/partial.js",
      mutate: (fixture: Awaited<ReturnType<typeof oracleRound>>) =>
        rmSync(`${fixture.repo}/src/partial.js`),
    },
    {
      name: "restoring retained source deletions",
      file: "src/remove.js",
      mutate: (fixture: Awaited<ReturnType<typeof oracleRound>>) =>
        fixture.git("restore", "src/remove.js"),
    },
    {
      name: "creating new source outside the test paths",
      file: "src/new.js",
      mutate: (fixture: Awaited<ReturnType<typeof oracleRound>>) =>
        fixture.write("src/new.js", "export const added = true;\n"),
    },
    {
      name: "editing a previously clean out-of-scope file",
      file: "docs/note.md",
      mutate: (fixture: Awaited<ReturnType<typeof oracleRound>>) =>
        fixture.write("docs/note.md", "Changed note.\n"),
    },
  ])("rejects Ezra $name", async ({ file, mutate }) => {
    const fixture = await oracleRound();
    fixture.runStage("after-scope");
    mutate(fixture);
    const result = fixture.define();
    expect(result).toMatchObject({ build: "no", freeze: "no" });
    expect(fixture.state().ledger["after-define"].blocked).toMatchObject({
      code: "acceptance-strays",
      detail: file,
    });
  });

  it("rejects index-only tampering even when worktree content and Git status are unchanged", async () => {
    const fixture = await oracleRound();
    fixture.runStage("after-scope");
    const before = fixture.git("status", "--porcelain=v1");
    const content = readFileSync(`${fixture.repo}/src/value.js`, "utf8");
    fixture.write("src/value.js", "export const value = 999;\n");
    fixture.git("add", "src/value.js");
    fixture.write("src/value.js", content);
    expect(fixture.git("status", "--porcelain=v1")).toBe(before);
    expect(fixture.define()).toMatchObject({ build: "no", freeze: "no" });
    expect(fixture.state().ledger["after-define"].blocked).toMatchObject({
      code: "acceptance-strays",
      detail: "src/value.js",
    });
  });

  it("does not bless pre-existing dirty files outside the assigned source paths", async () => {
    const fixture = await oracleRound();
    fixture.write("docs/note.md", "Unapproved note.\n");
    fixture.runStage("after-scope");
    expect(fixture.define()).toMatchObject({ build: "no", freeze: "no" });
    expect(fixture.state().ledger["after-define"].blocked).toMatchObject({
      code: "acceptance-strays",
      detail: "docs/note.md",
    });
  });

  it("rejects commits created during the acceptance stage", async () => {
    const fixture = await oracleRound();
    fixture.runStage("after-scope");
    fixture.git("commit", "--quiet", "-m", "unauthorized acceptance commit");
    expect(fixture.define()).toMatchObject({ build: "no", freeze: "no" });
    expect(fixture.state().ledger["after-define"].blocked).toMatchObject({
      code: "acceptance-head",
    });
  });

  it("requires a scoped pre-Ezra snapshot before accepting dirty source", async () => {
    const fixture = await oracleRound();
    expect(fixture.define()).toMatchObject({ build: "no", freeze: "no" });
    expect(fixture.state().ledger["after-define"].blocked).toMatchObject({
      code: "acceptance-baseline",
    });
  });
});
