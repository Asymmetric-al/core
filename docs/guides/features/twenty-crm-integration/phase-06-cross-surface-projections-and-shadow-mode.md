# Phase 06 - Cross-Surface Projections And Shadow Mode

> **Status (2026-07-06): Superseded — Twenty CRM retired** by
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
> Asym Postgres is the system of record for all CRM truth (people,
> relationships, notes, tasks, activity); see the
> [Phase 1 ownership matrix](../../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).
> No product surface reads from or depends on Twenty; the one-way mirror never
> turns on; sync code is dormant pending a scheduled cleanup ticket. This
> document is preserved for historical reference — do not execute its phases
> or runbooks.

## Trigger

Use this phase after Mission Control CRM domains are stable and the team needs CRM context to appear across donor, missionary, CMS, events, and reporting surfaces.

## Goal

Expose role-appropriate CRM context across Asym surfaces without changing the conceptual home of those surfaces or moving source-of-truth ownership to the wrong system.

## Scope

- Donor CRM detail projection.
- Missionary CRM detail projection.
- Project or fund CRM detail projection.
- CMS linkage status for missionary and project pages.
- Event attendee CRM context.
- Shadow-mode comparison dashboards.
- Drift metrics and staff review queues.

## Not In Scope

- Donor or missionary staff-level CRM controls.
- Public website operational controls.
- CMS public content authority moving to Twenty.
- Finance truth moving to Twenty.
- Care truth moving to Twenty.

## Workflow

1. Define projection contracts in `packages/api`.
2. Build mixed read models that combine Twenty CRM data with Asym-owned finance, care, CMS, and public state.
3. Keep each projection explicit about source ownership.
4. Add read-only panels first.
5. Run shadow mode and compare records before enabling user-visible dependency.
6. Add drift dashboards for staff.
7. Add role-scoped UI states for donor and missionary surfaces.
8. Add tests that prove staff-only CRM controls do not leak to narrow surfaces.

## Checklist

- [x] Donor projections do not expose staff CRM depth.
- [x] Missionary projections do not expose organization-wide CRM controls.
- [x] CMS linkage shows status without moving public content truth.
- [x] Event attendee context respects tenant and event scope.
- [x] Projection state is stored and replayable.
- [x] Drift dashboards show stale, missing, failed, and conflicting records.
- [x] Shadow mode reports record-count parity and duplicate counts.
- [x] Tests cover role boundaries across admin, donor, missionary, and public surfaces.
- [x] Staff can tell which system owns each field.
- [x] Rollback restores prior read models per projection.

## Phase 06 Artifact Status

Phase 06 adds cross-surface CRM projection contracts and a native Mission
Control shadow-mode dashboard. It does not make donor, missionary, CMS, event,
or reporting surfaces depend on Twenty at runtime.

### Projection Contracts

Projection contracts live in
`packages/api/src/crm/projections/contracts.ts`.

| Context      | Projection name                  | Target surface | Role scope            | Source-of-truth guardrail                                                                              |
| ------------ | -------------------------------- | -------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| Donor        | `donor_crm_detail`               | `donor`        | `donor_self`          | Donor identity, giving, receipts, statements, and payments stay Asym-owned.                            |
| Missionary   | `missionary_crm_detail`          | `missionary`   | `missionary_assigned` | Missionary workspace gets only assigned supporter context, not tenant-wide staff controls.             |
| CMS          | `cms_linkage_status`             | `cms`          | `cms_editor`          | CMS publish state, moderation, page content, and release rules stay Asym-owned.                        |
| Event        | `event_attendee_crm_context`     | `event`        | `event_staff`         | Event registration, attendee scope, tenant scope, and event permissions stay Asym-owned.               |
| Project/fund | `project_fund_crm_detail`        | `reporting`    | `reporting_staff`     | Fund/project designations, finance truth, CMS publish state, and public release rules stay Asym-owned. |
| Reporting    | `relationship_reporting_context` | `reporting`    | `reporting_staff`     | Finance, donation ledger, receipts, refunds, statements, and reconciliation stay Asym-owned.           |

Every contract explicitly names allowed roles, visible fields, blocked fields,
source ownership, shadow-mode status, and rollback behavior. Donor and
missionary projections are contracts only in Phase 06; staff-only CRM depth is
not exposed in those apps.

### Stored Shadow State

Projection state uses the Phase 02 `crm_projection_state` table. Phase 06 adds
`event` and `reporting` target-surface enum values in
`supabase/migrations/20260508092918_crm_projection_shadow_surfaces.sql`.

The projection state store lives in
`packages/api/src/crm/projections/store.ts`. It can upsert shadow projection
state and mark a projection stale for replay without changing the user-visible
read model. Shadow state stores source hashes, projected hashes, Twenty record
links, sync status, metadata, and replay request metadata.

### Mission Control Shadow Dashboard

Native Mission Control route:

- Page: `apps/admin/app/(app)/crm/projections/page.tsx`
- Client: `apps/admin/app/(app)/crm/projections/page-client.tsx`
- Columns: `apps/admin/app/(app)/crm/projections/columns.tsx`
- Entry point: `apps/admin/app/(app)/crm/page-client.tsx` links to
  `/crm/projections`

API boundary:

- Thin route: `apps/admin/app/api/admin/crm/projections/route.ts`
- Package route handler: `packages/api/src/admin/crm/projections/index.ts`
- Service: `packages/api/src/admin/crm/projections/service.ts`
- Query parser: `packages/api/src/admin/crm/projections/query.ts`

The route requires staff/admin/super-admin CRM access and
`crm.projection.read`. The app route only re-exports from `@asym/api`; all
projection state reads stay behind `packages/api`.

The dashboard reports:

- record-count parity
- duplicate candidate counts
- missing CRM records
- missing Asym records
- stale projection records
- failed projection records
- conflicting source/projected hashes
- source-of-truth ownership for each projection

### Rollback

Rollback is projection-name based. Hide `/crm/projections`, disable the
relevant `projection_name` rows in `crm_projection_state`, and each target
surface keeps its previous Asym read model:

- donor portal: existing donor history and giving read models
- missionary workspace: existing supporter and support-progress read models
- CMS: existing content and publication state
- event surfaces: existing event attendee read models
- reporting: existing Asym finance and relationship reports

No Phase 06 artifact transfers finance, care, CMS publish state, auth,
payment, donor, missionary, public, or event authority to Twenty.

### Tests

- `tests/unit/packages/api/admin/crm-projections-query.test.ts`
- `tests/unit/packages/api/crm-projections.test.ts`
- `tests/unit/packages/api/crm-boundary.test.ts`

## Exit Gate

Do not proceed until projections are shadowed, role-scoped, drift-monitored, and rollback-ready.
