import { getAdminClient } from "@asym/database/supabase/admin";
import { NonRetriableError } from "inngest";
import Stripe from "stripe";

import { processDonationSagaOutboxEvent } from "../../donate/saga";
import { runDonationSagaRecoveryScan } from "../adapters/donations";
import {
  DONATION_SAGA_RECOVERY_EVENT,
  WORKFLOW_SYSTEM_ACTOR_ID,
  workflowEventEnvelopeSchema,
} from "../events";
import { inngest } from "../inngest/client";

const STRIPE_API_VERSION = "2025-02-24.acacia";

/**
 * Durable one-time donation saga recovery. Each run processes exactly one
 * saga outbox row: claim_donation_saga_event claims the row before any
 * Stripe work, and the saga's product/Stripe idempotency keys keep retries
 * from duplicating customers, PaymentIntents, or donation transitions.
 * Stripe webhooks remain the authority for final payment status; donor-facing
 * checkout still creates the payment object immediately outside this path.
 */
export const donationSagaRecovery = inngest.createFunction(
  {
    id: "donation-saga-recovery",
    triggers: [{ event: DONATION_SAGA_RECOVERY_EVENT }],
    retries: 3,
    concurrency: [
      // Per-tenant fairness on shared workflow infrastructure.
      { key: "event.data.tenantId", limit: 5 },
    ],
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
    const outboxId = envelope.subject.id;

    return await step.run("process-donation-saga-row", async () => {
      const { client: supabaseAdmin, error: adminError } = getAdminClient();

      if (!supabaseAdmin) {
        throw new Error(
          `donation_recovery_admin_client_unavailable: ${adminError ?? "unknown"}`,
        );
      }

      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from("tenants")
        .select("id, stripe_secret_key")
        .eq("id", envelope.tenantId)
        .single();

      if (tenantError || !tenant) {
        throw new Error(
          `donation_recovery_tenant_not_found: ${tenantError?.message ?? envelope.tenantId}`,
        );
      }

      const stripeSecretKey =
        tenant.stripe_secret_key ?? process.env.STRIPE_SECRET_KEY;

      if (!stripeSecretKey) {
        throw new NonRetriableError(
          "donation_recovery_stripe_unconfigured: no Stripe secret key for tenant",
        );
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: STRIPE_API_VERSION,
      });

      return await processDonationSagaOutboxEvent({
        supabaseAdmin,
        stripe,
        outboxId,
        actorUserId: WORKFLOW_SYSTEM_ACTOR_ID,
      });
    });
  },
);

/**
 * Scheduled scanner that finds due donation saga outbox rows and dispatches
 * one recovery event per row through the workflow dispatch ledger. It only
 * finds rows; the per-row function claims each row before Stripe work.
 */
export const donationSagaRecoveryScan = inngest.createFunction(
  {
    id: "donation-saga-recovery-scan",
    triggers: [{ cron: "*/2 * * * *" }],
    retries: 2,
    concurrency: [{ limit: 1 }],
  },
  async ({ step }) => {
    return await step.run("scan-due-saga-rows", async () => {
      const { client, error } = getAdminClient();

      if (!client) {
        throw new Error(
          `donation_recovery_admin_client_unavailable: ${error ?? "unknown"}`,
        );
      }

      return await runDonationSagaRecoveryScan({ client });
    });
  },
);
