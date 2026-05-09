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
- Skipping rollback rehearsals for speed.

## Recommended Cutover Order

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

## Checklist

- [ ] Monitoring covers Twenty server, worker, Redis, Postgres, webhooks, queues, projections, rate limits, auth denials, and command failures.
- [ ] Runbooks exist for Twenty outage, Supabase outage, Redis outage, webhook failure, replay, outbound retry, rate-limit pressure, duplicate merges, projection drift, import failure, rollback, upgrades, restore, and secret rotation.
- [ ] Secrets are server-only and rotatable.
- [ ] Backups and restore are tested.
- [ ] Load test respects Twenty rate limits.
- [ ] Security review covers tenant isolation and browser secret exposure.
- [ ] Staff support path is documented.
- [ ] Rollback owner is named per domain.
- [ ] OpenSpec and architecture docs match production behavior.
- [ ] CI gates pass before release.

## Exit Gate

The program is complete only when production domains are stable, monitored, rollback-ready, documented, and aligned with OpenSpec. A one-time successful sync is not sufficient.
