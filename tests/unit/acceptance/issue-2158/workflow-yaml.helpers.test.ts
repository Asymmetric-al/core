/**
 * Unit tests for issue #2158 acceptance helpers (negative fixtures + invariants).
 */

import { describe, expect, it } from "vitest";

import {
  FORK_FAIL_MESSAGE,
  FORK_ONLY_STEP_GUARD,
  SAME_REPO_GUARD,
  analyzeSelfHostedForkSafety,
  ciGateFailsClosedWhenHeavyNeedsSkippedOnFork,
  containsSameRepoGuard,
  forkRejectProblems,
  hostedGateFailsClosedWhenHeavyNeedsSkipped,
  isAlwaysExpression,
  isForkAwareRunsOnExpression,
  referencesSecrets,
  renderNeedsContextExpressions,
  requiredJobFailsClosedOnFork,
  stripExpressionWrapper,
  type WorkflowJob,
} from "./workflow-yaml";

const G = SAME_REPO_GUARD;
const FORK_AWARE_RUNS_ON = `\${{ ${FORK_ONLY_STEP_GUARD} && 'ubuntu-latest' || fromJSON('["self-hosted", "linux", "x64", "proxmox"]') }}`;
const INVERTED_RUNS_ON = `\${{ ${FORK_ONLY_STEP_GUARD} && fromJSON('["self-hosted", "linux", "x64", "proxmox"]') || 'ubuntu-latest' }}`;
const REJECT_STEP = {
  name: "Reject fork pull requests",
  if: FORK_ONLY_STEP_GUARD,
  run: `echo "${FORK_FAIL_MESSAGE}"\nexit 1`,
};

describe("containsSameRepoGuard", () => {
  it("accepts the exact spec rev 3 guard G", () => {
    expect(
      containsSameRepoGuard(
        "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository",
      ),
    ).toBe(true);
  });

  it("rejects an inverted fork guard with !=", () => {
    expect(
      containsSameRepoGuard(
        "github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository",
      ),
    ).toBe(false);
  });

  it("accepts G as one conjunct of a larger && chain, with or without ${{ }}", () => {
    expect(
      containsSameRepoGuard(
        `\${{ needs.compilation-plan.outputs.requested == 'true' && (${G}) }}`,
      ),
    ).toBe(true);
    expect(containsSameRepoGuard(`\${{ ${G} }}`)).toBe(true);
  });

  it.each([
    ["true || G", `true || (${G})`],
    ["G || true", `(${G}) || true`],
    ["always() || G", `always() || (${G})`],
    ["X || G inside &&", `always() && (needs.a.result == 'success' || (${G}))`],
    ["!G", `!(${G})`],
  ])(
    "rejects %s structurally (G is not a necessary condition)",
    (_label, expr) => {
      expect(containsSameRepoGuard(expr)).toBe(false);
    },
  );

  it("rejects a bare github.repository mention without guard G", () => {
    expect(
      containsSameRepoGuard(
        "needs.compilation-plan.outputs.requested == 'true' && github.repository",
      ),
    ).toBe(false);
  });
});

describe("ciGateFailsClosedWhenHeavyNeedsSkippedOnFork", () => {
  const validCiGate: WorkflowJob = {
    if: "always()",
    needs: [
      "compilation-plan",
      "format",
      "integrity",
      "lint",
      "typecheck",
      "build",
      "test-unit",
    ],
    steps: [
      {
        name: "Validate correctness checks and requested compilation",
        env: {
          CI_BUILD_REQUESTED: "${{ needs.compilation-plan.outputs.requested }}",
          CI_RESULTS:
            '{"plan":"${{ needs.compilation-plan.result }}","format":"${{ needs.format.result }}","integrity":"${{ needs.integrity.result }}","lint":"${{ needs.lint.result }}","typecheck":"${{ needs.typecheck.result }}","unit":"${{ needs.test-unit.result }}","build":"${{ needs.build.result }}"}',
        },
        run: "node scripts/verify/ci-build-policy.mjs --gate",
      },
    ],
  };

  it("passes for a workflow that delegates to ci-build-policy --gate", () => {
    expect(ciGateFailsClosedWhenHeavyNeedsSkippedOnFork(validCiGate)).toBe(
      true,
    );
  });

  it("accepts PR A two-arg call listing build and test-unit", () => {
    expect(
      ciGateFailsClosedWhenHeavyNeedsSkippedOnFork(validCiGate, [
        "build",
        "test-unit",
      ]),
    ).toBe(true);
  });

  it("fails when requiredNeeds omits a heavy need", () => {
    expect(
      ciGateFailsClosedWhenHeavyNeedsSkippedOnFork(validCiGate, ["build"]),
    ).toBe(false);
  });

  it("fails when the gate only echoes", () => {
    const echoGate: WorkflowJob = {
      if: "always()",
      needs: ["build", "test-unit"],
      steps: [{ run: 'echo "ci-gate"' }],
    };
    expect(ciGateFailsClosedWhenHeavyNeedsSkippedOnFork(echoGate)).toBe(false);
  });
});

describe("hostedGateFailsClosedWhenHeavyNeedsSkipped", () => {
  const shellGate: WorkflowJob = {
    if: "always()",
    needs: ["test-e2e-smoke"],
    steps: [
      {
        run: `if [ "\${{ needs['test-e2e-smoke'].result }}" != "success" ]; then
  echo "E2E smoke gate failed."
  exit 1
fi`,
      },
    ],
  };

  it("executes shell and fails when a heavy need was skipped", () => {
    expect(
      hostedGateFailsClosedWhenHeavyNeedsSkipped(shellGate, ["test-e2e-smoke"]),
    ).toBe(true);
  });

  it("fails when the gate only echoes", () => {
    const echoGate: WorkflowJob = {
      if: "always()",
      needs: ["test-e2e-smoke"],
      steps: [{ run: 'echo "ok"' }],
    };
    expect(
      hostedGateFailsClosedWhenHeavyNeedsSkipped(echoGate, ["test-e2e-smoke"]),
    ).toBe(false);
  });
});

describe("requiredJobFailsClosedOnFork", () => {
  const validForkFailJob: WorkflowJob = {
    "runs-on":
      '${{ github.event_name == \'pull_request\' && github.event.pull_request.head.repo.full_name != github.repository && \'ubuntu-latest\' || fromJSON(\'["self-hosted", "linux", "x64", "proxmox"]\') }}',
    steps: [
      {
        name: "Reject fork pull requests",
        if: "github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name != github.repository",
        run: `echo "${FORK_FAIL_MESSAGE}"\nexit 1`,
      },
    ],
  };

  it("passes when fork step echoes message and exits 1 under fork guard", () => {
    expect(requiredJobFailsClosedOnFork(validForkFailJob)).toBe(true);
  });

  it("fails when only the step name mentions fork", () => {
    const nameOnly: WorkflowJob = {
      "runs-on":
        '${{ github.event_name == \'pull_request\' && github.event.pull_request.head.repo.full_name != github.repository && \'ubuntu-latest\' || fromJSON(\'["self-hosted", "linux", "x64", "proxmox"]\') }}',
      steps: [
        {
          name: "Detect fork",
          run: 'echo "noop"',
        },
      ],
    };
    expect(requiredJobFailsClosedOnFork(nameOnly)).toBe(false);
  });
});

describe("renderNeedsContextExpressions", () => {
  it("renders needs results and outputs", () => {
    expect(
      renderNeedsContextExpressions(
        '{"unit":"${{ needs.test-unit.result }}"} ${{ needs.compilation-plan.outputs.requested }}',
        {
          results: { "test-unit": "skipped" },
          outputs: { "compilation-plan": { requested: "true" } },
        },
      ),
    ).toBe('{"unit":"skipped"} true');
  });

  it("throws when a need result is not supplied", () => {
    expect(() =>
      renderNeedsContextExpressions("${{ needs.build.result }}", {
        results: {},
      }),
    ).toThrow(/needs\.build/);
  });

  it("throws when a non-needs expression would be left unrendered", () => {
    expect(() =>
      renderNeedsContextExpressions("${{ github.event_name }}", {
        results: {},
      }),
    ).toThrow(/Unrendered expression/);
  });
});

describe("stripExpressionWrapper", () => {
  it("removes one ${{ }} wrapper and normalizes whitespace", () => {
    expect(stripExpressionWrapper("${{  a ==\n  'b' }}")).toBe("a == 'b'");
  });

  it("leaves bare expressions unchanged apart from whitespace", () => {
    expect(stripExpressionWrapper("  always() ")).toBe("always()");
  });
});

describe("isAlwaysExpression", () => {
  it.each(["always()", "${{ always() }}", " always( ) "])(
    "accepts %j",
    (expr) => {
      expect(isAlwaysExpression(expr)).toBe(true);
    },
  );

  it.each([
    "always() && false",
    "!always()",
    "success() || always()",
    "always() && needs.a.result == 'success'",
    "'always()'",
    "",
    undefined,
  ])("rejects %j", (expr) => {
    expect(isAlwaysExpression(expr)).toBe(false);
  });
});

describe("isForkAwareRunsOnExpression (evaluated per event)", () => {
  it("accepts the fork -> ubuntu-latest / same-repo -> proxmox ternary", () => {
    expect(isForkAwareRunsOnExpression(FORK_AWARE_RUNS_ON)).toBe(true);
  });

  it.each([
    ["inverted ternary", INVERTED_RUNS_ON],
    [
      "same-repo condition instead of fork condition",
      `\${{ (${G}) && 'ubuntu-latest' || fromJSON('["self-hosted", "linux", "x64", "proxmox"]') }}`,
    ],
    [
      "fork goes to self-hosted ubuntu label",
      `\${{ ${FORK_ONLY_STEP_GUARD} && fromJSON('["self-hosted", "ubuntu-latest"]') || fromJSON('["self-hosted", "linux", "x64", "proxmox"]') }}`,
    ],
    [
      "same-repo misses the proxmox label",
      `\${{ ${FORK_ONLY_STEP_GUARD} && 'ubuntu-latest' || fromJSON('["self-hosted", "linux", "x64"]') }}`,
    ],
    [
      "substrings only (old helper accepted this)",
      "${{ 'pull_request head.repo.full_name ubuntu-latest self-hosted proxmox' }}",
    ],
    ["static labels", ["self-hosted", "linux", "x64", "proxmox"]],
  ])("rejects %s", (_label, runsOn) => {
    expect(isForkAwareRunsOnExpression(runsOn)).toBe(false);
  });
});

describe("referencesSecrets", () => {
  it.each([
    ["secrets.X", { env: { A: "${{ secrets.X }}" } }],
    ["secrets['X']", { with: { token: "${{ secrets['X'] }}" } }],
    ["github.token", { with: { token: "${{ github.token }}" } }],
    ["github['token']", { env: { T: "${{ github['token'] }}" } }],
    ["inside run", { run: 'echo "${{ format(secrets.X) }}"' }],
    ["secrets: inherit", { uses: "./x.yml", secrets: "inherit" }],
  ])("detects %s", (_label, value) => {
    expect(referencesSecrets(value)).toBe(true);
  });

  it.each([
    ["plain text mentioning secrets", { run: "echo secrets are not here" }],
    ["vars context", { env: { A: "${{ vars.X }}" } }],
    ["github.repository", { env: { A: "${{ github.repository }}" } }],
  ])("ignores %s", (_label, value) => {
    expect(referencesSecrets(value)).toBe(false);
  });
});

describe("fork-reject step ordering and job-level secrets", () => {
  const forkJob = (overrides: Partial<WorkflowJob>): WorkflowJob => ({
    "runs-on": FORK_AWARE_RUNS_ON,
    steps: [REJECT_STEP, { uses: "actions/checkout@v4" }],
    ...overrides,
  });

  it("passes when the reject step is first and nothing job-level reads secrets", () => {
    expect(forkRejectProblems(forkJob({}))).toEqual([]);
    expect(requiredJobFailsClosedOnFork(forkJob({}))).toBe(true);
  });

  it("fails when a secret-using step precedes the reject step", () => {
    const job = forkJob({
      steps: [
        { run: "echo ok", env: { T: "${{ secrets.TURBO_TOKEN }}" } },
        REJECT_STEP,
      ],
    });
    expect(forkRejectProblems(job).join("\n")).toMatch(/not the first step/);
    expect(forkRejectProblems(job).join("\n")).toMatch(/references secrets/);
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it("fails when any step (even without secrets) precedes the reject step", () => {
    const job = forkJob({
      steps: [{ uses: "actions/checkout@v4" }, REJECT_STEP],
    });
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it.each([
    ["env", { env: { T: "${{ secrets.TURBO_TOKEN }}" } }],
    ["services", { services: { db: { env: { P: "${{ secrets.DB }}" } } } }],
    [
      "container",
      { container: { credentials: { password: "${{ secrets.P }}" } } },
    ],
  ])("fails when job-level %s references secrets", (_label, overrides) => {
    const job = forkJob(overrides as Partial<WorkflowJob>);
    expect(forkRejectProblems(job)).toContain(
      "job-level keys reference secrets in a fork-reachable job",
    );
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it("fails when the reject step's if also matches same-repo events", () => {
    const job = forkJob({
      steps: [{ ...REJECT_STEP, if: `${FORK_ONLY_STEP_GUARD} || true` }],
    });
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });

  it("fails when the job if skips some fork events", () => {
    const job = forkJob({ if: "github.base_ref != 'production'" });
    expect(requiredJobFailsClosedOnFork(job)).toBe(false);
  });
});

describe("analyzeSelfHostedForkSafety", () => {
  const PROXMOX = ["self-hosted", "linux", "x64", "proxmox"];

  it("accepts a static self-hosted job guarded by G (fork events skip it)", () => {
    const report = analyzeSelfHostedForkSafety({
      "runs-on": PROXMOX,
      if: `\${{ ${G} }}`,
      env: { T: "${{ secrets.TURBO_TOKEN }}" },
      steps: [{ run: "echo hi" }],
    });
    expect(report).toEqual({
      forkReachable: false,
      runsForEveryFork: false,
      runsForSomeSameRepo: true,
      problems: [],
    });
  });

  it.each([
    ["no if", undefined],
    ["true || G", `\${{ true || (${G}) }}`],
    ["G || true", `\${{ (${G}) || true }}`],
    ["always() || G", `\${{ always() || (${G}) }}`],
  ])(
    "rejects a static self-hosted job whose if is %s (fork runs on proxmox)",
    (_label, ifExpr) => {
      const report = analyzeSelfHostedForkSafety({
        "runs-on": PROXMOX,
        ...(ifExpr === undefined ? {} : { if: ifExpr }),
        steps: [{ run: "echo hi" }],
      });
      expect(report.forkReachable).toBe(true);
      expect(report.problems.join("\n")).toMatch(
        /fork .* runs on \["self-hosted"/,
      );
    },
  );

  it("rejects an inverted fork-aware ternary", () => {
    const report = analyzeSelfHostedForkSafety({
      "runs-on": INVERTED_RUNS_ON,
      steps: [REJECT_STEP],
    });
    expect(report.problems.join("\n")).toMatch(/same-repo .* resolves runs-on/);
    expect(report.problems.join("\n")).toMatch(/fork .* runs on/);
  });

  it("evaluates needs results: a needs-success-only fork path is still caught", () => {
    const report = analyzeSelfHostedForkSafety({
      "runs-on": PROXMOX,
      needs: ["a"],
      if: `\${{ always() && (needs.a.result == 'success' || (${G})) }}`,
      steps: [{ run: "echo hi" }],
    });
    expect(report.forkReachable).toBe(true);
    expect(report.problems.length).toBeGreaterThan(0);
  });

  it("rejects a job that never runs for same-repo events", () => {
    const report = analyzeSelfHostedForkSafety({
      "runs-on": PROXMOX,
      if: "${{ false }}",
      steps: [{ run: "echo hi" }],
    });
    expect(report.problems).toContain("job never runs for a same-repo event");
  });
});
