# Stripe Donation Workflow Decisions

## Purpose

This guide records the Stripe payment decisions made during the Inngest workflow
executor planning grill. It exists to keep one-time donation recovery,
recurring donation setup, ACH timing, and Inngest background execution aligned
with Stripe best practices and the current Asymmetric.al repo boundaries.

This is a planning guide, not an implementation. Do not treat it as approval to
add Stripe API changes, Inngest routes, migrations, environment variables, or
runtime dependencies without an OpenSpec change and implementation plan.

## Triggers

Use this guide when planning or implementing:

- One-time donation checkout and PaymentIntent recovery.
- Recurring donations, subscriptions, pledges, or donor billing schedules.
- ACH Direct Debit, bank-account checkout, Link, or Instant Bank Payments.
- Inngest workflows that process donation outbox rows, Stripe webhook follow-up,
  payment reconciliation, donor notifications, or workflow run summaries.
- Mission Control wording for donation payment status.

## Stripe Sources Of Truth

Use current Stripe docs before implementation. The decisions below were based
on these Stripe guidance areas:

- PaymentIntents are valid when the app owns checkout state and needs to create
  or retrieve a payment object immediately.
- Checkout Sessions are Stripe's recommended default for most new checkout
  flows and support hosted, embedded, and custom UI modes.
- Stripe Billing and Subscriptions own recurring payment lifecycle, renewal
  retries, dunning, invoices, and subscription status. Do not build recurring
  renewal loops from raw one-time PaymentIntents.
- Dynamic payment methods and payment method configurations should be preferred
  over hardcoding `payment_method_types`, unless a Stripe-documented exception
  applies.
- ACH Direct Debit is a delayed-notification payment method. It can collect a
  mandate and start processing during checkout, but final success or failure can
  arrive days later.
- Link Instant Bank Payments can provide instant bank-payment confirmation when
  eligible, but it is not the same thing as ACH Direct Debit and is subject to
  Stripe eligibility rules.

## Workflow Steps

### One-Time Donations

1. Keep the current repo's immediate donor checkout behavior for one-time
   donations until a separate Stripe checkout redesign is approved.
2. The donor-facing server path should create or retrieve the Stripe payment
   object immediately when possible and return the client secret needed by the
   Stripe UI.
3. Continue using the product idempotency key for Stripe POST calls, including
   separate stable keys for customer creation and PaymentIntent creation.
4. Inngest should replace the scheduled/backfill worker first, not the
   donor-facing payment creation moment.
5. The Inngest one-time donation recovery function should process one
   `donation_saga_outbox` row per workflow run.
6. A due scanner may find candidate rows, but the per-row workflow should claim
   its own row immediately before Stripe work.
7. Stripe webhooks remain the source for final payment status updates.

### Recurring Donations

1. Treat recurring donations as subscription-oriented payment flows, not repeated
   one-time donations.
2. Use Stripe Billing and subscription-oriented checkout for recurring donation
   setup. Prefer Checkout Sessions with `mode=subscription` or another
   Stripe-documented Billing flow that matches the approved product design.
3. Use Stripe's subscription, invoice, and payment events to update product
   state. Inngest may process internal follow-up, reconciliation,
   notifications, and operator summaries, but it must not become the billing
   source of truth.
4. Use Stripe Customer Portal or a Stripe-documented self-service management
   flow for donor recurring-gift management when product scope includes
   cancellation, pauses, payment method updates, or billing changes.

### Bank Payments And ACH

1. Support credit cards, debit cards, wallets, and bank options through
   Stripe-supported checkout surfaces.
2. For the fastest bank option, use Link Instant Bank Payments when Stripe
   shows it as eligible.
3. Keep ACH Direct Debit available when required by the product, but do not
   describe it as immediately final.
4. For ACH Direct Debit, the immediate checkout checkpoint is mandate acceptance
   plus bank verification or processing state. Payment finality arrives later
   through Stripe payment status updates.
5. Mission Control and donor UI must distinguish "processing" from "completed"
   for ACH and other delayed-notification payment methods.
6. Prefer Stripe-hosted bank collection and Financial Connections for ACH
   verification. This can instantly verify eligible bank accounts and can use
   microdeposits when instant verification is not available.
7. Do not treat routing-number or account-number formatting as enough to mark
   ACH as ready. The useful checkpoint is Stripe's bank-account verification or
   the explicit need for donor verification.

### Donor Checkout UX

1. Keep one consistent donation checkout experience across cards, debit cards,
   wallets, Link Instant Bank Payments, and ACH Direct Debit.
2. Do not make ACH look like a separate product or a lower-quality checkout.
3. The payment rail may change the status language, required Stripe action, or
   timing of finality, but it should not fragment the donor's visual flow.
4. Use clear status copy for delayed bank payments so the donor understands that
   the debit was authorized or processing, not finally settled.

### Inngest Boundaries

1. Inngest executes internal workflow recovery and follow-up; it does not decide
   whether Stripe authorized, settled, failed, or retried a payment.
2. Inngest events must contain identifiers and routing metadata only. Do not put
   Stripe secrets, full donor records, bank details, payment internals, client
   secrets, or broad Stripe payloads into workflow events.
3. The product database remains authoritative for donation rows, saga outbox
   rows, workflow dispatch requests, product idempotency keys, and operator
   summaries.
4. Workflow run summaries may show payment workflow progress, but Stripe
   objects and webhooks remain the payment status authority.

### Stripe Webhooks

1. Stripe webhook routes must verify the Stripe signature before storing or
   processing the event.
2. Once a Stripe event is verified and durably stored, the route may return
   `200 OK` to Stripe even if immediate Inngest dispatch fails.
3. If immediate Inngest dispatch fails after storage, record the workflow
   dispatch failure and let dispatch recovery send the event later.
4. Return non-2xx only when signature verification fails, the webhook is
   misconfigured, or the raw event cannot be safely stored.
5. The first Inngest Stripe workflow should support the repo's current
   one-time donation events plus the minimum recurring-donation lifecycle
   events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.processing`
   - `charge.refunded`
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - key subscription status changes needed for donor recurring-gift state
6. Unsupported Stripe events should still be stored and marked `ignored` with a
   clear reason. They should not trigger provider retries or urgent staff
   alerts merely because they are unsupported.

## Status Language

Use precise language in UI, logs, docs, and workflow summaries:

- `requires_action`: The donor must complete an additional Stripe step.
- `processing`: Stripe accepted the payment attempt or bank debit flow, but
  final success or failure is not yet known.
- `completed`: Stripe has confirmed payment success and the product records
  have been updated.
- `failed`: Stripe or product processing confirmed failure.
- `dead_letter`: Product recovery exhausted its allowed attempts and needs
  staff review.

Avoid saying ACH is "approved", "settled", "cleared", or "completed" during
checkout unless Stripe has actually reported final success.

## Checklist

- [ ] Current Stripe docs were checked before coding.
- [ ] One-time donation checkout still returns a Stripe client secret
      immediately when Stripe can create or retrieve the payment object.
- [ ] Recurring donation work uses Stripe Billing or subscription-oriented
      checkout, not a manual PaymentIntent renewal loop.
- [ ] Dynamic payment methods or payment method configurations are preferred
      over hardcoded payment method lists.
- [ ] ACH Direct Debit is described as authorized/processing during checkout,
      not finally successful.
- [ ] ACH bank-account status distinguishes verified, verification required,
      processing, failed, and completed states.
- [ ] Link Instant Bank Payments is considered for eligible instant bank
      confirmation.
- [ ] Donor checkout remains visually consistent across payment methods.
- [ ] Stripe idempotency keys remain stable for retried POST calls.
- [ ] Stripe webhook handling remains the source of final payment outcomes.
- [ ] Stripe webhook routes acknowledge stored events even when immediate
      Inngest dispatch fails.
- [ ] Unsupported Stripe events are stored and marked ignored with a reason.
- [ ] Inngest workflows do not carry secrets, client secrets, bank details, or
      broad Stripe payloads.
- [ ] Mission Control and donor UI distinguish payment authorization checkpoint
      from payment finality.
