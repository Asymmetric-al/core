# Plan 005: Share the CRM view-settings patch util (in @asym/database)

## Status

- **Priority**: P2 — **Effort**: M — **Risk**: LOW — **Depends on**: none
- **Category**: tech-debt — **Planned at**: commit `36cc941b`, 2026-06-12

## Why this matters

The three-way settings-patch semantics (`undefined` = unchanged, `null` =
scoped reset, value = replace) are implemented twice with no shared source, and
they have **already diverged**: the API copy handles four keys (columns,
filtersSort, delegatedManagerProfileIds, activeViewId) while the client hook copy
handles only three — it silently ignores `delegatedManagerProfileIds`. One shared
helper removes the drift and the future "edit it in N places" tax.

## Current state (verified at 36cc941b)

- `packages/api/src/admin/crm/table-preferences/service.ts:69-108` `applySettingsPatch` — four keys.
- `packages/database/hooks/admin-crm-table-preferences.ts:129-156` `applyPatchToLayer` — three keys (omits `delegatedManagerProfileIds`).
- Shared types (`CrmViewSettingsLayer`, etc.) already live in `@asym/database/types`.
- **Boundary fact (load-bearing):** `@asym/api` depends on `@asym/database` (`workspace:*`); `@asym/database` does NOT depend on `@asym/api`. The consumer hook lives in `@asym/database`. Therefore the shared util MUST live in `@asym/database` — putting it in `@asym/api` would create a `database → api → database` cycle.

## Scope

**In scope**: a new pure helper in `@asym/database` (e.g. `packages/database/types/crm-table-preferences.ts` or a sibling pure module) exporting `applyCrmViewSettingsPatch(existing, patch)` over the full four-key shape; rewire `service.ts` and the hook to call it; a focused unit test.
**Out of scope**: changing patch semantics, the route schema, the page component.

## Steps

1. Add `applyCrmViewSettingsPatch(existing: CrmViewSettingsLayer | null, patch): CrmViewSettingsLayer` in `@asym/database` next to the types it operates on. Handle all four keys with the three-way semantics. Keep it framework-free (no React, no Supabase) so both server and `"use client"` consumers can import it.
2. Replace the body of `applySettingsPatch` in `service.ts` with a call to the shared helper (or delete it and call the shared one directly). The API patch type maps 1:1.
3. Replace `applyPatchToLayer` in the hook with the shared helper — this also fixes the `delegatedManagerProfileIds` omission.
4. Test the shared helper directly: unchanged/reset/replace for each key, including `delegatedManagerProfileIds` and `activeViewId`.

## Verify / Done criteria

- New util test passes; existing `crm-table-preferences-service`, `crm-view-settings`, and CRM page tests stay green.
- `git grep -n "applyPatchToLayer"` returns nothing (removed).
- `bunx turbo run lint typecheck --filter=@asym/database --filter=@asym/api --filter=@asym/admin` exits 0.

## STOP conditions

- The hook's optimistic-update shape needs a key the server patch type lacks (it does not — both use `CrmViewSettingsLayer`).
- Importing the new `@asym/database` util into the `"use client"` hook drags in server-only code (it must not — keep the util pure).
