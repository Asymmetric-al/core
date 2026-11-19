#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { repositoryGitEnvironment } from "./environment.mjs";
import {
  evaluatePrePushGuard,
  parsePrePushUpdates,
  targetsBranch,
} from "./pre-push-guard.mjs";

// Selects the preflight profile for a push that does not target production.
// The Core factory's publish step sets it to "full"
// (scripts/archon-factory/pack/.shared/publication.mjs FULL_PREFLIGHT_ENV).
export const PRE_PUSH_PROFILE_ENV = "ASYM_PRE_PUSH_PROFILE";

const PREFLIGHT = ["run", "ci:preflight"];

/**
 * Production pushes always run the full profile with every app compiled.
 * Otherwise the selector chooses: unset, empty or "fast" runs the fast
 * profile, "full" runs `bun run ci:preflight`, and anything else is refused
 * so a mistyped selector can never quietly weaken the gate.
 */
export function selectPreflight({ updates, env = process.env }) {
  if (updates.some((update) => targetsBranch(update)))
    return { ok: true, profile: "full", args: [...PREFLIGHT, "--", "--full"] };
  const requested = env[PRE_PUSH_PROFILE_ENV] ?? "";
  if (requested === "full")
    return { ok: true, profile: "full", args: [...PREFLIGHT] };
  if (requested === "" || requested === "fast")
    return { ok: true, profile: "fast", args: [...PREFLIGHT, "--", "--fast"] };
  return {
    ok: false,
    reason: `${PRE_PUSH_PROFILE_ENV} must be unset, "fast" or "full"; got ${JSON.stringify(requested)}`,
  };
}

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

  const selection = selectPreflight({ updates, env });
  if (!selection.ok) {
    console.error(`[pre-push] blocked: ${selection.reason}`);
    return 1;
  }
  console.log(
    `[pre-push] running the ${selection.profile} profile: bun ${selection.args.join(" ")}`,
  );

  const result = runCommand("bun", selection.args, {
    // Preflight creates disposable repositories; hook-local Git variables must
    // not redirect their commands into the repository being pushed.
    env: repositoryGitEnvironment(env),
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
