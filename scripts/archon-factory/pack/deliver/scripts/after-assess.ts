// After assess: apply Samson's dispositions. Repairs go to their owner in the
// next round, genuine disputes to Agabus under neutral ids, and a clean
// candidate to Ezra's final acceptance. An INCONCLUSIVE review without a
// repair stops the candidate before adjudication. Acceptance corrections
// still pending for Ezra (a review-only round whose context changed) send the
// candidate back to her instead of final acceptance.
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
import {
  READ_ONLY_CHECKS,
  changeSection,
  finalAcceptanceAssignment,
  prepareRoleView,
} from "../../.shared/views.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";
import { ezraCorrections } from "./repair-logic.mjs";
import { clearedReviews, planAssessment } from "./review-logic.mjs";

const round = openRound();
const assess = input("assess");
const seal = round.ledger.read("seal");
const freeze = round.ledger.read("freeze");
const document = await workItem(round);
let value = document.value;
const candidate = freeze.candidate;
const respond = (
  out: Record<string, string>,
  ledger: Record<string, unknown>,
) => {
  round.ledger.write("after-assess", ledger);
  emit(out);
  process.exit(0);
};
const halt = (reason: string, ledger: Record<string, unknown>) =>
  respond(
    {
      adjudicate: "no",
      final: "no",
      agabus_assignment: "",
      ezra_final_assignment: "",
      reason,
    },
    ledger,
  );
const toFinal = async (reason: string, ledger: Record<string, unknown>) =>
  respond(
    {
      adjudicate: "no",
      final: "yes",
      agabus_assignment: "",
      ezra_final_assignment: await finalAcceptanceAssignment(
        round,
        value,
        candidate,
        { clipText, renderAssignment, readFileSync },
      ),
      reason,
    },
    ledger,
  );

const findings = seal.bothClear
  ? []
  : JSON.parse(
      readFileSync(
        path.posix.join(round.materials("assess"), "findings.json"),
        "utf8",
      ),
    );
const plan = planAssessment({
  findings,
  assess,
  reports: seal.reports,
  bothClear: seal.bothClear,
  pending: ezraCorrections(value.brief?.repair),
});
if (plan.kind === "final" && seal.bothClear)
  await toFinal(plan.reason, { final: true });
if (plan.kind === "blocked") halt(plan.reason, { blocked: plan.blocked });
if (plan.kind === "repair")
  halt(plan.reason, { repair: plan.repair, fingerprint: plan.fingerprint });
if (plan.kind === "adjudicate") {
  const { view, materials, changed } = await prepareRoleView(round, {
    node: "agabus",
    role: "agabus",
    candidate,
    base: value.base,
    extra: { "claims.json": JSON.stringify(plan.claims, null, 2) },
  });
  // The D-to-finding map stays in the trusted ledger, outside Agabus's roots.
  round.ledger.write("assess-plan", plan.plan);
  respond(
    {
      adjudicate: "yes",
      final: plan.final ? "yes" : "no",
      agabus_assignment: renderAssignment({
        title: `Adjudicate disputed findings for issue #${round.issue}`,
        identity: {
          assignment_id: round.assignment,
          run_id: round.runId,
          candidate_sha: candidate,
          candidate_files: view,
          materials,
        },
        sections: [
          [
            "Original request",
            clipText(
              readFileSync(path.posix.join(materials, "request.md"), "utf8"),
              20_000,
            ),
          ],
          ["Acceptance", JSON.stringify(value.acceptance.criteria, null, 2)],
          [
            "Disputed claims (reviewer identities removed)",
            JSON.stringify(plan.claims, null, 2),
          ],
          [
            "Change",
            changeSection({ base: value.base, candidate, changed, materials }),
          ],
          ["Checks", READ_ONLY_CHECKS],
        ],
        contract:
          "Return one ruling per claim id (ACCEPT, REJECT or NEEDS_EVIDENCE) with reasons and any correction or check.",
      }),
      ezra_final_assignment: "",
      reason: plan.reason,
    },
    {
      adjudicate: true,
      disputes: plan.claims.length,
      pendingImplementation: plan.plan.implementation.length,
      pendingAcceptance: plan.plan.acceptance.length,
    },
  );
}
await writeWorkItem(
  round,
  planCheckpoint(document, {
    runId: round.runId,
    fields: { reviews: clearedReviews(value.reviews) },
    now: round.now(),
  }),
);
value = (await workItem(round)).value;
await toFinal(plan.reason, { final: true, cleared: true });
