// After adjudication: translate Agabus's rulings on neutral claim ids back to
// the sealed findings. Accepted claims become repairs for their owner,
// rejected claims are cleared, missing evidence blocks, and an INCONCLUSIVE
// first-pass review still stops the candidate before final acceptance.
import { readFileSync } from "node:fs";

import {
  clipText,
  emit,
  input,
  openRound,
  renderAssignment,
  workItem,
  writeWorkItem,
} from "../../.shared/round.mjs";
import { finalAcceptanceAssignment } from "../../.shared/views.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";
import { clearedReviews, planAdjudication } from "./review-logic.mjs";

const round = openRound();
const freeze = round.ledger.read("freeze");
const respond = (
  out: Record<string, string>,
  ledger: Record<string, unknown>,
) => {
  round.ledger.write("after-adjudicate", ledger);
  emit(out);
  process.exit(0);
};

const result = planAdjudication({
  agabus: input("agabus"),
  plan: round.ledger.read("assess-plan"),
  plannedFinal: input("planned_final"),
  reports: round.ledger.read("seal").reports,
});
if (result.kind === "pass")
  respond(
    {
      final: result.final ? "yes" : "no",
      ezra_final_assignment: result.final
        ? String(input("ezra_final_assignment") ?? "")
        : "",
      reason: result.reason,
    },
    { final: result.final },
  );
if (result.kind === "blocked")
  respond(
    { final: "no", ezra_final_assignment: "", reason: result.reason },
    { blocked: result.blocked },
  );
if (result.kind === "repair")
  respond(
    { final: "no", ezra_final_assignment: "", reason: result.reason },
    { repair: result.repair, fingerprint: result.fingerprint },
  );

const document = await workItem(round);
await writeWorkItem(
  round,
  planCheckpoint(document, {
    runId: round.runId,
    fields: { reviews: clearedReviews(document.value.reviews) },
    now: round.now(),
  }),
);
const value = (await workItem(round)).value;
respond(
  {
    final: "yes",
    ezra_final_assignment: await finalAcceptanceAssignment(
      round,
      value,
      freeze.candidate,
      { clipText, renderAssignment, readFileSync },
    ),
    reason: result.reason,
  },
  { final: true, rejected: result.rejected },
);
