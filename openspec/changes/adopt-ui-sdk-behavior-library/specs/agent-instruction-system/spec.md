## MODIFIED Requirements

### Requirement: Portable UI Work MUST Preserve Exact base-maia

Root portable instructions SHALL state a concise, always-on UI invariant that
every UI or UX change MUST use the shared shadcn/Base UI system in
`packages/ui` and preserve exact style `base-maia`, Zinc-oriented semantic
CSS-variable tokens, and the existing Core design language. Detailed Maia
implementation guidance SHALL live in UI-scoped instructions and the canonical
frontend rulebook, not as a full theming tutorial in root `AGENTS.md`.

#### Scenario: An agent starts UI or UX work

- **WHEN** an agent changes pages, shared components, forms, tables, charts,
  overlays, empty/loading/error states, motion, or registry-generated UI
- **THEN** the portable root instruction requires exact `base-maia`
- **AND** it requires Base UI primitives, Zinc-oriented semantic tokens, CSS-variable
  theming, and shared ownership in `packages/ui`
- **AND** it forbids another shadcn style, preset, primitive base, competing
  component system, or app-local fork of shared primitives
- **AND** it admits UI SDK only for behaviors no existing shared component
  provides, as the shared UI instructions scope it

#### Scenario: Detailed Maia guidance is needed

- **WHEN** an agent needs geometry, spacing, CLI, registry, or semantic-token
  workflow for UI work
- **THEN** it reads `packages/ui/AGENTS.md` and the canonical frontend rulebook
- **AND** app-scoped instructions point back to that shared contract
- **AND** they do not define a second visual system

## ADDED Requirements

### Requirement: UI SDK agent guidance is canonical and version-matched

The `ui-sdk` skill SHALL be a canonical import of the upstream skill from the
commit tagged for the installed `@ui-sdk/core` release, with provenance, its
license, a Core overlay and generated mirrors. The overlay SHALL keep Base UI
the default, route agents to the installed-version documentation, keep wrappers
in `packages/ui`, and keep agent bridges, the optional stylesheet and
expected-failure tests out of ordinary work.

#### Scenario: An agent needs an interaction no shared component provides

- **WHEN** dashboard UI work needs a behavior no shared component provides
- **THEN** the shared UI instructions route the agent to the `ui-sdk` skill
- **AND** the skill sends the agent to the documentation installed with the
  pinned release
- **AND** the agent builds a Maia-styled wrapper in `packages/ui` with keyboard,
  focus, accessibility and hydration checks

#### Scenario: Upstream guidance conflicts with Core

- **WHEN** upstream guidance says to install packages in an application, load
  the optional default stylesheet, replace an ordinary Base UI control, add an
  agent bridge, or mark failing tests as expected failures
- **THEN** the Core overlay prevails and the agent does none of these without
  explicit approval

#### Scenario: The SDK release changes

- **WHEN** the pinned UI SDK release changes
- **THEN** the skill is refreshed from the same release
- **AND** a repository check fails while the vendored skill differs from the
  copy bundled in the installed package

#### Scenario: A factory role starts outside its checkout

- **WHEN** an agent starts in a separate control directory without a skill
  loader
- **THEN** the shared UI instructions name the skill as a repository file it
  can read inside its assigned checkout
