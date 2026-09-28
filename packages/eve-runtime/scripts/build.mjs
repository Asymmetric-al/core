import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const EVE_BINARY = path.join(
  path.dirname(require.resolve("eve/package.json")),
  "bin/eve.js",
);
const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));

export function runEveBuild({
  environment = process.env,
  args = [],
  service = false,
  spawn = spawnSync,
} = {}) {
  // Generated Vercel service config can survive a later build in this checkout.
  // Decide from the service's current target, never from a saved preview command
  // or the artifact mode inherited from the generic web dependency build.
  const hostedPreview =
    environment.VERCEL === "1" &&
    environment.VERCEL_ENV === "preview" &&
    environment.VERCEL_TARGET_ENV !== "production";
  const mode = service
    ? hostedPreview
      ? "artifacts"
      : "full"
    : (environment.CORE_EVE_BUILD_MODE ?? "full");
  if (mode !== "full" && mode !== "artifacts") {
    throw new Error("CORE_EVE_BUILD_MODE must be full or artifacts.");
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
    if (service) args.shift();
    process.exitCode = runEveBuild({ args, service });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
