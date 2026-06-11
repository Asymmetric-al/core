import { z } from "zod";

/**
 * Workflow event names use product-domain object/action language, never app
 * route locations. See openspec/changes/add-inngest-durable-workflow-executor.
 */
export const WORKFLOW_SMOKE_EVENT = "workflows/smoke.requested";

/**
 * The standard tenant-scoped workflow event envelope (schema version 1).
 *
 * Workflow events carry identifiers and safe routing metadata only. The
 * schema is strict: unknown fields are rejected so secrets, full records,
 * payment internals, email bodies, attachments, rendered documents, and broad
 * CRM payloads can never ride along in a workflow event.
 */
export const workflowEventEnvelopeSchema = z
  .object({
    tenantId: z.string().uuid(),
    workflowName: z.string().min(1),
    schemaVersion: z.literal(1),
    subject: z
      .object({
        type: z.string().min(1).max(64),
        id: z.string().min(1).max(128),
      })
      .strict(),
    dispatchRequestId: z.string().uuid().optional(),
  })
  .strict();

export type WorkflowEventEnvelope = z.infer<typeof workflowEventEnvelopeSchema>;
