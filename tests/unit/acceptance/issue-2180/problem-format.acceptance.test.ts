/**
 * #2180 done criterion 6: every problem string carries the file, the job (or
 * `on`), the rule id and the doc pointer (§1.1). Owned by Acceptance.
 */
import { describe, expect, it } from "vitest";

import {
  PROBLEM_FORMAT,
  PROXMOX,
  guard,
  mutate,
  realTree,
  runsOnJob,
  treeWith,
  workflow,
  type Workflows,
} from "./guard-harness";
import * as W from "../../helpers/workflow-yaml";

const release = () => realTree()["release-source.yml"]!;
/** One tree per rule family, each with several violations at once. */
const CORPUS: [label: string, tree: () => Workflows, rules: string[]][] = [
  [
    "R1 new proxmox workflow",
    () => treeWith("probe.yml", workflow("push", runsOnJob(PROXMOX))),
    ["1"],
  ],
  [
    "R1 .yaml file",
    () => treeWith("probe.yaml", workflow("push", runsOnJob("proxmox"))),
    ["1"],
  ],
  [
    "R1+R2 reachable on pull_request_target",
    () =>
      treeWith(
        "probe.yml",
        workflow("pull_request_target", runsOnJob(PROXMOX)),
      ),
    ["1", "2", "3"],
  ],
  [
    "R2 workflow_call on ci.yml",
    () => ({
      ...realTree(),
      "ci.yml": mutate(
        realTree()["ci.yml"]!,
        "\non:\n",
        "\non:\n  workflow_call:\n",
      ),
    }),
    ["2"],
  ],
  [
    "R3 release-source checkout + write",
    () =>
      treeWith(
        "release-source.yml",
        mutate(
          mutate(
            release(),
            "    steps:\n",
            "    steps:\n      - uses: actions/checkout@v4\n",
          ),
          "  contents: read\n",
          "  contents: write\n",
        ),
      ),
    ["3"],
  ],
];

describe("#2180 criterion 6: problem string format", () => {
  for (const [label, tree, rules] of CORPUS) {
    it(label, async () => {
      const g = await guard();
      const input = tree();
      const problems = g.selfHostedRunnerProblems(input);
      expect(problems.length).toBeGreaterThan(0);
      const seen = new Set<string>();
      for (const problem of problems) {
        const m = PROBLEM_FORMAT.exec(problem);
        expect(m, `format of ${JSON.stringify(problem)}`).not.toBeNull();
        const [, file, slot, rule] = m!;
        expect(Object.keys(input), `file in ${problem}`).toContain(file);
        const jobs = Object.keys(
          W.parseWorkflowSource(input[file!]!).jobs ?? {},
        );
        expect([...jobs, "on"], `job|on in ${problem}`).toContain(slot);
        seen.add(rule!);
      }
      for (const rule of rules) expect([...seen]).toContain(rule);
    });
  }
});
