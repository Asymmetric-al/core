// Pure decisions for the chat record node. The answer node's result comes
// from the engine's node-outcome listing ($NODE_OUTCOMES_FILE), never from a
// `with:` binding: a binding to a failed producer fails the record node too,
// and the operator's message would stay pending forever.
import { readFileSync } from "node:fs";

const MESSAGES = 24;

export function readNodeOutcomes(file) {
  try {
    const listing = JSON.parse(readFileSync(file, "utf8"));
    return listing && Array.isArray(listing.nodes) ? listing : { nodes: [] };
  } catch {
    return { nodes: [] };
  }
}

// The last recorded invocation of a node: completed entries carry the
// certified output; failed ones only an error.
export function nodeOutcome(listing, nodeId, runId) {
  if (listing?.run_id && runId && listing.run_id !== runId)
    return {
      state: "unknown",
      output: null,
      error: "Node outcomes belong to another run",
    };
  const entry = (listing?.nodes ?? [])
    .filter((item) => item.node_id === nodeId)
    .at(-1);
  if (!entry) return { state: "unknown", output: null, error: "" };
  return {
    state: String(entry.state),
    output: entry.state === "completed" ? (entry.output ?? null) : null,
    error: String(entry.error ?? entry.reason ?? ""),
  };
}

const isText = (value) => typeof value === "string";
function validAnswer(answer) {
  return (
    answer !== null &&
    typeof answer === "object" &&
    isText(answer.answer) &&
    Array.isArray(answer.sources) &&
    answer.sources.every(isText) &&
    typeof answer.needs_clarification === "boolean" &&
    isText(answer.clarification) &&
    answer.operation !== null &&
    typeof answer.operation === "object" &&
    isText(answer.operation.kind)
  );
}

function failureText(outcome) {
  if (outcome.state === "completed")
    return "Samson could not answer this turn (the answer was malformed).";
  const detail = outcome.error ? `: ${outcome.error.slice(0, 300)}` : "";
  return `Samson could not answer this turn (answer node ${outcome.state}${detail}).`;
}

// Next conversation messages for one turn: the operator message keeps its
// original time and becomes answered (or failed), and exactly one Samson
// message for the request follows it.
export function chatMessages(
  messages,
  { request, question, at, run, outcome },
) {
  const answer =
    outcome.state === "completed" && validAnswer(outcome.output)
      ? outcome.output
      : null;
  const asked = messages.find(
    (message) => message.request === request && message.role === "operator",
  );
  const reply = answer
    ? {
        role: "samson",
        request,
        at,
        run,
        text: String(
          answer.needs_clarification ? answer.clarification : answer.answer,
        ).slice(0, 2500),
        sources: answer.sources.slice(0, 16),
        operation:
          answer.operation.kind === "none"
            ? null
            : { ...answer.operation, status: "proposed" },
      }
    : {
        role: "samson",
        request,
        at,
        run,
        text: failureText(outcome),
        failed: true,
      };
  return [
    ...messages.filter(
      (message) =>
        !(message.request === request && message.role === "operator"),
    ),
    {
      role: "operator",
      text: question,
      request,
      at: asked?.at ?? at,
      status: answer ? "answered" : "failed",
    },
    reply,
  ].slice(-MESSAGES);
}
