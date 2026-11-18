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
} from "../helpers/workflow-yaml";

const CI_FIXTURE = `
jobs:
  compilation-plan:
    steps:
      - run: node plan.mjs
  lint:
    steps:
      - run: bun run lint
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
      - run: psql -f migrations.sql
      - name: Verify tenant isolation (real stack)
        run: bun x vitest run tests/unit/a.realstack.test.ts
  smoke:
    needs: migrate
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
        jobOf(w, CII, "migrate").steps![1]!["continue-on-error"] = false;
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
        jobOf(w, CII, "migrate").steps![1]!.run =
          "set -e\nbun x vitest run tests/unit/a.realstack.test.ts || true\necho done";
      });
      expect(problems).toEqual([
        expect.stringMatching(/migrate.*swallows failure/),
      ]);
    });

    it("`|| exit 1` and a failure()-only diagnostic step are allowed", () => {
      // The fixture's e2e-smoke-gate uses `|| exit 1`, and its
      // test-e2e-smoke log step (if: failure()) ends in `|| true`.
      expect(requiredCheckProblems(fixture())).toEqual([]);
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
