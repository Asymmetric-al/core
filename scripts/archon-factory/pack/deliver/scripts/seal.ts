// Seal: both first-pass reviews have settled. Validate their bindings to the
// exact candidate and acceptance revision, record them, and only then make
// them available together to Samson.
import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  emit,
  input,
  openRound,
  renderAssignment,
  workItem,
  writeWorkItem,
} from "../../.shared/round.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";
import {
  ASSESSMENT_CHOICES,
  sealDecision,
  sealReview,
} from "./review-logic.mjs";

const round = openRound();
const candidate = input("candidate");
const document = await workItem(round);
const value = document.value;

const binding = { candidate, acceptanceRevision: value.acceptance.revision };
const reports = {
  micaiah: sealReview("Micaiah", input("micaiah"), binding),
  luke: sealReview("Luke", input("luke"), binding),
};
const sealedAt = round.now();
const evidence = path.posix.join(round.runDir, "sealed-reviews.json");
writeFileSync(
  evidence,
  JSON.stringify(
    { candidate, acceptance: value.acceptance.revision, sealedAt, reports },
    null,
    2,
  ),
);
const reviews = Object.fromEntries(
  Object.entries(reports).map(([name, report]) => [
    name,
    {
      decision: report.decision,
      candidate,
      acceptance: value.acceptance.revision,
      findings: report.findings.length,
      sealedAt,
      run: round.runId,
    },
  ]),
);
await writeWorkItem(
  round,
  planCheckpoint(document, {
    runId: round.runId,
    fields: { reviews },
    now: round.now(),
  }),
);

const { bothClear, findings } = sealDecision(reports);
writeFileSync(
  path.posix.join(round.materials("assess"), "findings.json"),
  JSON.stringify(findings, null, 2),
);
round.ledger.write("seal", { bothClear, reports, evidence });
if (bothClear) {
  emit({
    assess: "no",
    assessment_assignment: "",
    reason:
      "Both independent reviews are CLEAR with no findings for this candidate",
  });
  process.exit(0);
}
const assignment = renderAssignment({
  title: `Assess sealed reviews of issue #${round.issue}`,
  identity: {
    assignment_id: round.assignment,
    candidate_sha: candidate,
    acceptance_revision: value.acceptance.revision,
    run_id: round.runId,
  },
  sections: [
    ["Coordinator brief", value.brief.summary],
    ["Acceptance", JSON.stringify(value.acceptance.criteria, null, 2)],
    [
      "Micaiah (correctness and completeness)",
      `Decision: ${reports.micaiah.decision}. ${reports.micaiah.reason}\nLimitations: ${reports.micaiah.limitations.join("; ") || "none"}`,
    ],
    [
      "Luke (systems and failure cases)",
      `Decision: ${reports.luke.decision}. ${reports.luke.reason}\nLimitations: ${reports.luke.limitations.join("; ") || "none"}`,
    ],
    ["Findings", JSON.stringify(findings, null, 2)],
    ["Your decision", ASSESSMENT_CHOICES],
  ],
  contract:
    "Return task_status, one disposition per finding id, and a short summary.",
});
emit({
  assess: "yes",
  assessment_assignment: assignment,
  reason: `Reviews: Micaiah ${reports.micaiah.decision}, Luke ${reports.luke.decision}`,
});
