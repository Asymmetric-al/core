# 05: One-time donation saga recovery through Inngest

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## GitHub issue

#290

## What to build

Move the retryable one-time donation saga recovery path onto Inngest while
preserving the current donor-facing immediate payment creation behavior and the
existing Stripe/product idempotency guarantees.

## Acceptance criteria

- [ ] Donor checkout still creates or retrieves the Stripe payment object
      immediately when possible.
- [ ] Each donation saga workflow run processes one claimed saga outbox row.
- [ ] Product idempotency keys and Stripe idempotency keys remain stable across
      retries.
- [ ] Workflow retries do not duplicate Stripe customers, PaymentIntents, audit
      entries, or donation state transitions.
- [ ] Dead-letter donation saga behavior remains visible for staff recovery.
- [ ] Tests cover successful recovery, transient failure retry, duplicate
      dispatch, dead-letter transition, and immediate checkout behavior.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/04-work-claims-and-recovery-scan.md
