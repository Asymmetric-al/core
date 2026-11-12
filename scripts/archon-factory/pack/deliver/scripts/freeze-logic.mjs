// Freeze decisions. Writers can change the issue clone through run_check, so
// the trusted freeze verifies what it commits: Ezra's recorded acceptance
// tests must be unchanged, every committed path must be assigned, and no
// commit may appear outside the factory's own commit step.
import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { revParse, statusPorcelain } from "../../.shared/git.mjs";
import { globToRegExp } from "../../.shared/policy.mjs";
import { makeRepair, repairFingerprint } from "./repair-logic.mjs";

const posix = path.posix;

export const blobId = (content) =>
  createHash("sha1")
    .update(`blob ${content.length}\0`)
    .update(content)
    .digest("hex");

// Same digest after-define uses (round.mjs sha256 of the JSON value).
export const acceptanceRevision = (criteria, tests) =>
  createHash("sha256")
    .update(JSON.stringify({ criteria, tests }))
    .digest("hex");

export const repairOf = (items, source = "freeze") =>
  makeRepair({ implementation: items, source });

export function cleanupHold(error, { step, runId, assignment, issue }) {
  const receipt = error?.receipt;
  if (
    error?.name !== "CheckCleanupError" &&
    !(
      receipt &&
      (receipt.cleanupConfirmed !== true || receipt.reusable !== true)
    )
  )
    return null;
  return {
    cleanup: {
      step,
      runId,
      assignment,
      issue,
      error: {
        name: error?.name ?? "Error",
        message: String(error?.message ?? error),
      },
      receipt: receipt ?? null,
    },
    blocked: {
      code: "cleanup-unconfirmed",
      detail:
        "Owned executor cleanup is unconfirmed; retain the workspace and reservations",
      recovery:
        "Independently reconcile the exact receipt labels and confirm no owned workload before retry or workspace reuse",
    },
  };
}

const texts = (list, limit = 50) =>
  (Array.isArray(list) ? list : [])
    .filter((item) => typeof item === "string" && item.length > 0)
    .slice(0, limit)
    .map((item) => item.slice(0, 2000));

// What Bezalel reported, kept in the freeze ledger on every route (null when
// the build stage did not run, as on the review-only route).
export function buildReport(build) {
  if (!build || typeof build !== "object" || Array.isArray(build)) return null;
  return {
    task_status:
      typeof build.task_status === "string" ? build.task_status : null,
    oracle_requests: texts(build.oracle_requests),
    gaps: texts(build.gaps),
    checks_run: texts(build.checks_run),
  };
}

// The acceptance tests this freeze may commit: the ones after-define recorded
// in this run, and the ones an earlier run recorded that no commit holds yet
// (`pending`). What Ezra recorded is a file and its content hash; which run
// recorded it does not matter for what may be committed.
export function freshTests(acceptance, runId, pending = new Set()) {
  return new Set([
    ...(acceptance?.run === runId
      ? (acceptance.tests ?? []).map(([file]) => file)
      : []),
    ...pending,
  ]);
}

// Recorded acceptance tests the candidate's base does not hold as recorded.
// A round that defined acceptance can end before its first commit (an
// interruption, a failed step, rejected hooks); its tests are then in the
// workspace and in no commit, and the next commit carries them.
export async function pendingTests({ git, repo, acceptance, previousHead }) {
  const pending = new Set();
  for (const [file, blob] of acceptance?.tests ?? []) {
    const found = await git.git(
      ["rev-parse", "--verify", "--quiet", `${previousHead}:${file}`],
      { cwd: repo },
    );
    if ((found.code === 0 ? found.stdout.trim() : "") !== blob)
      pending.add(file);
  }
  return pending;
}

function matchers(globs) {
  const compiled = (globs ?? []).map((glob) => globToRegExp(glob));
  return (file) => compiled.some((matcher) => matcher.test(file));
}

// What the factory may commit: assigned source paths, plus test paths only
// for the files Ezra recorded this round or recorded earlier and not yet
// committed.
export function stagingScope({ brief, acceptance, runId, pending }) {
  const source = matchers(brief?.source_paths);
  const test = matchers(brief?.test_paths);
  const fresh = freshTests(acceptance, runId, pending);
  return (file) => source(file) || (test(file) && fresh.has(file));
}

// Before the commit: the tests this freeze may commit must still hold exactly
// what Ezra recorded; nothing a writer did since may change them.
export function freshTestDrift({
  repo,
  acceptance,
  runId,
  pending,
  lstat = lstatSync,
  readFile = readFileSync,
}) {
  const fresh = freshTests(acceptance, runId, pending);
  const drift = [];
  for (const [file, blob] of acceptance?.tests ?? []) {
    if (!fresh.has(file)) continue;
    const full = posix.join(repo, file);
    let stat;
    try {
      stat = lstat(full);
    } catch {
      drift.push(`${file} was deleted`);
      continue;
    }
    if (!stat.isFile()) drift.push(`${file} is no longer a regular file`);
    else if (blobId(readFile(full)) !== blob)
      drift.push(`${file} changed after Ezra recorded it`);
  }
  return drift;
}

// After the commit: every path changed since the previous head must be
// assigned, and every recorded acceptance test must be in the candidate
// unchanged, including tests Ezra recorded in the current round.
export async function verifyCandidate({
  git,
  repo,
  previousHead,
  candidate,
  brief,
  acceptance,
  runId,
}) {
  const fresh = freshTests(
    acceptance,
    runId,
    await pendingTests({ git, repo, acceptance, previousHead }),
  );
  const source = matchers(brief?.source_paths);
  const test = matchers(brief?.test_paths);
  const violations = [];
  const changed = (
    await git.ok(
      [
        "diff",
        "--no-ext-diff",
        "--no-textconv",
        "--no-renames",
        "--name-only",
        "-z",
        previousHead,
        candidate,
      ],
      { cwd: repo },
    )
  )
    .split("\0")
    .filter(Boolean);
  for (const file of changed) {
    if (source(file) || (test(file) && fresh.has(file))) continue;
    violations.push(
      test(file)
        ? `${file} is a test path Ezra did not record this round`
        : `${file} is outside the assigned paths`,
    );
  }
  const tests = [];
  const rewritten = [];
  for (const [file, blob] of acceptance?.tests ?? []) {
    const found = await git.git(
      ["rev-parse", "--verify", "--quiet", `${candidate}:${file}`],
      { cwd: repo },
    );
    const committed = found.code === 0 ? found.stdout.trim() : "";
    if (!/^[a-f0-9]{40}$/.test(committed)) {
      violations.push(`acceptance test ${file} is missing from the candidate`);
      tests.push([file, blob]);
      continue;
    }
    if (committed !== blob) {
      violations.push(
        `acceptance test ${file} changed (recorded ${blob.slice(0, 12)}, candidate ${committed.slice(0, 12)})`,
      );
    }
    tests.push([file, blob]);
  }
  return { violations, changed, tests, rewritten };
}

export function reviewRouteProblem({ status, head, recorded }) {
  if (!recorded) return "No recorded candidate to review again";
  if (head !== recorded)
    return `HEAD ${String(head).slice(0, 12)} is not the recorded candidate ${recorded.slice(0, 12)}`;
  if (status.length)
    return `The working tree has uncommitted changes: ${status
      .slice(0, 20)
      .map((entry) => entry.path)
      .join(", ")}`;
  return null;
}

// Changes outside what the factory may commit can only come from tools run
// during checks. Keep them as evidence, then restore index and tree.
export async function setAsideStrays({
  git,
  repo,
  inScope,
  evidenceDir,
  ledger,
}) {
  const strays = (await statusPorcelain({ git }, repo)).filter(
    (entry) => !inScope(entry.path),
  );
  if (!strays.length) return null;
  mkdirSync(evidenceDir, { recursive: true });
  // A file that is staged and in no commit (a rejected commit leaves its
  // index behind) cannot be restored from HEAD. It is unstaged and then kept
  // like an untracked file.
  const added = strays
    .filter((entry) => entry.code.startsWith("A"))
    .map((entry) => entry.path);
  if (added.length)
    await git.ok(
      ["--literal-pathspecs", "restore", "--staged", "--", ...added],
      { cwd: repo },
    );
  const fresh = new Set(added);
  const tracked = strays
    .filter((entry) => entry.code !== "??" && !fresh.has(entry.path))
    .map((entry) => entry.path);
  const untracked = strays
    .filter((entry) => entry.code === "??" || fresh.has(entry.path))
    .map((entry) => entry.path);
  if (tracked.length) {
    writeFileSync(
      posix.join(evidenceDir, "tracked.patch"),
      await git.ok(
        ["--literal-pathspecs", "diff", "--binary", "HEAD", "--", ...tracked],
        { cwd: repo },
      ),
    );
    await git.ok(
      [
        "--literal-pathspecs",
        "restore",
        "--source=HEAD",
        "--staged",
        "--worktree",
        "--",
        ...tracked,
      ],
      { cwd: repo },
    );
  }
  for (const file of untracked) {
    const target = posix.join(evidenceDir, "untracked", file);
    mkdirSync(posix.dirname(target), { recursive: true });
    renameSync(posix.join(repo, file), target);
  }
  const record = { tracked, untracked, evidence: evidenceDir };
  ledger.write("freeze-strays", record);
  return record;
}

// The freeze decision up to a verified candidate. A review-only round (I1)
// adopts the recorded head without a build or a commit; every other round
// commits Bezalel's in-scope work through `commit` (Core's hooks in the
// executor). Bezalel's oracle requests always go back to Ezra (I2 acceptance
// items); finished work is committed first so the next round starts from a
// recorded, clean head. Returns { stop: { reason, entry } } or the verified
// candidate (with `repair` when Ezra must act before any review).
export async function freezeCandidate({
  git,
  repo,
  route,
  value,
  build,
  runId,
  message,
  evidenceDir,
  ledger,
  commit,
}) {
  const report = buildReport(build);
  const oracle = report?.oracle_requests ?? [];
  const repair = (implementation) =>
    makeRepair({ acceptance: oracle, implementation, source: "freeze" });
  const stop = (reason, entry) => ({
    stop: { reason, entry: { ...entry, build: report } },
  });
  const blocked = (reason, code, detail, recovery) =>
    stop(reason, {
      blocked: {
        code,
        detail: String(detail).slice(0, 1200),
        ...(recovery ? { recovery } : {}),
      },
    });
  const askEzra = (reason, implementation = []) => {
    const repaired = repair(implementation);
    return stop(reason, {
      repair: repaired,
      fingerprint: repairFingerprint("oracle", repaired),
    });
  };
  const previousHead = value.head ?? value.base;
  const head = await revParse({ git, cwd: repo }, "HEAD");

  const verify = async (candidate, hooks) => {
    const verified = await verifyCandidate({
      git,
      repo,
      previousHead,
      candidate,
      brief: value.brief,
      acceptance: value.acceptance,
      runId,
    });
    if (verified.violations.length)
      return blocked(
        "The candidate failed the factory's integrity checks",
        "candidate-integrity",
        verified.violations.join("; "),
      );
    const fields = { head: candidate, reviews: null, final: null };
    return { candidate, previousHead, hooks, verified, fields, report };
  };

  if (route === "review") {
    const problem = reviewRouteProblem({
      status: await statusPorcelain({ git }, repo),
      head,
      recorded: value.head,
    });
    if (problem)
      return blocked(
        "The recorded candidate cannot be reviewed again",
        "review-precondition",
        problem,
        "Inspect the issue clone (nothing was committed); once its HEAD is the recorded head and its tree is clean, retry the issue",
      );
    if (oracle.length)
      return askEzra(
        "Bezalel asked for acceptance changes before the candidate can be reviewed",
      );
    return verify(value.head, { preCommit: "earlier-round" });
  }

  const finished = report?.task_status === "DONE";
  if (!finished && !oracle.length)
    return blocked(
      "Bezalel did not complete the build",
      "build-blocked",
      [...texts(build?.gaps), ...texts(build?.questions)].join("; ") ||
        "No build result",
    );
  if (head !== previousHead) {
    const moved = (
      await git.ok(
        ["diff", "--no-renames", "--name-only", "-z", previousHead, head],
        { cwd: repo },
      )
    )
      .split("\0")
      .filter(Boolean);
    return blocked(
      "Commits were made outside the factory's commit step",
      "unexpected-commit",
      `HEAD moved from ${previousHead.slice(0, 12)} to ${head.slice(0, 12)}; files: ${moved.join(", ")}`,
    );
  }
  const pending = await pendingTests({
    git,
    repo,
    acceptance: value.acceptance,
    previousHead,
  });
  const drift = freshTestDrift({
    repo,
    acceptance: value.acceptance,
    runId,
    pending,
  });
  if (drift.length)
    return blocked(
      "Acceptance tests changed after Ezra recorded them",
      "acceptance-tampered",
      drift.join("; "),
    );

  const inScope = stagingScope({
    brief: value.brief,
    acceptance: value.acceptance,
    runId,
    pending,
  });
  await setAsideStrays({ git, repo, inScope, evidenceDir, ledger });
  if (!finished) {
    // Bezalel stopped because the acceptance is wrong: Ezra corrects it, then
    // Bezalel finishes in the same round. His partial work stays in the tree.
    const why = [...texts(build?.gaps), ...texts(build?.questions)]
      .join("; ")
      .slice(0, 1200);
    return askEzra("Bezalel stopped and asked for acceptance changes", [
      `Bezalel stopped BLOCKED before finishing${why ? ` (${why})` : ""}. Finish the implementation against the corrected acceptance.`,
    ]);
  }
  if (
    !(await statusPorcelain({ git }, repo)).some((entry) => inScope(entry.path))
  ) {
    if (oracle.length)
      return askEzra(
        "Bezalel asked for acceptance changes before the candidate can be reviewed",
      );
    if (route === "repair" || route === "oracle")
      return stop("The repair produced no change", {
        repair: repair([
          "The previous repair left the candidate unchanged; address the recorded findings.",
        ]),
        fingerprint: "no-change",
      });
    return blocked(
      "Implementation produced no change",
      "no-change",
      "Bezalel reported DONE without changing assigned paths",
    );
  }

  const receipts = [];
  const commitOnce = async () => {
    const files = (await statusPorcelain({ git }, repo))
      .filter((entry) => inScope(entry.path))
      .map((entry) => entry.path);
    if (!files.length)
      return { status: "passed", nothing: true, stdout: "", stderr: "" };
    const result = await commit(files, message);
    if (result.receipt) receipts.push(result.receipt);
    return result;
  };
  let result = await commitOnce();
  if (result.blocked)
    return blocked(
      result.blocked.reason,
      result.blocked.code,
      result.blocked.detail,
    );
  if (result.status !== "passed")
    return stop("Normal commit hooks failed", {
      repair: repair([
        `The pre-commit hooks rejected the change (exit ${result.exitCode}). Output tail:\n${`${result.stdout ?? ""}${result.stderr ?? ""}`.slice(-3000)}`,
      ]),
      fingerprint: `hooks:${(result.stderr ?? "").slice(-200)}`,
    });
  let leftovers = await statusPorcelain({ git }, repo);
  if (leftovers.length) {
    // Hooks can rewrite content; commit their in-scope output through hooks once more.
    result = await commitOnce();
    if (result.blocked)
      return blocked(
        result.blocked.reason,
        result.blocked.code,
        result.blocked.detail,
      );
    leftovers = await statusPorcelain({ git }, repo);
    if (result.status !== "passed" || leftovers.length)
      return stop("Hooks left uncommitted changes", {
        repair: repair([
          `After committing, these paths remain modified: ${leftovers.map((entry) => entry.path).join(", ")}`,
        ]),
        fingerprint: "hook-leftovers",
      });
  }
  const candidate = await revParse({ git, cwd: repo }, "HEAD");
  if (candidate === previousHead)
    return blocked(
      "No new commit was created",
      "no-commit",
      "Commit produced no new revision",
    );
  const frozen = await verify(candidate, { preCommit: receipts });
  if (frozen.stop || !oracle.length) return frozen;
  return { ...frozen, repair: repair([]) };
}

export function candidateDiff({ git, repo, base, candidate }) {
  return git.ok(
    [
      "diff",
      "--no-ext-diff",
      "--no-textconv",
      "--stat",
      "--patch",
      `${base}...${candidate}`,
    ],
    { cwd: repo, timeoutMs: 120_000 },
  );
}
