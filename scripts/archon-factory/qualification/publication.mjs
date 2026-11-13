#!/usr/bin/env node
// Live qualification of hook-aware publication on VM 100, without GitHub
// writes: mirror fetch, per-issue clone, credential-free install, a commit
// through Core's real pre-commit hook and a push through the real pre-push
// guard + ci:preflight into the private outbox. Uses a synthetic workspace
// number that is not a GitHub issue. Run as admin:
//   CORE_FACTORY_CONFIG=/srv/core-factory/control/core-factory.json \
//   node publication.mjs <workspace-number>
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { factoryPaths, loadConfig } from "../pack/.shared/config.mjs";
import {
  createGit,
  ensureIssueRepo,
  ensureMirror,
  fetchMirror,
  prepareBranch,
  revParse,
  statusPorcelain,
} from "../pack/.shared/git.mjs";
import {
  hookEvidence,
  hookedGit,
  restoreHookShims,
} from "../pack/.shared/publication.mjs";
import { ensureInstall, runInIssueRepo } from "../pack/.shared/round.mjs";

const posix = path.posix;
const number = Number(process.argv[2]);
if (!Number.isSafeInteger(number) || number < 900000)
  throw new Error("Use a synthetic workspace number >= 900000");
const config = loadConfig();
const paths = factoryPaths(config);
const git = createGit({
  executable: config.git.executable,
  author: { name: config.git.authorName, email: config.git.authorEmail },
  issues: paths.issues,
});
const evidence = posix.join(paths.runs, `qualification-publication-${number}`);
mkdirSync(evidence, { recursive: true });
const log = (entry) => {
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry });
  appendFileSync(posix.join(evidence, "steps.jsonl"), line + "\n");
  console.log(line.slice(0, 600));
};
const step = async (name, work) => {
  const started = Date.now();
  try {
    const result = await work();
    log({ step: name, ok: true, ms: Date.now() - started, ...(result ?? {}) });
    return result;
  } catch (error) {
    log({
      step: name,
      ok: false,
      ms: Date.now() - started,
      error: String(error.message).slice(0, 2000),
    });
    throw error;
  }
};

await step("mirror", async () => {
  await ensureMirror({ git, paths, remote: config.repository.remote });
  await fetchMirror({ git, paths });
  return {
    develop: await revParse(
      { git, gitDir: paths.mirror },
      "refs/remotes/origin/develop",
    ),
  };
});
const where = await step("issue-clone", async () =>
  ensureIssueRepo({ git, paths, issue: number }),
);
const base = await revParse(
  { git, cwd: where.repo },
  "refs/remotes/origin/develop",
);
const branch = `factory/${number}-publication-qualification`;
await step("branch", async () =>
  prepareBranch({ git, repo: where.repo, branch, head: null, base }),
);
// The delivery rounds' own step runner and install: trusted Git metadata is
// restored before every container, the lockfile's cache seed is written only
// by the no-scripts install, and every other step sees a private view of it.
const round = {
  where,
  paths,
  config,
  runId: `qualification-publication-${number}`,
  issue: number,
  assignment: `qualification-${number}`,
  ledger: {
    write: (node, value) =>
      log({ ledger: node, value: JSON.stringify(value).slice(0, 400) }),
    read: () => null,
  },
};
const container = (command, options) =>
  runInIssueRepo(round, { command, ...options });
const record = (name, receipt, hook) => {
  writeFileSync(
    posix.join(evidence, `${name}.json`),
    JSON.stringify(receipt, null, 2),
  );
  return {
    status: receipt.status,
    exitCode: receipt.exitCode,
    container: receipt.containerId,
    cleanup: receipt.cleanupConfirmed,
    ...(hook ? { hooks: hookEvidence(hook, receipt) } : {}),
    tail: (receipt.stdout + receipt.stderr).slice(-1500),
  };
};
await step("install", async () => ensureInstall(round, { clean: true }));
const file = posix.join(
  where.repo,
  "docs",
  "ops",
  "archon-factory-publication-qualification.md",
);
writeFileSync(
  file,
  `# Publication qualification\n\nSynthetic factory workspace ${number}. Not for merge.\n`,
);
await step("add", async () =>
  record(
    "add",
    await container(
      [
        "git",
        "add",
        "--",
        "docs/ops/archon-factory-publication-qualification.md",
      ],
      { timeoutMs: 120_000 },
    ),
  ),
);
restoreHookShims(where.repo);
const commit = await step("commit-with-hooks", async () =>
  record(
    "commit",
    await container(
      hookedGit(where.repo, [
        "commit",
        "-m",
        "docs: factory publication qualification (synthetic, not for merge)",
      ]),
      { network: "bridge", timeoutMs: 30 * 60_000 },
    ),
    "pre-commit",
  ),
);
const candidate = await revParse({ git, cwd: where.repo }, "HEAD");
const status = await statusPorcelain({ git }, where.repo);
log({
  step: "post-commit",
  candidate,
  base,
  clean: status.length === 0,
  dirty: status.slice(0, 20),
  commitStatus: commit.status,
  commitHooksRan: commit.hooks.ran,
});
restoreHookShims(where.repo);
const push = await step("pre-push-preflight", async () =>
  record(
    "pre-push",
    await container(
      hookedGit(where.repo, [
        "push",
        "--porcelain",
        "--force",
        "/outbox",
        `HEAD:refs/heads/${branch}`,
      ]),
      {
        network: "bridge",
        cache: true,
        outbox: true,
        timeoutMs: 110 * 60_000,
        memoryMb: 32768,
        cpus: 16,
      },
    ),
    "pre-push",
  ),
);
const outboxHead = (
  await git.git(["rev-parse", "--verify", `refs/heads/${branch}`], {
    gitDir: where.outbox,
  })
).stdout.trim();
log({
  step: "outbox",
  outboxHead,
  matchesCandidate: outboxHead === candidate,
  prePush: push.status,
  prePushHooksRan: push.hooks.ran,
});
