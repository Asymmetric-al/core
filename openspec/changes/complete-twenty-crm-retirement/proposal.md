# Change: Complete Twenty CRM Retirement

## Why

ADR-0001 and issue #602 retire Twenty CRM as a product dependency. Asym
Postgres owns application and CRM truth. The native notes/relationships
replacement and vendor runtime removal merged into develop through PR #1325
on 2026-08-19. The durable `crm-core` specification now reflects that accepted
direction in the AL-1861 reconciliation.

Before the August replacement, live notes/relationships still called Twenty
and the durable spec described the retired architecture. That is historical
context, not the current implementation or a remaining vendor cutover plan.

## Accepted Changes

- Asym Postgres owns persons, donors, missionaries, households, organizations,
  churches, relationships, notes, tasks, activity, duplicate and merge state.
- Mission Control is the native staff CRM experience; `packages/api` owns the
  business boundary, tenant-safe local reads and authoritative local writes.
- Live Twenty clients, routes, webhooks, sync, projections, health checks and
  environment fields were removed; the non-regression guard rejects restoration.
- `crm-core` remains an active capability. Provider identifiers retained for
  compatibility are references, never vendor authority or permission to sync.
- ADR-0001, archived OpenSpec and dated evidence retain historical provenance.

## Remaining Work

The external Vercel variable and Twenty Cloud key/workspace cleanup is not
proved complete. Verify exact environments with authorized tooling and record
the result in `tasks.md`; do not expose secrets or infer cleanup from code
deletion. This change stays active for that explicit closeout work.

## Capabilities And Impact

`crm-core` governs native Asym CRM truth, local notes/relationships, Twenty
prohibition and provider links as references. The accepted implementation
affected CRM services, environment schema, forward migrations and verification.
AL-1861 corrects documentation; it does not claim a new deployment or data change.

## Non-goals

- Retiring the CRM capability or introducing a generic provider-sync platform.
- Restoring Twenty through a fallback, rollback or new credential.
- Rewriting historical archives to pretend Twenty was never considered.
- Dropping reusable Asym-owned command, merge, link or native-grid contracts.
- Changing Eve authority or implementing an unrelated CRM/Party migration.
