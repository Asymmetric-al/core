import {
  workflowEventEnvelopeSchema,
  type WorkflowEventEnvelope,
} from "./events";
import { inngest } from "./inngest/client";

interface WorkflowSendClient {
  send: (payload: {
    id?: string;
    name: string;
    data: WorkflowEventEnvelope;
  }) => Promise<{ ids: string[] }>;
}

export interface WorkflowDispatchInput {
  name: string;
  envelope: WorkflowEventEnvelope;
  /**
   * Optional Inngest event id for handoff-level deduplication. This only
   * prevents duplicate handoffs; product idempotency keys and product work
   * claims remain the guard for business effects.
   */
  dedupeId?: string;
}

export interface WorkflowDispatchResult {
  dispatched: boolean;
  eventIds: string[];
  error: string | null;
}

/**
 * The dispatch adapter hands a validated workflow event envelope to Inngest.
 * It never throws: callers (and later the workflow dispatch ledger) decide
 * how to record and recover failed handoffs.
 */
export function createWorkflowDispatcher(
  client: WorkflowSendClient = inngest,
): (input: WorkflowDispatchInput) => Promise<WorkflowDispatchResult> {
  return async function dispatchWorkflowEvent(input) {
    const parsed = workflowEventEnvelopeSchema.safeParse(input.envelope);

    if (!parsed.success) {
      const invalidPaths = parsed.error.issues
        .map((issue) => issue.path.join(".") || issue.code)
        .join(", ");

      return {
        dispatched: false,
        eventIds: [],
        error: `workflow_envelope_invalid: ${invalidPaths}`,
      };
    }

    try {
      const sent = await client.send({
        ...(input.dedupeId ? { id: input.dedupeId } : {}),
        name: input.name,
        data: parsed.data,
      });

      return { dispatched: true, eventIds: sent.ids, error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "workflow_dispatch_failed";

      return { dispatched: false, eventIds: [], error: message };
    }
  };
}

export const dispatchWorkflowEvent = createWorkflowDispatcher();
