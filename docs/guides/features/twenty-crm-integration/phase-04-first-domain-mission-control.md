# Phase 04 - First Domain And Mission Control

## Trigger

Use this phase when the gateway, identity model, and sync foundation are ready and the team wants the first user-facing Twenty-backed CRM capability.

## Goal

Cut over one safe CRM domain into native Mission Control while preserving Asym's UI, auth, tenant scope, and data-access boundary.

## Recommended First Domains

Use this order unless product leadership chooses differently:

1. Notes
2. Tasks
3. People read
4. People write

These domains exercise the integration without moving payment truth, receipts, statements, CMS publish state, or care plans.

## Scope

- Native Mission Control CRM routes for the first domain.
- TanStack Query, Table, DB, and Virtual patterns where useful.
- Server-side search, filters, sorting, pagination, and stable row IDs.
- Append note and create task flows after read-only parity is stable.
- Staff-only permission states.
- Audit and replay coverage for the first write path.

## Not In Scope

- Raw Twenty UI as the primary staff CRM.
- Donor or missionary surface changes.
- Pledge authority transfer.
- Bulk cutover of all people/church/org records.
- Finance, care, CMS, or automation ownership changes.

## Workflow

1. Start with read-only list/detail screens for the first domain.
2. Compare Twenty-backed records with current Asym records in non-production.
3. Add create/update commands only after read parity and audit logging work.
4. Use native Mission Control UI and shared table primitives.
5. Keep app routes thin and call `@asym/api`.
6. Add permission-denied and empty states.
7. Add UI tests for list, search, filters, detail, and first write action.
8. Run shadow comparison before enabling staff write access.

## Checklist

- [ ] Native Mission Control route exists for the first domain.
- [ ] Staff auth and tenant scope are enforced server-side.
- [ ] Query keys include filters, sort, pagination, and search.
- [ ] Tables use stable row IDs.
- [ ] Large lists use virtualization where needed.
- [ ] Writes create command log entries.
- [ ] Webhook side effects are replayable.
- [ ] Permission-denied states are clear.
- [ ] No donor or missionary staff controls leak into narrow surfaces.
- [ ] Existing Asym paths can be restored if the domain rolls back.

## Exit Gate

Do not proceed until one domain is usable in Mission Control, covered by tests, audited, replayable, and rollback-ready.
