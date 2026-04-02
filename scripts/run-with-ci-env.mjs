import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_ENV = {
  ASYM_USE_CI_ENV_DEFAULTS: "1",
  SKIP_ENV_VALIDATION: "1",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
  PAYLOAD_SECRET: "ci-placeholder-payload-secret",
};

function getCommandParts() {
  const args = process.argv.slice(2);
  const separatorIndex = args.indexOf("--");
  if (separatorIndex >= 0) {
    return args.slice(separatorIndex + 1);
  }
  return args;
}

function loadLocalEnvFiles() {
  const repoRoot = process.cwd();
  const envCandidates = [".env.local", ".env"];

  for (const relativePath of envCandidates) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) {
      continue;
    }

    process.loadEnvFile(absolutePath);
  }
}

function getEnv() {
  loadLocalEnvFiles();
  const env = { ...process.env };
  for (const [key, value] of Object.entries(DEFAULT_ENV)) {
    if (!env[key]) {
      env[key] = value;
    }
  }
  return env;
}

const commandParts = getCommandParts();
if (commandParts.length === 0) {
  console.error(
    "Usage: node scripts/run-with-ci-env.mjs -- <command> [args...]",
  );
  process.exit(1);
}

const [command, ...commandArgs] = commandParts;
const child = spawn(command, commandArgs, {
  stdio: "inherit",
  env: getEnv(),
});

child.on("error", (error) => {
  console.error(`Failed to start command "${command}": ${error.message}`);
  process.exit(1);
});

child.on("close", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
