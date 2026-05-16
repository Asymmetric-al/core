import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ENV = {
  ASYM_USE_CI_ENV_DEFAULTS: "1",
  SKIP_ENV_VALIDATION: "1",
  /** Lets POST /api/auth/demo-account set the E2E cookie without real Supabase sign-in. */
  E2E_AUTH_BYPASS: "true",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
  PAYLOAD_SECRET: "ci-placeholder-payload-secret",
};

function getCommandParts(args = process.argv.slice(2)) {
  const separatorIndex = args.indexOf("--");
  if (separatorIndex >= 0) {
    return args.slice(separatorIndex + 1);
  }
  return args;
}

export function parseEnvFile(content) {
  const parsed = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function applyEnvValues(env, values) {
  for (const [key, value] of Object.entries(values)) {
    if (!Object.prototype.hasOwnProperty.call(env, key)) {
      env[key] = value;
    }
  }
}

export function loadEnvFileWithFallback(
  absolutePath,
  { env = process.env, loadEnvFile = process.loadEnvFile } = {},
) {
  if (typeof loadEnvFile === "function" && env === process.env) {
    loadEnvFile(absolutePath);
    return;
  }

  applyEnvValues(env, parseEnvFile(readFileSync(absolutePath, "utf8")));
}

export function loadLocalEnvFiles({
  repoRoot = process.cwd(),
  env = process.env,
  loadEnvFile = process.loadEnvFile,
} = {}) {
  const envCandidates = [".env.local", ".env"];

  for (const relativePath of envCandidates) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) {
      continue;
    }

    loadEnvFileWithFallback(absolutePath, { env, loadEnvFile });
  }
}

export function normalizeEnvForCommand(env, commandParts = []) {
  const launchesPlaywright = commandParts.some((part) =>
    part.includes("@playwright/test/cli.js"),
  );
  const launchesBuild = commandParts.includes("build");

  if (launchesPlaywright || env.FORCE_COLOR !== undefined) {
    delete env.NO_COLOR;
  }

  if (launchesBuild) {
    env.NODE_ENV = "production";
  }

  return env;
}

function getEnv(commandParts = []) {
  loadLocalEnvFiles();
  const env = { ...process.env };
  for (const [key, value] of Object.entries(DEFAULT_ENV)) {
    if (!env[key]) {
      env[key] = value;
    }
  }
  return normalizeEnvForCommand(env, commandParts);
}

const commandParts = getCommandParts();
const scriptPath = fileURLToPath(import.meta.url);
const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === scriptPath;

if (isDirectExecution) {
  if (commandParts.length === 0) {
    console.error(
      "Usage: node scripts/run-with-ci-env.mjs -- <command> [args...]",
    );
    process.exit(1);
  }

  const [command, ...commandArgs] = commandParts;
  const child = spawn(command, commandArgs, {
    stdio: "inherit",
    env: getEnv(commandParts),
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
}
