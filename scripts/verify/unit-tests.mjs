import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const vitestCli = fileURLToPath(
  new URL("../../node_modules/vitest/vitest.mjs", import.meta.url),
);
const bunVersionScript = fileURLToPath(
  new URL("./bun-version.mjs", import.meta.url),
);

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

export function runUnitTests(
  platform = process.platform,
  spawn = spawnSync,
  args = [],
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
  return runVitest([...retained, ...args], spawn, platform);
}

const isMain =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain)
  process.exit(
    runUnitTests(process.platform, spawnSync, process.argv.slice(2)),
  );
