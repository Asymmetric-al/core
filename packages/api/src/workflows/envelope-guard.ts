import { NonRetriableError } from "inngest";

import {
  workflowEventEnvelopeSchema,
  type WorkflowEventEnvelope,
} from "./events";

import type { ZodError } from "zod";

/**
 * Formats envelope validation issues as a safe, comma-separated list of
 * offending paths. Never includes the rejected values themselves — envelope
 * failures can carry exactly the sensitive payloads the schema rejects.
 */
export function formatEnvelopeIssues(error: ZodError): string {
  return error.issues
    .map((issue) => issue.path.join(".") || issue.code)
    .join(", ");
}

/** The shared `workflow_envelope_invalid` error string for non-throwing callers. */
export function envelopeInvalidMessage(error: ZodError): string {
  return `workflow_envelope_invalid: ${formatEnvelopeIssues(error)}`;
}

/**
 * Parses an Inngest event payload into a workflow event envelope, or throws
 * a NonRetriableError — a malformed envelope can never become valid through
 * retries, so the run must fail immediately. This is also where a future
 * schemaVersion-2 negotiation belongs.
 */
export function parseWorkflowEnvelopeOrThrow(
  data: unknown,
): WorkflowEventEnvelope {
  const parsed = workflowEventEnvelopeSchema.safeParse(data);

  if (!parsed.success) {
    throw new NonRetriableError(envelopeInvalidMessage(parsed.error));
  }

  return parsed.data;
}
