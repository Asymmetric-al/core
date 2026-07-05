# 12: Bulk Support Hub move and Retry failed recovery

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## GitHub issue

#297

## What to build

Add bulk Support Hub message move behavior with per-item safeguards, partial
success, item-level audit, and a Retry failed action that retries only failed
items through the product server path.

## Acceptance criteria

- [ ] Bulk move applies the same tenant, authorization, reason, audit,
      assignment, label, priority, status, snooze, and marker safeguards as a
      single message move.
- [ ] Staff enter one shared required reason for the batch.
- [ ] The shared reason is copied into every moved item's audit entry.
- [ ] Every item-level audit entry clearly records that it came from a batch
      move and includes a stable batch operation identifier.
- [ ] Bulk move may partially succeed: successful items stay moved and failed
      items stay unchanged in their original inbox.
- [ ] Staff-visible failure reasons are safe and do not expose secrets,
      provider internals, workflow internals, stack traces, or cross-tenant
      details.
- [ ] Retry failed is shown when retryable failed items remain and retries only
      failed items.
- [ ] Retry failed reuses the original bulk move reason and records retry audit
      linked to the original batch operation.
- [ ] Repeat Retry failed clicks reuse the active retry attempt or return
      current retry status.
- [ ] Tests cover per-item idempotency, partial success, retry-only-failed,
      duplicate retry click, audit linkage, and failure text safety.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/11-support-message-move.md
