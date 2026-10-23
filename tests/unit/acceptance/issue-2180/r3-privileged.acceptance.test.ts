/**
 * #2180 R3 (privileged-trigger hygiene): done criterion 5, on
 * release-source.yml and on synthetic workflows for every OQ-5 trigger.
 * Owned by Acceptance; implementers must not edit.
 */
import { describe, expect, it } from "vitest";

import {
  PROXMOX,
  expectProblem,
  guard,
  mutate,
  realTree,
  treeWith,
} from "./guard-harness";

const CHECKOUT = "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1";
const SETUP_NODE =
  "actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1";

/** A clean, hosted, read-only workflow on a privileged trigger (job `report`). */
const synthetic = (on: string, value: string) =>
  [
    "name: Synthetic",
    "on:",
    `  ${on}:${value}`,
    "permissions:",
    "  contents: read",
    "jobs:",
    "  report:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - name: Report",
    "        env:",
    "          EVENT_ACTION: ${{ github.event.action }}",
    '        run: echo "$EVENT_ACTION"',
    "",
  ].join("\n");

const SUBJECTS: [file: string, job: string, source: () => string][] = [
  [
    "release-source.yml",
    "release-source-gate",
    () => realTree()["release-source.yml"]!,
  ],
  ...(
    [
      ["workflow_run", "\n    workflows: [CI]\n    types: [completed]"],
      ["issue_comment", "\n    types: [created]"],
      ["pull_request_review", "\n    types: [submitted]"],
      ["pull_request_review_comment", "\n    types: [created]"],
    ] as const
  ).map(([on, value]): [string, string, () => string] => [
    `synthetic-${on.replaceAll("_", "-")}.yml`,
    "report",
    () => synthetic(on, value),
  ]),
];

const STEPS = "    steps:\n";
const step = (yaml: string) => (s: string) =>
  mutate(s, STEPS, `${STEPS}${yaml}\n`);
const run = (body: string) =>
  step(`      - name: Echo\n        run: echo "${body}"`);
const TOP_PERMS = "\npermissions:\n  contents: read\n";
const JOB_RUNS_ON = "    runs-on: ubuntu-latest\n";

const MUTATIONS: [label: string, edit: (s: string) => string][] = [
  [
    "(a) proxmox runs-on",
    (s) => mutate(s, JOB_RUNS_ON, `    runs-on: ${PROXMOX}\n`),
  ],
  ["(b) checkout", step(`      - uses: ${CHECKOUT} # v7.0.1`)],
  [
    "(b) checkout at ref: develop",
    step(
      `      - uses: ${CHECKOUT}\n        with:\n          ref: develop\n          persist-credentials: false`,
    ),
  ],
  [
    "(b) checkout at the head sha",
    step(
      `      - uses: actions/checkout@v4\n        with:\n          ref: \${{ github.event.pull_request.head.sha }}`,
    ),
  ],
  ["(b) local uses: ./ action", step("      - uses: ./.github/actions/setup")],
  [
    "(b) local reusable workflow job",
    (s) =>
      mutate(
        s,
        "\njobs:\n",
        "\njobs:\n  local:\n    uses: ./.github/workflows/shadscan.yml\n",
      ),
  ],
  [
    "(b) download-artifact",
    step(
      "      - uses: actions/download-artifact@v4\n        with:\n          name: build",
    ),
  ],
  ["(b) gh run download", run("$(gh run download 1 -n build)")],
  [
    "(c) actions/cache",
    step(
      "      - uses: actions/cache@v4\n        with:\n          path: node_modules\n          key: k",
    ),
  ],
  [
    "(c) setup-node with cache:",
    step(
      `      - uses: ${SETUP_NODE}\n        with:\n          node-version: "24.22.1"\n          cache: npm`,
    ),
  ],
  [
    "(d) top-level contents: write",
    (s) => mutate(s, TOP_PERMS, "\npermissions:\n  contents: write\n"),
  ],
  ["(d) missing top-level permissions", (s) => mutate(s, TOP_PERMS, "\n")],
  [
    "(d) top-level write-all",
    (s) => mutate(s, TOP_PERMS, "\npermissions: write-all\n"),
  ],
  [
    "(d) job-level write",
    (s) =>
      mutate(
        s,
        JOB_RUNS_ON,
        `${JOB_RUNS_ON}    permissions:\n      pull-requests: write\n`,
      ),
  ],
  [
    "(e) secrets.X reference",
    step(
      "      - name: Leak\n        env:\n          X: ${{ secrets.X }}\n        run: echo ok",
    ),
  ],
  [
    "(e) secrets in workflow-level env",
    (s) => mutate(s, TOP_PERMS, `${TOP_PERMS}env:\n  X: \${{ secrets.X }}\n`),
  ],
  [
    "(e) secrets in job-level env",
    (s) =>
      mutate(
        s,
        JOB_RUNS_ON,
        `${JOB_RUNS_ON}    env:\n      X: \${{ secrets.X }}\n`,
      ),
  ],
  [
    "(f) github.event.pull_request.title in run:",
    run("${{ github.event.pull_request.title }}"),
  ],
  ["(f) github.head_ref in run:", run("${{ github.head_ref }}")],
  ["(f) inputs.* in run:", run("${{ inputs.name }}")],
];

describe("#2180 criterion 5: R3 privileged-trigger hygiene", () => {
  for (const [file, , source] of SUBJECTS) {
    describe(file, () => {
      it("control: the unmutated workflow passes", async () => {
        const g = await guard();
        expect(g.selfHostedRunnerProblems(treeWith(file, source()))).toEqual(
          [],
        );
      });
      for (const [label, edit] of MUTATIONS) {
        it(`${label} fails R3`, async () => {
          const g = await guard();
          const tree = treeWith(file, edit(source()));
          expectProblem(g.selfHostedRunnerProblems(tree), file, 3);
        });
      }
    });
  }
  it("job-scoped R3 problems name the job (release-source-gate)", async () => {
    const g = await guard();
    const src = realTree()["release-source.yml"]!;
    const tree = treeWith(
      "release-source.yml",
      step(`      - uses: ${CHECKOUT}`)(src),
    );
    expectProblem(
      g.selfHostedRunnerProblems(tree),
      "release-source.yml",
      3,
      "release-source-gate",
    );
  });
  it("github.token stays allowed under read-only permissions (release-source.yml)", async () => {
    const g = await guard();
    expect(realTree()["release-source.yml"]).toContain("${{ github.token }}");
    expect(g.selfHostedRunnerProblems(realTree())).toEqual([]);
  });
});
