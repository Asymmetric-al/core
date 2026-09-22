# Complete Base UI adoption

## Why

Core's shared design-system contract requires Base UI and exact base-maia, but four workspaces pin 1.5.0, obsolete state selectors remain, app surfaces rebuild accessible selection behavior, and popup setup predates current Safari guidance. AL-1894 covers this upgrade and evidence-based adoption audit.

## What Changes

- Pin the latest published stable Base UI release (1.8.0, verified against npm and official releases on 2026-09-22); no newer beta or RC is published.
- Remove unused direct competing primitive dependencies and unnecessary app-owned Base UI dependencies; retain specialized libraries where they own a distinct behavior.
- Repair popup root isolation and backdrops, stale primitive state styling, and audited app controls that bypass shared selection primitives.
- Validate shared and consumer behavior, keyboard interaction, dependency consistency, and existing repository gates.

## Capabilities

### New Capabilities

- `shared-ui-primitives`: Common accessible primitive behavior and portal setup across Core apps.

## Impact

Shared UI, all three app dependency manifests and root layouts, selected admin/donor controls, Bun lockfile, focused regression tests, and adoption documentation. No changes to data, authorization, donations, or payment execution. Preserve Maia geometry, semantic tokens, and public wrapper contracts wherever feasible. Revert this change as one unit to roll back.
