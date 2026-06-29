# ADR-CD-021: Table preferences use server source of truth with local responsive cache

**Status:** Accepted (grill session 2026-05-28)

## Context

CRM donor gift history needs per-admin customizable columns. Preferences should persist automatically and follow the signed-in admin across sessions/devices. The implementation should fit the app's modern table stack: Next.js, TanStack Table, TanStack Query, TanStack DB, TanStack Store, and TanStack Virtual.

Repo research found existing admin tables already use shared `DataTableResponsive` with column visibility enabled, but current usage is initial-state driven rather than persisted per-user preference driven. The repo's TanStack guide defines clear boundaries: Query/DB for data and mutations, Table for view state, Virtual for rendering optimization, and app components for presentation.

## Decision

Use a hybrid preference model:

- Server-side per-user preference record is the source of truth.
- Local client cache/state makes the UI instant and resilient.
- Preferences are scoped by signed-in user and table id, e.g. `crm.giftHistory.columns`.
- Preferences include schema/version metadata for safe migration when columns change.
- CRM gift history supports multiple named personal views. Each view can include columns, filters/sort, pinned row action, and other personal display settings. One named personal view can be the user's default.

TanStack responsibilities:

- **TanStack Table:** controlled `columnVisibility` for the persisted visibility slice; protect required columns with `enableHiding: false` or equivalent metadata.
- **TanStack Query:** fetch/mutate preference records, optimistically update cache, reconcile from server response, and invalidate relevant query keys when needed.
- **TanStack DB:** preferred collection layer once preferences are shared across admin tables; use Zod schema, stable key (`userId:tableId`), query-backed sync, and optimistic mutations.
- **TanStack Store:** transient preference-editor state only (open/closed state, draft toggles, dirty/saving indicators), not the persisted authority.
- **TanStack Virtual:** render optimization only; use stable row ids and keep virtualization independent from data freshness or preference sync.
- **Next.js:** enforces user/tenant ownership in server/API routes.

## Consequences

- Column choices persist across devices and sessions.
- Tables feel responsive because local state updates immediately.
- Preference writes should be debounced and race-safe.
- A reset-to-default action is required.
- New/renamed/removed columns need migration behavior.
- Preference persistence should reuse shared table and data patterns rather than creating a bespoke CRM table system.
- CRM gift-history view settings use granular reset controls: reset columns, reset pinned row action, reset filters/sort, or reset all view settings.
- Each reset previews what will change, resets only the selected scope, and falls back to tenant defaults before system defaults.
- Tenant-level CRM gift-history defaults are managed by super admins or staff with a delegated settings capability. Changes are audited and do not require a separate approval workflow.
- Named personal views should use a compact dropdown-style view switcher near the table toolbar, not persistent tabs/chips. Common actions include save current view, rename, duplicate, set as default, reset, and delete. Shared tenant/team views remain out of scope unless introduced later.
- Named personal views are personal-only in this PRD. Sharing by link, publishing to a team, ownership transfer, shared-view permissions, and shared-view conflict resolution are out of scope.

## Research Notes

- TanStack Table v8 has dedicated `columnVisibility` state; docs warn not to provide the same state in both `initialState` and controlled `state`.
- TanStack Table guidance recommends controlling only the state slices another system needs.
- TanStack Query mutation docs emphasize updating cache / invalidating related queries after successful mutations.
- TanStack DB docs support Zod-backed schemas and optimistic mutations; schemas validate data before it enters the collection.
- TanStack Virtual docs emphasize stable item keys, realistic `estimateSize`, moderate `overscan`, and keeping virtualization separate from data freshness.

## Alternatives rejected

- **Browser localStorage only:** Fast but does not reliably follow the signed-in admin across devices/sessions.
- **Server-only with no local responsiveness:** Durable but can make column toggles feel sluggish.
- **One personal view only:** Simpler, but too limiting for staff who need fast pivots between receipt follow-up, corrections pending, refund review, and donor-care workflows.
- **Shared tenant/team named views immediately:** Useful later, but adds governance and publishing complexity beyond this PRD.
