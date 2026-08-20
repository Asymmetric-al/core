import { spawnSync } from "node:child_process";

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
 * verify:git-attribution -> format -> skills:verify -> openspec:validate -> lint -> verify:data-boundary
 * -> verify:cms-public-sole-entry
 * -> verify:workspace-contract -> verify:bun-lock-drift
 * -> verify:eslint -> verify:shadcn-config
 * -> verify:shadcn-diff
 * -> typecheck -> build -> test-unit
 */
const stages = [
  {
    id: "verify-git-attribution",
    script: "verify:git-attribution",
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
    id: "openspec-validate",
    script: "openspec:validate",
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

for (const stage of stages) {
  if (!runStage(stage)) {
    process.exit(1);
  }
}

console.log("==> PASS ci:preflight");
