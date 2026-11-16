# Adopt UI SDK as a complementary behavior library

## Why

Core's dashboards need occasional interactions that neither Base UI nor
Core's other shared components provide, such as a star rating, a mixed
text-and-token input, keyboard shortcuts or drag-and-keyboard reordering.
Today agents either hand-roll them, losing accessible keyboard,
focus and server-rendering behavior, or have no sanctioned library to use.
Vercel's UI SDK provides those behaviors, unstyled, with documentation and an
agent skill that ship with each release. The current UI invariant forbids any
other component system, so adopting it needs an explicit, scoped decision.

## What Changes

- Install `@ui-sdk/core` and `@ui-sdk/react` in `packages/ui` only, pinned to
  one exact release, and declare the shared package's React peer as React 19.
- Name the `ui-sdk` cascade layer first in the shared global stylesheet and in
  admin's explicit layer order, so the SDK's injected rules rank below Core's.
- Add one Maia-styled shared wrapper, `Rating`, as the reference integration,
  with unit, server-render, hydration and real-browser checks.
- Import the upstream `ui-sdk` agent skill as a canonical, version-matched skill
  with a Core overlay, and route the shared UI instructions, the frontend
  rulebook, the skill catalog and the root invariant to it.

Non-goals: replacing any Base UI component, importing the SDK from
applications, loading its optional default stylesheet, adding a provider,
agent bridge, WebMCP integration or Content Security Policy change, changing
production screens, and changing the factory pack.

## Capabilities

- `agent-instruction-system`: the portable UI invariant admits UI SDK only for
  gaps no shared component fills, and the `ui-sdk` skill is canonical and
  version-matched.
- `shared-ui-primitives`: UI SDK complements Base UI through shared wrappers.

## Impact

The change adds two exact dependencies to `packages/ui`, one CSS layer
statement in two stylesheets, one shared primitive with its tests, and agent
instructions, provenance and generated skill mirrors with their checks. No
application imports change. Rollback reverts the change as one unit: the
wrapper has no product consumers, and removing the layer statement only
restores the previous cascade.
