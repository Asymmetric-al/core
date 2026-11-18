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
  { id: "verify-shadcn-diff", script: "verify:shadcn-diff" },
  { id: "typecheck", script: "typecheck" },
  { id: "build", script: "build" },
  { id: "test-unit", script: "test:unit" },
  { id: "acceptance", script: "test:acceptance" },
];

// The fast profile keeps the full profile's order. It leaves out the stages
// that need the network or took more than a few seconds when timed alone on
// the loaded Windows host (skills:verify 183 s, verify:eslint 54 s), and the
// unit, acceptance and build stages that required CI runs on every PR.
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
  return getFastStages({ changedFiles, exists }) as Stage[];
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

  it("never runs a unit, acceptance, build, network or slow stage", () => {
    for (const stages of [fastStages(null), fastStages(["bun.lock"])]) {
      const commands = stages.flatMap((s) => [
        s.script ?? "",
        ...(s.runs ?? []).map((run) => run.args.join(" ")),
      ]);
      for (const forbidden of [
        "test:unit",
        "test:acceptance",
        "build",
        "verify:shadcn-diff",
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
          "--no-error-on-unmatched-pattern",
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

  it("falls back to whole-repository checks when the branch diff is unknown", () => {
    const stages = fastStages(null);
    expect(stage(stages, "format").script).toBe("format:check");
    expect(stage(stages, "lint").script).toBe("lint");
    expect(stage(stages, "typecheck").script).toBe("typecheck");
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
    const full = completionLines({ profile: "full", stages: 20, seconds: 9 });
    expect(full.at(-1)).toBe(FULL_PASS_LINE);
    expect(full.join("\n")).toMatch(/full profile/i);

    const fast = completionLines({ profile: "fast", stages: 14, seconds: 9 });
    expect(fast.join("\n")).toMatch(/fast pre-push profile/i);
    expect(fast.join("\n")).not.toContain(FULL_PASS_LINE);

    const only = completionLines({
      profile: "full",
      stages: 1,
      seconds: 9,
      only: "test-unit",
    });
    expect(only.join("\n")).not.toContain(FULL_PASS_LINE);
  });
});
