import { z } from "zod";

/**
 * Workflow event names use product-domain object/action language, never app
 * route locations. See openspec/changes/add-inngest-durable-workflow-executor.
 */
export const WORKFLOW_SMOKE_EVENT = "workflows/smoke.requested";

export const DONATION_SAGA_RECOVERY_EVENT = "donations/saga.recovery.requested";

export const STRIPE_EVENT_PROCESS_EVENT =
  "giving/stripe-event.process.requested";

/**
 * System actor recorded when a workflow run (not a staff user) performs a
 * product action. audit_logs.user_id has no FK, and the donation saga RPCs
 * accept any UUID, so the nil UUID identifies "the workflow executor".
 */
export const WORKFLOW_SYSTEM_ACTOR_ID = "00000000-0000-0000-0000-000000000000";

/**
 * Context keys that look like sensitive or broad product content. The
 * envelope rejects these so secrets, payment internals, bank details, email
 * bodies, rendered documents, attachments, and raw provider payloads can
 * never ride along in a workflow event. The list is deliberately overbroad:
 * workflow context is for identifiers and safe routing metadata only.
 */
const SENSITIVE_CONTEXT_KEY_PATTERN =
  /body|html|secret|token|password|credential|signature|attachment|payload|raw|bank|iban|routing.?number|account.?number|card|ssn|document/i;

const MAX_CONTEXT_KEYS = 16;
const MAX_CONTEXT_VALUE_LENGTH = 256;

const safeContextSchema = z
  .record(
    z.string().min(1).max(64),
    z.union([
      z.string().max(MAX_CONTEXT_VALUE_LENGTH),
      z.number(),
      z.boolean(),
      z.null(),
    ]),
  )
  .superRefine((context, ctx) => {
    const keys = Object.keys(context);

    if (keys.length > MAX_CONTEXT_KEYS) {
      ctx.addIssue({
        code: "custom",
        message: `context allows at most ${MAX_CONTEXT_KEYS} keys`,
        path: [],
      });
    }

    for (const key of keys) {
      if (SENSITIVE_CONTEXT_KEY_PATTERN.test(key)) {
        ctx.addIssue({
          code: "custom",
          message: `context key "${key}" looks like sensitive content and is not allowed in workflow events`,
          path: [key],
        });
      }
    }
  });

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
    context: safeContextSchema.optional(),
  })
  .strict();

export type WorkflowEventEnvelope = z.infer<typeof workflowEventEnvelopeSchema>;
