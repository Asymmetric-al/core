// Hook-aware publication. Core's pre-push hook runs ci:preflight, which runs
// candidate code, so it runs inside the credential-free executor while the
// container pushes to the issue's private outbox. The host then pushes that
// exact verified commit from the hookless mirror and reads the remote back.
//
// Core's hooks are pinned on the container's git command line and their
// shims are rewritten by the factory before each use, so a candidate cannot
// switch them off; a commit or push counts only when its receipt shows the
// hook (and the tool it runs) actually ran.
import { lstatSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { publishFromOutbox, remoteHead } from "./git.mjs";
import { runInIssueRepo } from "./round.mjs";
import { checkFactoryStorage } from "./storage-policy.mjs";

const posix = path.posix;
export const PINNED_HOOKS = ["pre-commit", "pre-push"];

// Runs the tracked .husky/<hook> exactly like Husky's runner, ignoring
// HUSKY=0 and user init files, and reports start and outcome.
const SHIM = `#!/bin/sh
# Written by the Core factory before each hooked step (core.hooksPath is
# pinned on the command line); Core's tracked .husky/<hook> does the work.
n=$(basename "$0")
s="$(dirname "$(dirname "$0")")/$n"
echo "core-factory: $n hook started"
if [ ! -f "$s" ]; then
  echo "core-factory: $n hook missing"
  exit 1
fi
export PATH="$PWD/node_modules/.bin:$PATH"
sh -e "$s" "$@"
c=$?
if [ "$c" -eq 0 ]; then echo "core-factory: $n hook passed"; else echo "core-factory: $n hook failed ($c)"; fi
exit "$c"
`;

export function restoreHookShims(repo) {
  const husky = posix.join(repo, ".husky");
  let stat = null;
  try {
    stat = lstatSync(husky);
  } catch {}
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory())
    throw Object.assign(
      new Error(
        "The candidate has no real .husky directory, so Core's hooks cannot be pinned",
      ),
      { code: "hooks-unpinned" },
    );
  const dir = posix.join(husky, "_");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { mode: 0o755 });
  writeFileSync(posix.join(dir, ".gitignore"), "*\n", { flag: "wx" });
  for (const hook of PINNED_HOOKS)
    writeFileSync(posix.join(dir, hook), SHIM, { flag: "wx", mode: 0o755 });
  return dir;
}

export function hookedGit(repo, args) {
  return [
    "git",
    "-c",
    `core.hooksPath=${posix.join(repo, ".husky", "_")}`,
    ...args,
  ];
}

const HOOK_TOOLS = {
  "pre-commit": (out) => /Running tasks for (?:staged|changed) files/.test(out),
  "pre-push": (out) => out.includes("==> PASS ci:preflight"),
};

export function hookEvidence(hook, receipt) {
  const out = `${receipt?.stdout ?? ""}\n${receipt?.stderr ?? ""}`;
  const shim = out.includes(`core-factory: ${hook} hook passed`);
  const tool = HOOK_TOOLS[hook](out);
  return { ran: shim && tool, shim, tool };
}

export function publicationTarget(branch, { issue, targetBranch }) {
  return (
    typeof branch === "string" &&
    branch !== targetBranch &&
    new RegExp(`^factory/${issue}-[a-z0-9-]{1,80}$`).test(branch)
  );
}

function storageRefused(round, storage) {
  try {
    round.ledger.write("publication-storage", storage);
  } catch {}
  return {
    ok: false,
    reason: `Storage refused: ${storage.code}`,
    blocked: {
      code: storage.code,
      storage,
      recovery:
        "Restore storage prerequisites and explicit operator policy before retrying publication",
    },
  };
}

export async function publishCandidate(
  round,
  { branch, candidate },
  { execute } = {},
) {
  if (
    !publicationTarget(branch, {
      issue: round.issue,
      targetBranch: round.config.repository.targetBranch,
    })
  )
    return {
      ok: false,
      reason: `Refusing to publish to ${branch}`,
      blocked: {
        code: "forbidden-target",
        detail: `Branch ${branch} is not this issue's factory branch`,
        recovery: "Inspect the work item's branch, then retry the issue",
      },
    };
  const storageBeforeChecks = await checkFactoryStorage({
    ...round,
    operation: "publish",
  });
  if (
    storageBeforeChecks.ok !== true ||
    storageBeforeChecks.code !== "STORAGE_READY"
  )
    return storageRefused(round, storageBeforeChecks);
  try {
    restoreHookShims(round.where.repo);
  } catch (error) {
    return {
      ok: false,
      reason: error.message,
      blocked: { code: error.code ?? "hooks-unpinned", detail: error.message },
    };
  }
  const prePush = await runInIssueRepo(
    round,
    {
      command: hookedGit(round.where.repo, [
        "push",
        "--porcelain",
        "--force",
        "/outbox",
        `HEAD:refs/heads/${branch}`,
      ]),
      network: "bridge",
      cache: true,
      outbox: true,
      timeoutMs: 85 * 60_000,
      memoryMb: 32768,
      cpus: 16,
    },
    { execute },
  );
  const tail = ((prePush.stdout ?? "") + (prePush.stderr ?? "")).slice(-6000);
  const hooks = hookEvidence("pre-push", prePush);
  round.ledger.write("pre-push", {
    status: prePush.status,
    exitCode: prePush.exitCode,
    container: prePush.containerId,
    cleanup: prePush.cleanupConfirmed,
    candidate,
    hooks,
    tail,
  });
  if (prePush.status !== "passed") {
    const stages = [...tail.matchAll(/==> CI preflight: ([\w-]+)/g)].map(
      (match) => match[1],
    );
    return {
      ok: false,
      reason: `Pre-push guard or preflight failed${stages.length ? ` at ${stages.at(-1)}` : ""}`,
      repair: {
        acceptance: [],
        implementation: [
          `The normal pre-push hook (ci:preflight) failed for ${candidate}. Output tail:\n${tail.slice(-3500)}`,
        ],
        source: "pre-push",
      },
      fingerprint: `prepush:${stages.at(-1) ?? prePush.exitCode}`,
    };
  }
  if (!hooks.ran)
    return {
      ok: false,
      reason:
        "The push succeeded but its receipt does not show Core's pre-push hook and ci:preflight passing",
      blocked: {
        code: "hooks-unverified",
        detail: `hook shim ${hooks.shim ? "passed" : "not seen"}; ci:preflight ${hooks.tool ? "passed" : "not seen"}. Output tail: ${tail.slice(-800)}`,
        recovery: "Inspect the pre-push receipt, then retry the issue",
      },
    };
  const storageBeforePush = await checkFactoryStorage({
    ...round,
    operation: "publish",
  });
  if (
    storageBeforePush.ok !== true ||
    storageBeforePush.code !== "STORAGE_READY"
  )
    return storageRefused(round, storageBeforePush);
  const remote = round.config.repository.remote;
  let pushed;
  let observed;
  try {
    pushed = await publishFromOutbox({
      git: round.git,
      paths: round.paths,
      issue: round.issue,
      branch,
      expected: candidate,
      credentialHelper: `!${round.config.github.executable} auth git-credential`,
      remote,
      extraEnv: {
        GH_CONFIG_DIR: round.config.github.configDir,
        GH_PROMPT_DISABLED: "1",
      },
    });
    observed = await remoteHead({ git: round.git, remote }, branch);
  } catch (error) {
    // The push may or may not have reached GitHub; record it for reconciliation.
    const detail = String(error?.message ?? error).slice(0, 1200);
    round.ledger.write("push", {
      code: pushed?.code ?? null,
      observed: null,
      candidate,
      error: detail,
    });
    return {
      ok: false,
      reason:
        "The host push or its readback failed; the remote state is unknown",
      blocked: {
        code: "push-unknown",
        detail,
        recovery: "Read the remote branch head, then retry the issue",
      },
    };
  }
  round.ledger.write("push", {
    code: pushed.code,
    observed,
    candidate,
    stderr: pushed.stderr,
  });
  if (observed !== candidate)
    return {
      ok: false,
      reason: "GitHub does not show the candidate on the branch",
      blocked: {
        code: "push-unverified",
        detail: `push exit ${pushed.code}; remote head ${observed ?? "absent"}; ${pushed.stderr}`,
        recovery: "Inspect the remote branch, then retry the issue",
      },
    };
  return {
    ok: true,
    reason: `Pushed ${candidate.slice(0, 12)}`,
    hooks: { prePush: true },
  };
}
