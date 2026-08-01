# Phase 05 - Relationship Expansion

> **Status (2026-07-06): Superseded — Twenty CRM retired** by
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
> Asym Postgres is the system of record for all CRM truth (people,
> relationships, notes, tasks, activity); see the
> [Phase 1 ownership matrix](../../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).
> No product surface reads from or depends on Twenty; the one-way mirror never
> turns on; sync code is dormant pending a scheduled cleanup ticket. This
> document is preserved for historical reference — do not execute its phases
> or runbooks. The "Twenty CRM owns relationship context" claim below is
> overridden: Asym Postgres owns relationship context.

## Trigger

Use this phase after the first CRM domain is stable in Mission Control and rollback has been rehearsed.

## Goal

Expand the CRM model to the deeper relationship graph: churches, organizations, households, pledges, relationship activity, and fundraiser-friendly reporting.

## Scope

- Churches and organizations.
- Households.
- Relationship activity.
- Pledges as CRM relationship records.
- Recent donor CRM projections.
- CRM search across people, churches, organizations, and households.
- Mission Control reports that depend on CRM relationship context.

## Not In Scope

- Stripe payment state.
- Contribution ledger.
- Recurring gift payment lifecycle.
- Receipt state.
- Annual statement state.
- Refund and reconciliation authority.
- Care plans or private care notes.
- CMS publish state.

## Pledge Guardrail

Pledges may be represented in Twenty as CRM relationship commitments, but Asym must remain authoritative for payment execution, recurring gift state, donation ledger, receipts, refunds, statements, and reconciliation.

If a pledge can trigger money movement or donor-visible financial state, treat that portion as Asym-owned.

## Workflow

1. Extend the ownership matrix before each new domain.
2. Add or update Twenty object schema for the domain.
3. Add mapping and duplicate rules.
4. Add read models through `packages/api`.
5. Add native Mission Control UI.
6. Enable writes only after read parity and rollback are proven.
7. Add reconciliation rules specific to each domain.
8. Validate donor and missionary surfaces remain role-scoped.

## Checklist

- [x] Each domain has an ownership matrix row.
- [x] Each domain has rollback instructions.
- [x] Churches and organizations do not create duplicate company records.
- [x] Households have deterministic membership rules.
- [x] Relationship activity does not duplicate care truth.
- [x] Pledges do not become payment truth.
- [x] CRM search respects tenant scope.
- [x] Reports cite source systems clearly.
- [x] Recent donor views combine CRM and finance data without moving finance
      truth.
- [x] Tests cover mapping, permissions, and rollback for each new domain.

## Phase 05 Artifact Status

Phase 05 expands the native Mission Control CRM read model to relationship
domains without enabling relationship-domain writes.

### Native Surface

- Route: `apps/admin/app/(app)/crm/relationships/page.tsx`
- Client: `apps/admin/app/(app)/crm/relationships/page-client.tsx`
- Columns: `apps/admin/app/(app)/crm/relationships/columns.tsx`
- Entry point: `apps/admin/app/(app)/crm/page-client.tsx` links the CRM dashboard to
  `/crm/relationships`

The surface includes tenant-scoped search, domain filters, source-system
reporting, stable row ids, and virtualized tables. It does not expose raw
Twenty UI and does not add donor, missionary, finance, care, CMS, public, or
payment controls.

### Server Boundary

- Thin route handler:
  `apps/admin/app/api/admin/crm/relationships/route.ts`
- Package API:
  `packages/api/src/admin/crm/relationships/index.ts`
- Service boundary:
  `packages/api/src/admin/crm/relationships/service.ts`
- Query parsing:
  `packages/api/src/admin/crm/relationships/query.ts`
- Relationship read model:
  `packages/api/src/admin/crm/relationships/model.ts`

The app route only re-exports `GET` from `@asym/api`. Twenty access stays
server-side behind `packages/api`, and browser code receives only the native
Asym response model from `@asym/database/types`.

### Domains

| Domain        | Twenty object(s)                         | Owner and guardrail                                                                  |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| People        | `people`                                 | CRM relationship context only; Supabase Auth and Asym memberships remain auth truth. |
| Organizations | `companies`                              | CRM organization context; churches are deduped out of generic company duplicates.    |
| Churches      | `churches`, church-like `companies`      | Custom church rows win over duplicate company rows for the same tenant/name key.     |
| Households    | `households`                             | Membership keys are deterministic from sorted unique member ids.                     |
| Pledges       | `relationshipCommitments`                | Relationship commitment context only; Asym finance owns payment truth.               |
| Activity      | `ministryActivities` excluding care rows | CRM activity context only; care plans and private care notes stay Asym-owned.        |

### Search And Reporting

`GET /api/admin/crm/relationships` requires staff/admin/super-admin access and
`crm.relationship.read`. It sends a tenant filter to Twenty and applies a
second server-side tenant filter after normalizing and deduping records.

Search covers people, churches, organizations, households, pledges, and
relationship activity. Domain filters, search, sort, cursor, and limit state
are included in the TanStack Query key in
`packages/database/hooks/admin-crm-relationships.ts`.

Reports cite source systems explicitly:

- Twenty CRM owns relationship context.
- Asym owns payment execution, receipts, statements, refunds, and
  reconciliation.
- Asym owns care plans and private care notes.
- Supabase Auth and Asym memberships own identity and authorization.

### Finance And Care Separation

Pledge rows expose relationship commitment terms such as amount, currency,
frequency, and status for CRM context. They intentionally do not project
payment status, payment intent ids, receipts, statements, refunds, or
reconciliation records.

Relationship activity excludes care-sensitive activity rows before the native
CRM read model is returned. Care-sensitive records remain in Asym care systems.

### Rollback

The existing `/crm` and `/crm/notes` Mission Control paths remain intact. To
roll back Phase 05, hide `/crm/relationships` and pause these domains in
`crm_sync_settings` as needed: `people`, `companies`, `churches`,
`households`, `ministry_activities`, and `relationship_commitments`.

No donor, missionary, finance, CMS, care, public, auth, or payment authority is
moved by this phase.

### Tests

- `tests/unit/packages/api/admin/crm-relationships-query.test.ts`
- `tests/unit/packages/api/crm-relationships.test.ts`
- `tests/unit/packages/api/crm-boundary.test.ts`

## Exit Gate

Do not proceed until relationship domains are stable, searchable, tenant-safe, and clearly separated from finance and care authority.
