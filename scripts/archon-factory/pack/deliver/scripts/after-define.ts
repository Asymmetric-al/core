// After define: validate Ezra's acceptance, fix the acceptance revision and
// render Bezalel's assignment. A review-only round freezes the recorded head
// again without a build; a correction that leaves nothing to build ends the
// round with a review-only repair.
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";
import path from "node:path";

import {
  acceptanceBoundaryChanges,
  acceptanceTestFiles,
  afterDefineEntry,
  afterDefinePlan,
  briefAfterDefine,
  removedTestFiles,
  sourceOverlap,
} from "./define-logic.mjs";
import { bezalelRepairs } from "./repair-logic.mjs";
import { bezalelPaths } from "./scope-logic.mjs";
import { changedSince, statusPorcelain } from "../../.shared/git.mjs";
import { globToRegExp } from "../../.shared/policy.mjs";
import {
  clipText,
  emit,
  input,
  openRound,
  renderAssignment,
  sha256,
  workItem,
  writeWorkItem,
} from "../../.shared/round.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";

type Plan = {
  build: boolean;
  freeze: boolean;
  reason: string;
  repair?: Record<string, unknown>;
  blocked?: Record<string, unknown>;
};
const round = openRound();
const claim = round.ledger.read("claim");
const scoped = round.ledger.read("after-scope");
const define = input("define");
const planned = input("planned");
let document = await workItem(round);
let value = document.value;
const respond = (plan: Plan, assignment = "", repairs?: number) => {
  round.ledger.write(
    "after-define",
    afterDefineEntry(plan, {
      acceptance: value?.acceptance?.revision,
      repairs,
    }),
  );
  emit({
    build: plan.build ? "yes" : "no",
    freeze: plan.freeze ? "yes" : "no",
    bezalel_assignment: assignment,
    reason: plan.reason,
  });
  process.exit(0);
};
const stop = (reason: string, ledger: { blocked: Record<string, unknown> }) =>
  respond({ build: false, freeze: false, reason, ...ledger });

const repo = round.where.repo;
// Git's blob id; a symbolic link is hashed as its target, never followed.
const blobOf = (file: string) => {
  const full = path.posix.join(repo, file);
  const content = lstatSync(full).isSymbolicLink()
    ? Buffer.from(readlinkSync(full))
    : readFileSync(full);
  return createHash("sha1")
    .update(`blob ${content.length}\0`)
    .update(content)
    .digest("hex");
};
const present = (file: string) => {
  try {
    const stat = lstatSync(path.posix.join(repo, file));
    return stat.isFile() || stat.isSymbolicLink();
  } catch {
    return false;
  }
};

const brief = value.brief;
const scopeStopped = Boolean(scoped?.stopped);
let defined = false;
let testsChanged = false;
if (define && !scopeStopped) {
  if (define.task_status !== "DONE")
    stop("Ezra could not define acceptance", {
      blocked: {
        code: "acceptance-blocked",
        detail: [...define.gaps, ...define.questions].join("; ").slice(0, 1200),
      },
    });
  const ids = define.criteria.map((criterion: { id: string }) => criterion.id);
  if (!ids.length || new Set(ids).size !== ids.length)
    stop("Acceptance criteria are empty or have duplicate ids", {
      blocked: { code: "acceptance-malformed", detail: ids.join(",") },
    });
  const baseline = scoped?.acceptanceBaseline;
  if (
    !baseline?.head ||
    !baseline.files ||
    typeof baseline.files !== "object" ||
    Array.isArray(baseline.files)
  )
    stop("Acceptance has no pre-Ezra workspace snapshot", {
      blocked: {
        code: "acceptance-baseline",
        detail: "Re-run the acceptance stage from after-scope",
      },
    });
  const matchers = brief.test_paths.map((glob: string) => globToRegExp(glob));
  const status = await statusPorcelain({ git: round.git }, repo);
  const changed = status.map((entry) => entry.path);
  testsChanged = changed.some((file) =>
    matchers.some((matcher: RegExp) => matcher.test(file)),
  );
  const { headChanged, strays } = await acceptanceBoundaryChanges({
    git: round.git,
    repo,
    baseline,
    testGlobs: brief.test_paths,
  });
  if (headChanged)
    stop("Acceptance stage changed the recorded commit", {
      blocked: {
        code: "acceptance-head",
        detail: "Ezra may edit acceptance tests, not commit candidate changes",
      },
    });
  if (strays.length)
    stop("Acceptance stage left changes outside the assigned test paths", {
      blocked: {
        code: "acceptance-strays",
        detail: strays.slice(0, 20).join(", "),
      },
    });
  const files = acceptanceTestFiles({
    candidates: [
      ...(await changedSince({ git: round.git }, repo, value.base)),
      ...changed,
    ],
    previous: (value.acceptance?.tests ?? []).map((test: string[]) => test[0]),
    testGlobs: brief.test_paths,
    exists: present,
  });
  const misplaced = sourceOverlap({ files, sourceGlobs: brief.source_paths });
  if (misplaced.length)
    stop("Acceptance test files lie inside the implementation paths", {
      blocked: {
        code: "acceptance-overlap",
        detail: misplaced.slice(0, 20).join(", "),
        recovery: "Re-scope with disjoint source and test paths",
      },
    });
  const tests = files.map((file) => [file, blobOf(file)]);
  // A removal is part of the record only when there is one, so an acceptance
  // without removals keeps the revision it always had.
  const removed = removedTestFiles({
    status,
    testGlobs: brief.test_paths,
    exists: present,
  });
  const removal = removed.length ? { removed } : {};
  const acceptance = {
    revision: sha256({ criteria: define.criteria, tests, ...removal }),
    criteria: define.criteria,
    tests,
    ...removal,
    gaps: define.gaps.slice(0, 20),
    checks: define.checks_run.slice(0, 30),
    at: round.now(),
    run: round.runId,
  };
  if (JSON.stringify(acceptance).length > 24_000)
    stop("Acceptance record is too large for the work item", {
      blocked: { code: "acceptance-size", detail: "Reduce criteria detail" },
    });
  await writeWorkItem(
    round,
    planCheckpoint(document, {
      runId: round.runId,
      fields: { acceptance, brief: briefAfterDefine(brief) },
      now: round.now(),
    }),
  );
  document = await workItem(round);
  value = document.value;
  defined = true;
}

const plan = afterDefinePlan({
  route: claim.route,
  planned,
  hasAcceptance: Boolean(value.acceptance),
  scopeStopped,
  defined,
  hasHead: Boolean(value.head),
  implementationRepairs: bezalelRepairs(value.brief?.repair).length,
  testsChanged,
});
if (!plan.build) respond(plan);

const materials = round.materials("bezalel");
const request = readFileSync(path.posix.join(materials, "request.md"), "utf8");
const repairs = bezalelRepairs(value.brief.repair);
const assignment = renderAssignment({
  title: `${repairs.length || claim.route === "repair" ? "Repair" : "Implement"} issue #${round.issue}`,
  identity: {
    assignment_id: round.assignment,
    run_id: round.runId,
    workspace: repo,
    branch: value.branch,
    base_sha: value.base,
    starting_commit: value.head ?? value.base,
    acceptance_revision: value.acceptance.revision,
    materials,
  },
  sections: [
    ["Original request", clipText(request, 30_000)],
    ["Coordinator brief", value.brief.summary],
    [
      "Acceptance (independently authored; do not weaken it)",
      JSON.stringify(value.acceptance.criteria, null, 2) +
        `\n\nAcceptance test files: ${value.acceptance.tests.map((test: string[]) => test[0]).join(", ") || "none"}` +
        (value.acceptance.removed?.length
          ? `\nRemoved by the acceptance author (leave them removed): ${value.acceptance.removed.join(", ")}`
          : ""),
    ],
    ["Paths", bezalelPaths(value.brief)],
    ...(repairs.length
      ? [
          [
            "Repairs to make",
            repairs.map((item: string) => `- ${item}`).join("\n"),
          ] as [string, string],
        ]
      : []),
    [
      "How to work",
      [
        `Use absolute paths under ${repo}. Follow the nearest AGENTS.md files and repository rules.`,
        "Use run_check for focused checks (tests, typecheck, lint for the touched packages). Network is unavailable there.",
        "Leave changes in the working tree; the factory commits them through the normal hooks.",
        "If the acceptance itself is wrong, do not change it: list the needed correction in oracle_requests.",
      ].join("\n"),
    ],
  ],
  contract:
    "Return task_status, changed_paths, checks actually run with outcomes, remaining acceptance gaps, oracle_requests and questions.",
});
respond(
  { ...plan, reason: `Acceptance ${value.acceptance.revision.slice(0, 12)}` },
  assignment,
  repairs.length,
);
