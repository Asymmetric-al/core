# 06: Stripe webhook and recurring donation lifecycle dispatch

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Route verified and durably stored Stripe webhook records into workflow
follow-up for one-time payment status, refunds, and the minimum recurring
donation lifecycle events needed for Stripe Billing based recurring donations.

## Acceptance criteria

- [ ] Stripe signature verification happens before storage or workflow handoff.
- [ ] Stored Stripe events can be acknowledged even when immediate workflow
      dispatch fails.
- [ ] Immediate dispatch failure is recorded for dispatch recovery instead of
      forcing provider replay after durable storage.
- [ ] Unsupported Stripe events are stored and marked ignored with a safe reason.
- [ ] Recurring donation follow-up uses Stripe Billing subscription and invoice
      lifecycle events, not a manual one-time PaymentIntent renewal loop.
- [ ] Tests cover stored-event acknowledgement, dispatch failure recovery,
      unsupported events, subscription success, and invoice failure.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/04-work-claims-and-recovery-scan.md
