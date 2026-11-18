## MODIFIED Requirements

### Requirement: Portable UI Work MUST Preserve Exact base-maia

Root portable instructions SHALL state a concise, always-on UI invariant that
every UI or UX change MUST use the shared `@asym/ui` system in `packages/ui`
and preserve exact style `base-maia`, Zinc-oriented semantic
CSS-variable tokens, and the existing Core design language. Detailed Maia
implementation guidance SHALL live in UI-scoped instructions and the canonical
frontend rulebook, not as a full theming tutorial in root `AGENTS.md`.

#### Scenario: An agent starts UI or UX work

- **WHEN** an agent changes pages, shared components, forms, tables, charts,
  overlays, empty/loading/error states, motion, or registry-generated UI
- **THEN** the portable root instruction requires exact `base-maia`
- **AND** it requires Zinc-oriented semantic tokens, CSS-variable theming, and
  shared ownership in `packages/ui`
- **AND** it approves both Base UI and UI SDK for shared components and prefers
  Base UI over Radix, as the shared UI instructions scope it
- **AND** it forbids another shadcn style, preset, competing component system,
  or app-local fork of shared primitives

#### Scenario: Detailed Maia guidance is needed

- **WHEN** an agent needs geometry, spacing, CLI, registry, or semantic-token
  workflow for UI work
- **THEN** it reads `packages/ui/AGENTS.md` and the canonical frontend rulebook
- **AND** app-scoped instructions point back to that shared contract
- **AND** they do not define a second visual system

### Requirement: UI SDK agent guidance is canonical and version-matched

The `ui-sdk` skill SHALL be a canonical import of the upstream skill from the
commit tagged for the installed `@ui-sdk/core` release, with provenance, its
license, a Core overlay and generated mirrors. The overlay SHALL keep shared
reuse first, treat Base UI and UI SDK as approved choices, route agents to the
installed-version documentation, keep wrappers in `packages/ui`, and keep agent
bridges, the optional stylesheet and expected-failure tests out of ordinary
work.

#### Scenario: An agent needs an interaction no shared component provides

- **WHEN** dashboard UI work needs a behavior no shared component provides
- **THEN** the shared UI instructions route the agent to the `ui-sdk` skill
- **AND** the skill sends the agent to the documentation installed with the
  pinned release
- **AND** the agent builds a Maia-styled wrapper in `packages/ui` with keyboard,
  focus, accessibility and hydration checks

#### Scenario: An agent weighs UI SDK against an existing shared component

- **WHEN** shared UI work may benefit from UI SDK although a shared component
  exists, or changes UI SDK code
- **THEN** the shared UI instructions route the agent to the `ui-sdk` skill
- **AND** the skill applies its import, part, attribute and testing rules to UI
  SDK code only

#### Scenario: UI SDK is installed but not involved

- **WHEN** an agent composes a page from existing shared components or makes a
  small styling correction
- **THEN** the `ui-sdk` skill is not required merely because the package is
  installed

#### Scenario: Upstream guidance conflicts with Core

- **WHEN** upstream guidance says to install packages in an application, load
  the optional default stylesheet, replace shared components only because the
  SDK ships them, add an agent bridge, or mark failing tests as expected
  failures
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

### Requirement: Installed skill audits account for sources and exclusions

Maintenance SHALL account for every discoverable installed skill using a
canonical owner, verified ecosystem source or explicit retained/excluded status.
Source revisions, content hashes, adaptations and outcomes SHALL distinguish
updated/current content from snapshots and unresolved evidence. Refresh SHALL
preserve Core policies, stable aliases, compatible installed-version guidance
and opaque credentials without expanding product dependencies or the installed
upstream catalog.

#### Scenario: A source moves or disappears

- **WHEN** a reviewed source moves or removes an installed skill
- **THEN** a verified successor retains the installed compatibility identity
  unless the owner retires that identity
- **AND** a removed-source snapshot remains explicitly recorded, or is retired
  by a recorded owner decision, rather than silently substituted

#### Scenario: The owner excludes PDF pending license review

- **WHEN** the catalog refresh runs with the PDF exclusion
- **THEN** every PDF payload byte in all three runtime trees remains unchanged
- **AND** its status is excluded rather than claimed current or refreshed

#### Scenario: Ecosystem source content is restored before sync

- **WHEN** a targeted restore replaces a reviewed ecosystem source
- **THEN** persistent Core overlays, invocation boundaries and code-example repairs are reapplied
- **AND** final mirrors retain the verified complete source inventory

#### Scenario: Reviewed browser and chart helpers handle external data

- **WHEN** the explicitly invoked frontend exploration skill inspects a page
- **THEN** its browser tools require an explicit HTTP(S) dev-server URL and do not serve the checkout
- **AND** page-provided scene IDs remain text rather than screenshot paths or HTML
- **AND** chart labels and formatter output render as literal text

#### Scenario: Source evidence describes a hosted bundle or removed path

- **WHEN** reviewed source has a bundle identity rather than a Git revision, or an installed source path is absent
- **THEN** maintenance records the verified bundle version and hashes or the separate availability check
- **AND** absence alone does not claim provenance for retained historical bytes

## ADDED Requirements

### Requirement: Retired skills leave every discovery surface together

A skill that the owner retires SHALL be removed from its canonical or ecosystem
source, every runtime mirror, the skills lock and the installed-skill audit in
one change. The maintenance log SHALL record its name, source, last hashes and
the routed skill that replaces it, if any. Aliases that other instructions
still route to SHALL remain.

#### Scenario: A superseded snapshot is retired

- **WHEN** an installed skill's upstream removed it and a routed Core skill
  covers its purpose, or its guidance conflicts with Core's stack
- **THEN** the owner MAY retire it instead of keeping a snapshot
- **AND** no refresh, sync or lock entry restores it
- **AND** a repository check fails if it reappears in any source, mirror, lock
  or audit record
