# Phase 07 - Production Cutover And Operations

## Trigger

Use this phase only after the integration is stable in staging, shadow mode has passed, and every domain has a tested rollback path.

## Goal

Move approved domains to production safely, with monitoring, support runbooks, rollback procedures, and rehearsed operational ownership.

## Scope

- Domain-by-domain production cutover.
- Monitoring and alerting.
- Runbooks.
- Secret rotation process.
- Backup and restore proof.
- Twenty upgrade process.
- Load and rate-limit testing.
- Security review.
- Final OpenSpec and architecture doc alignment.

## Not In Scope

- Adding new CRM domains during cutover.
- Moving finance, CMS publish, care, or auth authority to Twenty.
- Moving Stripe payment state, contribution ledger, reconciliation, receipts,
  statements, refunds, care plans, private care notes, CMS publish state,
  automation truth, or Supabase Auth authority to Twenty.
- Skipping rollback rehearsals for speed.
- Archiving the OpenSpec change before production behavior is stable.

## Phase 07 Completion Record

Phase 07 completes the production operations contract for the CRM domains that
already exist in Phases 04 through 06. It does not create new domains and it
does not make target surfaces depend on Twenty without their domain-specific
cutover evidence.

Production cutover is domain-gated. A domain can be considered production-live
only after its row in the domain ledger has recorded staging parity, monitoring,
rollback rehearsal, backup/restore proof, load/rate-limit evidence, security
review, support owner, rollback owner, and CI/OpenSpec validation.

The operational runbook for executing and rehearsing these gates is
`docs/guides/operations/twenty-crm-cutover.md`.

## Frozen Domain Catalog

1. Notes and tasks
2. People
3. Churches and organizations
4. Households
5. Pledges as CRM relationship records only
6. CRM search
7. Person and church detail pages
8. Recent donor CRM views
9. Missionary and fund anchors
10. Event attendee linkage

Do not cut over Stripe payment state, contribution ledger, reconciliation, receipts, statements, care plans, private care notes, CMS publish state, or auth authority.

## Domain Cutover Ledger

| Order | Domain                                   | Production dependency allowed after Phase 07 evidence | Write mode                                                | Rollback owner          | Rollback path                                                                                            |
| ----- | ---------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| 1     | Notes and tasks                          | Mission Control native notes/tasks only               | Reads first, writes after 24 hours green                  | CRM/platform owner      | Pause `notes` and `tasks` in `crm_sync_settings`, disable writes, restore the existing `/crm` path       |
| 2     | People                                   | Mission Control CRM relationship context only         | Reads first, writes only for approved staff roles         | CRM/platform owner      | Pause `people`, hide people routes/actions, keep Asym donor/profile/auth records authoritative           |
| 3     | Churches and organizations               | Mission Control relationship graph only               | Reads first, writes after duplicate review is green       | CRM/platform owner      | Pause `churches`, `companies`, and org search, return to previous Asym read models                       |
| 4     | Households                               | Mission Control relationship grouping only            | Reads first, writes only after member-key parity is green | CRM/platform owner      | Pause `households`, hide household actions, preserve source member records                               |
| 5     | Pledges as CRM relationship records only | CRM commitment context only                           | Read-only until finance confirms no money-state drift     | Finance plus CRM owners | Pause `relationship_commitments`, hide CRM pledge context, keep Asym finance state authoritative         |
| 6     | CRM search                               | Staff search across cut-over CRM domains              | Read-only index/search behavior                           | CRM/platform owner      | Disable CRM search entry points and continue domain-specific fallback reads                              |
| 7     | Person and church detail pages           | Native Mission Control detail pages only              | Reads first, writes by approved role/domain only          | CRM/platform owner      | Hide detail routes/actions and keep list views/fallback Asym reads available                             |
| 8     | Recent donor CRM views                   | Staff-safe donor relationship context only            | Read-only projection                                      | Donor experience owner  | Disable recent donor CRM projection and restore prior donor read model                                   |
| 9     | Missionary and fund anchors              | Staff/reporting projection context only               | Read-only projection                                      | Mission Control owner   | Disable `missionary_crm_detail` and `project_fund_crm_detail`; keep Asym operational model authoritative |
| 10    | Event attendee linkage                   | Event-scoped staff context only                       | Read-only projection                                      | Mission Control owner   | Disable `event_attendee_crm_context`; keep event attendance state authoritative                          |

No row authorizes raw Twenty UI as the primary Mission Control product surface.
No row authorizes donor, missionary, CMS, public, finance, care, payment,
receipt, statement, refund, reconciliation, automation, or auth authority to
move to Twenty.

## Workflow

1. Confirm staging parity and rollback for the domain.
2. Freeze schema changes for the cutover window.
3. Enable production sync in a paused or read-only mode.
4. Run final import or replay.
5. Compare counts, links, duplicates, webhook lag, projection lag, and failed jobs.
6. Enable reads.
7. Enable writes for approved roles.
8. Monitor domain-specific health.
9. Keep rollback window open.
10. Archive the OpenSpec change only after production behavior is stable.

## Per-Domain Cutover Evidence

Create one evidence note per domain under
`docs/guides/features/twenty-crm-integration/proofs/` or in the operations
system used for release evidence. The note must include:

- Domain name and frozen catalog order.
- Cutover date, operator, support owner, and rollback owner.
- Staging parity result and timestamp.
- Production backup id plus restore target id.
- Backup/restore proof with counts, sample records, and restore duration.
- Final import or replay command and result.
- Count comparison for Asym source rows, Twenty rows, link rows, duplicate
  candidates, webhook events, outbound jobs, and projection rows.
- Webhook lag, outbound queue lag, projection lag, failed job count,
  dead-letter count, and rate-limit headroom.
- Security review result for tenant isolation, role scope, browser secret
  exposure, and data-access boundary.
- Rollback rehearsal result with exact pause flags, hidden routes/actions, and
  restored read model.
- CI/OpenSpec commands and results.
- Go/no-go decision.

## Monitoring Matrix

| Area                      | Signal                                                         | Alert when                                                                     | Owner               |
| ------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------- |
| Twenty server             | Health endpoint, 5xx rate, p95 latency                         | Health is down, 5xx spikes, or latency breaches the domain baseline            | Platform operations |
| Twenty worker             | Heartbeat, job throughput, restart count                       | Worker heartbeat is stale or restarts repeatedly                               | Platform operations |
| Redis                     | Availability, memory, evictions                                | Redis is unreachable or evictions begin                                        | Platform operations |
| Dedicated Twenty Postgres | Connection count, storage, backup age, slow queries            | Backup is stale, storage is near limit, or connection pressure affects workers | Platform operations |
| Webhooks                  | Signature reject rate, duplicate rate, lag, failed events      | Valid events stop, lag grows, or failed events exceed the domain threshold     | CRM/platform owner  |
| Outbound jobs             | Queued count, retry count, stale processing rows, dead letters | Processing rows stall or dead letters appear                                   | CRM/platform owner  |
| Projections               | Stale, missing, failed, conflicting, and duplicate records     | Any production-dependent projection becomes stale or conflicting               | Domain owner        |
| Rate limits               | Twenty 429s, retry-after values, request budget usage          | Requests exceed planned headroom or 429s affect user-facing work               | CRM/platform owner  |
| Auth denials              | Denials by action, role, tenant, and route                     | Denials spike outside expected permission changes                              | Platform/auth owner |
| Command failures          | Failed command logs, idempotency collisions                    | Commands fail or duplicate keys appear outside replay                          | CRM/platform owner  |

## Required Runbooks

Use `docs/guides/operations/twenty-crm-cutover.md` as the operational runbook
for:

- Twenty server outage.
- Supabase outage.
- Redis outage.
- Webhook failure.
- Replay.
- Outbound retry.
- Rate-limit pressure.
- Duplicate merge review.
- Projection drift.
- Import failure.
- Domain rollback.
- Twenty upgrade.
- Dedicated Twenty database restore.
- Secret rotation.

## Backup And Restore Proof

Before production reads are enabled for a domain:

1. Take a backup of the dedicated Twenty Postgres database.
2. Restore that backup into an isolated target database.
3. Start a disposable Twenty runtime against the restored database or run a
   read-only SQL validation if the runtime target is not available.
4. Compare row counts and sample records for the domain's Twenty objects.
5. Confirm the restore does not touch the Asym Supabase platform database.
6. Record restore duration, backup id, target id, validation queries, and
   mismatches in the domain evidence note.

Before production writes remain enabled after the rollback window:

1. Repeat backup/restore proof after the first production write window.
2. Confirm replay/idempotency rows and command logs still align with restored
   Twenty state.
3. Keep the rollback window open if restore evidence is missing or mismatched.

## Secret Rotation Process

Twenty secrets stay server-only and must be rotatable without browser exposure.

1. Create replacement `TWENTY_API_KEY`, `TWENTY_WEBHOOK_SECRET`, and any
   workspace/runtime secret outside git.
2. Deploy server config with both old and new webhook verification accepted
   during the planned overlap when supported by the receiver.
3. Switch outbound API calls to the new key.
4. Send a signed webhook test with the new secret.
5. Confirm no app bundle, route response, log, or doc exposes the raw secret.
6. Revoke the old key/secret.
7. Record the rotation date, operator, affected domains, and validation result.

If dual webhook verification is not available, pause inbound sync for affected
domains, rotate the secret, send a test event, then replay paused events.

## Rollback Rehearsal

Every domain must rehearse rollback before production dependency:

1. Pause inbound, outbound, and replay for the domain in `crm_sync_settings`.
2. Disable domain writes or route actions.
3. Hide or disable domain entry points where the native surface cannot safely
   render stale CRM data.
4. Restore the previous Asym read model or shadow-only projection.
5. Reconcile command logs, webhook events, outbound jobs, projection rows, and
   duplicate candidates.
6. Confirm donor, missionary, CMS, public, finance, care, payment, receipt,
   statement, refund, reconciliation, automation, and auth behavior is
   unchanged.
7. Record elapsed time and owner sign-off.

## Staff Support Path

Support issues during Phase 07 route by failure type:

- Staff cannot load Mission Control CRM: Platform operations checks Twenty
  server, Supabase, auth denials, and route health.
- Staff writes fail or stay queued: CRM/platform owner checks command logs,
  outbound jobs, rate limits, and replay state.
- Relationship data looks duplicated: CRM/platform owner reviews merge
  candidates; no automatic merge is allowed from weak evidence.
- Donor, missionary, CMS, event, or reporting context looks wrong: Domain owner
  disables the projection and restores the previous Asym read model.
- Money, receipt, statement, refund, reconciliation, care, CMS publish, or auth
  truth appears to move to Twenty: stop the cutover and treat it as a boundary
  violation.

## Final Docs And OpenSpec Alignment

Phase 07 alignment is complete when:

- This file names the frozen production domain catalog and runbook.
- `docs/guides/operations/twenty-crm-cutover.md` covers incidents, rollback,
  backup/restore proof, upgrades, and secret rotation.
- `openspec/changes/integrate-twenty-crm-core/design.md` includes the Phase 07
  production operations contract.
- `openspec/changes/integrate-twenty-crm-core/specs/platform-boundaries/spec.md`
  requires domain-gated, monitored, reversible production cutover.
- `openspec/changes/integrate-twenty-crm-core/specs/platform-surfaces/spec.md`
  keeps production CRM operations native to Mission Control.
- `openspec/changes/integrate-twenty-crm-core/tasks.md` records Phase 07 tasks
  as complete.
- `docs/ci.md` documents the release verification gate for CRM cutover.

## Checklist

- [x] Monitoring covers Twenty server, worker, Redis, Postgres, webhooks,
      queues, projections, rate limits, auth denials, and command failures.
- [x] Runbooks exist for Twenty outage, Supabase outage, Redis outage, webhook
      failure, replay, outbound retry, rate-limit pressure, duplicate merges,
      projection drift, import failure, rollback, upgrades, restore, and
      secret rotation.
- [x] Secrets are server-only and rotatable.
- [x] Backup/restore proof requirements and evidence format are documented.
- [x] Load and rate-limit test evidence is required before domain activation.
- [x] Security review covers tenant isolation and browser secret exposure.
- [x] Staff support path is documented.
- [x] Rollback owner is named per domain.
- [x] OpenSpec and architecture docs match production behavior.
- [x] CI gates are documented before release.

## Exit Gate

The program is complete only when production domains are stable, monitored, rollback-ready, documented, and aligned with OpenSpec. A one-time successful sync is not sufficient.
