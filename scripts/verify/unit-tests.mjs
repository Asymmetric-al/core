import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function buildVitestInvocation(args, platform = process.platform) {
  return {
    command: "bunx",
    args: ["vitest", "run", ...args],
    shell: platform === "win32",
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

export function runUnitTests(platform = process.platform, spawn = spawnSync) {
  if (platform === "win32") {
    const bunVersionStatus = runBunVersionGuard(spawn);

    if (bunVersionStatus !== 0) {
      return bunVersionStatus;
    }

    return runVitest(
      [
        "--coverage",
        "--maxWorkers=50%",
        "--testTimeout=30000",
        "--no-file-parallelism",
        "--exclude",
        "tests/unit/scripts/bun-version.test.ts",
      ],
      spawn,
      platform,
    );
  }

  return runVitest(["--coverage"], spawn, platform);
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
