// Freeze: stop writers, commit through Core's normal hooks inside the
// credential-free executor, verify the actual post-hook candidate, reinstall
// its dependencies from its own lockfile and build separate exact views for
// the two independent reviewers. A review-only round freezes the recorded
// head again without a build or a commit. Bezalel's oracle requests go back
// to Ezra as an acceptance repair.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { prepareCandidateView } from "../../.shared/candidate-view.mjs";
import { READ_ONLY_CHECKS, TRUSTED_GATES } from "../../.shared/views.mjs";
import { trustIssueRepo } from "../../.shared/git.mjs";
import {
  hookEvidence,
  hookedGit,
  restoreHookShims,
} from "../../.shared/publication.mjs";
import {
  clipText,
  emit,
  ensureInstall,
  input,
  nodeModulesMounts,
  scratchTargets,
  openRound,
  renderAssignment,
  runInIssueRepo,
  workItem,
  writeWorkItem,
} from "../../.shared/round.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";
import {
  buildReport,
  candidateDiff,
  cleanupHold,
  freezeCandidate,
  repairOf,
} from "./freeze-logic.mjs";
import { repairFingerprint } from "./repair-logic.mjs";

const posix = path.posix;
const round = openRound();
const claim = round.ledger.read("claim");
// Null when the build stage was skipped (the review-only route).
const build = input("build");
const report = buildReport(build);
const stop = (reason: string, ledger: Record<string, unknown>): never => {
  round.ledger.write("freeze", {
    review: false,
    reason,
    build: report,
    ...ledger,
  });
  emit({
    review: "no",
    candidate: "",
    micaiah_assignment: "",
    luke_assignment: "",
    reason,
  });
  process.exit(0);
};

let document = await workItem(round);
let value = document.value;
const repo = round.where.repo;
const route: string = claim?.route ?? value.run?.route ?? "initial";

const stopForCleanup = (error: unknown, step: string) => {
  const held = cleanupHold(error, {
    step,
    runId: round.runId,
    assignment: round.assignment,
    issue: round.issue,
  });
  if (held)
    stop("Owned executor cleanup remains unconfirmed", {
      ...round.ledger.read("freeze"),
      ...held,
      prepared: false,
    });
};

const runHookStep = async (step: string, options: Record<string, unknown>) => {
  let receipt;
  try {
    receipt = await runInIssueRepo(round, options);
  } catch (error) {
    stopForCleanup(error, step);
    throw error;
  }
  stopForCleanup(
    {
      name: "Error",
      message: "Executor receipt did not confirm owned workload cleanup",
      receipt,
    },
    step,
  );
  return receipt;
};

let hookDependenciesReady = false;

// One commit through Core's pinned hooks in the executor; the receipt must
// show the pre-commit hook and lint-staged ran.
const commitThroughHooks = async (files: string[], message: string) => {
  if (!hookDependenciesReady) {
    try {
      await ensureInstall(round, { clean: true });
      hookDependenciesReady = true;
    } catch (error) {
      stopForCleanup(error, "hook-dependencies");
      return {
        blocked: {
          reason: "Clean dependencies for Core's commit hooks are unavailable",
          code: "hook-dependencies",
          detail: (error as Error).message,
        },
      };
    }
  }
  const add = await runHookStep("hooks-add", {
    command: ["git", "--literal-pathspecs", "add", "-A", "--", ...files],
    timeoutMs: 120_000,
  });
  if (add.status !== "passed") return add;
  try {
    restoreHookShims(repo);
  } catch (error) {
    return {
      blocked: {
        reason: "Core's commit hooks cannot be pinned",
        code: (error as { code?: string }).code ?? "hooks-unpinned",
        detail: (error as Error).message,
      },
    };
  }
  const commit = await runHookStep("hooks-commit", {
    command: hookedGit(repo, ["commit", "-m", message]),
    network: "bridge",
    cache: false,
    timeoutMs: 30 * 60_000,
  });
  const evidence = hookEvidence("pre-commit", commit);
  const receipt = {
    status: commit.status,
    exitCode: commit.exitCode,
    container: commit.containerId,
    ...evidence,
  };
  if (commit.status === "passed" && !evidence.ran)
    return {
      receipt,
      blocked: {
        reason:
          "The commit's receipt does not show Core's pre-commit hook and lint-staged running",
        code: "hooks-unverified",
        detail: `hook shim ${evidence.shim ? "passed" : "not seen"}; lint-staged ${evidence.tool ? "ran" : "not seen"}. Output tail: ${`${commit.stdout ?? ""}${commit.stderr ?? ""}`.slice(-800)}`,
      },
    };
  return { ...commit, receipt };
};

const frozen = await freezeCandidate({
  git: round.git,
  repo,
  route,
  value,
  build,
  runId: round.runId,
  message: `${route === "initial" ? "feat" : "fix"}(#${round.issue}): factory round ${value.round}\n\nAssignment ${round.assignment}, acceptance ${String(value.acceptance?.revision ?? "none").slice(0, 12)}.\nRefs #${round.issue}`,
  evidenceDir: posix.join(round.runDir, "strays"),
  ledger: round.ledger,
  commit: commitThroughHooks,
});
if (frozen.stop) stop(frozen.stop.reason, frozen.stop.entry);
const { candidate, previousHead, hooks, verified } = frozen;
const changedFiles = (
  await round.git.ok(["diff", "--name-only", `${value.base}...${candidate}`], {
    cwd: repo,
  })
)
  .split("\n")
  .filter(Boolean);
await writeWorkItem(
  round,
  planCheckpoint(document, {
    runId: round.runId,
    fields: frozen.fields,
    now: round.now(),
  }),
);
// Committed and recorded, but Ezra must correct the acceptance before any
// review: the next round takes the oracle route from this clean head.
if (frozen.repair)
  stop(
    "Bezalel asked for acceptance changes; the committed candidate waits for Ezra",
    {
      repair: frozen.repair,
      fingerprint: repairFingerprint("oracle", frozen.repair),
      candidate,
      previousHead,
      hooks,
      changedFiles,
    },
  );
document = await workItem(round);
value = document.value;
// The candidate is frozen and recorded. If preparing its reviews fails from
// here on, record sends the next round to the review-only route.
round.ledger.write("freeze", {
  review: true,
  prepared: false,
  route,
  candidate,
  previousHead,
  hooks,
  hookRewrites: verified.rewritten,
  build: report,
});

// Independent checks must see dependencies derived from the candidate's own
// lockfile, never node_modules a writer could have changed.
let install;
try {
  install = await ensureInstall(round, { clean: true });
} catch (error) {
  stopForCleanup(error, "install");
  stop("Dependencies could not be installed from the candidate lockfile", {
    repair: repairOf([
      `bun install --frozen-lockfile failed for candidate ${candidate}: ${(error as Error).message.slice(-2500)}`,
    ]),
    fingerprint: "install",
  });
}

const diff = await candidateDiff({
  git: round.git,
  repo,
  base: value.base,
  candidate,
});
const viewsRoot = posix.join(round.paths.views, round.runId);
mkdirSync(viewsRoot, { recursive: true, mode: 0o750 });
const views: Record<string, string> = {};
trustIssueRepo(round.where);
for (const role of ["micaiah", "luke"]) {
  const view = await prepareCandidateView({
    repositoryDirectory: repo,
    disposableRoot: viewsRoot,
    candidateSha: candidate,
    baseSha: value.base,
    role,
    assignmentId: round.assignment.toLowerCase(),
    attemptId: round.runId.toLowerCase(),
    gitExecutable: round.config.git.executable,
  });
  views[role] = view.workspaceDirectory;
  const dir = round.materials(role);
  writeFileSync(posix.join(dir, "candidate.diff"), diff);
  writeFileSync(
    posix.join(dir, "acceptance.json"),
    JSON.stringify(value.acceptance, null, 2),
  );
  writeFileSync(posix.join(dir, "view.json"), JSON.stringify(view, null, 2));
}
const mounts = nodeModulesMounts(repo, "/candidate");
const scratch = scratchTargets(repo, "/candidate");
const context = round.context.read();
for (const role of ["micaiah", "luke"])
  context.nodes[role] = {
    role,
    read: [views[role], round.materials(role)],
    check: {
      workspaceRoot: viewsRoot,
      workspaceDirectory: views[role],
      workspaceTarget: "/candidate",
      mounts,
      scratch,
    },
  };
round.context.write(context);

const reviewer = (role: string, focus: string) => {
  const materials = round.materials(role);
  return renderAssignment({
    title: `Independent ${focus} review of issue #${round.issue}`,
    identity: {
      assignment_id: round.assignment,
      run_id: round.runId,
      candidate_sha: candidate,
      base_sha: value.base,
      acceptance_revision: value.acceptance.revision,
      candidate_files: views[role],
      materials,
    },
    sections: [
      [
        "Original request",
        clipText(
          readFileSync(posix.join(materials, "request.md"), "utf8"),
          30_000,
        ),
      ],
      [
        "Constraints and scope",
        `${value.brief.summary}\n\nOut of scope: ${value.brief.out_of_scope.join("; ") || "none stated"}`,
      ],
      ["Acceptance", JSON.stringify(value.acceptance.criteria, null, 2)],
      [
        "Change",
        [
          `Files changed from base: ${changedFiles.join(", ")}`,
          `Full diff: ${posix.join(materials, "candidate.diff")}`,
          `Governing documents: ${posix.join(materials, "governing.md")}`,
        ].join("\n"),
      ],
      [
        "How to work",
        [
          `Your exact copy of the committed candidate is ${views[role]} (no Git metadata). Read it with absolute paths.`,
          "run_check executes there with dependencies freshly installed from the candidate's lockfile, mounted read-only; network is unavailable.",
          READ_ONLY_CHECKS,
          TRUSTED_GATES,
          "Echo candidate_sha and acceptance_revision exactly as given above.",
        ].join("\n"),
      ],
    ],
    contract:
      "Return task_status, decision (CLEAR, FINDINGS or INCONCLUSIVE), candidate_sha, acceptance_revision, scope, findings with severity P0-P3 and owner (implementation or acceptance), checks run and limitations.",
  });
};
round.ledger.write("freeze", {
  review: true,
  prepared: true,
  route,
  candidate,
  previousHead,
  changedFiles,
  views,
  hooks,
  install,
  hookRewrites: verified.rewritten,
  build: report,
});
emit({
  review: "yes",
  candidate,
  micaiah_assignment: reviewer("micaiah", "correctness and completeness"),
  luke_assignment: reviewer("luke", "systems and failure-case"),
  reason:
    route === "review"
      ? `Recorded candidate ${candidate.slice(0, 12)} frozen again for review`
      : `Candidate ${candidate.slice(0, 12)} frozen through normal hooks`,
});
