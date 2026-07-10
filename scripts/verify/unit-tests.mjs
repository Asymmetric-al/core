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
        "--testTimeout=30000",
        "--no-file-parallelism",
        "--exclude",
        "tests/unit/scripts/bun-version.test.ts",
      ]),
    );
  }

  process.exit(runVitest(["--coverage"]));
}
