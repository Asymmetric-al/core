import { getAdminClient } from "@asym/database/supabase/admin";
import { getReceivedEmail, listReceivedEmailAttachments } from "@asym/email";
import { serverEnv } from "@asym/env";
import { NonRetriableError } from "inngest";

import {
  listInboundAttachments,
  loadInboundEmailForWorkflow,
  markInboundBodyRetrievalFailed,
  retrieveInboundBody,
  routeReadyInboundEmail,
  type InboundProviderClient,
} from "../adapters/inbound-email";
import {
  EMAIL_INBOUND_PROCESS_EVENT,
  workflowEventEnvelopeSchema,
} from "../events";
import { inngest } from "../inngest/client";

const NON_RETRIABLE_LOAD_ERRORS = new Set([
  "inbound_email_not_found",
  "inbound_email_tenant_mismatch",
]);

function getWorkflowAdminClient() {
  const { client, error } = getAdminClient();

  if (!client) {
    throw new Error(
      `inbound_email_admin_client_unavailable: ${error ?? "unknown"}`,
    );
  }

  return client;
}

function getProviderClient(): InboundProviderClient {
  const apiKey = serverEnv.RESEND_API_KEY;

  if (!apiKey) {
    throw new NonRetriableError("inbound_email_provider_unconfigured");
  }

  return {
    fetchReceivedEmail: getReceivedEmail,
    fetchAttachments: listReceivedEmailAttachments,
    apiKey,
  };
}

/**
 * Durable inbound email processing: load the placeholder, retrieve the body
 * from the provider, list attachment metadata, and route to Support Hub only
 * after the body is available. Attachment failures never block the
 * conversation; body retrieval exhaustion keeps a visible failed placeholder
 * for authorized staff retry.
 */
export const inboundEmailProcessing = inngest.createFunction(
  {
    id: "inbound-email-processing",
    triggers: [{ event: EMAIL_INBOUND_PROCESS_EVENT }],
    retries: 4,
    concurrency: [{ key: "event.data.tenantId", limit: 3 }],
    throttle: { limit: 8, period: "1s" },
    onFailure: async ({ event }) => {
      const original = event.data.event?.data as
        | { tenantId?: string; subject?: { id?: string } }
        | undefined;
      const inboundEmailRowId = original?.subject?.id;

      if (!inboundEmailRowId) return;

      const client = getWorkflowAdminClient();
      await markInboundBodyRetrievalFailed(client, { inboundEmailRowId });
    },
  },
  async ({ event, step }) => {
    const parsed = workflowEventEnvelopeSchema.safeParse(event.data);

    if (!parsed.success) {
      throw new NonRetriableError(
        `workflow_envelope_invalid: ${parsed.error.issues
          .map((issue) => issue.path.join(".") || issue.code)
          .join(", ")}`,
      );
    }

    const envelope = parsed.data;
    const target = {
      tenantId: envelope.tenantId,
      inboundEmailRowId: envelope.subject.id,
    };

    const placeholder = await step.run("load-inbound-placeholder", async () => {
      try {
        const client = getWorkflowAdminClient();
        const row = await loadInboundEmailForWorkflow(client, target);
        return {
          supportMessageId: row.support_message_id,
          bodyStatus: row.body_retrieval_status,
          attachmentStatus: row.attachment_retrieval_status,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (NON_RETRIABLE_LOAD_ERRORS.has(message)) {
          throw new NonRetriableError(message);
        }
        throw error;
      }
    });

    const body = await step.run("retrieve-inbound-body", async () => {
      const client = getWorkflowAdminClient();
      return await retrieveInboundBody(client, getProviderClient(), target);
    });

    const attachments = await step.run("list-inbound-attachments", async () => {
      const client = getWorkflowAdminClient();
      return await listInboundAttachments(client, getProviderClient(), target);
    });

    const routing = await step.run("route-to-support-hub", async () => {
      const client = getWorkflowAdminClient();
      return await routeReadyInboundEmail(client, target);
    });

    return {
      alreadyRouted: Boolean(placeholder.supportMessageId),
      body,
      attachments,
      routing,
    };
  },
);
