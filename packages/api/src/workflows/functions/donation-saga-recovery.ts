import { NonRetriableError } from "inngest";

import { processDonationSagaOutboxEvent } from "../../donate/saga";
import { getStripeClient } from "../../stripe/client";
import { runDonationSagaRecoveryScan } from "../adapters/donations";
import { requireWorkflowAdminClient } from "../admin-client";
import { parseWorkflowEnvelopeOrThrow } from "../envelope-guard";
import {
  DONATION_SAGA_RECOVERY_EVENT,
  WORKFLOW_SYSTEM_ACTOR_ID,
} from "../events";
import { inngest } from "../inngest/client";

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
    const envelope = parseWorkflowEnvelopeOrThrow(event.data);
    const outboxId = envelope.subject.id;

    return await step.run("process-donation-saga-row", async () => {
      const supabaseAdmin = requireWorkflowAdminClient("donation_recovery");

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

      const stripe = getStripeClient(stripeSecretKey);

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
      const client = requireWorkflowAdminClient("donation_recovery");

      return await runDonationSagaRecoveryScan({ client });
    });
  },
);
