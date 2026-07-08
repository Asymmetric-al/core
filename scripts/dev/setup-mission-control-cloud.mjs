#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..", "..");

export const missionControlCloudEnvDefaults = {
  ASYM_USE_CI_ENV_DEFAULTS: "1",
  SKIP_ENV_VALIDATION: "1",
  E2E_AUTH_BYPASS: "true",
  E2E_AUTH_SECRET: "cloud-agent-e2e-auth-hmac-secret-not-for-production",
  E2E_AUTH_ALLOWED_SUPABASE_REFS: "example",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
  PAYLOAD_SECRET: "cloud-agent-mission-control-placeholder",
  PLAYWRIGHT_ADMIN_BASE_URL: "http://localhost:3030",
  PLAYWRIGHT_ADMIN_PORT: "3030",
};

const placeholderValues = new Set([
  "",
  "false",
  "changeme",
  "TODO",
  "your-anon-key",
  "your_anon_key",
  "your-anon-key-here",
  "https://your-project.supabase.co",
]);

function log(message) {
  console.log(`==> ${message}`);
}

function fail(message) {
  console.error(`error: ${message}`);
}

function parseArgs(args) {
  return {
    forceBypass: args.includes("--force-bypass"),
    skipInstall: args.includes("--skip-install"),
    skipSkillsVerify: args.includes("--skip-skills-verify"),
  };
}

function envLineKey(line) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  return match?.[1] ?? null;
}

function unquoteEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function envLineValue(line) {
  const index = line.indexOf("=");
  if (index < 0) return "";
  return unquoteEnvValue(line.slice(index + 1));
}

function shouldReplaceEnvValue(key, value, options = {}) {
  const trimmed = value.trim();

  if (key === "E2E_AUTH_BYPASS") {
    if (trimmed.toLowerCase() === "false" && !options.forceBypass) {
      return false;
    }

    return placeholderValues.has(trimmed);
  }

  return placeholderValues.has(trimmed);
}

function formatEnvLine(key, value) {
  return `${key}=${value}`;
}

export function applyMissionControlCloudEnvDefaults(
  content,
  defaults = missionControlCloudEnvDefaults,
  options = {},
) {
  const lines = content ? content.split(/\r?\n/) : [];
  const seen = new Set();
  const changedKeys = [];
  const preservedKeys = [];
  const nextLines = lines.map((line) => {
    const key = envLineKey(line);
    if (!key || !(key in defaults)) {
      return line;
    }

    seen.add(key);
    const defaultValue = defaults[key];
    const currentValue = envLineValue(line);
    if (shouldReplaceEnvValue(key, currentValue, options)) {
      changedKeys.push(key);
      return formatEnvLine(key, defaultValue);
    }

    preservedKeys.push(key);
    return line;
  });

  const missingKeys = Object.keys(defaults).filter((key) => !seen.has(key));
  if (missingKeys.length > 0) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== "") {
      nextLines.push("");
    }
    nextLines.push("# Mission Control Cloud Agent defaults");
    for (const key of missingKeys) {
      changedKeys.push(key);
      nextLines.push(formatEnvLine(key, defaults[key]));
    }
  }

  return {
    content: `${nextLines.join("\n").replace(/\n*$/, "")}\n`,
    changedKeys,
    preservedKeys,
  };
}

async function ensureEnvFile(options) {
  const envPath = path.join(repoRoot, ".env.local");
  const current = existsSync(envPath) ? await readFile(envPath, "utf8") : "";
  const result = applyMissionControlCloudEnvDefaults(
    current,
    missionControlCloudEnvDefaults,
    options,
  );

  if (result.changedKeys.length > 0) {
    await writeFile(envPath, result.content, "utf8");
    log(`Updated .env.local defaults: ${result.changedKeys.join(", ")}`);
  } else {
    log(".env.local already has Mission Control Cloud Agent defaults");
  }

  if (result.preservedKeys.length > 0) {
    log(`Preserved existing values: ${result.preservedKeys.join(", ")}`);
  }

  if (result.changedKeys.includes("E2E_AUTH_BYPASS")) {
    log(
      options.forceBypass
        ? "Forced E2E_AUTH_BYPASS=true because --force-bypass was provided."
        : "Set E2E_AUTH_BYPASS=true because it was missing or placeholder-like.",
    );
  } else if (result.preservedKeys.includes("E2E_AUTH_BYPASS")) {
    log("Preserved explicit E2E_AUTH_BYPASS value.");
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    fail(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);

  log("Preparing Mission Control Cloud Agent environment...");
  await ensureEnvFile(options);

  if (!options.skipInstall) {
    log("Installing dependencies with Bun using the frozen lockfile...");
    run("bun", ["install", "--frozen-lockfile"]);
  }

  if (!options.skipSkillsVerify) {
    log("Verifying agent skill mirrors...");
    run("bun", ["run", "skills:verify"]);
  }

  log("Mission Control Cloud Agent environment is ready.");
  console.log("Next: bun run dev:mission-control");
  console.log("Open: http://localhost:3030");
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await main();
}
