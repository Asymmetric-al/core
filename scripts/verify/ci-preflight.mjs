import { execFileSync, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import {
  readCompilationChanges,
  resolveCompilation,
} from "./ci-build-policy.mjs";

const CI_FALLBACK_SUPABASE_URL = "https://ci-placeholder.supabase.co";
const CI_FALLBACK_SUPABASE_ANON_KEY = "ci-placeholder-anon-key";

const ciSupabasePublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? CI_FALLBACK_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? CI_FALLBACK_SUPABASE_ANON_KEY,
};

/**
 * Mirrors blocking GitHub CI checks:
 * format -> skills:verify -> verify:phase25-spec
 * -> openspec:validate -> verify:openspec-deltas -> lint -> verify:data-boundary
 * -> verify:cms-public-sole-entry
 * -> verify:workspace-contract -> verify:bun-lock-drift
 * -> verify:eslint -> verify:shadcn-config
 * -> verify:shadcn-diff -> verify:shadscan
 * -> typecheck -> build -> test-unit
 */
const stages = [
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
    id: "verify-shadcn-diff",
    script: "verify:shadcn-diff",
  },
  {
    id: "verify-shadscan",
    script: "verify:shadscan",
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
];

function runStage(stage) {
  console.log(`==> CI preflight: ${stage.id}`);
  const env = {
    ...process.env,
    ...(stage.env ?? {}),
  };

  const result = spawnSync("bun", ["run", stage.script], {
    stdio: "inherit",
    env,
  });

  if (result.error) {
    console.error(`==> FAIL ${stage.id} (${result.error.message})`);
    return false;
  }

  if (result.status !== 0) {
    console.error(`==> FAIL ${stage.id} (exit ${result.status ?? "unknown"})`);
    return false;
  }

  console.log(`==> PASS ${stage.id}`);
  return true;
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
  return stages.flatMap((stage) => {
    if (stage.id !== "build") return [stage];
    if (apps.length === 3) return [stage];
    return apps.map((app) => ({
      ...stage,
      id: `build-${app}`,
      script: `build:${app}`,
    }));
  });
}

function main() {
  if (process.argv.slice(2).some((arg) => arg !== "--full"))
    throw new Error("Usage: ci:preflight [--full]");
  const branch = execFileSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
  }).trim();
  const selected = getPreflightStages({
    full: process.argv.includes("--full"),
    branch,
    changedFiles: readCompilationChanges({ includeWorkingTree: true }),
  });
  console.log(
    `Compilation: ${
      selected
        .filter((stage) => stage.id.startsWith("build"))
        .map((stage) => stage.script)
        .join(", ") || "not requested for routine development"
    }`,
  );
  for (const stage of selected) if (!runStage(stage)) return 1;
  console.log("==> PASS ci:preflight");
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
