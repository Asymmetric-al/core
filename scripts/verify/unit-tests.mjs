import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  analyzeGroupTests,
  readChangedFiles,
  unitTestScope,
} from "./ci-test-scope.mjs";

const vitestCli = fileURLToPath(
  new URL("../../node_modules/vitest/vitest.mjs", import.meta.url),
);
const bunVersionScript = fileURLToPath(
  new URL("./bun-version.mjs", import.meta.url),
);

// The acceptance directory runs once, in the dedicated acceptance-tests CI job
// (scripts/verify/acceptance-tests.mjs), not again inside test:unit.
const ACCEPTANCE_DIRECTORY = "tests/unit/acceptance";
export const ACCEPTANCE_EXCLUDE = `${ACCEPTANCE_DIRECTORY}/**`;
const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url))
  .replaceAll("\\", "/")
  .replace(/\/+$/, "");

/**
 * Whether an argument is a path inside the acceptance directory: relative to
 * the repository root (with or without `./`, either slash) or absolute under
 * it. Options, test-name patterns and words that merely contain
 * "acceptance" are not.
 */
export function namesAcceptancePath(argument) {
  if (argument.startsWith("-")) return false;
  let candidate = argument.replaceAll("\\", "/");
  if (candidate.startsWith("/") || /^[a-z]:\//i.test(candidate)) {
    const prefix = `${REPO_ROOT}/`;
    if (!candidate.toLowerCase().startsWith(prefix.toLowerCase())) return false;
    candidate = candidate.slice(prefix.length);
  }
  const normal = path.posix
    .normalize(candidate)
    .replace(/^\.\//, "")
    .replace(/\/+$/, "");
  return (
    normal === ACCEPTANCE_DIRECTORY ||
    normal.startsWith(`${ACCEPTANCE_DIRECTORY}/`)
  );
}

/**
 * Excludes the acceptance directory unless an argument is a path inside it:
 * `bun run test:unit -- tests/unit/acceptance/<file>` (the factory check
 * tool's documented form) must still run that file.
 */
export function acceptanceExclusion(args) {
  return args.some(namesAcceptancePath)
    ? []
    : ["--exclude", ACCEPTANCE_EXCLUDE];
}

export function buildVitestInvocation(args, _platform = process.platform) {
  return {
    command: process.execPath,
    args: [vitestCli, "run", ...args],
    shell: false,
  };
}

function runVitest(args, spawn = spawnSync, platform = process.platform) {
  const invocation = buildVitestInvocation(args, platform);
  const result = spawn(invocation.command, invocation.args, {
    shell: invocation.shell,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

export function runBunVersionGuard(spawn = spawnSync) {
  let result = spawn(process.execPath, [bunVersionScript], {
    shell: false,
    stdio: "inherit",
  });
  if (result.error)
    result = spawn("bun", ["run", "verify:bun-version"], {
      shell: false,
      stdio: "inherit",
    });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function defaultOptionName(argument) {
  const match = /^--(?:no-)?([^=]+)(?:=.*)?$/.exec(argument);
  if (!match) return null;
  const name = match[1].replaceAll("-", "").toLowerCase();
  if (name === "coverage" || name === "coverage.enabled") return "coverage";
  return [
    "maxworkers",
    "testtimeout",
    "hooktimeout",
    "fileparallelism",
  ].includes(name)
    ? name
    : null;
}

/**
 * Exclusions for scoped test groups a pull request provably cannot affect
 * (see ./ci-test-scope.mjs). Any failure runs every test.
 */
export function scopedExclusions({
  env = process.env,
  readChanges = readChangedFiles,
  analyze = analyzeGroupTests,
  log = console.log,
} = {}) {
  try {
    const scope = unitTestScope({ env, readChanges, analyze });
    for (const line of scope.lines) log(line);
    return scope.excludeArgs;
  } catch (error) {
    log(
      `unit-test scope: selection failed (${error instanceof Error ? error.message : error}): every test runs`,
    );
    return [];
  }
}

export function runUnitTests(
  platform = process.platform,
  spawn = spawnSync,
  args = [],
  options = {},
) {
  if (platform === "win32") {
    const status = runBunVersionGuard(spawn);
    if (status !== 0) return status;
  }
  // Preserve the Windows resource policy. Direct argument arrays prevent cmd.exe
  // from interpreting the percentage, spaces in paths or user-supplied filters.
  const defaults =
    platform === "win32"
      ? [
          "--coverage",
          "--maxWorkers=50%",
          "--testTimeout=120000",
          "--hookTimeout=120000",
          "--no-file-parallelism",
          "--exclude",
          "tests/unit/scripts/bun-version.test.ts",
        ]
      : ["--coverage"];
  // Vitest rejects duplicate scalar options. Keep unspecified defaults and
  // repeatable exclusions; explicit positive/negative and dotted aliases win.
  const boundary = args.indexOf("--");
  const explicit = new Set(
    args
      .slice(0, boundary < 0 ? args.length : boundary)
      .map(defaultOptionName)
      .filter(Boolean),
  );
  const retained = defaults.filter(
    (argument) => !explicit.has(defaultOptionName(argument)),
  );
  return runVitest(
    [
      ...retained,
      ...acceptanceExclusion(args),
      ...scopedExclusions(options),
      ...args,
    ],
    spawn,
    platform,
  );
}

const isMain =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain)
  process.exit(
    runUnitTests(process.platform, spawnSync, process.argv.slice(2)),
  );
