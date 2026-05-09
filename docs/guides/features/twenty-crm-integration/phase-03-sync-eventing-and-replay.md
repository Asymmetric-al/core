# Phase 03 - Sync, Eventing, And Replay

## Trigger

Use this phase after identity mapping exists and before any domain depends on live bidirectional sync.

## Goal

Move CRM data between Twenty and Asym safely, visibly, and replayably. Twenty downtime or webhook lag must not break money flows, public pages, auth, or care workflows.

## Scope

- Signed webhook ingress.
- Durable inbound event storage.
- Inbound event processor.
- Outbound sync queue.
- Idempotency keys.
- Retry and dead-letter behavior.
- Reconciliation and drift detection jobs.
- Sync logs and replay tooling.
- Feature flags for inbound and outbound sync.

## Not In Scope

- Production cutover.
- Bulk import.
- Donor or missionary visible behavior.
- Moving Stripe, receipt, statement, CMS publish, or care truth into Twenty.

## Workflow

1. Add a thin webhook route under the admin app that delegates to `@asym/api`.
2. Read the raw body where required for signature verification.
3. Validate Twenty webhook signature and timestamp.
4. Store accepted events durably before processing.
5. Route events by object and event type.
6. Ignore irrelevant events explicitly.
7. Build outbound jobs for retryable writes and import-related commands.
8. Use idempotency keys for every write that may retry.
9. Add reconciliation jobs for links, projections, stalled jobs, duplicate candidates, and failed webhooks.
10. Add replay tools that can safely reprocess inbound events and outbound jobs.

## Checklist

- [ ] Webhooks reject missing, stale, or invalid signatures.
- [ ] Accepted events are stored durably before processing.
- [ ] Event processing is idempotent.
- [ ] Outbound writes are queued when they should not block user-facing flows.
- [ ] Stripe, receipt, statement, and reconciliation flows do not depend on Twenty availability.
- [ ] Failed events and jobs are visible.
- [ ] Replay does not duplicate records.
- [ ] Sync can be paused per domain.
- [ ] Reconciliation detects orphan links, stale projections, stalled jobs, and duplicate candidates.
- [ ] Operators can distinguish ignored events from failed events.

## Exit Gate

Do not proceed until webhooks, outbound jobs, replay, and reconciliation work in non-production and can be paused without data loss.
