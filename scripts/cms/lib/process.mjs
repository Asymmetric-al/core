import { spawnSync } from "node:child_process";

export function commandExists(command) {
  const result =
    process.platform === "win32"
      ? spawnSync("where", [command], { stdio: "ignore" })
      : spawnSync("sh", ["-lc", `command -v ${command}`], {
          stdio: "ignore",
        });

  return result.status === 0;
}

export function runCommand(label, command, args, options = {}) {
  process.stdout.write(`==> ${label}\n`);
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    shell: process.platform === "win32",
    stdio: options.stdio ?? "inherit",
  });

  if (result.error) {
    throw new Error(`Failed to run ${command}: ${result.error.message}`, {
      cause: result.error,
    });
  }

  if (result.status !== 0 && options.allowFailure !== true) {
    throw new Error(`${label} failed with exit code ${result.status ?? 1}`);
  }

  return result;
}

export function captureCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    ok: !result.error && result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error ?? null,
  };
}

export function maskValue(value) {
  if (!value) {
    return "";
  }

  if (value.length <= 12) {
    return "<set>";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
