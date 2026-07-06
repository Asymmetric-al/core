# Phase 03 - Sync, Eventing, And Replay

> **Status (2026-07-06): Superseded — Twenty CRM retired** by
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
> Asym Postgres is the system of record for all CRM truth (people,
> relationships, notes, tasks, activity); see the
> [Phase 1 ownership matrix](../../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).
> No product surface reads from or depends on Twenty; the one-way mirror never
> turns on; sync code is dormant pending a scheduled cleanup ticket. This
> document is preserved for historical reference — do not execute its phases
> or runbooks. The live bidirectional sync this phase targets never enables.

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

- [x] Webhooks reject missing, stale, or invalid signatures.
- [x] Accepted events are stored durably before processing.
- [x] Event processing is idempotent.
- [x] Outbound writes are queued when they should not block user-facing flows.
- [x] Stripe, receipt, statement, and reconciliation flows do not depend on
      Twenty availability.
- [x] Failed events and jobs are visible.
- [x] Replay does not duplicate records.
- [x] Sync can be paused per domain.
- [x] Reconciliation detects orphan links, stale projections, stalled jobs, and
      duplicate candidates.
- [x] Operators can distinguish ignored events from failed events.

## Phase 03 Artifact Status

Phase 03 is complete as a non-production sync/eventing foundation:

- Signed Twenty webhook ingress is exposed by the thin admin route
  `apps/admin/app/api/admin/crm/webhooks/twenty/route.ts`, which delegates to
  `@asym/api/admin/crm/webhooks/twenty`.
- Signature verification, timestamp tolerance, raw-body parsing, and payload
  normalization live under `packages/api/src/crm/webhooks/*`.
- Durable event, outbound job, sync pause, reconciliation, and sync log tables
  are created by `supabase/migrations/20260508001923_crm_sync_eventing_replay.sql`.
- Outbound job idempotency and retry/dead-letter handling live in
  `packages/api/src/crm/sync/outbound.ts`.
- Replay helpers for inbound events and outbound jobs live in
  `packages/api/src/crm/sync/replay.ts`.
- Reconciliation detection for orphan links, stale projections, stalled jobs,
  duplicate candidates, and failed webhooks lives in
  `packages/api/src/crm/reconciliation/run.ts`.
- Staff-only non-production replay and reconciliation endpoints are thin admin
  route exports under `apps/admin/app/api/admin/crm/sync/*`.
- Unit coverage lives in
  `tests/unit/packages/api/crm-{webhook-signature,webhook-ingress,outbound-sync,replay-reconciliation}.test.ts`.

Sync flags default off through server-only environment variables:

- `CRM_SYNC_INBOUND_ENABLED`
- `CRM_SYNC_OUTBOUND_ENABLED`
- `CRM_SYNC_REPLAY_ENABLED`
- `CRM_SYNC_RECONCILIATION_ENABLED`
- `CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS`

Per-tenant, per-domain pause controls live in `crm_sync_settings`. This phase
does not run production imports, move money/CMS/care truth to Twenty, add
user-facing CRM cutover behavior, or proceed to Phase 04.

## Exit Gate

Do not proceed until webhooks, outbound jobs, replay, and reconciliation work in non-production and can be paused without data loss.
