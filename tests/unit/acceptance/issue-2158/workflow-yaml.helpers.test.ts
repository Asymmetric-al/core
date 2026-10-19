/**
 * Unit tests for issue #2158 acceptance helpers (negative fixtures + invariants).
 */

import { describe, expect, it } from "vitest";

import {
  FORK_FAIL_MESSAGE,
  ciGateFailsClosedWhenHeavyNeedsSkippedOnFork,
  containsSameRepoGuard,
  hostedGateFailsClosedWhenHeavyNeedsSkipped,
  requiredJobFailsClosedOnFork,
  type WorkflowJob,
} from "./workflow-yaml";

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
