import { spawnSync } from "node:child_process";

const CI_FALLBACK_SUPABASE_URL = "https://ci-placeholder.supabase.co";
const CI_FALLBACK_SUPABASE_ANON_KEY = "ci-placeholder-anon-key";

/**
 * Mirrors blocking GitHub CI checks:
 * format -> lint -> verify:workspace-contract -> verify:eslint
 * -> typecheck -> build -> test-unit
 */
const stages = [
  {
    id: "format",
    script: "format:check",
  },
  {
    id: "lint",
    script: "lint",
  },
  {
    id: "verify-workspace-contract",
    script: "verify:workspace-contract",
  },
  {
    id: "verify-eslint",
    script: "verify:eslint",
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
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? CI_FALLBACK_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        CI_FALLBACK_SUPABASE_ANON_KEY,
    },
  },
  {
    id: "test-unit",
    script: "test:unit",
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
