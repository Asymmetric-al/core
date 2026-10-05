import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installNative } from "./install-native.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

/** Prepare native instructions and optionally dependencies, without running a product trial. */
export function runSetupCloud({
  args = [],
  sourceRoot = root,
  home,
  codexHome,
  execute = spawnSync,
} = {}) {
  if (
    args.length > 1 ||
    args.some((arg) => !["--install-only", "--verify-only"].includes(arg))
  ) {
    throw new Error(
      "Unsupported setup flags; use --install-only, --verify-only, or no flags.",
    );
  }
  const options = { sourceRoot, home, codexHome };
  if (args[0] === "--install-only") {
    installNative(options);
    installNative({ ...options, verify: true });
    return;
  }
  const manifest = JSON.parse(
    readFileSync(path.join(sourceRoot, "package.json"), "utf8"),
  );
  if (!/^bun@\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(manifest.packageManager ?? "")) {
    throw new Error("Cloud setup requires an exact Bun pin in package.json.");
  }
  const expected = manifest.packageManager.slice(4);
  const installed = execute("bun", ["--version"], {
    cwd: sourceRoot,
    encoding: "utf8",
    shell: false,
  });
  if (installed.status !== 0 || installed.stdout?.trim() !== expected) {
    throw new Error(
      `Cloud setup requires Bun ${expected} from package.json; install that runtime before running this script.`,
    );
  }
  function run(commandArgs) {
    const result = execute("bun", commandArgs, {
      cwd: sourceRoot,
      stdio: "inherit",
      shell: false,
    });
    if (result.status !== 0)
      throw new Error(
        `Cloud setup command failed: bun ${commandArgs.join(" ")} (status ${result.status ?? "unavailable"})`,
      );
  }
  if (args[0] === "--verify-only") {
    installNative({ ...options, verify: true });
  } else {
    run(["ci", "--backend=copyfile"]);
    installNative(options);
    installNative({ ...options, verify: true });
  }
  for (const command of [
    "verify:bun-version",
    "verify:bun-lock-drift",
    "skills:verify",
    "verify:workspace-contract",
  ])
    run(["run", command]);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    runSetupCloud({ args: process.argv.slice(2) });
    console.log(
      "Native factory instructions verified. Actual role loading and model access require runtime verification. Shared files are not isolated. No trial was started.",
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
