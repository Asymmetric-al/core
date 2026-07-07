import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function buildVitestInvocation(args, platform = process.platform) {
  const useShell = platform === "win32";
  return {
    command: useShell ? ["bunx", "vitest", "run", ...args].join(" ") : "bunx",
    args: useShell ? [] : ["vitest", "run", ...args],
    shell: useShell,
  };
}

function runVitest(args, spawn = spawnSync, platform = process.platform) {
  const invocation = buildVitestInvocation(args, platform);
  const result = spawn(invocation.command, invocation.args, {
    shell: invocation.shell,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

export function runBunVersionGuard(spawn = spawnSync) {
  const result = spawn("bun run verify:bun-version", [], {
    shell: true,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

export function runUnitTests(platform = process.platform) {
  if (platform === "win32") {
    const bunVersionStatus = runBunVersionGuard();

    if (bunVersionStatus !== 0) {
      return bunVersionStatus;
    }

    return runVitest([
      "--coverage",
      "--maxWorkers=50%",
      "--testTimeout=30000",
      "--no-file-parallelism",
      "--exclude",
      "tests/unit/scripts/bun-version.test.ts",
    ]);
  }

  return runVitest(["--coverage"]);
}

const isMain =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const bunVersionStatus = runUnitTests();
  if (bunVersionStatus !== 0) {
    process.exit(bunVersionStatus);
  }
}
