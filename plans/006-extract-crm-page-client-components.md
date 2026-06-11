# Plan 006: Extract components from the crm/page-client god-file

## Status

- **Priority**: P3 — **Effort**: L — **Risk**: MED — **Depends on**: 001, 005
- **Category**: tech-debt — **Planned at**: commit `36cc941b`, 2026-06-12

## Why this matters

`apps/admin/app/crm/page-client.tsx` has grown to ~2050 lines holding 8 distinct
responsibilities: the records data-table, the kanban view, the donor detail
drawer, the gift-history list, the inline-action controls, the view-settings
menu, the named-view switcher, and several dialogs. It is hard to review, test in
isolation, and change without reading the whole file. Extracting cohesive
components (behavior-preserving) lowers the blast radius of every future CRM
change. This is a pure refactor — no behavior change — guarded by the existing
CRM test suite.

## Current state (verified at 36cc941b)

- `apps/admin/app/crm/page-client.tsx` ~2050 lines. Self-contained sub-components already defined inline and good extraction seams: `GiftInlineActionControls`, `GiftHistoryViewSettingsMenu`, `GiftHistoryViewSwitcher`, `DetailDrawer`, `KanbanView`.
- Tests that pin behavior: `tests/unit/apps/admin/app/crm-gift-detail-entry.test.tsx` (drawer, gift list, inline ops, view settings, named views), plus the canonical-route and detail-sheet tests.

## Scope

**In scope**: split `page-client.tsx` into a coordinator plus extracted component modules under `apps/admin/app/crm/` (e.g. `gift-inline-action-controls.tsx`, `gift-history-view-settings-menu.tsx`, `gift-history-view-switcher.tsx`, `detail-drawer.tsx`, `kanban-view.tsx`). Move only; do not change rendered output, props semantics, or state ownership.
**Out of scope**: any logic change, any change to hooks/API, restyling. If a behavior change seems needed, it belongs in a separate plan.

## Steps

1. Extract leaf-first (lowest coupling first): `KanbanView` → `GiftInlineActionControls` → `GiftHistoryViewSettingsMenu` → `GiftHistoryViewSwitcher` → `DetailDrawer`. After each extraction run the CRM test suite; keep each extraction its own commit so a regression is bisectable.
2. Keep the default export and the `?gift=`/`?donor=` URL/state coordination in `page-client.tsx`. Pass the same props the inline versions received; do not introduce new context.
3. Preserve `"use client"`, import order conventions, and the existing `data-testid`s / `aria-label`s exactly (the tests query them).

## Verify / Done criteria

- After each extraction and at the end: `bunx vitest run tests/unit/apps/admin/app/crm-gift-detail-entry.test.tsx` passes unchanged (no test edits needed — if a test needs editing, the refactor changed behavior → STOP).
- `bunx turbo run lint typecheck --filter=@asym/admin` exits 0.
- `page-client.tsx` is materially smaller (target < ~700 lines) and each extracted file has one responsibility.

## STOP conditions

- A test starts failing or requires editing to pass — the extraction changed behavior; revert that step.
- An extraction forces prop-drilling so deep it would be clearer to leave inline — stop and leave that component in place; partial extraction is acceptable.

## Maintenance note

Do this last (after 001 removes `canResendReceipt` and 005 extracts the patch
util the page indirectly relies on), so the split happens on already-cleaned code.
