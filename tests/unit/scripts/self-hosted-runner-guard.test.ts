/**
 * #2180 self-hosted runner guard (spec I2): the real workflow tree passes and
 * in-memory mutations for each rule fail with the right `[R#]`, file and slot.
 * Complements tests/unit/acceptance/issue-2180, which covers done criteria
 * 1-6 in breadth.
 */
import { describe, expect, it } from "vitest";

import {
  loadWorkflows,
  reachableWorkflows,
  selfHostedRunnerProblems,
  type Workflows,
} from "../helpers/self-hosted-runner-guard";

const PROXMOX = "[self-hosted, linux, x64, proxmox]";
const REMOTE =
  "other/repo/.github/workflows/x.yml@0123456789abcdef0123456789abcdef01234567";
const FORMAT =
  /^(\S+\.ya?ml) (\S+) \[R([123])\] \S.*; see docs\/ops\/self-hosted-runners\.md$/;

const real = loadWorkflows();
const tree = (extra: Workflows): Workflows => ({ ...real, ...extra });
const edit = (file: string, from: string, to: string): Workflows => {
  expect(real[file]).toContain(from);
  return tree({ [file]: real[file]!.replace(from, to) });
};
const workflow = (on: string, jobs: string) =>
  `name: Probe\non: ${on}\npermissions:\n  contents: read\njobs:\n${jobs}\n`;
const job = (id: string, body: string) =>
  `  ${id}:\n${body}\n    steps:\n      - run: echo ok`;
const call = (id: string, uses: string) => `  ${id}:\n    uses: ${uses}`;

/** `file slot [R#]` heads of every problem, checking the full format on each. */
function heads(workflows: Workflows): string[] {
  return selfHostedRunnerProblems(workflows).map((problem) => {
    const match = FORMAT.exec(problem);
    expect(match, problem).not.toBeNull();
    return `${match![1]} ${match![2]} [R${match![3]}]`;
  });
}

describe("self-hosted runner guard: real tree", () => {
  it("passes, and only ci.yml and ci-integration.yml are reachable", () => {
    expect(selfHostedRunnerProblems(real)).toEqual([]);
    expect(reachableWorkflows(real)).toEqual(["ci-integration.yml", "ci.yml"]);
  });
});

describe("R1 reachability allowlist", () => {
  it("names the file and job for a new self-hosted workflow", () => {
    const probe = workflow("push", job("probe", `    runs-on: ${PROXMOX}`));
    expect(heads(tree({ "probe.yml": probe }))).toEqual([
      "probe.yml probe [R1]",
    ]);
  });

  it("fails closed on a job with neither runs-on nor uses", () => {
    const probe = workflow("push", job("bare", "    name: Bare"));
    expect(heads(tree({ "probe.yaml": probe }))).toEqual([
      "probe.yaml bare [R1]",
    ]);
  });

  for (const file of ["ci.yml", "ci-integration.yml"]) {
    it(`flags a remote reusable workflow call in allowlisted ${file}`, () => {
      const mutated = edit(
        file,
        "\njobs:\n",
        `\njobs:\n${call("remote", REMOTE)}\n`,
      );
      expect(heads(mutated)).toEqual([`${file} remote [R1]`]);
    });
  }

  it("flags an allowlisted workflow that loses self-hosted reach, at on", () => {
    let source = real["ci-integration.yml"]!;
    source = source.replaceAll(`runs-on: ${PROXMOX}`, "runs-on: ubuntu-latest");
    source = source.replace(
      /runs-on: >-\n(?: {6}.*\n)+/g,
      "runs-on: ubuntu-latest\n",
    );
    const mutated = tree({ "ci-integration.yml": source });
    expect(reachableWorkflows(mutated)).toEqual(["ci.yml"]);
    expect(heads(mutated)).toEqual(["ci-integration.yml on [R1]"]);
  });

  it("flags allowlisted callers of reachable local workflows", () => {
    const mutated = edit(
      "ci.yml",
      "\njobs:\n",
      `\njobs:\n${call("nested", "./.github/workflows/ci-integration.yml")}\n`,
    );
    expect(heads(mutated)).toEqual(["ci.yml nested [R1]"]);
  });

  it("fails closed on a local call to a workflow outside the given map", () => {
    const caller = workflow(
      "push",
      call("ghost", "./.github/workflows/ghost.yml"),
    );
    expect(heads(tree({ "caller.yml": caller }))).toEqual([
      "caller.yml ghost [R1]",
    ]);
  });

  it("terminates on call cycles between hosted workflows", () => {
    const a = workflow("push", call("to-b", "./.github/workflows/b.yml"));
    const b = workflow("push", call("to-a", "./.github/workflows/a.yml"));
    const cyclic = tree({ "a.yml": a, "b.yml": b });
    expect(selfHostedRunnerProblems(cyclic)).toEqual([]);
    expect(reachableWorkflows(cyclic)).toEqual([
      "ci-integration.yml",
      "ci.yml",
    ]);
  });

  it("keeps reach through a call cycle when a later job is self-hosted", () => {
    const a = workflow(
      "push",
      `${call("to-b", "./.github/workflows/b.yml")}\n${job("own", `    runs-on: ${PROXMOX}`)}`,
    );
    const b = workflow("push", call("to-a", "./.github/workflows/a.yml"));
    const cyclic = tree({ "a.yml": a, "b.yml": b });
    expect(reachableWorkflows(cyclic)).toContain("b.yml");
    expect(heads(cyclic)).toEqual(
      expect.arrayContaining(["a.yml own [R1]", "b.yml to-a [R1]"]),
    );
  });
});

describe("R2 trigger allowlist", () => {
  it("names each unmodelled trigger at on, once per trigger", () => {
    const probe = workflow(
      "[push, schedule, workflow_run]",
      job("probe", `    runs-on: ${PROXMOX}`),
    );
    const problems = selfHostedRunnerProblems(tree({ "probe.yml": probe }));
    const r2 = problems.filter((p) => p.startsWith("probe.yml on [R2]"));
    expect(r2).toHaveLength(2);
    expect(r2.join("\n")).toMatch(
      /trigger schedule .*\n.*trigger workflow_run /,
    );
  });

  it("ignores triggers on workflows that cannot reach a runner", () => {
    const hosted = workflow(
      "[schedule, repository_dispatch]",
      job("probe", "    runs-on: ubuntu-latest"),
    );
    expect(selfHostedRunnerProblems(tree({ "hosted.yml": hosted }))).toEqual(
      [],
    );
  });
});

describe("R3 privileged-trigger hygiene", () => {
  const release = "release-source.yml";

  it("puts top-level permission problems at on and job ones at the job id", () => {
    let source = real[release]!.replace(
      "  contents: read\n",
      "  contents: write\n",
    );
    source = source.replace(
      "    runs-on: ubuntu-latest\n",
      "    runs-on: ubuntu-latest\n    permissions: write-all\n",
    );
    expect(heads(tree({ [release]: source }))).toEqual([
      `${release} on [R3]`,
      `${release} release-source-gate [R3]`,
    ]);
  });

  it("flags secrets: inherit and workflow-level env secrets", () => {
    const source = [
      "on:",
      "  issue_comment:",
      "permissions:",
      "  contents: read",
      "env:",
      "  T: ${{ secrets.T }}",
      "jobs:",
      job("report", "    runs-on: ubuntu-latest\n    secrets: inherit"),
      "",
    ].join("\n");
    const problems = selfHostedRunnerProblems(tree({ "comment.yml": source }));
    expect(problems).toEqual([
      expect.stringMatching(/^comment\.yml on \[R3\] \(e\) workflow-level env/),
      expect.stringMatching(
        /^comment\.yml report \[R3\] \(e\) references secrets/,
      ),
    ]);
  });

  /** A hosted, read-only pull_request_target workflow echoing `expression`. */
  const echoing = (expression: string) =>
    [
      "on:",
      "  pull_request_target:",
      "permissions:",
      "  contents: read",
      "jobs:",
      "  report:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: |",
      `          echo '\${{ ${expression} }}'`,
      "",
    ].join("\n");

  for (const expression of [
    "toJSON(github)",
    "toJSON(inputs)",
    "toJson( github )",
    "TOJSON(\tInputs )",
    "format('{0}', github)",
    "toJSON(github.event)",
  ]) {
    it(`flags whole-context ${JSON.stringify(expression)} in run: as R3(f)`, () => {
      const problems = selfHostedRunnerProblems(
        tree({ "echo.yml": echoing(expression) }),
      );
      expect(problems).toEqual([
        expect.stringMatching(/^echo\.yml report \[R3\] \(f\) /),
      ]);
    });
  }

  for (const expression of [
    "toJSON(github.sha)",
    "github.repository",
    "contains(github.repository, 'github')",
    "toJSON(steps)",
  ]) {
    it(`control: ${JSON.stringify(expression)} in run: passes`, () => {
      expect(
        selfHostedRunnerProblems(tree({ "echo.yml": echoing(expression) })),
      ).toEqual([]);
    });
  }

  it("allows github.token and env-passed event data (release-source.yml)", () => {
    expect(real[release]).toContain("${{ github.token }}");
    expect(
      selfHostedRunnerProblems(tree({ [release]: real[release]! })),
    ).toEqual([]);
  });
});
