// Snapshot of factory facts for one Samson chat turn. No unsealed review
// content or worker transcripts are included.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createArchon } from "../../.shared/archon.mjs";
import { factoryPaths, loadConfig } from "../../.shared/config.mjs";
import { ensureInitialRunIdentity } from "../../.shared/identity.mjs";
import { writeRunContext } from "../../.shared/runctx.mjs";
import { chatSnapshot } from "./facts-logic.mjs";

const config = loadConfig();
const paths = factoryPaths(config);
const archon = createArchon();
const runId = process.env.WORKFLOW_ID!;
await ensureInitialRunIdentity({ config, runId });
const question = String(process.env.INPUTS_QUESTION ?? "").slice(0, 4000);
const conversation = String(process.env.INPUTS_CONVERSATION ?? "");
if (!/^[a-z0-9-]{8,64}$/.test(conversation))
  throw new Error("Invalid conversation id");

const [factory, scope, selection, issues, attention, chat] = await Promise.all([
  archon.get("core/factory"),
  archon.get("core/scope"),
  archon.get("core/selection"),
  archon.list("core/issues/", { values: true }),
  archon.get("core/attention"),
  archon.get(`core/chat/${conversation}`),
]);
const snapshot = chatSnapshot({
  observedAt: new Date().toISOString(),
  factory: factory.value,
  scope: scope.value,
  selection: selection.value,
  issues,
  attention: attention.value,
});
const materials = path.posix.join(paths.runs, runId, "materials", "answer");
mkdirSync(materials, { recursive: true });
writeFileSync(
  path.posix.join(materials, "snapshot.json"),
  JSON.stringify(snapshot, null, 2),
);
writeRunContext(
  {
    v: 1,
    runId,
    issue: 0,
    round: 0,
    nodes: { answer: { role: "samson", read: [materials] } },
  },
  paths.runs,
);
const history = (chat.value?.messages ?? []).slice(-12);
const assignment = [
  "# Operator conversation",
  "",
  "## Factory facts (observed now; authoritative over memory)",
  "",
  "```json",
  JSON.stringify(snapshot, null, 2).slice(0, 40_000),
  "```",
  "",
  "## Earlier turns in this conversation",
  "",
  history
    .map(
      (message: { role: string; text: string }) =>
        `${message.role}: ${message.text}`,
    )
    .join("\n\n") || "(none)",
  "",
  "## Operator message",
  "",
  question,
  "",
  "## How to answer",
  "",
  "Answer plainly from the facts above, citing work items, runs or PRs. Say when the facts do not show something.",
  "If the operator gives a direction, propose exactly one operation that implements it; the operator confirms it in the Console before anything happens.",
  "Use issue 0 and an empty issues list when they do not apply, and endState unchanged unless assigning scope.",
  "If a consequential direction is ambiguous (which issue? which scope?), set needs_clarification and ask the smallest question instead.",
].join("\n");
process.stdout.write(
  JSON.stringify({ assignment, reason: "Snapshot assembled" }) + "\n",
);
