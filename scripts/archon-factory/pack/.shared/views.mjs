// Exact, separate candidate views for read-only roles, registered in the
// trusted run context with their own check workspace.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { prepareCandidateView } from "./candidate-view.mjs";
import { trustIssueRepo } from "./git.mjs";
import {
  clipText as clipRound,
  nodeModulesMounts,
  scratchTargets,
  renderAssignment as renderRound,
} from "./round.mjs";

const posix = path.posix;

// A read-only role's node_modules is mounted read-only, so the usual Vitest
// start (which writes a bundled config and a module cache there) fails.
export const READ_ONLY_CHECKS =
  "Checks run in a disposable container where node_modules is read-only, so a tool that writes a cache there fails at startup. Run Vitest as: node node_modules/vitest/vitest.mjs run --configLoader runner --no-fsModuleCache <paths>";

// What a read-only role is not expected to reproduce, and what a failure
// caused by its own check container means. Without this, a role that could
// not run a repository-wide gate in its container answered INCONCLUSIVE for a
// candidate it had found no fault in.
export const TRUSTED_GATES =
  "The repository-wide gates (the full unit suite, typecheck, lint, format and build) are run by the factory's pre-push gate on this exact commit before anything is published, and a failure there sends the issue back for repair. Do not try to reproduce them in full, and do not answer INCONCLUSIVE because you could not. Verify the behaviour each criterion or claim is about, directly. A check that fails only because of this container (dependencies are read-only outside their cache directories, there is no Git metadata and no network) is not a failure of the candidate: name it under limitations and verify the behaviour another way. INCONCLUSIVE is for evidence about the candidate's own behaviour that you could not obtain at all.";

// Told to Ezra when she defines acceptance, so a criterion about what may
// change can be settled at final acceptance.
export const FINAL_EVIDENCE =
  "Final acceptance checks the committed candidate in a copy without Git metadata. It is given the list of changed files and the full diff from base, both read from Git by the factory. State any criterion about what may or may not change in terms of that list and diff, not as a `git` command to run.";

// What changed, as the trusted side read it from Git. A role's view has no
// Git metadata, so the role cannot work this out itself.
const LISTED = 400;
export function changeSection({ base, candidate, changed, materials }) {
  const listed = changed.slice(0, LISTED);
  return [
    `Files changed from base ${base} to candidate ${candidate} (${changed.length}), read from Git by the factory:`,
    ...listed.map((file) => `- ${file}`),
    ...(changed.length > listed.length
      ? [
          `${changed.length - listed.length} more in ${posix.join(materials, "changed-files.txt")}`,
        ]
      : []),
    `Full diff: ${posix.join(materials, "candidate.diff")}`,
    "Your copy of the candidate has no Git metadata, so `git` cannot answer this there; rely on this list and the diff for what changed.",
  ].join("\n");
}

async function candidateChange(round, { base, candidate }) {
  const cwd = round.where.repo;
  const changed = (
    await round.git.ok(
      [
        "diff",
        "--no-ext-diff",
        "--no-textconv",
        "--no-renames",
        "--name-only",
        "-z",
        base,
        candidate,
      ],
      { cwd },
    )
  )
    .split("\0")
    .filter(Boolean);
  const diff = await round.git.ok(
    [
      "diff",
      "--no-ext-diff",
      "--no-textconv",
      "--stat",
      "--patch",
      `${base}...${candidate}`,
    ],
    { cwd, timeoutMs: 120_000 },
  );
  return { changed, diff };
}

export async function prepareRoleView(
  round,
  { node, role, candidate, base, materialsRole = node, extra = {} },
) {
  const viewsRoot = posix.join(round.paths.views, round.runId);
  mkdirSync(viewsRoot, { recursive: true, mode: 0o750 });
  // The view is read with host Git from the writable clone: restore its
  // trusted metadata first.
  trustIssueRepo(round.where);
  const view = await prepareCandidateView({
    repositoryDirectory: round.where.repo,
    disposableRoot: viewsRoot,
    candidateSha: candidate,
    baseSha: base,
    role: role === "ezra-final" ? "ezra" : role,
    assignmentId: round.assignment.toLowerCase(),
    attemptId: `${round.runId.toLowerCase()}-${node}`.slice(0, 80),
    gitExecutable: round.config.git.executable,
  });
  const materials = round.materials(materialsRole);
  writeFileSync(
    posix.join(materials, "view.json"),
    JSON.stringify(view, null, 2),
  );
  const { changed, diff } = await candidateChange(round, { base, candidate });
  writeFileSync(
    posix.join(materials, "changed-files.txt"),
    changed.map((file) => `${file}\n`).join(""),
  );
  writeFileSync(posix.join(materials, "candidate.diff"), diff);
  for (const [name, content] of Object.entries(extra))
    writeFileSync(posix.join(materials, name), content);
  const context = round.context.read();
  context.nodes[node] = {
    role: role === "ezra-final" ? "ezra" : role,
    read: [view.workspaceDirectory, materials],
    check: {
      workspaceRoot: viewsRoot,
      workspaceDirectory: view.workspaceDirectory,
      workspaceTarget: "/candidate",
      mounts: nodeModulesMounts(round.where.repo, "/candidate"),
      scratch: scratchTargets(round.where.repo, "/candidate"),
    },
  };
  round.context.write(context);
  return { view: view.workspaceDirectory, materials, changed };
}

// I9: Ezra names the owner of every criterion; the trusted side reads a
// missing or unknown owner as "implementation" (publish-logic criterionOwner).
export const FINAL_OWNER_RULE =
  "Give every criterion an owner: `acceptance` when the criterion or its test is wrong and Ezra must correct it, `implementation` when the candidate must change to meet a correct criterion. A FAIL goes to that owner in the next round; a missing or unknown owner counts as `implementation`.";

export function finalAcceptanceText(
  {
    issue,
    assignment,
    runId,
    value,
    candidate,
    view,
    materials,
    request,
    changed,
  },
  { clipText = clipRound, renderAssignment = renderRound } = {},
) {
  return renderAssignment({
    title: `Final acceptance of issue #${issue}`,
    identity: {
      assignment_id: assignment,
      run_id: runId,
      stage: "final_acceptance",
      candidate_sha: candidate,
      base_sha: value.base,
      acceptance_revision: value.acceptance.revision,
      candidate_files: view,
      materials,
    },
    sections: [
      ["Original request", clipText(request, 30_000)],
      [
        "Acceptance criteria",
        JSON.stringify(value.acceptance.criteria, null, 2),
      ],
      [
        "Acceptance tests",
        value.acceptance.tests
          .map((test) => `${test[0]} (blob ${test[1]})`)
          .join("\n") || "none",
      ],
      ...(Array.isArray(changed)
        ? [
            [
              "Change",
              changeSection({
                base: value.base,
                candidate,
                changed,
                materials,
              }),
            ],
          ]
        : []),
      [
        "How to work",
        `Writers are paused. Verify every criterion against the committed candidate at ${view} using run_check. Echo candidate_sha and acceptance_revision exactly.\n${READ_ONLY_CHECKS}\n${TRUSTED_GATES}`,
      ],
      ["Criterion owners", FINAL_OWNER_RULE],
    ],
    contract:
      "Return task_status, decision PASS/FAIL/INCONCLUSIVE, candidate_sha, acceptance_revision, a result per criterion id with evidence, correction and owner (implementation or acceptance), checks run and limitations.",
  });
}

export async function finalAcceptanceAssignment(
  round,
  value,
  candidate,
  { clipText, renderAssignment, readFileSync },
) {
  const { view, materials, changed } = await prepareRoleView(round, {
    node: "final",
    role: "ezra-final",
    candidate,
    base: value.base,
    materialsRole: "ezra-final",
    extra: { "acceptance.json": JSON.stringify(value.acceptance, null, 2) },
  });
  return finalAcceptanceText(
    {
      issue: round.issue,
      assignment: round.assignment,
      runId: round.runId,
      value,
      candidate,
      view,
      materials,
      request: readFileSync(posix.join(materials, "request.md"), "utf8"),
      changed,
    },
    { clipText, renderAssignment },
  );
}
