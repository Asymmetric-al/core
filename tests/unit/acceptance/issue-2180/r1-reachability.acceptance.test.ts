/**
 * #2180 R1 (reachability allowlist): done criteria 1, 2 and 3.
 * Owned by Acceptance; implementers must not edit. See guard-harness.ts.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  PROXMOX,
  expectProblem,
  guard,
  hostedJob,
  matching,
  mutated,
  realTree,
  runsOnJob,
  treeWith,
  workflow,
} from "./guard-harness";

const ALLOWED = ["ci-integration.yml", "ci.yml"];
const SHA = "0123456789abcdef0123456789abcdef01234567";
const REMOTE = `other/repo/.github/workflows/x.yml@${SHA}`;
const callJob = (uses: string) => `    uses: ${uses}`;

describe("#2180 criterion 1: real tree passes; .yml and .yaml scanned", () => {
  it("guard returns [] on the real tree", async () => {
    const g = await guard();
    expect(g.selfHostedRunnerProblems(realTree())).toEqual([]);
    expect(g.selfHostedRunnerProblems(g.loadWorkflows())).toEqual([]);
  });
  it("reachable set is exactly [ci-integration.yml, ci.yml]", async () => {
    const g = await guard();
    expect(g.reachableWorkflows(realTree())).toEqual(ALLOWED);
  });
  it("loadWorkflows reads every *.yml and *.yaml file and nothing else", async () => {
    const g = await guard();
    expect(Object.keys(g.loadWorkflows()).sort()).toEqual(
      Object.keys(realTree()),
    );
    const dir = mkdtempSync(path.join(tmpdir(), "issue-2180-"));
    try {
      for (const f of ["a.yml", "b.yaml", "c.txt", "d.json", "README.md"]) {
        writeFileSync(path.join(dir, f), workflow("push", hostedJob));
      }
      const loaded = g.loadWorkflows(dir);
      expect(Object.keys(loaded).sort()).toEqual(["a.yml", "b.yaml"]);
      expect(loaded["b.yaml"]).toBe(workflow("push", hostedJob));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("a .yaml workflow on proxmox fails R1, naming file and job", async () => {
    const g = await guard();
    const tree = treeWith(
      "runner-probe.yaml",
      workflow("push", runsOnJob(PROXMOX)),
    );
    expect(g.reachableWorkflows(tree)).toContain("runner-probe.yaml");
    expectProblem(
      g.selfHostedRunnerProblems(tree),
      "runner-probe.yaml",
      1,
      "probe",
    );
  });
  it("an allowlisted file that stops being reachable fails R1 (set must be equal)", async () => {
    const g = await guard();
    const tree = mutated(
      "ci.yml",
      `runs-on: ${PROXMOX}`,
      "runs-on: ubuntu-latest",
      2,
    );
    expect(g.reachableWorkflows(tree)).toEqual(["ci-integration.yml"]);
    expectProblem(g.selfHostedRunnerProblems(tree), "ci.yml", 1);
  });
});

describe("#2180 criterion 2: R1 runs-on mutations fail, naming file and job", () => {
  const cases: [string, string][] = [
    ["[self-hosted, linux, x64, proxmox]", PROXMOX],
    ["[self-hosted] alone", "[self-hosted]"],
    ["proxmox alone", "proxmox"],
    ["a custom label", "build-box-7"],
    ["{group: proxmox}", "\n      group: proxmox"],
    ["${{ vars.RUNNER }}", "${{ vars.RUNNER }}"],
    [
      "an expression that evaluates hosted (fails closed)",
      "${{ 'ubuntu-latest' }}",
    ],
    ["a non-ubuntu hosted label (OQ-4)", "windows-latest"],
    ["macos (OQ-4)", "macos-latest"],
    ["two labels incl. ubuntu", "[ubuntu-latest, self-hosted]"],
  ];
  for (const [label, runsOn] of cases) {
    it(`new workflow with runs-on ${label}`, async () => {
      const g = await guard();
      const tree = treeWith(
        "runner-probe.yml",
        workflow("pull_request", runsOnJob(runsOn)),
      );
      const problems = g.selfHostedRunnerProblems(tree);
      expectProblem(problems, "runner-probe.yml", 1, "probe");
      expect(g.reachableWorkflows(tree)).toEqual(
        [...ALLOWED, "runner-probe.yml"].sort(),
      );
    });
  }
  it("matrix-derived runs-on added to shadscan.yml", async () => {
    const g = await guard();
    const tree = mutated(
      "shadscan.yml",
      "    runs-on: ubuntu-latest\n",
      "    strategy:\n      matrix:\n        runner: [ubuntu-latest]\n    runs-on: ${{ matrix.runner }}\n",
    );
    expectProblem(
      g.selfHostedRunnerProblems(tree),
      "shadscan.yml",
      1,
      "report",
    );
    expect(g.reachableWorkflows(tree)).toContain("shadscan.yml");
  });
  for (const hosted of [
    "ubuntu-latest",
    "ubuntu-24.04",
    "ubuntu-slim",
    "[ubuntu-latest]",
  ]) {
    it(`control: ${hosted} is hosted, not reachable, no problem`, async () => {
      const g = await guard();
      const tree = treeWith(
        "hosted-probe.yml",
        workflow("pull_request", runsOnJob(hosted)),
      );
      expect(g.selfHostedRunnerProblems(tree)).toEqual([]);
      expect(g.reachableWorkflows(tree)).toEqual(ALLOWED);
    });
  }
});

describe("#2180 criterion 3: reusable-workflow paths fail", () => {
  for (const file of ALLOWED) {
    it(`adding workflow_call to ${file} fails R2 naming it`, async () => {
      const g = await guard();
      const tree = mutated(file, "\non:\n", "\non:\n  workflow_call:\n");
      expectProblem(
        g.selfHostedRunnerProblems(tree),
        file,
        2,
        "on",
        "workflow_call",
      );
    });
  }
  it("a hosted workflow calling ./.github/workflows/ci-integration.yml fails R1", async () => {
    const g = await guard();
    const caller = workflow(
      "pull_request",
      callJob("./.github/workflows/ci-integration.yml"),
      "call",
    );
    const tree = treeWith("caller.yml", caller);
    expectProblem(g.selfHostedRunnerProblems(tree), "caller.yml", 1, "call");
    expect(g.reachableWorkflows(tree)).toContain("caller.yml");
  });
  it("transitive: A calls hosted-only B which calls ci.yml; A and B fail R1", async () => {
    const g = await guard();
    const tree = {
      ...realTree(),
      "a.yml": workflow(
        "pull_request",
        callJob("./.github/workflows/b.yml"),
        "to-b",
      ),
      "b.yml": workflow(
        "pull_request",
        `${callJob("./.github/workflows/ci.yml")}`,
        "to-ci",
      ),
    };
    const problems = g.selfHostedRunnerProblems(tree);
    expectProblem(problems, "a.yml", 1, "to-b");
    expectProblem(problems, "b.yml", 1, "to-ci");
  });
  it("control: calling the hosted shadscan.yml stays unreachable", async () => {
    const g = await guard();
    const caller = workflow(
      "pull_request",
      callJob("./.github/workflows/shadscan.yml"),
      "scan",
    );
    const tree = treeWith("caller.yml", caller);
    expect(g.reachableWorkflows(tree)).toEqual(ALLOWED);
    expect(matching(g.selfHostedRunnerProblems(tree), "caller.yml", 1)).toEqual(
      [],
    );
  });
  const others = Object.keys(realTree()).filter((f) => !ALLOWED.includes(f));
  for (const file of others) {
    it(`a remote reusable workflow call added to ${file} fails R1 (fails closed)`, async () => {
      const g = await guard();
      const tree = mutated(
        file,
        "\njobs:\n",
        `\njobs:\n  remote:\n${callJob(REMOTE)}\n`,
      );
      expectProblem(g.selfHostedRunnerProblems(tree), file, 1, "remote");
    });
  }
  // Scope ruling (#2180 gap 4): a remote reusable-workflow call fails R1 in
  // EVERY workflow, allowlisted ones included; the 2158/2201 pins do not cover
  // it because isSelfHostedJob() is false for reusable-workflow calls.
  for (const file of ALLOWED) {
    it(`a remote reusable workflow call added to allowlisted ${file} fails R1 naming the job`, async () => {
      const g = await guard();
      const tree = mutated(
        file,
        "\njobs:\n",
        `\njobs:\n  remote:\n${callJob(REMOTE)}\n`,
      );
      expect(g.reachableWorkflows(tree)).toEqual(ALLOWED);
      expectProblem(g.selfHostedRunnerProblems(tree), file, 1, "remote");
    });
  }
});
