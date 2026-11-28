import { readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  allSteps,
  loadWorkflowDocument,
  parseWorkflowSource,
  workflowJobs,
  type WorkflowJob,
  type WorkflowStep,
} from "../helpers/workflow-yaml";

const WORKFLOW_DIR = ".github/workflows";
const RUNTIME_GUARD = "node scripts/verify/bun-version.mjs --runtime";
const RUNTIME_COMMAND =
  /(?:^|[\s;&|(`"'$])(?:bun|bunx|node|npm|npx|pnpm|yarn)(?=[\s;&|)`"']|$)/m;
const REPOSITORY_SCRIPT =
  /(?:^|[\s;&|(`"'$])(?:(?:bash|sh|source|\.)\s+(?:\.\/)?[\w.-]+\/[\w./-]+|\.\/[\w.-]+)/m;
const DATABASE_COMMAND =
  /supabase-migrations\.mjs|cms:migrate|schema-fingerprint\.mjs|release-database\.mjs/;

const isSupabaseCli = (step: WorkflowStep) =>
  typeof step.uses === "string" && step.uses.startsWith("supabase/setup-cli@");

const isRepositoryBun = (step: WorkflowStep) =>
  typeof step.uses === "string" &&
  step.uses.startsWith("oven-sh/setup-bun@") &&
  step.with?.["bun-version"] === "${{ env.BUN_VERSION }}";

const isRuntimeGuard = (step: WorkflowStep) =>
  typeof step.run === "string" && step.run.trim() === RUNTIME_GUARD;

function runsRepositoryCode(step: WorkflowStep): boolean {
  if (typeof step.uses === "string") return step.uses.startsWith("./");
  const run = typeof step.run === "string" ? step.run : "";
  return RUNTIME_COMMAND.test(run) || REPOSITORY_SCRIPT.test(run);
}

function lastIndex(
  steps: WorkflowStep[],
  test: (step: WorkflowStep) => boolean,
): number {
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    if (test(steps[index]!)) return index;
  }
  return -1;
}

function stepLabel(steps: WorkflowStep[], index: number): string {
  const step = steps[index]!;
  const name = step.name ?? step.uses ?? step.run?.split("\n")[0] ?? "";
  return `step ${index + 1} (${name})`;
}

function runtimeOrderProblems(job: WorkflowJob): string[] {
  const steps = allSteps(job);
  const cli = lastIndex(steps, isSupabaseCli);
  if (cli < 0) return [];

  const problems: string[] = [];
  const bun = lastIndex(steps, isRepositoryBun);
  if (bun < cli) {
    problems.push(
      "the repository's oven-sh/setup-bun step does not come after the last supabase/setup-cli step",
    );
  }

  const guards = steps.flatMap((step, index) =>
    isRuntimeGuard(step) ? [index] : [],
  );
  if (guards.length !== 1) {
    problems.push(
      `${guards.length} steps run "${RUNTIME_GUARD}", expected exactly one`,
    );
    return problems;
  }

  const guard = guards[0]!;
  const guardStep = steps[guard]!;
  if (guard < cli || guard < bun) {
    problems.push(
      "the runtime guard runs before the Supabase CLI and the repository's Bun are set up",
    );
  }
  if (
    guardStep.if !== undefined ||
    guardStep["continue-on-error"] !== undefined
  ) {
    problems.push(
      "the runtime guard has a condition or continue-on-error, so it may not stop the job",
    );
  }
  const early = steps.findIndex(
    (step, index) => index < guard && runsRepositoryCode(step),
  );
  if (early >= 0) {
    problems.push(
      `${stepLabel(steps, early)} runs repository code before the runtime guard`,
    );
  }
  return problems;
}

const jobsWithSupabaseCli = readdirSync(WORKFLOW_DIR)
  .filter((file) => /\.ya?ml$/.test(file))
  .sort()
  .flatMap((file) =>
    Object.entries(
      workflowJobs(loadWorkflowDocument(`${WORKFLOW_DIR}/${file}`), file),
    )
      .filter(([, job]) => allSteps(job).some(isSupabaseCli))
      .map(([id, job]) => ({ where: `${file} ${id}`, job })),
  );

describe("the repository's Bun after supabase/setup-cli (AL-2671, release 7)", () => {
  it("finds every job that sets up the Supabase CLI", () => {
    expect(jobsWithSupabaseCli.map(({ where }) => where)).toEqual(
      expect.arrayContaining([
        "local-supabase.yml local-supabase",
        "qa-smoke-preview-deploy.yml preview-database",
        "release.yml database",
      ]),
    );
  });

  it.each(jobsWithSupabaseCli.map(({ where, job }) => [where, job] as const))(
    "%s installs the repository's Bun after the Supabase CLI and checks the runtime before any repository code",
    (_where, job) => {
      expect(runtimeOrderProblems(job)).toEqual([]);
    },
  );

  it("checks the release job's runtime before its first database step", () => {
    const jobs = workflowJobs(
      loadWorkflowDocument(`${WORKFLOW_DIR}/release.yml`),
      "release.yml",
    );
    const steps = allSteps(jobs.database!);
    const guard = steps.findIndex(isRuntimeGuard);
    const firstDatabase = steps.findIndex((step) =>
      DATABASE_COMMAND.test(typeof step.run === "string" ? step.run : ""),
    );
    const migrate = steps.findIndex(
      (step) =>
        typeof step.run === "string" &&
        step.run.includes("scripts/release/release-database.mjs migrate"),
    );

    expect(steps[firstDatabase]?.name).toBe(
      "Replay every migration on a fresh database",
    );
    expect(guard).toBeGreaterThanOrEqual(0);
    expect(guard).toBeLessThan(firstDatabase);
    expect(guard).toBeLessThan(migrate);
  });
});

describe("the runtime order check", () => {
  const job = (steps: string) =>
    workflowJobs(
      parseWorkflowSource(
        `on: push\njobs:\n  release:\n    runs-on: ubuntu-latest\n    steps:\n${steps}`,
      ),
    ).release!;
  const checkout =
    "      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1\n";
  const pin =
    '      - name: Read the pinned Supabase CLI version\n        run: |\n          version="$(sed -n \'s/^x$/y/p\' scripts/supabase-cli.mjs)"\n          test -n "$version"\n';
  const cli =
    "      - uses: supabase/setup-cli@45a513f8c64c0bc8e0e3dfe572b5c95be85f6359\n        with:\n          version: 2.121.0\n";
  const bun =
    "      - uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6\n        with:\n          bun-version: ${{ env.BUN_VERSION }}\n";
  const guard = `      - name: Require the repository's Bun and Node.js\n        run: ${RUNTIME_GUARD}\n`;
  const canvas =
    "      - name: Install system dependencies (canvas)\n        run: bash scripts/github/install-canvas-deps.sh\n";
  const install =
    "      - name: Install dependencies\n        run: bun ci --no-cache --backend=copyfile\n";

  it("passes the order that installs the repository's Bun last and checks it first", () => {
    expect(
      runtimeOrderProblems(
        job(checkout + pin + cli + bun + guard + canvas + install),
      ),
    ).toEqual([]);
  });

  it("refuses release 7's order, where the Supabase CLI's Bun replaced the repository's", () => {
    expect(
      runtimeOrderProblems(job(checkout + bun + install + pin + cli + guard)),
    ).toEqual([
      "the repository's oven-sh/setup-bun step does not come after the last supabase/setup-cli step",
      "step 3 (Install dependencies) runs repository code before the runtime guard",
    ]);
  });

  it("refuses a guard that runs before the Supabase CLI replaces Bun", () => {
    expect(
      runtimeOrderProblems(job(checkout + guard + cli + bun + install)),
    ).toEqual([
      "the runtime guard runs before the Supabase CLI and the repository's Bun are set up",
    ]);
  });

  it("refuses a repository script that runs before the guard", () => {
    expect(
      runtimeOrderProblems(
        job(checkout + canvas + cli + bun + guard + install),
      ),
    ).toEqual([
      "step 2 (Install system dependencies (canvas)) runs repository code before the runtime guard",
    ]);
  });

  it("refuses a job with no guard, and a guard that cannot stop the job", () => {
    expect(runtimeOrderProblems(job(checkout + cli + bun + install))).toEqual([
      `0 steps run "${RUNTIME_GUARD}", expected exactly one`,
    ]);
    expect(
      runtimeOrderProblems(
        job(
          checkout +
            cli +
            bun +
            `      - continue-on-error: true\n        run: ${RUNTIME_GUARD}\n` +
            install,
        ),
      ),
    ).toEqual([
      "the runtime guard has a condition or continue-on-error, so it may not stop the job",
    ]);
  });

  it("leaves a job without the Supabase CLI to the Bun pin check", () => {
    expect(runtimeOrderProblems(job(checkout + bun + install))).toEqual([]);
  });
});
