#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const PRODUCTION_BRANCH = "epic";
export const RELEASE_PUSH_ENV = "ASYM_RELEASE_PRODUCTION_PUSH";
export const RELEASE_REASON_ENV = "ASYM_RELEASE_PRODUCTION_REASON";
export const EMERGENCY_BYPASS_ENV = "ASYM_PRODUCTION_PUSH_BYPASS_REASON";

const ZERO_SHA = "0000000000000000000000000000000000000000";

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function parsePrePushUpdates(input) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [localRef, localSha, remoteRef, remoteSha] = line.split(/\s+/);
      return { localRef, localSha, remoteRef, remoteSha };
    })
    .filter((update) => update.remoteRef);
}

export function targetsBranch(update, branch = PRODUCTION_BRANCH) {
  return update.remoteRef === `refs/heads/${branch}`;
}

export function isDeletion(update) {
  return update.localSha === ZERO_SHA;
}

export function evaluatePrePushGuard({
  updates,
  env = process.env,
  productionBranch = PRODUCTION_BRANCH,
}) {
  const productionUpdates = updates.filter((update) =>
    targetsBranch(update, productionBranch),
  );

  if (productionUpdates.length === 0) {
    return {
      allowed: true,
      reason: `no push targets ${productionBranch}`,
    };
  }

  const releaseReason = env[RELEASE_REASON_ENV];
  const releaseCommandAllowed =
    env[RELEASE_PUSH_ENV] === "1" && isNonEmpty(releaseReason);

  if (releaseCommandAllowed) {
    return {
      allowed: true,
      reason: `production release command: ${releaseReason.trim()}`,
    };
  }

  const emergencyReason = env[EMERGENCY_BYPASS_ENV];

  if (isNonEmpty(emergencyReason)) {
    return {
      allowed: true,
      reason: `emergency production push bypass: ${emergencyReason.trim()}`,
    };
  }

  const deletingProduction = productionUpdates.some(isDeletion);
  const action = deletingProduction ? "delete" : "push to";

  return {
    allowed: false,
    reason: `direct ${action} ${productionBranch} is blocked`,
    remediation: `Use \`bun run release:production\` or set ${EMERGENCY_BYPASS_ENV} with a concrete reason for a true emergency.`,
  };
}

function runCli() {
  const input = readFileSync(0, "utf8");
  const updates = parsePrePushUpdates(input);
  const result = evaluatePrePushGuard({ updates });

  if (result.allowed) {
    console.log(`[pre-push-guard] allowed: ${result.reason}`);
    return 0;
  }

  console.error(`[pre-push-guard] blocked: ${result.reason}`);
  console.error(`[pre-push-guard] ${result.remediation}`);
  return 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
