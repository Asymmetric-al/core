import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function runVitest(args) {
  const result = spawnSync("bunx", ["vitest", "run", ...args], {
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

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
