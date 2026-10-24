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

/**
 * Slot each problem must carry (Scope ruling, #2180 gap 5): "job" means the
 * subject's job id, "on" means workflow-scoped, a literal names another job,
 * and undefined leaves the slot open (not ruled).
 */
type Slot = "job" | "on" | "local" | undefined;
const MUTATIONS: [label: string, edit: (s: string) => string, slot: Slot][] = [
  [
    "(a) proxmox runs-on",
    (s) => mutate(s, JOB_RUNS_ON, `    runs-on: ${PROXMOX}\n`),
    "job",
  ],
  ["(b) checkout", step(`      - uses: ${CHECKOUT} # v7.0.1`), "job"],
  [
    "(b) checkout at ref: develop",
    step(
      `      - uses: ${CHECKOUT}\n        with:\n          ref: develop\n          persist-credentials: false`,
    ),
    "job",
  ],
  [
    "(b) checkout at the head sha",
    step(
      `      - uses: actions/checkout@v4\n        with:\n          ref: \${{ github.event.pull_request.head.sha }}`,
    ),
    "job",
  ],
  [
    "(b) local uses: ./ action",
    step("      - uses: ./.github/actions/setup"),
    "job",
  ],
  [
    "(b) local reusable workflow job",
    (s) =>
      mutate(
        s,
        "\njobs:\n",
        "\njobs:\n  local:\n    uses: ./.github/workflows/shadscan.yml\n",
      ),
    "local",
  ],
  [
    "(b) download-artifact",
    step(
      "      - uses: actions/download-artifact@v4\n        with:\n          name: build",
    ),
    "job",
  ],
  ["(b) gh run download", run("$(gh run download 1 -n build)"), "job"],
  [
    "(c) actions/cache",
    step(
      "      - uses: actions/cache@v4\n        with:\n          path: node_modules\n          key: k",
    ),
    "job",
  ],
  [
    "(c) setup-node with cache:",
    step(
      `      - uses: ${SETUP_NODE}\n        with:\n          node-version: "24.22.1"\n          cache: npm`,
    ),
    "job",
  ],
  [
    "(d) top-level contents: write",
    (s) => mutate(s, TOP_PERMS, "\npermissions:\n  contents: write\n"),
    "on",
  ],
  [
    "(d) missing top-level permissions",
    (s) => mutate(s, TOP_PERMS, "\n"),
    "on",
  ],
  [
    "(d) top-level write-all",
    (s) => mutate(s, TOP_PERMS, "\npermissions: write-all\n"),
    "on",
  ],
  [
    "(d) job-level write",
    (s) =>
      mutate(
        s,
        JOB_RUNS_ON,
        `${JOB_RUNS_ON}    permissions:\n      pull-requests: write\n`,
      ),
    "job",
  ],
  [
    "(e) secrets.X reference",
    step(
      "      - name: Leak\n        env:\n          X: ${{ secrets.X }}\n        run: echo ok",
    ),
    "job",
  ],
  [
    "(e) secrets in workflow-level env",
    (s) => mutate(s, TOP_PERMS, `${TOP_PERMS}env:\n  X: \${{ secrets.X }}\n`),
    undefined,
  ],
  [
    "(e) secrets in job-level env",
    (s) =>
      mutate(
        s,
        JOB_RUNS_ON,
        `${JOB_RUNS_ON}    env:\n      X: \${{ secrets.X }}\n`,
      ),
    "job",
  ],
  [
    "(f) github.event.pull_request.title in run:",
    run("${{ github.event.pull_request.title }}"),
    "job",
  ],
  ["(f) github.head_ref in run:", run("${{ github.head_ref }}"), "job"],
  ["(f) inputs.* in run:", run("${{ inputs.name }}"), "job"],
];

describe("#2180 criterion 5: R3 privileged-trigger hygiene", () => {
  for (const [file, job, source] of SUBJECTS) {
    describe(file, () => {
      it("control: the unmutated workflow passes", async () => {
        const g = await guard();
        expect(g.selfHostedRunnerProblems(treeWith(file, source()))).toEqual(
          [],
        );
      });
      for (const [label, edit, slot] of MUTATIONS) {
        const want = slot === "job" ? job : slot;
        it(`${label} fails R3${want ? ` in slot ${want}` : ""}`, async () => {
          const g = await guard();
          const tree = treeWith(file, edit(source()));
          expectProblem(g.selfHostedRunnerProblems(tree), file, 3, want);
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
