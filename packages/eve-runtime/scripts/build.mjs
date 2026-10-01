import { spawnSync } from "node:child_process";
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

function isHostedArtifactServiceBuild(environment) {
  return (
    environment.VERCEL === "1" &&
    normalizeDeploymentEnvironmentName(environment.VERCEL_ENV) === "preview" &&
    !isProductionDeployment(environment) &&
    resolveDeploymentEnvironment(environment) !== "development"
  );
}

export function runEveBuild({
  environment = process.env,
  args = [],
  service = false,
  mode: explicitMode,
  spawn = spawnSync,
} = {}) {
  // Generated Vercel service config can survive a later build in this checkout.
  // Decide from the service's current target, never from a saved preview command
  // or the artifact mode inherited from the generic web dependency build.
  const mode =
    explicitMode ??
    (service
      ? isHostedArtifactServiceBuild(environment)
        ? "artifacts"
        : "full"
      : (environment.CORE_EVE_BUILD_MODE ?? "full"));
  if (mode !== "full" && mode !== "artifacts") {
    throw new Error("CORE_EVE_BUILD_MODE must be full or artifacts.");
  }
  if (
    args.some((arg) => ["--full", "--artifacts", "--service"].includes(arg))
  ) {
    throw new Error("Eve build mode selectors cannot be combined.");
  }
  if (mode === "full" && args.includes("--skip-sandbox-prewarm")) {
    throw new Error(
      "--skip-sandbox-prewarm is only supported in artifacts mode.",
    );
  }

  const buildArgs = [EVE_BINARY, "build"];
  if (mode === "artifacts") {
    console.log("Eve artifact build: sandbox qualification is still required.");
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
