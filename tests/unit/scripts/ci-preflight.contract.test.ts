import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  FULL_PASS_LINE,
  completionLines,
  failureLines,
  formatChunks,
  getFastStages,
  getPreflightStages,
  parsePreflightArgs,
  rerunCommand,
  selectStages,
  stagePassLine,
  touchesInputs,
} from "../../../scripts/verify/ci-preflight.mjs";

const PREFLIGHT_PATH = "scripts/verify/ci-preflight.mjs";

type Stage = {
  id: string;
  script?: string;
  runs?: Array<{ args: string[]; env?: Record<string, string> }>;
  env?: Record<string, string>;
  skip?: string;
};

const EXPECTED_STAGES: Array<{ id: string; script: string }> = [
  { id: "runtime", script: "verify:node-version" },
  { id: "format", script: "format:check" },
  { id: "skills-verify", script: "skills:verify" },
  { id: "verify-phase25-spec", script: "verify:phase25-spec" },
  { id: "verify-phase27-spec", script: "verify:phase27-spec" },
  { id: "verify-phase28-spec", script: "verify:phase28-spec" },
  { id: "openspec-validate", script: "openspec:validate" },
  { id: "verify-openspec-deltas", script: "verify:openspec-deltas" },
  { id: "lint", script: "lint" },
  { id: "verify-data-boundary", script: "verify:data-boundary" },
  {
    id: "verify-cms-public-sole-entry",
    script: "verify:cms-public-sole-entry",
  },
  { id: "verify-workspace-contract", script: "verify:workspace-contract" },
  { id: "verify-bun-lock-drift", script: "verify:bun-lock-drift" },
  { id: "verify-eslint", script: "verify:eslint" },
  { id: "verify-shadcn-config", script: "verify:shadcn-config" },
  { id: "typecheck", script: "typecheck" },
  { id: "build", script: "build" },
  { id: "test-unit", script: "test:unit" },
  { id: "acceptance", script: "test:acceptance" },
];

// The fast profile keeps the full profile's order. It leaves out the stages
// that took more than a few seconds when timed alone on the loaded Windows
// host (skills:verify 183 s, verify:eslint 54 s), and the unit, acceptance and
// build stages that required CI runs on every PR. verify:shadcn-diff, which
// no CI job runs, stays and runs only when the push changes its inputs.
const FAST_STAGE_IDS = [
  "runtime",
  "format",
  "verify-phase25-spec",
  "verify-phase27-spec",
  "verify-phase28-spec",
  "openspec-validate",
  "verify-openspec-deltas",
  "lint",
  "verify-data-boundary",
  "verify-cms-public-sole-entry",
  "verify-workspace-contract",
  "verify-bun-lock-drift",
  "verify-shadcn-config",
  "typecheck",
];

// Fast stages that run only when the push changes one of their inputs. Each
// one except verify-shadcn-diff also runs in a required CI job on every pull
// request.
const SCOPED_STAGE_IDS = [
  "verify-phase25-spec",
  "verify-phase27-spec",
  "verify-phase28-spec",
  "openspec-validate",
  "verify-openspec-deltas",
  "verify-data-boundary",
  "verify-cms-public-sole-entry",
  "verify-workspace-contract",
];

// One path each stage reads, from a trace of every file it opened.
const STAGE_INPUT_SAMPLES: Record<string, string[]> = {
  "verify-phase25-spec": [
    "docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/traceability.json",
    "docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth.md",
    "openspec/changes/add-donor-dashboard-depth/specs/donor-dashboard-depth/spec.md",
  ],
  "verify-phase27-spec": [
    "docs/prds/sitestacker-parity/phase-27-donor-development/stories.json",
    "docs/prds/sitestacker-parity/phase-27-donor-development.md",
    "openspec/changes/add-donor-development/specs/donor-development/spec.md",
    "openspec/contracts/summaries.json",
    "docs/features/donor-development/grill/phase27-grill-log.md",
    "scripts/lib/openspec-contracts.mjs",
  ],
  "verify-phase28-spec": [
    "docs/prds/sitestacker-parity/phase-28-missionary-workspace-depth/traceability.json",
    "docs/prds/sitestacker-parity/phase-28-missionary-workspace-depth.md",
    "openspec/changes/add-missionary-workspace-depth/tasks.md",
    "docs/features/missionary-workspace-depth/grill/d1-evidence/current-runtime.md",
    "scripts/git/environment.mjs",
  ],
  "openspec-validate": [
    "openspec/specs/agent-instruction-system/spec.md",
    "openspec/config.yaml",
  ],
  "verify-openspec-deltas": [
    "openspec/changes/speed-up-local-gates/proposal.md",
    "docs/adr/0185-tenant-owned-donor-portal-host.md",
    "docs/prds/sitestacker-parity/phase-24-multi-site-management.md",
    "docs/features/files-documents/CONTEXT.md",
    "docs/ai/document-authority.md",
    "scripts/verify/phase24-authority.mjs",
  ],
  "verify-data-boundary": [
    "apps/donor/lib/cms/client.ts",
    "packages/api/src/admin/comments/comment.ts",
    "scripts/cms/local-bootstrap.mjs",
    ".env.example",
  ],
  "verify-cms-public-sole-entry": [
    "apps/admin/src/cms/public/resolve-tenant.ts",
    "apps/donor/app/(public)/(hero)/about/page.tsx",
    "packages/database/collections/admin-locations.ts",
  ],
  "verify-workspace-contract": [
    "apps/admin/app/api/health/route.ts",
    "apps/missionary/app/(auth)/login/page.tsx",
    "docs/guides/architecture/runtime-map.md",
    "vendor/react-pdf-packages/asym-pdf-editor/package.json",
    "docs/maintenance/modernization/pdf-owner-release.json",
  ],
};

// A change to any of these can alter every scoped stage's result.
const SHARED_INPUT_SAMPLES = [
  "package.json",
  "apps/admin/package.json",
  "bun.lock",
  ".node-version",
  "docs/.prettierrc.json",
  "scripts/verify/ci-preflight.mjs",
];

// Full compilation of the product apps for a documentation change, so the
// operator Console (compiled only for its own inputs) adds no stage.
const FULL_DOCS_CHANGE = { full: true, changedFiles: ["docs/ci.md"] };

const AFFECTED_FILTERS = [
  "--affected",
  "--filter=./apps/*",
  "--filter=./packages/*",
  "--filter=./tooling/*",
];

const everyFileExists = () => true;

function fastStages(changedFiles: string[] | null, exists = everyFileExists) {
  return getFastStages({
    changedFiles,
    exists,
  }) as Stage[];
}

function stage(stages: Stage[], id: string): Stage {
  const found = stages.find((candidate) => candidate.id === id);
  expect(found, id).toBeDefined();
  return found as Stage;
}

function integritySteps() {
  const lines = readFileSync(".github/workflows/ci.yml", "utf8").split(/\r?\n/);
  const start = lines.indexOf("  integrity:");
  expect(start).toBeGreaterThanOrEqual(0);
  const end = lines.findIndex(
    (line, index) => index > start && /^  \S[^:]*:\s*$/.test(line),
  );
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join("\n")
    .split(/^      - /m)
    .slice(1);
}

describe("ci-preflight contract", () => {
  const source = readFileSync(PREFLIGHT_PATH, "utf8");

  it("omits compilation for routine development feedback while retaining correctness stages", () => {
    const selected = getPreflightStages({
      branch: "feature/example",
      changedFiles: ["apps/donor/app/page.tsx"],
    });
    expect(selected.map((stage: Stage) => stage.script)).toEqual(
      EXPECTED_STAGES.filter((stage) => stage.id !== "build").map(
        (stage) => stage.script,
      ),
    );
  });

  it("requests full compilation for explicit QA and production", () => {
    for (const options of [{ full: true }, { branch: "production" }]) {
      expect(
        getPreflightStages({ changedFiles: ["docs/ci.md"], ...options }).map(
          (stage: Stage) => stage.script,
        ),
      ).toContain("build");
    }
  });

  it("compiles only the operator Console for its own change", () => {
    const scripts = getPreflightStages({
      branch: "feature/example",
      changedFiles: ["apps/factory-console/src/app/page.tsx"],
    }).map((stage: Stage) => stage.script);
    expect(scripts).toContain("build:factory-console");
    expect(scripts).not.toContain("build");
    expect(scripts.indexOf("build:factory-console")).toBe(
      scripts.indexOf("typecheck") + 1,
    );
  });

  it("keeps the product build whole and adds the Console for shared inputs", () => {
    const builds = getPreflightStages({
      branch: "feature/example",
      changedFiles: ["bun.lock"],
    })
      .map((stage: Stage) => stage.script)
      .filter((script: string) => script.startsWith("build"));
    expect(builds).toEqual(["build", "build:factory-console"]);
  });

  it("mirrors blocking ci.yml stage order documented in docs/ci.md", () => {
    expect(
      getPreflightStages(FULL_DOCS_CHANGE).map(({ id, script }: Stage) => ({
        id,
        script,
      })),
    ).toEqual(EXPECTED_STAGES);
  });

  it("runs the acceptance suite as its own full-profile stage after the unit suite", () => {
    const ids = getPreflightStages(FULL_DOCS_CHANGE).map(
      (stage: Stage) => stage.id,
    );
    expect(ids.at(-2)).toBe("test-unit");
    expect(ids.at(-1)).toBe("acceptance");
  });

  it("checks Phase 27 projections in the blocking integrity job", () => {
    const steps = integritySteps();
    const phase25 = steps.findIndex((step) =>
      step.includes("run: bun run verify:phase25-spec"),
    );
    const phase27 = steps.findIndex((step) =>
      step.includes("run: bun run verify:phase27-spec"),
    );
    expect(phase25).toBeGreaterThanOrEqual(0);
    expect(phase27).toBe(phase25 + 1);
    expect(steps[phase27]).not.toMatch(/(?:^|\n)\s*(?:if|continue-on-error):/);
  });

  it("checks Phase 28 projections and evidence in the blocking integrity job", () => {
    const steps = integritySteps();
    const phase27 = steps.findIndex((step) =>
      step.includes("run: bun run verify:phase27-spec"),
    );
    const phase28 = steps.findIndex((step) =>
      step.includes("run: bun run verify:phase28-spec"),
    );
    expect(phase28).toBe(phase27 + 1);
    expect(steps[phase28]).not.toMatch(/(?:^|\n)\s*(?:if|continue-on-error):/);
    const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
    expect(scripts["verify:phase28-spec"]).toContain("render-spec.mjs --check");
    expect(scripts["verify:phase28-spec"]).toContain("verify-evidence.mjs");
    expect(scripts["verify:phase28-spec"]).not.toContain("--write");
  });

  // The advisory Shadscan scan runs in its own reporting job, which makes no
  // auxiliary checkout (tests/unit/scripts/shadscan-workflow.test.ts).
  it("keeps the advisory Shadscan audit out of the blocking integrity job", () => {
    const steps = integritySteps();
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.filter((step) => /shadscan/i.test(step))).toEqual([]);
  });

  it("does not run deployment-discipline inside preflight", () => {
    expect(source).not.toContain("verify:deployment-discipline");
    for (const stages of [
      getPreflightStages(FULL_DOCS_CHANGE),
      fastStages(null),
      fastStages(["apps/donor/app/page.tsx"]),
    ])
      expect(stages.map((stage: Stage) => stage.script)).not.toContain(
        "verify:deployment-discipline",
      );
  });

  it("does not run the networked shadcn upstream review inside preflight", () => {
    const source = readFileSync("scripts/verify/ci-preflight.mjs", "utf8");
    expect(source).not.toContain("verify:shadcn-diff");
    const stages = getPreflightStages(FULL_DOCS_CHANGE) as Stage[];
    expect(stages.map((stage: Stage) => stage.script)).not.toContain(
      "verify:shadcn-diff",
    );
  });

  it("applies CI Supabase placeholders to build, unit and acceptance tests", () => {
    const stages = getPreflightStages(FULL_DOCS_CHANGE) as Stage[];
    const build = stage(stages, "build");
    expect(Object.keys(build.env ?? {})).toEqual(
      expect.arrayContaining([
        "SKIP_ENV_VALIDATION",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ]),
    );
    for (const id of ["test-unit", "acceptance"])
      expect(Object.keys(stage(stages, id).env ?? {})).toEqual(
        expect.arrayContaining([
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        ]),
      );
  });
});

describe("fast pre-push profile", () => {
  it("runs the cheap deterministic stages in the full profile's order", () => {
    expect(fastStages(["apps/donor/app/page.tsx"]).map((s) => s.id)).toEqual(
      FAST_STAGE_IDS,
    );
    expect(fastStages(null).map((s) => s.id)).toEqual(FAST_STAGE_IDS);
  });

  it("never runs a unit, acceptance, build or slow stage", () => {
    for (const stages of [fastStages(null), fastStages(["bun.lock"])]) {
      const commands = stages.flatMap((s) => [
        s.script ?? "",
        ...(s.runs ?? []).map((run) => run.args.join(" ")),
      ]);
      for (const forbidden of [
        "test:unit",
        "test:acceptance",
        "build",
        "skills:verify",
        "verify:eslint",
      ])
        expect(
          commands.filter(
            (command) => command === forbidden || command.endsWith(forbidden),
          ),
          forbidden,
        ).toEqual([]);
    }
  });

  it("checks formatting of the changed files that still exist", () => {
    const format = stage(
      fastStages(
        ["apps/donor/app/page.tsx", "docs/removed.md", "README.md"],
        (file) => file !== "docs/removed.md",
      ),
      "format",
    );
    expect(format.script).toBeUndefined();
    expect(format.runs).toEqual([
      {
        args: [
          "run",
          "prettier",
          "--check",
          "--ignore-unknown",
          "apps/donor/app/page.tsx",
          "README.md",
        ],
      },
    ]);
  });

  it("skips the format stage when no changed file remains", () => {
    const format = stage(
      fastStages(["docs/removed.md"], () => false),
      "format",
    );
    expect(format.runs).toEqual([]);
    expect(format.skip).toMatch(/no changed file/i);
  });

  it("splits a long changed-file list so no command line grows too long", () => {
    const files = Array.from(
      { length: 400 },
      (_, index) => `apps/admin/features/example/very/long/path/${index}.tsx`,
    );
    const chunks = formatChunks(files) as string[][];
    expect(chunks.flat()).toEqual(files);
    for (const chunk of chunks)
      expect(chunk.join(" ").length).toBeLessThanOrEqual(6000);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("lints and typechecks the affected workspaces exactly as pull-request CI does", () => {
    const stages = fastStages(["packages/api/src/index.ts"]);
    for (const task of ["lint", "typecheck"])
      expect(stage(stages, task).runs).toEqual([
        {
          args: ["run", "turbo", "run", task, ...AFFECTED_FILTERS],
          env: { TURBO_SCM_BASE: "origin/develop" },
        },
      ]);
  });

  it("treats an empty change list as uncertain and runs every scoped stage", () => {
    const stages = fastStages([]);
    for (const id of SCOPED_STAGE_IDS) {
      expect(stage(stages, id).skip, id).toBeUndefined();
      expect(stage(stages, id).script, id).toBeDefined();
    }
  });

  it("falls back to whole-repository checks when the branch diff is unknown", () => {
    const stages = fastStages(null);
    expect(stage(stages, "format").script).toBe("format:check");
    expect(stage(stages, "lint").script).toBe("lint");
    expect(stage(stages, "typecheck").script).toBe("typecheck");
    for (const id of SCOPED_STAGE_IDS) {
      expect(stage(stages, id).skip, id).toBeUndefined();
      expect(stage(stages, id).script, id).toBeDefined();
    }
  });
});

describe("fast profile stages scoped to their inputs", () => {
  const unrelated = ["README.md", "docs/ai/rules/general.md"];

  it("runs each scoped stage when the push changes one of its inputs", () => {
    for (const id of SCOPED_STAGE_IDS)
      for (const file of STAGE_INPUT_SAMPLES[id]) {
        const selected = stage(fastStages([...unrelated, file]), id);
        expect(selected.skip, `${id} for ${file}`).toBeUndefined();
        expect(selected.script, `${id} for ${file}`).toBeDefined();
      }
  });

  it("skips each scoped stage with a printed reason when no input changed", () => {
    const stages = fastStages(unrelated);
    for (const id of SCOPED_STAGE_IDS) {
      const skipped = stage(stages, id);
      expect(skipped.runs, id).toEqual([]);
      expect(skipped.skip, id).toMatch(/no change to its inputs/);
    }
    // A product code change leaves the document and spec projections out.
    const code = fastStages([
      "apps/admin/features/mission-control/care/care-contact-trend.ts",
    ]);
    for (const id of [
      "verify-phase25-spec",
      "verify-phase27-spec",
      "verify-phase28-spec",
      "openspec-validate",
      "verify-openspec-deltas",
    ])
      expect(stage(code, id).skip, id).toMatch(/no change to its inputs/);
    for (const id of ["verify-data-boundary", "verify-cms-public-sole-entry"])
      expect(stage(code, id).skip, id).toBeUndefined();
  });

  it("runs every scoped stage when a shared input changes", () => {
    for (const file of SHARED_INPUT_SAMPLES) {
      const stages = fastStages([file]);
      for (const id of SCOPED_STAGE_IDS)
        expect(stage(stages, id).skip, `${id} for ${file}`).toBeUndefined();
    }
  });

  it("scopes only stages a required CI job also runs on every pull request", () => {
    const lines = readFileSync(".github/workflows/ci.yml", "utf8").split(
      /\r?\n/,
    );
    const jobLines = (job: string) => {
      const start = lines.indexOf(`  ${job}:`);
      expect(start, job).toBeGreaterThanOrEqual(0);
      const end = lines.findIndex(
        (line, index) => index > start && /^  \S[^:]*:\s*$/.test(line),
      );
      return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
    };
    // The jobs ci-gate (the check develop requires) waits for.
    const needs = /^ {4}needs:\s*\[([^\]]*)\]/m.exec(jobLines("ci-gate"));
    expect(needs).not.toBeNull();
    const gated = (needs?.[1] ?? "")
      .split(",")
      .map((job) => job.trim())
      .filter(Boolean);
    expect(gated.length).toBeGreaterThan(1);
    const required = gated.flatMap((job) => {
      const [header, ...steps] = jobLines(job).split(/^ {6}- /m);
      // A job that can skip itself or report success after failing does not
      // count, whatever its steps run.
      if (/^ {4}(?:if|continue-on-error):/m.test(header)) return [];
      return steps.filter(
        (step) => !/(?:^|\n)\s*(?:if|continue-on-error):/.test(step),
      );
    });
    const scoped = fastStages(["README.md"]).filter(
      (candidate) => candidate.skip && candidate.id !== "format",
    );
    expect(scoped.map((candidate) => candidate.id)).toEqual(SCOPED_STAGE_IDS);
    const full = getPreflightStages(FULL_DOCS_CHANGE) as Stage[];
    for (const { id } of scoped) {
      const { script } = stage(full, id);
      const inCi = required.some((step) =>
        step.includes(`run: bun run ${script}`),
      );
      expect(inCi, id).toBe(true);
    }
  });
});

describe("preflight arguments and output", () => {
  it("keeps the bare command as the full profile and --full as full compilation", () => {
    expect(parsePreflightArgs([])).toEqual({
      profile: "full",
      full: false,
      only: null,
    });
    expect(parsePreflightArgs(["--full"])).toEqual({
      profile: "full",
      full: true,
      only: null,
    });
    expect(parsePreflightArgs(["--fast"])).toEqual({
      profile: "fast",
      full: false,
      only: null,
    });
    expect(parsePreflightArgs(["--fast", "--only", "lint"])).toEqual({
      profile: "fast",
      full: false,
      only: "lint",
    });
  });

  it.each([[["--fast", "--full"]], [["--only"]], [["--quick"]], [["lint"]]])(
    "rejects %j",
    (args) => {
      expect(() => parsePreflightArgs(args)).toThrow(/Usage: ci:preflight/);
    },
  );

  it("selects one stage by id and names the known ids otherwise", () => {
    const stages = fastStages(["README.md"]);
    expect(selectStages(stages, "lint").map((s: Stage) => s.id)).toEqual([
      "lint",
    ]);
    expect(() => selectStages(stages, "test-unit")).toThrow(
      /Unknown stage "test-unit".*runtime, format/s,
    );
  });

  it("gives every failed stage a command that re-runs it alone", () => {
    const full = getPreflightStages(FULL_DOCS_CHANGE) as Stage[];
    expect(rerunCommand(stage(full, "verify-eslint"), "full")).toBe(
      "bun run verify:eslint",
    );
    // Stages with CI placeholder environment re-run through the preflight,
    // which applies that environment.
    expect(rerunCommand(stage(full, "test-unit"), "full")).toBe(
      "bun run ci:preflight -- --only test-unit",
    );
    expect(rerunCommand(stage(full, "build"), "full", true)).toBe(
      "bun run ci:preflight -- --full --only build",
    );
    const fast = fastStages(["README.md"]);
    expect(rerunCommand(stage(fast, "lint"), "fast")).toBe(
      "bun run ci:preflight -- --fast --only lint",
    );
    expect(rerunCommand(stage(fast, "runtime"), "fast")).toBe(
      "bun run verify:node-version",
    );
  });

  it("ends a failure with the stage, its re-run command and the last lines of its output", () => {
    const output = Array.from({ length: 60 }, (_, index) => `line ${index}`);
    const lines = failureLines({
      stage: { id: "lint", script: "lint" },
      profile: "full",
      exit: 1,
      tail: output.join("\n"),
    }) as string[];
    expect(lines[0]).toBe("==> FAIL lint (exit 1)");
    expect(lines).toContain("==> Re-run this stage alone: bun run lint");
    expect(lines).toContain("line 59");
    expect(lines).toContain("line 20");
    expect(lines).not.toContain("line 19");
    expect(lines.join("\n")).not.toContain(FULL_PASS_LINE);
  });

  it("names each passed stage with its duration", () => {
    expect(stagePassLine("lint", 12_345)).toBe("==> PASS lint (12.3s)");
    expect(stagePassLine("runtime", 40)).toBe("==> PASS runtime (0.0s)");
  });

  it("prints the factory's full-preflight line only for a complete full profile", () => {
    expect(FULL_PASS_LINE).toBe("==> PASS ci:preflight");
    const full = completionLines({ profile: "full", ran: 20, seconds: 9 });
    expect(full.at(-1)).toBe(FULL_PASS_LINE);
    expect(full.join("\n")).toMatch(/full profile: all 20 stages passed/i);

    const fast = completionLines({ profile: "fast", ran: 14, seconds: 9 });
    expect(fast.join("\n")).toMatch(/fast pre-push profile/i);
    expect(fast.join("\n")).not.toContain(FULL_PASS_LINE);

    const only = completionLines({
      profile: "full",
      ran: 1,
      seconds: 9,
      only: "test-unit",
    });
    expect(only.join("\n")).not.toContain(FULL_PASS_LINE);
  });

  it("counts the fast stages that ran and those skipped separately", () => {
    const lines = completionLines({
      profile: "fast",
      ran: 6,
      skipped: 9,
      seconds: 19,
    });
    expect(lines.join("\n")).toMatch(
      /PASS fast pre-push profile: 6 stages ran and 9 were skipped/,
    );
  });

  it("says a skipped --only stage did not run instead of passing it", () => {
    const skipped = stage(fastStages(["README.md"]), "verify-phase25-spec");
    const lines = completionLines({
      profile: "fast",
      ran: 0,
      skipped: 1,
      seconds: 0,
      only: "verify-phase25-spec",
      onlySkipped: skipped,
    }) as string[];
    expect(lines.join("\n")).not.toMatch(/PASS/);
    expect(lines.join("\n")).toMatch(
      /verify-phase25-spec did not run \(no change to its inputs; .*\)/,
    );
    expect(lines.join("\n")).toContain("bun run verify:phase25-spec");
  });
});
