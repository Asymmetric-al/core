import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const bun = process.platform === "win32" ? "bun.exe" : "bun";
const baseArgs = ["x", "--bun", "react-doctor@latest"];

export const REACT_DOCTOR_TARGETS = Object.freeze([
  "apps/admin",
  "apps/donor",
  "apps/missionary",
  "packages/auth",
  "packages/database",
  "packages/lib",
  "packages/missionary",
  "packages/ui",
]);

export function createReactDoctorCommand(target, extraArgs = []) {
  return {
    command: bun,
    args: [...baseArgs, target, "--verbose", ...extraArgs],
  };
}

export function runReactDoctorTargets({
  targets = REACT_DOCTOR_TARGETS,
  extraArgs = process.argv.slice(2),
  cwd = process.cwd(),
  spawn = spawnSync,
} = {}) {
  for (const target of targets) {
    const command = createReactDoctorCommand(target, extraArgs);
    const result = spawn(command.command, command.args, {
      cwd,
      stdio: "inherit",
    });

    if (result.error) {
      throw result.error;
    }

    if ((result.status ?? 1) !== 0) {
      return result.status ?? 1;
    }
  }

  return 0;
}

const scriptPath = fileURLToPath(import.meta.url);
const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === scriptPath;

if (isDirectExecution) {
  process.exit(runReactDoctorTargets());
}
