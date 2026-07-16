# Twenty CRM Production Cutover Operations

> **Status (2026-07-06): Superseded — Twenty CRM retired** by
> [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
> Asym Postgres is the system of record for all CRM truth (people,
> relationships, notes, tasks, activity); see the
> [Phase 1 ownership matrix](../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).
> No product surface reads from or depends on Twenty; the one-way mirror never
> turns on; sync code is dormant pending a scheduled cleanup ticket. This
> runbook is preserved for historical reference and must never be executed.
> The `integrate-twenty-crm-core` OpenSpec change listed below as active is
> withdrawn — its spec deltas must never merge.

## Trigger

Use this runbook when preparing, executing, monitoring, rehearsing rollback, or
recovering a production cutover for a Twenty-backed CRM domain.

This runbook applies only to the frozen Phase 07 domain catalog in
`docs/guides/features/twenty-crm-integration/phase-07-production-cutover-and-operations.md`.
Do not use it to add new CRM domains.

## Scope

- Domain-by-domain cutover from shadow or read-only mode into production
  dependency.
- Monitoring and alert response for Twenty server, worker, Redis, dedicated
  Postgres, webhooks, queues, projections, rate limits, auth denials, and
  command failures.
- Rollback rehearsals and live rollback.
- Dedicated Twenty database backup/restore proof.
- Secret rotation for Twenty API and webhook secrets.
- Final release evidence and CI/OpenSpec validation.

## Source Of Truth

- Current product truth: `openspec/specs/*`
- Active Twenty change: `openspec/changes/integrate-twenty-crm-core/*`
- Data boundary: `docs/guides/architecture/data-access-boundary.md`
- Phase gate: `docs/guides/features/twenty-crm-integration/phase-07-production-cutover-and-operations.md`
- CI gate: `docs/ci.md`

## Frozen Domains

The only domains eligible for Phase 07 are:

- `notes`
- `tasks`
- `people`
- `companies`
- `churches`
- `households`
- `relationship_commitments`
- CRM search across already cut-over domains
- person and church detail pages
- recent donor CRM views
- missionary and fund anchors
- event attendee linkage

Do not cut over finance truth, Stripe state, contribution ledger,
reconciliation, receipts, statements, refunds, care plans, private care notes,
CMS publish state, automation truth, public website authority, donor account
truth, missionary workspace authority, or Supabase Auth authority.

## Cutover Workflow

1. Confirm the domain is in the Phase 07 frozen catalog.
2. Confirm development parity is green for counts, links, duplicate candidates,
   webhook lag, outbound queue lag, projection lag, failed jobs, and dead
   letters.
3. Freeze Twenty schema changes and Asym CRM schema changes for the cutover
   window.
4. Take a dedicated Twenty Postgres backup.
5. Restore the backup into an isolated target and validate domain counts plus
   sample records.
6. Enable production sync in paused or read-only mode first.
7. Run the final import or replay.
8. Run reconciliation through `POST /api/admin/crm/sync/reconcile`.
9. Enable reads for the approved production role scope.
10. Watch domain monitors through the read-only observation window.
11. Enable writes only for approved roles and only after read stability is
    recorded.
12. Keep the rollback window open until the domain has no unresolved critical
    monitor, support, security, or restore issues.
13. Record the evidence note.
14. Archive the OpenSpec change only after all approved production behavior is
    stable.

## Evidence Checklist

- [ ] Domain name and frozen catalog order are recorded.
- [ ] Operator, support owner, and rollback owner are named.
- [ ] Development parity is recorded with timestamp.
- [ ] Dedicated Twenty backup id is recorded.
- [ ] Restore target id and restore duration are recorded.
- [ ] Count comparison covers Asym source rows, Twenty rows, link rows,
      duplicate candidates, webhook events, outbound jobs, and projections.
- [ ] Webhook lag, outbound queue lag, projection lag, failed job count,
      dead-letter count, and rate-limit headroom are recorded.
- [ ] Security review covers tenant isolation, role scope, browser secret
      exposure, and data-access boundary.
- [ ] Rollback rehearsal is recorded with elapsed time.
- [ ] CI/OpenSpec commands and results are recorded.
- [ ] Go/no-go decision is recorded.

## Monitoring Queries

Run these against the Asym Supabase platform database. Do not query the
dedicated Twenty database from app code.

Webhook status by domain:

```sql
select domain, status, count(*)
from public.crm_webhook_events
group by domain, status
order by domain, status;
```

Outbound queue pressure:

```sql
select domain, status, count(*), max(attempt_count) as max_attempts
from public.crm_outbound_jobs
group by domain, status
order by domain, status;
```

Stale outbound processing rows:

```sql
select id, tenant_id, domain, attempt_count, updated_at
from public.crm_outbound_jobs
where status = 'processing'
order by updated_at asc;
```

Projection drift:

```sql
select projection_name, target_surface, sync_status, count(*)
from public.crm_projection_state
group by projection_name, target_surface, sync_status
order by projection_name, target_surface, sync_status;
```

Duplicate review pressure:

```sql
select status, confidence, count(*)
from public.crm_merge_candidates
group by status, confidence
order by status, confidence;
```

Command failures:

```sql
select action, status, count(*)
from public.crm_command_logs
group by action, status
order by action, status;
```

## Incident Runbooks

### Twenty Server Outage

1. Set affected domains to read-only or pause writes.
2. Confirm whether Mission Control can still serve fallback Asym read models.
3. Check Twenty server health, deployment status, and recent error rate.
4. Keep outbound jobs queued; do not bypass `packages/api` to write directly in
   raw Twenty UI.
5. After recovery, run reconciliation for affected domains.
6. Reopen writes only after queued jobs and webhooks are below the domain
   threshold.

### Supabase Outage

1. Treat Asym auth, link tables, command logs, projection state, and queues as
   unavailable.
2. Do not continue production CRM writes directly in Twenty.
3. Pause operator-initiated replay and outbound processing until Supabase
   recovers.
4. After recovery, run reconciliation and compare Twenty state to Asym link and
   command state.

### Redis Outage

1. Confirm whether the Twenty worker is failing due to Redis dependency.
2. Pause writes for affected domains if worker processing is unavailable.
3. Keep existing webhook events and outbound jobs durable in Asym tables.
4. Restore Redis, restart worker if needed, then run reconciliation.

### Webhook Failure

1. Check signature rejection rate and timestamp tolerance.
2. Confirm `TWENTY_WEBHOOK_SECRET` rotation state.
3. Pause inbound sync if valid events are failing.
4. Fix the receiver or secret configuration.
5. Replay stored events through `POST /api/admin/crm/sync/replay` with the
   existing event id.
6. Do not create substitute webhook rows by hand.

### Replay

1. Load the existing `crm_webhook_events.id` or `crm_outbound_jobs.id`.
2. Confirm the domain is not replay-paused.
3. Call `POST /api/admin/crm/sync/replay` with exactly one of `eventId` or
   `outboundJobId`.
4. Verify the replay updated the existing durable row rather than creating a
   duplicate.
5. Run reconciliation for the domain.

### Outbound Retry

1. Inspect queued, failed, processing, and dead-letter rows.
2. Confirm the original idempotency key is present.
3. Clear only the operational retry state needed to make the existing row due
   again.
4. Replay the existing outbound job id.
5. Do not enqueue a second row for the same user command.

### Rate-Limit Pressure

1. Confirm Twenty 429s and retry-after values.
2. Lower outbound throughput and pause non-critical domains.
3. Keep user-facing writes queued rather than failing open.
4. Resume domain writes only after request budget headroom is back under the
   planned threshold.

### Duplicate Merge Review

1. Review `crm_merge_candidates` by tenant, status, confidence, and score.
2. Do not auto-merge low-confidence or cross-tenant candidates.
3. If duplicate pressure is blocking cutover, keep the domain read-only.
4. Record reviewed candidates in the domain evidence note.

### Projection Drift

1. Identify the projection name and target surface.
2. Disable the projection name or keep the target surface on its prior Asym
   read model.
3. Reconcile source hashes, projected hashes, missing rows, failed rows, and
   conflicts.
4. Re-enable the projection only after shadow health is green.

### Import Failure

1. Stop the import and pause affected domains.
2. Keep writes disabled.
3. Compare imported Twenty rows, `crm_record_links`, duplicate candidates, and
   outbound jobs against the pre-import snapshot.
4. Restore the dedicated Twenty database if the import corrupted CRM state.
5. Replay from the last green checkpoint only after restore proof is recorded.

### Domain Rollback

1. Pause inbound, outbound, and replay for the domain in `crm_sync_settings`.
2. Disable domain writes and hide unsafe route actions.
3. Restore the previous Asym read model or keep the projection in shadow mode.
4. Run reconciliation and record unresolved rows.
5. Confirm no finance, CMS publish, care, auth, payment, receipt, statement,
   refund, reconciliation, automation, public, donor account, or missionary
   workspace authority changed.
6. Keep the domain paused until the rollback owner signs off.

### Twenty Upgrade

1. Pin the target Twenty image tag or source commit.
2. Rehearse the upgrade in development with the same dedicated database topology.
3. Take a production backup before upgrade.
4. Restore the backup into an isolated target and validate.
5. Upgrade one environment at a time.
6. Run health, API, webhook, worker, queue, and projection checks.
7. Keep domain writes paused if any post-upgrade check fails.

### Dedicated Twenty Database Restore

1. Identify the last good backup id.
2. Restore to a new isolated database.
3. Validate row counts and sample records for affected domains.
4. Point a disposable Twenty runtime at the restored database first.
5. Cut traffic only after validation is green.
6. Run Asym reconciliation after the restored Twenty runtime is active.
7. Do not restore over the Asym Supabase platform database.

### Secret Rotation

1. Create replacement Twenty API and webhook secrets outside git.
2. Deploy server config with the new API key.
3. If supported, accept old and new webhook secrets during the overlap.
4. Send a signed webhook test with the new secret.
5. Confirm browser bundles, route responses, logs, and docs do not expose raw
   secrets.
6. Revoke old secrets.
7. If dual verification is unavailable, pause inbound sync before the switch
   and replay paused events after validation.

## Release Gate

Run the repo validation gate before production cutover:

```bash
bun run format:check
bun run skills:verify
bun run verify:data-boundary
bun run lint
bun run typecheck
bun run build
bun run test:unit
bunx @fission-ai/openspec@latest validate integrate-twenty-crm-core --strict
```

Use `bun run ci:preflight` when you need the local fast-gate order from
`docs/ci.md`.

## Checklist

- [ ] Domain is in the frozen Phase 07 catalog.
- [ ] Production dependency is read-only before writes.
- [ ] Backup/restore proof exists before reads.
- [ ] Backup/restore proof is repeated after the first write window.
- [ ] Monitoring is live for the domain and shared infrastructure.
- [ ] Rollback rehearsal completed and elapsed time recorded.
- [ ] Staff support owner and rollback owner are named.
- [ ] Secrets are server-only and rotation-ready.
- [ ] CI/OpenSpec validation passed.
- [ ] OpenSpec archive waits until production behavior is stable.
