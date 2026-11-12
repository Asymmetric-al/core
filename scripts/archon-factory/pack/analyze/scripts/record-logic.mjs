// Pure validation for the analysis record node. The analyst's result comes
// from the engine's node-outcome listing ($NODE_OUTCOMES_FILE), never from a
// `with:` binding, so a failed analyst is still recorded as a failed analysis.
// Malformed or missing output is failed or inconclusive, never healthy.
import { readFileSync } from "node:fs";

export const LIMITS = { outputChars: 8000, findings: 5 };

export function readNodeOutcomes(file) {
  try {
    const listing = JSON.parse(readFileSync(file, "utf8"));
    return listing && Array.isArray(listing.nodes) ? listing : { nodes: [] };
  } catch {
    return { nodes: [] };
  }
}

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
const texts = (value) => Array.isArray(value) && value.every(isText);
const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function shapeProblem(output) {
  if (!record(output)) return "the result is not an object";
  if (!["findings", "no-actionable-concern"].includes(output.result))
    return "unknown result";
  if (
    !Array.isArray(output.observations) ||
    !output.observations.every(
      (item) => record(item) && isText(item.text) && texts(item.evidence),
    )
  )
    return "observations are malformed";
  if (
    !Array.isArray(output.findings) ||
    !output.findings.every(
      (item) =>
        record(item) &&
        isText(item.title) &&
        typeof item.material === "boolean" &&
        isText(item.explanation) &&
        texts(item.alternatives) &&
        texts(item.evidence) &&
        isText(item.next_step) &&
        isText(item.how_to_tell),
    )
  )
    return "findings are malformed";
  if (!texts(output.coverage_limits)) return "coverage limits are malformed";
  return "";
}

export function assessAnalysis({ outcome, ids }) {
  const failed = (problem) => ({ status: "failed", problem, result: null });
  const inconclusive = (problem) => ({
    status: "inconclusive",
    problem,
    result: null,
  });
  if (outcome.state !== "completed")
    return failed(
      `The analyst node ${outcome.state}${outcome.error ? `: ${outcome.error.slice(0, 600)}` : ""}`,
    );
  const output = outcome.output;
  const malformed = shapeProblem(output);
  if (malformed)
    return failed(`The analyst produced no valid result: ${malformed}`);
  const known = new Set(ids ?? []);
  const unknown = [...output.observations, ...output.findings]
    .flatMap((item) => item.evidence)
    .filter((id) => !known.has(id));
  if (unknown.length)
    return inconclusive(
      `Cites evidence not in the packet: ${[...new Set(unknown)].join(", ")}`,
    );
  const size = JSON.stringify(output).length;
  if (size > LIMITS.outputChars)
    return inconclusive(
      `Output exceeds ${LIMITS.outputChars} characters (${size})`,
    );
  if (output.findings.length > LIMITS.findings)
    return inconclusive(
      `Reports ${output.findings.length} findings; at most ${LIMITS.findings} are allowed`,
    );
  const uncited = output.findings.filter(
    (item) => item.material && !item.evidence.length,
  );
  if (uncited.length)
    return inconclusive(
      `Material finding without evidence: ${uncited[0].title.slice(0, 120)}`,
    );
  if (output.result === "findings" && !output.findings.length)
    return inconclusive("Reported findings without any");
  return { status: "completed", problem: "", result: output };
}
