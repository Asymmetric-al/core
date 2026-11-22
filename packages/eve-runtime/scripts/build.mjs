import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isProductionDeployment,
  normalizeDeploymentEnvironmentName,
  resolveDeploymentEnvironment,
} from "@asym/env/target-env";

const require = createRequire(import.meta.url);
const EVE_BINARY = path.join(
  path.dirname(require.resolve("eve/package.json")),
  "bin/eve.js",
);
const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));
const GOVERNANCE_CHECK_SCRIPT = path.join(
  PACKAGE_ROOT,
  "scripts",
  "check-production-governance.ts",
);
const GOVERNANCE_UNAVAILABLE = Object.freeze({
  allowed: false,
  reason: "governance_unavailable",
});

function isHostedArtifactServiceBuild(environment) {
  return (
    environment.VERCEL === "1" &&
    normalizeDeploymentEnvironmentName(environment.VERCEL_ENV) === "preview" &&
    !isProductionDeployment(environment) &&
    resolveDeploymentEnvironment(environment) !== "development"
  );
}

function isHostedProductionServiceBuild(environment) {
  return environment.VERCEL === "1" && isProductionDeployment(environment);
}

function resolveBunExecutable(environment) {
  const execPath = environment.npm_execpath;
  if (
    typeof execPath === "string" &&
    /(?:^|[/\\])bun(?:\.exe)?$/iu.test(execPath)
  ) {
    return execPath;
  }
  return "bun";
}

function normalizeProbeEnvironment(environment) {
  const normalized = { ...environment };
  if (typeof environment.VERCEL_ENV === "string") {
    normalized.VERCEL_ENV = normalizeDeploymentEnvironmentName(
      environment.VERCEL_ENV,
    );
  }
  if (typeof environment.VERCEL_TARGET_ENV === "string") {
    normalized.VERCEL_TARGET_ENV = normalizeDeploymentEnvironmentName(
      environment.VERCEL_TARGET_ENV,
    );
  }
  return normalized;
}

function defaultResolveProductionGovernance(environment) {
  if (
    typeof environment.NEXT_PUBLIC_SUPABASE_URL !== "string" ||
    environment.NEXT_PUBLIC_SUPABASE_URL.trim().length === 0
  ) {
    return GOVERNANCE_UNAVAILABLE;
  }
  if (!existsSync(GOVERNANCE_CHECK_SCRIPT)) {
    return GOVERNANCE_UNAVAILABLE;
  }

  const result = spawnSync(
    resolveBunExecutable(environment),
    ["--no-env-file", GOVERNANCE_CHECK_SCRIPT],
    {
      cwd: PACKAGE_ROOT,
      env: normalizeProbeEnvironment(environment),
      encoding: "utf8",
      shell: false,
      timeout: 15_000,
    },
  );
  if (result.error || result.status !== 0) {
    return GOVERNANCE_UNAVAILABLE;
  }

  const lastLine = (result.stdout ?? "").trim().split(/\r?\n/u).at(-1);
  if (!lastLine) {
    return GOVERNANCE_UNAVAILABLE;
  }

  try {
    const parsed = JSON.parse(lastLine);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.allowed === "boolean" &&
      typeof parsed.reason === "string"
    ) {
      return { allowed: parsed.allowed, reason: parsed.reason };
    }
  } catch {
    // Malformed output fails closed to full qualification.
  }

  return GOVERNANCE_UNAVAILABLE;
}

function isPersistedReleaseDisabled(environment, resolveProductionGovernance) {
  try {
    const decision = resolveProductionGovernance(environment);
    return (
      decision?.allowed === false && decision?.reason === "release_disabled"
    );
  } catch {
    return false;
  }
}

export function runEveBuild({
  environment = process.env,
  args = [],
  service = false,
  mode: explicitMode,
  spawn = spawnSync,
  resolveProductionGovernance = defaultResolveProductionGovernance,
} = {}) {
  if (
    args.some((arg) => ["--full", "--artifacts", "--service"].includes(arg))
  ) {
    throw new Error("Eve build mode selectors cannot be combined.");
  }
  if (service && args.includes("--skip-sandbox-prewarm")) {
    throw new Error(
      "--skip-sandbox-prewarm is only supported in artifacts mode.",
    );
  }

  // Generated Vercel service config can survive a later build in this checkout.
  // Decide from the service's current target, never from a saved preview command
  // or the artifact mode inherited from the generic web dependency build.
  let releaseOffProduction = false;
  let mode;
  if (explicitMode !== undefined) {
    mode = explicitMode;
  } else if (service) {
    if (isHostedArtifactServiceBuild(environment)) {
      mode = "artifacts";
    } else if (
      isHostedProductionServiceBuild(environment) &&
      isPersistedReleaseDisabled(environment, resolveProductionGovernance)
    ) {
      mode = "artifacts";
      releaseOffProduction = true;
    } else {
      mode = "full";
    }
  } else {
    mode = environment.CORE_EVE_BUILD_MODE ?? "full";
  }

  if (mode !== "full" && mode !== "artifacts") {
    throw new Error("CORE_EVE_BUILD_MODE must be full or artifacts.");
  }
  if (mode === "full" && args.includes("--skip-sandbox-prewarm")) {
    throw new Error(
      "--skip-sandbox-prewarm is only supported in artifacts mode.",
    );
  }

  const buildArgs = [EVE_BINARY, "build"];
  if (mode === "artifacts") {
    console.log(
      releaseOffProduction
        ? "Eve Release-Off production artifact build: persisted governance confirms release_disabled; sandbox qualification remains required before enabling Eve."
        : "Eve artifact build: sandbox qualification is still required.",
    );
    buildArgs.push("--skip-sandbox-prewarm");
  }
  buildArgs.push(...args);

  const result = spawn(process.execPath, buildArgs, {
    cwd: PACKAGE_ROOT,
    env: environment,
    shell: false,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    const service = args[0] === "--service";
    const mode =
      args[0] === "--full"
        ? "full"
        : args[0] === "--artifacts"
          ? "artifacts"
          : undefined;
    if (service || mode) args.shift();
    process.exitCode = runEveBuild({ args, service, mode });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
