# Phase 04 - First Domain And Mission Control

> **Status (2026-07-06): Superseded — Twenty CRM retired** by
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
> Asym Postgres is the system of record for all CRM truth (people,
> relationships, notes, tasks, activity); see the
> [Phase 1 ownership matrix](../../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).
> No product surface reads from or depends on Twenty; the one-way mirror never
> turns on; sync code is dormant pending a scheduled cleanup ticket. This
> document is preserved for historical reference — do not execute its phases
> or runbooks. The Twenty-backed notes read path it describes is exactly what
> the ruling forbids product surfaces from depending on.

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

- [x] Native Mission Control route exists for the first domain.
- [x] Staff auth and tenant scope are enforced server-side.
- [x] Query keys include filters, sort, pagination, and search.
- [x] Tables use stable row IDs.
- [x] Large lists use virtualization where needed.
- [x] Writes create command log entries.
- [x] Webhook side effects are replayable.
- [x] Permission-denied states are clear.
- [x] No donor or missionary staff controls leak into narrow surfaces.
- [x] Existing Asym paths can be restored if the domain rolls back.

## Phase 04 Artifact Status

The first native Mission Control CRM domain is Notes.

### Native Surface

- Route: `apps/admin/app/(app)/crm/notes/page.tsx`
- Client: `apps/admin/app/(app)/crm/notes/page-client.tsx`
- Columns: `apps/admin/app/(app)/crm/notes/columns.tsx`
- Entry point: `apps/admin/app/(app)/crm/page-client.tsx` links the CRM dashboard to
  `/crm/notes`

The surface keeps the existing Mission Control shell and shared table patterns.
It does not expose raw Twenty UI, donor controls, missionary controls, care
controls, finance controls, CMS controls, or public-surface CRM controls.

### Server Boundary

- Thin route handler: `apps/admin/app/api/admin/crm/notes/route.ts`
- Package API: `packages/api/src/admin/crm/notes/index.ts`
- Service boundary: `packages/api/src/admin/crm/notes/service.ts`
- Query parsing: `packages/api/src/admin/crm/notes/query.ts`
- Read model normalization: `packages/api/src/admin/crm/notes/model.ts`

The app route only re-exports `GET` and `POST` from `@asym/api`. Twenty access
stays server-side behind `packages/api`, and browser code uses only the
Mission Control route handler.

### Read Path

`GET /api/admin/crm/notes` requires staff/admin/super-admin access and
`crm.note.read`. It reads Twenty notes only when the server-only Twenty env
contract is configured. In non-configured environments it returns an empty,
queue-only response with missing configuration metadata instead of exposing
credentials or failing the page.

The service sends a tenant filter to Twenty and applies a second server-side
tenant filter after normalizing the response. Search, sort, cursor, and limit
state are included in the TanStack Query key in
`packages/database/hooks/admin-crm-notes.ts`.

### Write, Audit, Replay

`POST /api/admin/crm/notes` requires staff/admin/super-admin access and
`crm.note.create`. It validates the body, writes a `crm.note.create` command
log entry, queues a `notes` outbound job with a deterministic idempotency key,
and appends a CRM sync log entry.

Replay uses the existing Phase 03 outbound replay path:
`/api/admin/crm/sync/replay` with the returned outbound job id. Webhook side
effects remain replayable through the durable webhook event path added in
Phase 03.

### Rollback

The existing `/crm` Mission Control path remains intact. To roll back the
Notes cutover, pause the `notes` domain in `crm_sync_settings` for outbound and
replay, remove or hide the `/crm/notes` entry point, and continue operating on
the previous CRM surface. No donor, missionary, finance, CMS, care, public, or
payment authority is moved by this phase.

### Tests

- `tests/unit/packages/api/admin/crm-notes-query.test.ts`
- `tests/unit/packages/api/crm-notes.test.ts`
- `tests/unit/packages/api/crm-boundary.test.ts`

## Exit Gate

Do not proceed until one domain is usable in Mission Control, covered by tests, audited, replayable, and rollback-ready.
