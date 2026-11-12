// After scope: validate Samson's scope, reserve its shared areas, persist the
// brief, narrow each writer's paths in the trusted run context and render
// Ezra's assignment. A review-only round passes through without AI stages; a
// context change there waits in brief.repair for Ezra.
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  clipText,
  emit,
  input,
  openRound,
  renderAssignment,
  workItem,
  writeWorkItem,
} from "../../.shared/round.mjs";
import { FINAL_EVIDENCE } from "../../.shared/views.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";
import { snapshotAcceptanceBaseline } from "./define-logic.mjs";
import { ezraCorrections } from "./repair-logic.mjs";
import {
  acceptanceOnly,
  ezraPaths,
  hasScope,
  parkingStop,
  planScopeStages,
  protectedBlock,
  protectedTouches,
  reserveAreas,
  scopedBrief,
  validateScope,
} from "./scope-logic.mjs";

const round = openRound();
const claim = round.ledger.read("claim");
const context = round.ledger.read("context");
const scope = input("scope");
const stop = (reason: string, ledger: Record<string, unknown>) => {
  round.ledger.write("after-scope", {
    define: false,
    build: false,
    stopped: true,
    reason,
    ...ledger,
  });
  emit({
    proceed: "no",
    define: "no",
    build: "no",
    ezra_assignment: "",
    reason,
  });
  process.exit(0);
};

let document = await workItem(round);
const value = document.value;
const allowProtected = (await round.archon.get("core/scope")).value
  ?.allowProtected?.[String(round.issue)];
let brief = value.brief;
const newScope = claim.route === "initial" || Boolean(scope);
if (newScope) {
  const checked = validateScope(scope, { allowProtected });
  if (!checked.ok) stop(checked.reason, { blocked: checked.blocked });
  brief = scopedBrief(scope, checked, context.fingerprint);
} else if (!hasScope(brief)) {
  stop("No recorded scope for a follow-up round", {
    blocked: { code: "no-brief", detail: "Retry from the initial route" },
  });
} else {
  const touches = protectedTouches(
    [...brief.source_paths, ...brief.test_paths],
    allowProtected,
  );
  if (touches.length)
    stop("The recorded scope reaches protected repository policy", {
      blocked: protectedBlock(touches),
    });
}

const reservation = await reserveAreas(round.archon, {
  issue: round.issue,
  areas: brief.shared_areas,
});
if (reservation.kind === "parked") {
  const parked = parkingStop(reservation);
  stop(parked.reason, parked.ledger);
}
if (claim.route === "feedback" || claim.route === "deliver") {
  round.ledger.write("after-scope", { define: false, build: false });
  emit({
    proceed: "yes",
    define: "no",
    build: "no",
    ezra_assignment: "",
    reason: `Shared-area gate passed for the ${claim.route} round`,
  });
  process.exit(0);
}
if (newScope) {
  await writeWorkItem(
    round,
    planCheckpoint(document, {
      runId: round.runId,
      fields: { brief },
      now: round.now(),
    }),
  );
  document = await workItem(round);
}

const plan = planScopeStages({
  route: claim.route,
  brief,
  contextChanged: context.changed,
  fingerprint: context.fingerprint,
});
brief = plan.brief;
if (plan.briefChanged)
  await writeWorkItem(
    round,
    planCheckpoint(document, {
      runId: round.runId,
      fields: { brief },
      now: round.now(),
    }),
  );

const runContext = round.context.read();
round.context.write({
  ...runContext,
  nodes: {
    ...runContext.nodes,
    define: {
      ...runContext.nodes.define,
      write: [{ root: round.where.repo, globs: brief.test_paths }],
    },
    build: {
      ...runContext.nodes.build,
      write: [{ root: round.where.repo, globs: brief.source_paths }],
      denyWrite: [{ root: round.where.repo, globs: brief.test_paths }],
    },
  },
});

const acceptanceBaseline = plan.define
  ? await snapshotAcceptanceBaseline({
      git: round.git,
      repo: round.where.repo,
      sourceGlobs: brief.source_paths,
      testGlobs: brief.test_paths,
    })
  : undefined;
let ezraAssignment = "";
if (plan.define) {
  const materials = round.materials("ezra");
  const request = readFileSync(
    path.posix.join(materials, "request.md"),
    "utf8",
  );
  const corrections = ezraCorrections(brief.repair);
  ezraAssignment = renderAssignment({
    title: `Acceptance ${plan.stage} for issue #${round.issue}`,
    identity: {
      assignment_id: round.assignment,
      run_id: round.runId,
      stage: plan.stage,
      workspace: round.where.repo,
      materials,
      base_sha: value.base,
      candidate_sha: value.head ?? "not yet created",
      acceptance_revision: value.acceptance?.revision ?? "not yet created",
    },
    sections: [
      ["Original request", clipText(request, 30_000)],
      ["Coordinator brief", brief.summary],
      ["Paths", ezraPaths(brief)],
      ...(corrections.length
        ? [
            [
              "Acceptance corrections requested",
              corrections.map((item: string) => `- ${item}`).join("\n"),
            ] as [string, string],
          ]
        : []),
      [
        "Previous criteria",
        value.acceptance
          ? JSON.stringify(value.acceptance.criteria, null, 2)
          : "None yet.",
      ],
      [
        "How to work",
        [
          `Use absolute paths under ${round.where.repo} with Read, Grep and Glob; read governing documents in ${materials}.`,
          acceptanceOnly(brief)
            ? "Make the test change itself and confirm with run_check that the tests pass against the unchanged code."
            : "Write meaningful tests that fail before the change where behavior is substantive (red), using run_check to confirm.",
          brief.docs_only
            ? "This is documentation-only work: define deterministic structural checks rather than artificial failing product tests."
            : "",
          FINAL_EVIDENCE,
        ]
          .filter(Boolean)
          .join("\n"),
      ],
    ],
    contract:
      "Return task_status, criteria (stable ids such as C1, C2), the test files you wrote (test_paths), checks actually run with outcomes, gaps and questions.",
  });
}
round.ledger.write("after-scope", {
  define: plan.define,
  build: plan.build,
  stage: plan.stage,
  contextChanged: plan.briefChanged,
  ...(acceptanceBaseline ? { acceptanceBaseline } : {}),
});
emit({
  proceed: "yes",
  define: plan.define ? "yes" : "no",
  build: plan.build ? "yes" : "no",
  ezra_assignment: ezraAssignment,
  reason: plan.reason,
});
