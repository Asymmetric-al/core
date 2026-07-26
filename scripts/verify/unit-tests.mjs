import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

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

function runDefaultBunVersionGuard() {
  const bunVersionScriptPath = fileURLToPath(
    new URL("./bun-version.mjs", import.meta.url),
  );

  let result = spawnSync(process.execPath, [bunVersionScriptPath], {
    shell: false,
    stdio: "inherit",
  });

  if (result.error) {
    result = spawnSync("bun", ["run", "verify:bun-version"], {
      shell: process.platform === "win32",
      stdio: "inherit",
    });
  }

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

export function runBunVersionGuard(spawn = spawnSync) {
  if (spawn === spawnSync) {
    return runDefaultBunVersionGuard();
  }

  const result = spawn("bun run verify:bun-version", [], {
    shell: true,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

/**
 * Windows runs the suite through one sequential worker (`--no-file-parallelism`),
 * so a test's wall time is dominated by how much of its module graph is already
 * transformed — not by the assertions.
 *
 * Measured on the admin subset (65 files) with these exact flags: the heaviest
 * jsdom files take ~17-20s with a warm cache, but the same
 * `contributions-page.test.tsx` takes ~119s cold, and its first test alone ~63s.
 * Overhead dwarfs the work: 37s import + 42s environment vs 66s of tests for 65
 * warm files, and 496s import + 224s environment for the full cold suite.
 *
 * At the previous `--testTimeout=30000` that spread landed on the wrong side of
 * the cap intermittently, failing a *different* admin/api test each run while
 * every one passed in isolation.
 *
 * `--hookTimeout` is the load-bearing half, and is easy to miss: the observed
 * failures were `Hook timed out in 30000ms` inside `beforeEach`, which
 * `--testTimeout` does not govern. Passing `--testTimeout` alone changed
 * nothing and simply moved which files failed. `vitest.config.ts` sets
 * `hookTimeout: 120_000`, but a CLI `--testTimeout` drags the effective hook
 * budget down with it, so both must be stated explicitly here.
 *
 * Neither masks a hang — a genuinely stuck test or hook still fails, just later.
 */
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
        "--testTimeout=120000",
        "--hookTimeout=120000",
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
  if (process.platform === "win32") {
    const bunVersionScriptPath = fileURLToPath(
      new URL("./bun-version.mjs", import.meta.url),
    );

    let bunVersionResult = spawnSync(process.execPath, [bunVersionScriptPath], {
      shell: false,
      stdio: "inherit",
    });

    if (bunVersionResult.error) {
      bunVersionResult = spawnSync("bun", ["run", "verify:bun-version"], {
        shell: process.platform === "win32",
        stdio: "inherit",
      });
    }

    if (bunVersionResult.error) {
      throw bunVersionResult.error;
    }

    const bunVersionStatus = bunVersionResult.status ?? 1;

    if (bunVersionStatus !== 0) {
      process.exit(bunVersionStatus);
    }

    process.exit(
      runVitest([
        "--coverage",
        "--maxWorkers=50%",
        "--testTimeout=120000",
        "--hookTimeout=120000",
        "--no-file-parallelism",
        "--exclude",
        "tests/unit/scripts/bun-version.test.ts",
      ]),
    );
  }

  process.exit(runVitest(["--coverage"]));
}
