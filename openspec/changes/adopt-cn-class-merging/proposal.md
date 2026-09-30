## Why

Core already centralizes class merging in `@asym/ui`, but its implementation
uses `cnfast@0.0.8`. Adopt the maintained `cn` engine from shadcn while preserving
the existing variadic `cn` and `ClassValue` API and verifying Core's class combinations instead of
treating upstream parity or performance claims as application evidence.

## What Changes

- Pin `cn@0.3.2` in `@asym/ui` and use its default full-table engine behind the
  existing `cn` and `ClassValue` exports.
- Remove `cnfast` and the unused direct `clsx` and `tailwind-merge` dependencies
  from the admin app. Preserve dependencies that third-party packages require.
- Add regression coverage for Core's conditional inputs, shared component
  overrides, semantic tokens, variants, and arbitrary values.
- Make transparency explicit at affected legacy-gradient consumers where the
  new engine preserves a shared component's background color independently.
- Document the integration boundary, upstream limitations, validation evidence,
  and rollback. Preserve exact `base-maia`, Base UI, tokens, and consumer imports.

## Capabilities

### New Capabilities

- `ui-class-merging`: predictable shared class composition and override behavior
  across Core's UI consumers, including representative compatibility coverage.

### Modified Capabilities

None. Existing platform and design-system boundaries remain in force.

## Impact

The shared UI helper, UI/admin dependency manifests, Bun lockfile, focused tests,
shared UI documentation, and confirmed gradient consumers change. Admin, donor,
and missionary apps keep the same helper imports. There are no schema, API, tenant,
authorization, payment, or publication changes.

## Non-goals

- Changing the design system, component variants, frameworks, or other packages.
- Adding bundler aliases that replace dependencies inside third-party packages.
- Enabling `cn/next`, generated project subsets, or custom conflict tables.
- Claiming a measured Core speedup from the upstream 30x benchmark.

## Rollback

Restore the previous helper and dependency/lockfile state together if a tested
consumer regression cannot be resolved within this migration. Existing shared
import paths make rollback independent of app call sites. Keep this change
active until the implementation is merged and accepted.
