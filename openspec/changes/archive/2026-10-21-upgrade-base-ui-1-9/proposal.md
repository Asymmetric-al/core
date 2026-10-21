# Upgrade Base UI to 1.9.0 — AL-1985

## Why

Base UI 1.9.0 fixes shared control, popup, focus, and list behavior and introduces preview menu filtering. Core currently pins 1.8.0. Email Studio's existing merge-tag menu combines a regular menu with a separate search input, so it can benefit directly from the new filtering and keyboard primitives.

## What Changes

- Pin every direct first-party Base UI dependency to exact 1.9.0 and update the Bun lockfile without unrelated dependency upgrades.
- Expose styled `DropdownMenuFilterProvider`, `DropdownMenuInput`, `DropdownMenuList`, `DropdownMenuClear`, and `DropdownMenuEmpty` through the existing shared dropdown-menu module.
- Adopt those parts in `EmailStudioMergeTagMenu`, preserving its trimmed, case-insensitive key OR label OR category substring matching and `onInsert(key)` callback.
- Add focused compatibility, filtering, keyboard, reset, empty-state, and consumer verification. Record release-specific evidence and any verification gaps.

## Capabilities

### Modified Capabilities

- `shared-ui-primitives`: Add release-specific compatibility and filterable menu behavior alongside the active `complete-base-ui-adoption` change. This companion change uses distinct requirement names and retains that change's existing design-system and accessibility contracts.

## Impact

The direct dependency manifests, Bun lockfile, shared dropdown-menu wrappers, Email Studio merge-tag menu, focused tests, and release evidence change. All three apps consume the upgraded shared UI package. Exact base-maia, Zinc semantic tokens, wrapper composition, and existing menu callbacks remain authoritative.

The scope excludes a new repository-wide documentation compliance audit, unrelated control migrations, data or authorization changes, email delivery, and provider qualification. Menu filtering is an upstream preview API. Rollback restores the 1.8.0 manifests/lockfile and the prior merge-tag composition together with the shared wrappers and tests.
