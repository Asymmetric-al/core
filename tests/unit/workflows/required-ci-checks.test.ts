/**
 * A required status check must not be able to pass while the work it stands
 * for failed. This replaces the retired workflow fingerprints (#2706): it
 * reads the workflow structure, so comments, reordering and new steps pass,
 * while making a required job non-blocking fails.
 */
import { describe, expect, it } from "vitest";

import {
  CI,
  CII,
  requiredCheckProblems,
  type Workflows,
} from "../helpers/required-ci-checks";
import {
  loadWorkflowDocument,
  parseWorkflowSource,
  type WorkflowJob,
  type WorkflowStep,
} from "../helpers/workflow-yaml";

const CI_FIXTURE = `
jobs:
  compilation-plan:
    steps:
      - run: node plan.mjs
  lint:
    steps:
      - run: bun run lint
      - name: Affected lint on pull requests
        if: github.event_name == 'pull_request'
        run: bun run lint:affected
      - name: Full lint on pushes
        if: github.event_name != 'pull_request'
        run: bun run lint:full
  test-unit:
    steps:
      - run: bun run test:unit
  shadscan-report:
    needs: [lint]
    uses: ./.github/workflows/shadscan.yml
  ci-gate:
    if: always()
    needs: [compilation-plan, lint, test-unit]
    steps:
      - name: Validate
        env:
          CI_RESULTS: '{"plan":"\${{ needs.compilation-plan.result }}","lint":"\${{ needs.lint.result }}","unit":"\${{ needs.test-unit.result }}"}'
        run: node scripts/verify/ci-build-policy.mjs --gate
  ci-gate-comment:
    needs: [ci-gate]
    steps:
      - continue-on-error: true
        run: gh pr comment || true
`;

const CII_FIXTURE = `
jobs:
  migrate:
    steps:
      - name: Reject fork pull requests
        if: >-
          github.event_name == 'pull_request' &&
          github.event.pull_request.head.repo.full_name != github.repository
        run: |
          echo "fork PRs need a maintainer to run CI"
          exit 1
      - run: psql -f migrations.sql
      - name: Verify tenant isolation (real stack)
        run: bun x vitest run tests/unit/a.realstack.test.ts
  smoke:
    needs: migrate
    if: >-
      always() &&
      (needs.migrate.result == 'success' ||
        (github.event_name == 'pull_request' &&
          github.event.pull_request.head.repo.full_name != github.repository))
    steps:
      - run: bun run start
  test-e2e-smoke:
    needs: smoke
    steps:
      - run: bun run test:e2e:smoke
      - name: Show logs on failure
        if: failure()
        run: tail -n 50 dev.log || true
  test-e2e:
    needs: [smoke, test-e2e-smoke]
    continue-on-error: \${{ github.event_name == 'pull_request' }}
    steps:
      - run: bun run test:e2e || true
  e2e-smoke-gate:
    if: always()
    needs: [migrate, smoke, test-e2e-smoke]
    steps:
      - run: |
          [ "\${{ needs.migrate.result }}" = success ] || exit 1
          [ "\${{ needs.smoke.result }}" = success ] || exit 1
          [ "\${{ needs['test-e2e-smoke'].result }}" = success ] || exit 1
`;

const fixture = (): Workflows => ({
  [CI]: parseWorkflowSource(CI_FIXTURE),
  [CII]: parseWorkflowSource(CII_FIXTURE),
});

const jobOf = (w: Workflows, file: string, id: string): WorkflowJob =>
  w[file]!.jobs![id]!;

/** Problems after applying `mutate` to a fresh copy of the sound fixture. */
const problemsAfter = (mutate: (w: Workflows) => void): string[] => {
  const w = fixture();
  mutate(w);
  return requiredCheckProblems(w);
};

describe("requiredCheckProblems (fixtures)", () => {
  it("a sound pair of workflows has no problems", () => {
    expect(requiredCheckProblems(fixture())).toEqual([]);
  });

  describe("a required job or a job it needs is non-blocking", () => {
    it.each([
      [CII, "migrate"],
      [CII, "smoke"],
      [CII, "test-e2e-smoke"],
      [CII, "e2e-smoke-gate"],
      [CI, "ci-gate"],
      [CI, "lint"],
    ])("%s %s with continue-on-error: true", (file, id) => {
      const problems = problemsAfter((w) => {
        jobOf(w, file, id)["continue-on-error"] = true;
      });
      expect(problems).toEqual([
        expect.stringMatching(new RegExp(`\\b${id}\\b.*continue-on-error`)),
      ]);
    });

    it("an expression-valued continue-on-error on a needed job", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "test-e2e-smoke")["continue-on-error"] =
          "${{ github.event_name == 'push' }}";
      });
      expect(problems).toEqual([
        expect.stringMatching(/test-e2e-smoke.*continue-on-error/),
      ]);
    });

    it("a step with continue-on-error in a job ci-gate needs", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CI, "test-unit").steps![0]!["continue-on-error"] = true;
      });
      expect(problems).toEqual([
        expect.stringMatching(/test-unit.*step.*continue-on-error/),
      ]);
    });

    it("continue-on-error: false is allowed", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "migrate")["continue-on-error"] = false;
        jobOf(w, CII, "migrate").steps![2]!["continue-on-error"] = false;
      });
      expect(problems).toEqual([]);
    });
  });

  describe("a run line swallows failure", () => {
    it.each(["|| true", "|| :", "|| exit 0", "||true"])(
      "a smoke step ending in %s",
      (tail) => {
        const problems = problemsAfter((w) => {
          jobOf(w, CII, "smoke").steps![0]!.run = `bun run start ${tail}`;
        });
        expect(problems).toEqual([
          expect.stringMatching(/smoke.*swallows failure/),
        ]);
      },
    );

    it("a swallowed line inside a multi-line real-stack step", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "migrate").steps![2]!.run =
          "set -e\nbun x vitest run tests/unit/a.realstack.test.ts || true\necho done";
      });
      expect(problems).toEqual([
        expect.stringMatching(/migrate.*swallows failure/),
      ]);
    });

    // #2706 review: each of these passed the end-of-line pattern.
    it.each([
      "bun run start || true # flaky",
      "(bun run start || true)",
      "bun run start || echo failed",
      "bun run start || printf 'start failed\\n'",
      "bun run start || /bin/true",
      "bun run start; true",
      "bun run start || true; echo ok",
      "set +e\nbun run start",
      "set +o errexit\nbun run start",
      "bun run start || { echo failed; }",
      "bun run start ||\n  true",
      "bun run start \\\n  || true",
      "bun run start 2>&1 || true",
      // #2716 review: a bare exit after a command that succeeded exits 0.
      "bun run start || { echo failed; exit; }",
      "bun run start || (echo failed; exit)",
      // Bash -e does not stop at a failure inside an && list, so a later
      // `; true` does swallow it.
      "bun run start && echo started; true",
    ])("a smoke step running %j", (run) => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "smoke").steps![0]!.run = run;
      });
      expect(problems).toEqual([
        expect.stringMatching(/smoke.*swallows failure/),
      ]);
    });

    it.each([
      "bun run start || exit 1",
      "bun run start || exit",
      // A bare exit first in the group still carries the failed status.
      "bun run start || { exit; }",
      'bun run start || { echo "start failed"; exit 1; }',
      "bun run start || {\n  echo start failed\n  exit 1\n}",
      "bun run start || (echo failed; false)",
      'echo "a || true" && bun run start',
      "bun run start # || true",
      'if [ "$a" = b ] || [ "$c" = d ]; then exit 1; fi',
      "[[ $a == b || $c == d ]] && bun run start",
      "echo \"${{ needs.migrate.result || 'none' }}\"\nbun run start",
      "bun run start\nexit 0",
    ])("a smoke step running %j is allowed", (run) => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "smoke").steps![0]!.run = run;
      });
      expect(problems).toEqual([]);
    });

    it("`|| exit 1` and a failure()-only diagnostic step are allowed", () => {
      // The fixture's e2e-smoke-gate uses `|| exit 1`, and its
      // test-e2e-smoke log step (if: failure()) ends in `|| true`.
      expect(requiredCheckProblems(fixture())).toEqual([]);
    });
  });

  describe("a step or a required job can be skipped", () => {
    it.each<[string, WorkflowStep["if"]]>([
      ["if: false", false],
      ["if: ${{ false }}", "${{ false }}"],
      ["a condition no modelled event meets", "github.event_name == 'release'"],
      ["!always()", "${{ !always() }}"],
    ])("a real-stack step with %s never runs", (_label, condition) => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "migrate").steps![2]!.if = condition;
      });
      expect(problems).toEqual([
        expect.stringMatching(/migrate.*Verify tenant isolation.*never runs/),
      ]);
    });

    it("a step that never runs in a job ci-gate needs", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CI, "test-unit").steps![0]!.if = false;
      });
      expect(problems).toEqual([
        expect.stringMatching(/test-unit.*never runs/),
      ]);
    });

    it("event-scoped, always() and fork-reject steps are allowed", () => {
      // The fixture's lint pair runs on pull requests or on pushes, and the
      // migrate reject step runs only on fork pull requests.
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "smoke").steps![0]!.if = "always()";
      });
      expect(problems).toEqual([]);
    });

    it.each<[string, WorkflowJob["if"]]>([
      ["if: false", false],
      ["pull requests only", "github.event_name == 'pull_request'"],
      ["no merge queue", "github.event_name != 'merge_group'"],
      ["an unmodelled context", "vars.RUN_MIGRATE == 'true'"],
    ])("a job-level %s on migrate", (_label, condition) => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "migrate").if = condition;
      });
      expect(problems).toEqual([expect.stringMatching(/migrate.*job if/)]);
    });

    it("a job-level condition that skips smoke on pushes", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "smoke").if =
          "always() && needs.migrate.result == 'success' && github.event_name != 'push'";
      });
      expect(problems).toEqual([expect.stringMatching(/smoke.*job if/)]);
    });

    it.each([
      [CII, "migrate"],
      [CII, "test-e2e-smoke"],
      [CI, "lint"],
    ])("%s %s turned into a reusable-workflow call", (file, id) => {
      const problems = problemsAfter((w) => {
        const job = jobOf(w, file, id);
        delete job.steps;
        job.uses = `./.github/workflows/${id}.yml`;
      });
      expect(problems).toEqual([
        expect.stringMatching(new RegExp(`\\b${id}\\b.*reusable workflow`)),
      ]);
    });
  });

  describe("a gate stops gating", () => {
    it("ci-gate drops a job it is meant to gate", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CI, "ci-gate").needs = ["compilation-plan", "test-unit"];
      });
      expect(problems).toContainEqual(
        expect.stringMatching(/ci-gate does not need lint/),
      );
    });

    it("a new ci.yml job that ci-gate does not need", () => {
      const problems = problemsAfter((w) => {
        w[CI]!.jobs!["typecheck"] = { steps: [{ run: "bun run typecheck" }] };
      });
      expect(problems).toEqual([
        expect.stringMatching(/ci-gate does not need typecheck/),
      ]);
    });

    it("ci-gate needs a job but never reads its result", () => {
      const problems = problemsAfter((w) => {
        const step = jobOf(w, CI, "ci-gate").steps![0]!;
        step.env = {
          CI_RESULTS:
            '{"plan":"${{ needs.compilation-plan.result }}","unit":"${{ needs.test-unit.result }}"}',
        };
      });
      expect(problems).toEqual([
        expect.stringMatching(/ci-gate never reads needs\.lint\.result/),
      ]);
    });

    // #2716 review: reading a result in a log line does not make the gate
    // fail. The gate script is run for each outcome of the jobs it gates.
    it.each([
      [
        "only logs the results",
        'echo "migrate: ${{ needs.migrate.result }}"\necho "smoke: ${{ needs.smoke.result }}"\necho "test-e2e-smoke: ${{ needs[\'test-e2e-smoke\'].result }}"',
      ],
      [
        "tests a result but never exits non-zero",
        '[ "${{ needs.migrate.result }}" = success ] || exit 1\n[ "${{ needs.smoke.result }}" = success ] || exit 1\nif [ "${{ needs[\'test-e2e-smoke\'].result }}" != success ]; then echo "E2E smoke failed"; fi',
      ],
    ])("e2e-smoke-gate %s", (_label, run) => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "e2e-smoke-gate").steps![0]!.run = run;
      });
      expect(problems).toContainEqual(
        expect.stringMatching(
          /e2e-smoke-gate: gate passes when test-e2e-smoke failure/,
        ),
      );
    });

    it("e2e-smoke-gate drops test-e2e-smoke", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "e2e-smoke-gate").needs = ["migrate", "smoke"];
      });
      expect(problems).toContainEqual(
        expect.stringMatching(/e2e-smoke-gate does not need test-e2e-smoke/),
      );
    });

    it("a gate that can be skipped (no always())", () => {
      const problems = problemsAfter((w) => {
        jobOf(w, CII, "e2e-smoke-gate").if = "success()";
      });
      expect(problems).toEqual([
        expect.stringMatching(/e2e-smoke-gate.*always\(\)/),
      ]);
    });
  });

  describe("a required job id disappears", () => {
    it.each([
      [CII, "smoke"],
      [CII, "migrate"],
      [CI, "ci-gate"],
      [CII, "e2e-smoke-gate"],
    ])("%s loses %s", (file, id) => {
      const problems = problemsAfter((w) => {
        const jobs = w[file]!.jobs!;
        jobs[`${id}-renamed`] = jobs[id]!;
        delete jobs[id];
      });
      expect(problems).toContainEqual(
        expect.stringMatching(new RegExp(`required job ${id} is missing`)),
      );
    });
  });

  it("advisory jobs outside every required closure may be non-blocking", () => {
    // test-e2e (continue-on-error on develop) and ci-gate-comment are not
    // required checks and no required check needs them.
    const problems = problemsAfter((w) => {
      jobOf(w, CII, "test-e2e")["continue-on-error"] = true;
      jobOf(w, CI, "ci-gate-comment")["continue-on-error"] = true;
    });
    expect(problems).toEqual([]);
  });
});

describe("the real workflows", () => {
  it("every required check on develop stays blocking", () => {
    const workflows: Workflows = {
      [CI]: loadWorkflowDocument(CI),
      [CII]: loadWorkflowDocument(CII),
    };
    expect(requiredCheckProblems(workflows)).toEqual([]);
  });
});
