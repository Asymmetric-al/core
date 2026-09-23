#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  evaluatePrePushGuard,
  parsePrePushUpdates,
} from "./pre-push-guard.mjs";
import { parseGitHubRepoSlug } from "./trusted-identities.mjs";

export function createPrePushEnvironment({
  input,
  remoteName,
  remoteUrl,
  env,
}) {
  const { ASYM_PRE_PUSH_REMOTE_URL: _discardedRemoteUrl, ...safeEnv } = env;
  const safeRemoteName =
    typeof remoteName === "string" && /^[A-Za-z0-9._-]+$/.test(remoteName)
      ? remoteName
      : "";

  return {
    ...safeEnv,
    ASYM_PRE_PUSH_UPDATES: input,
    ASYM_PRE_PUSH_REMOTE_NAME: safeRemoteName,
    ASYM_PRE_PUSH_REPOSITORY_SLUG: parseGitHubRepoSlug(remoteUrl) ?? "",
  };
}

export function runPrePush({
  env = process.env,
  input,
  remoteName,
  remoteUrl,
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

  const result = runCommand("bun", ["run", "ci:preflight"], {
    env: createPrePushEnvironment({
      input,
      remoteName,
      remoteUrl,
      env,
    }),
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
  const [remoteName = "", remoteUrl = ""] = process.argv.slice(2);

  return runPrePush({ input, remoteName, remoteUrl });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
