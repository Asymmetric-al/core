// After-define decisions: which test files make up the acceptance record and
// whether this round builds, freezes the recorded head, or stops.
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";
import path from "node:path";

import { afterAcceptance, makeRepair } from "./repair-logic.mjs";
import { globToRegExp } from "../../.shared/policy.mjs";

const matcher = (globs) => {
  const expressions = globs.map((glob) => globToRegExp(glob));
  return (file) => expressions.some((expression) => expression.test(file));
};

const digest = (content) => createHash("sha256").update(content).digest("hex");

function worktreeState(repo, file) {
  const segments = file.split("/");
  let full = repo;
  for (const [index, segment] of segments.entries()) {
    full = path.join(full, segment);
    let stat;
    try {
      stat = lstatSync(full);
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
      throw error;
    }
    if (stat.isSymbolicLink())
      return {
        kind: "symlink",
        at: index,
        content: digest(readlinkSync(full)),
      };
    if (index < segments.length - 1) {
      if (!stat.isDirectory())
        return { kind: "non-directory", at: index, mode: stat.mode };
    } else if (stat.isFile())
      return {
        kind: "file",
        mode: stat.mode,
        content: digest(readFileSync(full)),
      };
    else return { kind: "other", mode: stat.mode };
  }
}

async function snapshotDirtyPaths({ git, repo, include }) {
  const status = await git.ok(
    ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames"],
    { cwd: repo },
  );
  const changed = status
    .split("\0")
    .filter(Boolean)
    .map((entry) => ({ code: entry.slice(0, 2), path: entry.slice(3) }))
    .filter((entry) => include(entry.path));
  const head = (
    await git.ok(["rev-parse", "--verify", "HEAD"], { cwd: repo })
  ).trim();
  const index = new Map();
  if (changed.length) {
    const staged = await git.ok(["ls-files", "--stage", "-z"], { cwd: repo });
    for (const record of staged.split("\0").filter(Boolean)) {
      const separator = record.indexOf("\t");
      const file = record.slice(separator + 1);
      index.set(file, [...(index.get(file) ?? []), record.slice(0, separator)]);
    }
  }
  const files = Object.fromEntries(
    changed.map((entry) => [
      entry.path,
      digest(
        JSON.stringify({
          code: entry.code,
          index: index.get(entry.path) ?? [],
          worktree: worktreeState(repo, entry.path),
        }),
      ),
    ]),
  );
  return { head, files };
}

export async function snapshotAcceptanceBaseline({
  git,
  repo,
  sourceGlobs,
  testGlobs,
}) {
  const isSource = matcher(sourceGlobs);
  const isTest = matcher(testGlobs);
  return snapshotDirtyPaths({
    git,
    repo,
    include: (file) => isSource(file) && !isTest(file),
  });
}

export async function acceptanceBoundaryChanges({
  git,
  repo,
  baseline,
  testGlobs,
}) {
  const isTest = matcher(testGlobs);
  const current = await snapshotDirtyPaths({
    git,
    repo,
    include: (file) => !isTest(file),
  });
  const files = [
    ...new Set([...Object.keys(baseline.files), ...Object.keys(current.files)]),
  ];
  return {
    headChanged: baseline.head !== current.head,
    strays: files
      .filter((file) => baseline.files[file] !== current.files[file])
      .sort(),
  };
}

// Every test file of this issue: changed on the branch or in the working tree
// (candidates), plus the files an earlier acceptance revision recorded.
export function acceptanceTestFiles({
  candidates,
  previous = [],
  testGlobs,
  exists = () => true,
}) {
  const isTest = matcher(testGlobs);
  return [...new Set([...candidates, ...previous])]
    .filter((file) => isTest(file) && exists(file))
    .sort();
}

// Test files Ezra removed: tracked files in the test paths that the working
// tree no longer holds. They are recorded with the acceptance, and the freeze
// commits the removal as it commits a recorded test.
export function removedTestFiles({ status, testGlobs, exists = () => false }) {
  const isTest = matcher(testGlobs);
  return [
    ...new Set(
      status
        .filter(
          (entry) =>
            entry.code.includes("D") &&
            isTest(entry.path) &&
            !exists(entry.path),
        )
        .map((entry) => entry.path),
    ),
  ].sort();
}

export function sourceOverlap({ files, sourceGlobs }) {
  const isSource = matcher(sourceGlobs);
  return files.filter(isSource);
}

// A correction that changed no test file and left Bezalel nothing to repair
// needs no build: the round ends with a review-only repair, so the next round
// re-freezes the recorded head and reviews it against the corrected acceptance.
export function afterDefinePlan({
  route,
  planned,
  hasAcceptance,
  scopeStopped,
  defined = false,
  hasHead = false,
  implementationRepairs = 0,
  testsChanged = false,
}) {
  if (scopeStopped)
    return {
      build: false,
      freeze: false,
      reason: "After-scope ended the round",
    };
  if (!hasAcceptance)
    return {
      build: false,
      freeze: false,
      reason: "No acceptance exists for this candidate",
      blocked: { code: "no-acceptance", detail: "Run the acceptance stage" },
    };
  if (route === "review")
    return {
      build: false,
      freeze: true,
      reason: "Review-only round on the recorded head",
    };
  if (planned !== "yes")
    return { build: false, freeze: false, reason: "No build stage this round" };
  if (
    defined &&
    route !== "initial" &&
    hasHead &&
    implementationRepairs === 0 &&
    !testsChanged
  )
    return {
      build: false,
      freeze: false,
      reason:
        "Acceptance corrected without test changes and nothing for Bezalel; the recorded head is reviewed again",
      repair: makeRepair({ reviewOnly: true, source: "after-define" }),
    };
  return { build: true, freeze: true, reason: "Build" };
}

// The after-define ledger entry record reads: the acceptance revision whenever
// acceptance exists (a later failure before freeze goes to Bezalel), an I2
// repair with its fingerprint, or a block.
export function afterDefineEntry(plan, { acceptance, repairs } = {}) {
  return {
    build: plan.build,
    freeze: plan.freeze,
    reason: plan.reason,
    ...(acceptance ? { acceptance } : {}),
    ...(plan.blocked ? { blocked: plan.blocked } : {}),
    ...(plan.repair
      ? {
          repair: plan.repair,
          fingerprint: `oracle-review:${String(acceptance ?? "").slice(0, 16)}`,
        }
      : {}),
    ...(plan.freeze && !plan.build ? { reviewOnly: true } : {}),
    ...(plan.build && repairs !== undefined ? { repairs } : {}),
  };
}

// Ezra has applied the acceptance corrections; Bezalel keeps his repairs.
export function briefAfterDefine(brief) {
  return { ...brief, repair: afterAcceptance(brief.repair) };
}
