# Phase 06 - Cross-Surface Projections And Shadow Mode

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

- [ ] Donor projections do not expose staff CRM depth.
- [ ] Missionary projections do not expose organization-wide CRM controls.
- [ ] CMS linkage shows status without moving public content truth.
- [ ] Event attendee context respects tenant and event scope.
- [ ] Projection state is stored and replayable.
- [ ] Drift dashboards show stale, missing, failed, and conflicting records.
- [ ] Shadow mode reports record-count parity and duplicate counts.
- [ ] Tests cover role boundaries across admin, donor, missionary, and public surfaces.
- [ ] Staff can tell which system owns each field.
- [ ] Rollback restores prior read models per projection.

## Exit Gate

Do not proceed until projections are shadowed, role-scoped, drift-monitored, and rollback-ready.
