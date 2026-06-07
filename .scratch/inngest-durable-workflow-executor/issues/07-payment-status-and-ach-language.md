# 07: Payment status and ACH language across giving surfaces

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Make donation status language truthful across donor and Mission Control
surfaces for card, debit, wallet, instant bank, ACH Direct Debit, recurring, and
delayed-notification states.

## Acceptance criteria

- [ ] Payment authorization checkpoint, bank account verification checkpoint,
      processing, completed, failed, and dead-letter states are represented
      clearly.
- [ ] ACH Direct Debit is never shown as finally successful until Stripe final
      payment status supports that state.
- [ ] Donation checkout remains visually consistent across payment methods.
- [ ] Staff-facing payment workflow summaries preserve Stripe as the payment
      authority.
- [ ] Donor-facing copy is calm and clear without exposing payment internals.
- [ ] Tests cover ACH processing, verification required, final success, failure,
      and recurring payment status display.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/05-one-time-donation-saga-recovery.md
- .scratch/inngest-durable-workflow-executor/issues/06-stripe-webhook-and-recurring-lifecycle.md
