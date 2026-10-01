#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  evaluatePrePushGuard,
  parsePrePushUpdates,
  targetsBranch,
} from "./pre-push-guard.mjs";

export function runPrePush({
  env = process.env,
  input,
  runCommand = spawnSync,
}) {
  const updates = parsePrePushUpdates(input);
  const guardResult = evaluatePrePushGuard({ updates, env });

  if (!guardResult.allowed) {
    console.error(`[pre-push-guard] blocked: ${guardResult.reason}`);
    console.error(`[pre-push-guard] ${guardResult.remediation}`);
    return 1;
  }

  console.log(`[pre-push-guard] allowed: ${guardResult.reason}`);

  const args = ["run", "ci:preflight"];
  if (updates.some((update) => targetsBranch(update)))
    args.push("--", "--full");
  const result = runCommand("bun", args, {
    env,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(
      `[pre-push] failed to run ci:preflight: ${result.error.message}`,
    );
    return 1;
  }

  return result.status ?? 1;
}

function runCli() {
  const input = readFileSync(0, "utf8");
  return runPrePush({ input });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
