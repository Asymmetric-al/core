import { execFileSync, spawn } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  BUILD_APPS,
  readCompilationChanges,
  resolveCompilation,
} from "./ci-build-policy.mjs";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

const CI_FALLBACK_SUPABASE_URL = "https://ci-placeholder.supabase.co";
const CI_FALLBACK_SUPABASE_ANON_KEY = "ci-placeholder-anon-key";

const ciSupabasePublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? CI_FALLBACK_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? CI_FALLBACK_SUPABASE_ANON_KEY,
};

// The Core factory accepts a published push only when its hook output
// contains this exact line (scripts/archon-factory/pack/.shared/publication.mjs).
// Only a complete full-profile run may print it.
export const FULL_PASS_LINE = "==> PASS ci:preflight";

const USAGE = "Usage: ci:preflight [--fast | --full] [--only <stage>]";
const TAIL_LINES = 40;
// Windows caps a command line at 8,191 characters when a shim relays it.
const FORMAT_CHUNK_CHARS = 6000;
const AFFECTED_FILTERS = [
  "--affected",
  "--filter=./apps/*",
  "--filter=./packages/*",
  "--filter=./tooling/*",
];

/**
 * Full profile (`bun run ci:preflight`). Mirrors blocking GitHub CI checks:
 * runtime -> format -> skills:verify -> verify:phase25-spec -> verify:phase27-spec -> verify:phase28-spec
 * -> openspec:validate -> verify:openspec-deltas -> lint -> verify:comments
 * -> verify:data-boundary
 * -> verify:cms-public-sole-entry
 * -> verify:workspace-contract -> verify:bun-lock-drift
 * -> verify:eslint -> verify:shadcn-config
 * -> typecheck -> build -> test-unit -> acceptance
 */
// Exceptions to the mirror: ci.yml has no step for verify:shadcn-config (it
// runs only here), and getPreflightStages replaces `build` with the selected
// compilation (none for routine development changes). The shadcn upstream
// review is deliberately not a stage: it depends on the public registry, so
// it runs only by hand.
const stages = [
  {
    id: "runtime",
    script: "verify:node-version",
  },
  {
    id: "format",
    script: "format:check",
  },
  {
    id: "skills-verify",
    script: "skills:verify",
  },
  {
    id: "verify-phase25-spec",
    script: "verify:phase25-spec",
  },
  {
    id: "verify-phase27-spec",
    script: "verify:phase27-spec",
  },
  {
    id: "verify-phase28-spec",
    script: "verify:phase28-spec",
  },
  {
    id: "openspec-validate",
    script: "openspec:validate",
  },
  {
    id: "verify-openspec-deltas",
    script: "verify:openspec-deltas",
  },
  {
    id: "lint",
    script: "lint",
  },
  {
    id: "verify-comments",
    script: "verify:comments",
  },
  {
    id: "verify-data-boundary",
    script: "verify:data-boundary",
  },
  {
    id: "verify-cms-public-sole-entry",
    script: "verify:cms-public-sole-entry",
  },
  {
    id: "verify-workspace-contract",
    script: "verify:workspace-contract",
  },
  {
    id: "verify-bun-lock-drift",
    script: "verify:bun-lock-drift",
  },
  {
    id: "verify-eslint",
    script: "verify:eslint",
  },
  {
    id: "verify-shadcn-config",
    script: "verify:shadcn-config",
  },
  {
    id: "typecheck",
    script: "typecheck",
  },
  {
    id: "build",
    script: "build",
    env: {
      SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION ?? "1",
      ...ciSupabasePublicEnv,
    },
  },
  {
    id: "test-unit",
    script: "test:unit",
    env: ciSupabasePublicEnv,
  },
  {
    id: "acceptance",
    script: "test:acceptance",
    env: ciSupabasePublicEnv,
  },
];

// Fast profile (the pre-push default): the full profile's order without the
// slow stages that required CI already runs on every pull request.
// skills:verify (183 s) and verify:eslint (54 s) were timed alone on the
// loaded Windows host and were not cheap.
const FAST_EXCLUDED = new Set([
  "skills-verify",
  "verify-eslint",
  "build",
  "test-unit",
  "acceptance",
]);

// Fast stages that run only when the push changes one of their inputs; any
// other push skips them with a printed line. An unknown change set runs them
// all. A string ending in "/" stands for everything under it.
//
// Inputs every traced stage shares: the lock and runtime pin, any package
// manifest (workspaces, scripts, dependency versions, and Prettier's option
// lookup), Prettier configuration, and this selection code.
const SHARED_INPUTS = [
  "bun.lock",
  "bunfig.toml",
  ".npmrc",
  ".node-version",
  "scripts/verify/ci-preflight.mjs",
  "scripts/verify/ci-build-policy.mjs",
  /(?:^|\/)package\.(?:json|yaml)$/,
  /(?:^|\/)(?:\.prettierrc(?:\.[^/]+)?|prettier\.config\.[^/]+|\.editorconfig)$/,
];
const PRD = "docs/prds/sitestacker-parity/";
// Each list is every repository path the stage's scripts opened when traced
// on 2026-11-18 (Node fs calls and git commands), collapsed to the
// directories they read or list, plus the scripts themselves. Each of these
// stages also runs in the required CI `integrity` or `lint` job.
const STAGE_INPUTS = {
  "verify-phase25-spec": [
    `${PRD}phase-25-donor-dashboard-depth/`,
    `${PRD}phase-25-donor-dashboard-depth.md`,
    "openspec/changes/add-donor-dashboard-depth/",
  ],
  "verify-phase27-spec": [
    `${PRD}phase-27-donor-development/`,
    `${PRD}phase-27-donor-development.md`,
    "openspec/changes/add-donor-development/",
    "openspec/contracts/",
    "docs/features/donor-development/",
    "scripts/lib/openspec-contracts.mjs",
  ],
  "verify-phase28-spec": [
    `${PRD}phase-28-missionary-workspace-depth/`,
    `${PRD}phase-28-missionary-workspace-depth.md`,
    "openspec/changes/add-missionary-workspace-depth/",
    "openspec/contracts/",
    "docs/features/missionary-workspace-depth/",
    "scripts/lib/openspec-contracts.mjs",
    "scripts/git/environment.mjs",
  ],
  "openspec-validate": ["openspec/"],
  // openspec-delta-compatibility, phase24-authority (which also compares the
  // listings of docs/adr and the sitestacker-parity folder) and phase 29.
  "verify-openspec-deltas": [
    "openspec/",
    PRD,
    "docs/adr/",
    "docs/features/files-documents/",
    "docs/ai/document-authority.md",
    "scripts/lib/openspec-contracts.mjs",
    "scripts/verify/openspec-delta-compatibility.mjs",
    "scripts/verify/phase24-authority.mjs",
  ],
  "verify-comments": [
    "apps/",
    "packages/",
    "scripts/",
    "tests/",
    "tooling/",
    /^[^/]+\.(?:[cm]?[jt]s|[jt]sx)$/,
  ],
  "verify-data-boundary": ["apps/", "packages/", "scripts/", ".env.example"],
  "verify-cms-public-sole-entry": [
    "apps/admin/",
    "apps/donor/",
    "packages/",
    "scripts/verify/cms-public-sole-entry.mjs",
  ],
  // Workspace manifests are shared inputs; the App Router trees are where it
  // finds route handlers, segment config and private capture routes.
  "verify-workspace-contract": [
    /^apps\/[^/]+\/(?:src\/)?app\//,
    "docs/guides/architecture/runtime-map.md",
    "docs/maintenance/modernization/pdf-owner-release.json",
    "docs/maintenance/modernization/pdf-package-provenance.json",
    "vendor/react-pdf-packages/",
    "scripts/verify-workspace-contract.mjs",
    "scripts/verify/typescript-toolchain.mjs",
    "scripts/verify/pdf-package-provenance.mjs",
  ],
};

function matchesInput(file, input) {
  if (input instanceof RegExp) return input.test(file);
  return input.endsWith("/") ? file.startsWith(input) : file === input;
}

/** True when any changed path is one of the inputs. */
export function touchesInputs(changedFiles, inputs) {
  return changedFiles.some((file) =>
    inputs.some((input) => matchesInput(file, input)),
  );
}

/**
 * Inputs per scoped stage. The traced stages also take the shared inputs.
 */
function scopedStageInputs() {
  return Object.fromEntries(
    Object.entries(STAGE_INPUTS).map(([id, inputs]) => [
      id,
      [...inputs, ...SHARED_INPUTS],
    ]),
  );
}

function isExistingFile(file) {
  try {
    return statSync(path.join(REPO_ROOT, file)).isFile();
  } catch {
    return false;
  }
}

/** Groups paths so each Prettier command line stays well under OS limits. */
export function formatChunks(files, limit = FORMAT_CHUNK_CHARS) {
  const chunks = [];
  let chunk = [];
  let length = 0;
  for (const file of files) {
    if (chunk.length > 0 && length + 1 + file.length > limit) {
      chunks.push(chunk);
      chunk = [];
      length = 0;
    }
    length += (chunk.length > 0 ? 1 : 0) + file.length;
    chunk.push(file);
  }
  if (chunk.length > 0) chunks.push(chunk);
  return chunks;
}

/**
 * Fast-profile stages. `changedFiles` is the branch diff against
 * origin/develop with working-tree changes (readCompilationChanges), or null
 * when that diff is unknown: then every stage runs and checks the whole
 * repository. An empty list is uncertain too (the pushed ref may not be the
 * checked-out tree), so every scoped stage runs.
 */
export function getFastStages({ changedFiles, exists = isExistingFile }) {
  const known = Array.isArray(changedFiles);
  const scopeKnown = known && changedFiles.length > 0;
  const scoped = scopedStageInputs();
  const skipped = (stage, skip) => ({ ...stage, runs: [], skip });
  return stages
    .filter((stage) => !FAST_EXCLUDED.has(stage.id))
    .map((stage) => {
      if (!known) return stage;
      if (stage.id in scoped) {
        const inputs = scoped[stage.id];
        if (!scopeKnown || !inputs || touchesInputs(changedFiles, inputs))
          return stage;
        return skipped(
          stage,
          "no change to its inputs; required CI runs it on every pull request",
        );
      }
      if (stage.id === "format") {
        const files = changedFiles.filter((file) => exists(file));
        return files.length === 0
          ? skipped(stage, "no changed file to format")
          : {
              id: stage.id,
              runs: formatChunks(files).map((chunk) => ({
                args: [
                  "run",
                  "prettier",
                  "--check",
                  "--ignore-unknown",
                  ...chunk,
                ],
              })),
            };
      }
      if (stage.id === "lint" || stage.id === "typecheck")
        return {
          id: stage.id,
          // The same selection pull-request CI uses (ci.yml lint/typecheck).
          runs: [
            {
              args: ["run", "turbo", "run", stage.id, ...AFFECTED_FILTERS],
              env: { TURBO_SCM_BASE: "origin/develop" },
            },
          ],
        };
      return stage;
    });
}

export function getPreflightStages({
  full = false,
  branch,
  changedFiles = null,
} = {}) {
  const apps = resolveCompilation({
    event: "pull_request",
    baseBranch: "develop",
    branch,
    changedFiles,
    full,
  });
  // `bun run build` compiles exactly the product apps; any other selected app
  // (or a partial product selection) runs its own `build:<app>` stage.
  const wholeProduct = BUILD_APPS.every((app) => apps.includes(app));
  const separate = wholeProduct
    ? apps.filter((app) => !BUILD_APPS.includes(app))
    : apps;
  return stages.flatMap((stage) => {
    if (stage.id !== "build") return [stage];
    return [
      ...(wholeProduct ? [stage] : []),
      ...separate.map((app) => ({
        ...stage,
        id: `build-${app}`,
        script: `build:${app}`,
      })),
    ];
  });
}

export function parsePreflightArgs(argv) {
  let fast = false;
  let full = false;
  let only = null;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--fast") fast = true;
    else if (argument === "--full") full = true;
    else if (argument === "--only") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(USAGE);
      only = value;
      index += 1;
    } else throw new Error(USAGE);
  }
  if (fast && full) throw new Error(USAGE);
  return { profile: fast ? "fast" : "full", full, only };
}

export function selectStages(selected, only) {
  if (!only) return selected;
  const match = selected.filter((stage) => stage.id === only);
  if (match.length === 0)
    throw new Error(
      `Unknown stage "${only}". Stages in this profile: ${selected
        .map((stage) => stage.id)
        .join(", ")}`,
    );
  return match;
}

/** The exact command that repeats one stage, scope and environment included. */
export function rerunCommand(stage, profile, full = false) {
  if (stage.script && !stage.env) return `bun run ${stage.script}`;
  const flags = [
    ...(profile === "fast" ? ["--fast"] : []),
    ...(full ? ["--full"] : []),
    "--only",
    stage.id,
  ];
  return `bun run ci:preflight -- ${flags.join(" ")}`;
}

function lastLines(text, count = TAIL_LINES) {
  const lines = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  while (lines.length > 0 && lines.at(-1).trim() === "") lines.pop();
  return lines.slice(-count);
}

export function failureLines({
  stage,
  profile,
  full = false,
  exit,
  error,
  tail,
}) {
  const shown = lastLines(tail);
  return [
    `==> FAIL ${stage.id} (${error ? error : `exit ${exit ?? "unknown"}`})`,
    `==> Re-run this stage alone: ${rerunCommand(stage, profile, full)}`,
    `==> Last ${shown.length} lines of ${stage.id}:`,
    ...shown,
    `==> The ${profile} profile stopped at ${stage.id}; later stages did not run.`,
  ];
}

/**
 * The closing lines of a run that did not fail. `ran` and `skipped` count
 * stages separately; `onlySkipped` is the stage `--only` selected when the
 * profile skipped it, which is reported as not run, never as passed.
 */
export function completionLines({
  profile,
  ran,
  skipped = 0,
  seconds,
  only,
  onlySkipped,
}) {
  if (only && onlySkipped)
    return [
      `==> ${only} did not run (${onlySkipped.skip}); nothing was checked. Run it alone with: ${rerunCommand(onlySkipped, profile)}`,
    ];
  if (only)
    return [
      `==> PASS ${only} (only this stage ran; this is not a complete ${profile} profile)`,
    ];
  if (profile === "full")
    return [
      `==> Full profile: all ${ran} stages passed in ${seconds}s`,
      FULL_PASS_LINE,
    ];
  return [
    `==> PASS fast pre-push profile: ${ran} stages ran and ${skipped} were skipped, in ${seconds}s. Before a pull request is ready, run the full preflight: bun run ci:preflight`,
  ];
}

export function stagePassLine(id, milliseconds) {
  return `==> PASS ${id} (${(milliseconds / 1000).toFixed(1)}s)`;
}

function runTeed(args, env) {
  return new Promise((resolve) => {
    let tail = "";
    const keep = (chunk) => {
      tail = (tail + chunk.toString()).slice(-64 * 1024);
    };
    let child;
    try {
      child = spawn("bun", args, {
        cwd: REPO_ROOT,
        env,
        stdio: ["inherit", "pipe", "pipe"],
        shell: false,
      });
    } catch (error) {
      resolve({ status: null, error: error.message, tail });
      return;
    }
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      keep(chunk);
    });
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
      keep(chunk);
    });
    child.on("error", (error) =>
      resolve({ status: null, error: error.message, tail }),
    );
    child.on("close", (status) => resolve({ status, tail }));
  });
}

/** Runs one stage: "passed", "skipped" or "failed". */
async function runStage(stage, { profile, full }) {
  console.log(`==> CI preflight: ${stage.id}`);
  if (stage.skip) {
    console.log(`==> SKIP ${stage.id} (${stage.skip})`);
    return "skipped";
  }
  const started = Date.now();
  const runs = stage.runs ?? [{ args: ["run", stage.script] }];
  for (const run of runs) {
    const env = { ...process.env, ...(stage.env ?? {}), ...(run.env ?? {}) };
    const result = await runTeed(run.args, env);
    if (result.error || result.status !== 0) {
      for (const line of failureLines({
        stage,
        profile,
        full,
        exit: result.status,
        error: result.error,
        tail: result.tail,
      }))
        console.error(line);
      return "failed";
    }
  }
  console.log(stagePassLine(stage.id, Date.now() - started));
  return "passed";
}

function describeChanges(changedFiles) {
  if (!Array.isArray(changedFiles))
    return "branch diff unknown (no origin/develop?): checking the whole repository";
  return changedFiles.length === 0
    ? "no change against origin/develop: every scoped stage runs"
    : `${changedFiles.length} changed files against origin/develop, working tree included`;
}

async function main() {
  const { profile, full, only } = parsePreflightArgs(process.argv.slice(2));
  const changedFiles = readCompilationChanges({ includeWorkingTree: true });
  let selected;
  if (profile === "fast") {
    console.log(
      "==> Profile: fast pre-push checks (the full preflight is `bun run ci:preflight`)",
    );
    console.log(`Scope: ${describeChanges(changedFiles)}`);
    selected = getFastStages({ changedFiles });
  } else {
    console.log(`==> Profile: full${full ? ", every app compiled" : ""}`);
    const branch = execFileSync("git", ["branch", "--show-current"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
    selected = getPreflightStages({ full, branch, changedFiles });
    console.log(
      `Compilation: ${
        selected
          .filter((stage) => stage.id.startsWith("build"))
          .map((stage) => stage.script)
          .join(", ") || "not requested for routine development"
      }`,
    );
  }
  selected = selectStages(selected, only);
  const started = Date.now();
  const outcomes = [];
  for (const stage of selected) {
    const outcome = await runStage(stage, { profile, full });
    if (outcome === "failed") return 1;
    outcomes.push(outcome);
  }
  for (const line of completionLines({
    profile,
    ran: outcomes.filter((outcome) => outcome === "passed").length,
    skipped: outcomes.filter((outcome) => outcome === "skipped").length,
    seconds: Math.round((Date.now() - started) / 1000),
    only,
    onlySkipped: only && selected[0]?.skip ? selected[0] : undefined,
  }))
    console.log(line);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error.message);
      process.exitCode = 1;
    },
  );
