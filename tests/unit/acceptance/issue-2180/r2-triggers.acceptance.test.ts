/**
 * #2180 R2 (trigger allowlist on reachable workflows and their callers):
 * done criterion 4. Owned by Acceptance; implementers must not edit.
 */
import { describe, expect, it } from "vitest";

import {
  PROXMOX,
  expectProblem,
  guard,
  matching,
  mutated,
  realTree,
  runsOnJob,
  treeWith,
  workflow,
} from "./guard-harness";

/** §1.1 R2's named triggers plus one other unmodelled event (`release`). */
const BANNED: Record<string, string> = {
  pull_request_target: "",
  workflow_run: "\n    workflows: [CI]\n    types: [completed]",
  issue_comment: "\n    types: [created]",
  pull_request_review: "\n    types: [submitted]",
  pull_request_review_comment: "\n    types: [created]",
  workflow_call: "",
  schedule: '\n    - cron: "0 3 * * *"',
  repository_dispatch: "",
  release: "\n    types: [published]",
};
const block = (t: string) => `\n  ${t}:${BANNED[t]}`;
const reachable = (on: string) => workflow(on, runsOnJob(PROXMOX));
const caller = (on: string) =>
  workflow(on, "    uses: ./.github/workflows/ci.yml", "call");

describe("#2180 criterion 4: R2 rejects unmodelled triggers, naming them", () => {
  for (const trigger of Object.keys(BANNED)) {
    describe(trigger, () => {
      for (const file of ["ci.yml", "ci-integration.yml"]) {
        it(`added to ${file}`, async () => {
          const g = await guard();
          const tree = mutated(file, "\non:", `\non:${block(trigger)}`);
          const problems = g.selfHostedRunnerProblems(tree);
          expectProblem(problems, file, 2, "on", trigger);
        });
      }
      it("added to a new reachable workflow (not tied to file names)", async () => {
        const g = await guard();
        const on = `\n  pull_request:${block(trigger)}`;
        const tree = treeWith("runner-probe.yml", reachable(on));
        const problems = g.selfHostedRunnerProblems(tree);
        expectProblem(problems, "runner-probe.yml", 2, "on", trigger);
      });
      it("added to a hosted caller of ci.yml", async () => {
        const g = await guard();
        const on = `\n  pull_request:${block(trigger)}`;
        const tree = treeWith("caller.yml", caller(on));
        const problems = g.selfHostedRunnerProblems(tree);
        expectProblem(problems, "caller.yml", 2, "on", trigger);
      });
    });
  }
  it("string form `on: pull_request_target` on a reachable workflow", async () => {
    const g = await guard();
    const tree = treeWith("runner-probe.yml", reachable("pull_request_target"));
    const problems = g.selfHostedRunnerProblems(tree);
    expectProblem(problems, "runner-probe.yml", 2, "on", "pull_request_target");
  });
  it("list form `on: [push, issue_comment]` on a reachable workflow", async () => {
    const g = await guard();
    const tree = treeWith(
      "runner-probe.yml",
      reachable("[push, issue_comment]"),
    );
    const problems = g.selfHostedRunnerProblems(tree);
    expectProblem(problems, "runner-probe.yml", 2, "on", "issue_comment");
  });
  it("control: modelled triggers on a reachable workflow raise no R2", async () => {
    const g = await guard();
    const on = "[merge_group, pull_request, push, workflow_dispatch]";
    const tree = treeWith("runner-probe.yml", reachable(on));
    const problems = g.selfHostedRunnerProblems(tree);
    expect(matching(problems, "runner-probe.yml", 2)).toEqual([]);
    expectProblem(problems, "runner-probe.yml", 1, "probe");
  });
  it("control: hosted, non-calling workflows may use workflow_call (shadscan.yml)", async () => {
    const g = await guard();
    expect(realTree()["shadscan.yml"]).toContain("workflow_call:");
    expect(g.selfHostedRunnerProblems(realTree())).toEqual([]);
  });
});
