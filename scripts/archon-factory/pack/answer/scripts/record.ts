// Append the turn to the conversation document. A proposed operation is
// stored as `proposed`; only the Console's confirmed control path executes it.
// The answer node's result is read from the node-outcome listing, so a failed
// answer node is recorded as a failed turn instead of leaving it pending.
import { StateConflict, createArchon } from "../../.shared/archon.mjs";
import {
  chatMessages,
  nodeOutcome,
  readNodeOutcomes,
} from "./record-logic.mjs";

const archon = createArchon();
const conversation = String(process.env.INPUTS_CONVERSATION ?? "");
const request = String(process.env.INPUTS_REQUEST ?? "");
const question = String(process.env.INPUTS_QUESTION ?? "").slice(0, 2000);
const run = process.env.WORKFLOW_ID;
const outcome = nodeOutcome(
  readNodeOutcomes(process.env.NODE_OUTCOMES_FILE),
  "answer",
  run,
);
const name = `core/chat/${conversation}`;
for (let attempt = 0; attempt < 4; attempt += 1) {
  const document = await archon.get(name);
  const messages = document.value?.messages ?? [];
  if (
    messages.some(
      (message: { request?: string; role: string }) =>
        message.request === request && message.role === "samson",
    )
  ) {
    process.stdout.write(
      JSON.stringify({ recorded: "yes", reason: "Turn already recorded" }) +
        "\n",
    );
    process.exit(0);
  }
  const next = chatMessages(messages, {
    request,
    question,
    at: new Date().toISOString(),
    run,
    outcome,
  });
  try {
    await archon.put(
      name,
      { v: 1, messages: next },
      { ifRevision: document.revision },
    );
    const failed = next.at(-1)?.failed === true;
    process.stdout.write(
      JSON.stringify({
        recorded: "yes",
        reason: failed ? "Failure recorded" : "Answer recorded",
      }) + "\n",
    );
    process.exit(0);
  } catch (error) {
    if (!(error instanceof StateConflict)) throw error;
  }
}
process.stdout.write(
  JSON.stringify({
    recorded: "no",
    reason: "Conversation changed concurrently",
  }) + "\n",
);
