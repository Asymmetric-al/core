import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const reactDoctorRunner = "bunx";
const baseArgs = ["--bun", "react-doctor@latest"];

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
    command: reactDoctorRunner,
    args: [
      ...baseArgs,
      target,
      "--verbose",
      ...normalizeReactDoctorArgs(extraArgs),
    ],
  };
}

function normalizeReactDoctorArgs(args) {
  const normalizedArgs = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--full") {
      normalizedArgs.push("--scope", "full");
      continue;
    }

    if (arg === "--offline") {
      normalizedArgs.push("--no-score");
      continue;
    }

    if (arg === "--fail-on") {
      normalizedArgs.push("--blocking");
      if (index + 1 < args.length) {
        index += 1;
        normalizedArgs.push(args[index]);
      }
      continue;
    }

    if (arg.startsWith("--fail-on=")) {
      normalizedArgs.push(`--blocking=${arg.slice("--fail-on=".length)}`);
      continue;
    }

    normalizedArgs.push(arg);
  }

  return normalizedArgs;
}

export function createSpawnCommand(
  command,
  { platform = process.platform, comSpec = process.env.ComSpec } = {},
) {
  if (platform !== "win32") {
    return command;
  }

  return {
    command: comSpec ?? "cmd.exe",
    args: ["/d", "/s", "/c", command.command, ...command.args],
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
    const spawnCommand = createSpawnCommand(command);
    const result = spawn(spawnCommand.command, spawnCommand.args, {
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
