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
 * KNOWN BROKEN: these two timeout flags do not take effect, and raising them
 * has NOT fixed the intermittent failures. Running this script directly still
 * reports `Test timed out in 30000ms` / `Hook timed out in 90000ms` — 90000
 * being 3x30000, i.e. vitest deriving the hook budget from an effective
 * `testTimeout` of 30000. That 30000 is in neither these flags nor
 * `vitest.config.ts` (which sets `testTimeout: 20_000`), so something else is
 * supplying it and both values below are being ignored. Do not read the flags
 * as a working fix; the underlying slowness is real but still uncapped.
 *
 * Unverified leads: a second vitest/workspace config; Vitest 4 not accepting
 * `--testTimeout` on the CLI (unknown flags are dropped silently);
 * `buildVitestInvocation` joining args under `shell: true` on Windows, where
 * cmd.exe also treats the `%` in `--maxWorkers=50%` specially; or a `VITEST_*`
 * env var. Quickest probe: run one slow file with `--testTimeout` and check
 * whether the reported timeout changes at all.
 *
 * Separately, the husky pre-push wrapper exits 255 at vitest *startup* while
 * this script run directly exits 1 with ordinary failures — so that 255 belongs
 * to the wrapper, not to vitest.
 *
 * Suite health is not the problem: 513/518 files and 3460 tests pass in ~1500s;
 * only `contributions-page.test.tsx` (hook) and `contribution-batches.test.ts`
 * (test) time out.
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
