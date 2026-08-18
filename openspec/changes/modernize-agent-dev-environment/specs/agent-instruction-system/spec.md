# Delta for Agent Instruction System

## ADDED Requirements

### Requirement: Portable UI Work MUST Preserve Exact base-maia

Root portable instructions SHALL state a concise, always-on UI invariant that
every UI or UX change MUST use the shared shadcn/Base UI system in
`packages/ui` and preserve exact style `base-maia`, Zinc-oriented semantic
CSS-variable tokens, and the existing Core design language. Detailed Maia
implementation guidance SHALL live in UI-scoped instructions and the canonical
frontend rulebook, not as a full theming tutorial in root `AGENTS.md`.

#### Scenario: An agent starts UI or UX work

- WHEN an agent changes pages, shared components, forms, tables, charts,
  overlays, empty/loading/error states, motion, or registry-generated UI
- THEN the portable root instruction requires exact `base-maia`
- AND it requires Base UI primitives, Zinc-oriented semantic tokens, CSS-variable
  theming, and shared ownership in `packages/ui`
- AND it forbids another shadcn style, preset, primitive base, component system,
  or app-local fork of shared primitives

#### Scenario: Detailed Maia guidance is needed

- WHEN an agent needs geometry, spacing, CLI, registry, or semantic-token
  workflow for UI work
- THEN it reads `packages/ui/AGENTS.md` and the canonical frontend rulebook
- AND app-scoped instructions point back to that shared contract
- AND they do not define a second visual system

### Requirement: Substantive Code Changes Use Test-Driven Development

Substantive feature, bug-fix, and behavior-changing work SHALL follow
red-green-refactor Test-Driven Development at the nearest stable public or
architectural seam. Documentation-only, formatting-only, generated-mirror, and
provenance-only changes SHALL use the strongest relevant deterministic
verification instead of an artificial failing test.

#### Scenario: A behavior-changing implementation starts

- WHEN an agent implements a feature, bug fix, or behavior-changing refactor
- THEN it inspects existing tests and the current implementation first
- AND it adds or updates a test that expresses the desired behavior or
  reproduces the bug
- AND it runs that test before completing the implementation change
- AND it does not require the user to type `/tdd` or approve an already
  established public seam

#### Scenario: The change has no executable behavior

- WHEN the change is documentation-only, formatting-only, an exact generated
  mirror update, or provenance metadata
- THEN the agent uses deterministic verification such as structural tests,
  snapshot comparison, or `git diff --check`
- AND it does not invent a meaningless red unit test

### Requirement: Skill Mirror Verification MUST NOT Mutate The Working Tree

`skills:verify` SHALL compare canonical skill sources and generated mirrors
without writing tracked files. `skills:sync` remains the command that updates
generated mirrors.

#### Scenario: Mirrors already match canonical sources

- WHEN an agent or CI runs `skills:verify` on a tree whose generated mirrors
  match the canonical overlay
- THEN verification succeeds
- AND the working tree `git status` is unchanged

#### Scenario: Generated mirrors have drifted

- WHEN generated mirrors are missing, changed, stale, or orphaned relative to
  canonical sources
- THEN `skills:verify` fails with a drift report
- AND it does not repair or rewrite the tracked mirrors

### Requirement: Nested Instructions Carry Package And App Unique Rules

The repository SHALL use nested `AGENTS.md` files for scopes that have unique
rules, including shared UI, apps, Supabase, scripts, and Eve runtime isolation.
Nested files SHALL NOT copy the root router.

#### Scenario: Shared UI work is requested

- WHEN an agent works in `packages/ui` or on shared shadcn/Base UI components
- THEN it loads `packages/ui/AGENTS.md`
- AND that file states the detailed `base-maia`, Base UI, semantic-token, and
  CLI contract

#### Scenario: App UI work is requested

- WHEN an agent works in `apps/admin`, `apps/donor`, or `apps/missionary`
- THEN nested app instructions identify the app and point to the shared
  `packages/ui` contract
- AND they do not introduce an app-local design system

### Requirement: Agents Explore Context Before Workflow Skills

For framework and product work, agents SHALL identify the relevant app or
package, inspect current implementation and configuration, and read
version-matched installed docs before loading an action-specific workflow skill.

#### Scenario: Next.js implementation is requested

- WHEN an agent works on a Next.js route, cache, navigation, or runtime issue
- THEN it identifies the app and reads the nearest bundled
  `node_modules/next/dist/docs/` or `.next-docs/` fallback
- AND it loads an official Next.js workflow skill only after that exploration
- AND it uses Next.js MCP for live diagnostics when a dev server is running
- AND it uses `agent-browser` for browser and React inspection when the change
  is user-visible

### Requirement: Always-On Instructions Fit Supported Client Budgets

The portable instruction chain SHALL keep high-frequency invariants always
available, including Bun/Turborepo usage, TDD, exact `base-maia`, OpenSpec
routing, and Next.js docs-first behavior, without relying on a single client's
limit increase. Silent truncation of those invariants is a defect.

#### Scenario: Root instructions are loaded

- WHEN Codex, Cursor, Claude Code, Copilot, or another `AGENTS.md` client loads
  repository instructions
- THEN the root file includes the concise `base-maia` invariant and TDD default
- AND it contains one Next.js compressed docs index, not duplicate managed
  indexes
- AND detailed skill catalogs and operational runbooks live in scoped files

## MODIFIED Requirements

### Requirement: AGENTS Remains the Always-On Router

The repository SHALL keep `AGENTS.md` as the always-on routing layer for
project work, while preserving generated Next.js-managed content. Root
`AGENTS.md` SHALL act as a concise router and working contract: repository
identity, source-of-truth hierarchy, package boundaries, TDD default,
version-aware docs lookup, compact skill and tool map, nested-instruction
discovery, Bun/Turborepo commands, verification expectations, major invariants
including exact `base-maia`, and OpenSpec routing. Full skill catalogs,
cloud runbooks, review-bot policy, and MCP tutorials SHALL live in scoped
rulebooks, nested instructions, or ordinary developer documentation.

#### Scenario: Repo-wide routing is needed

- WHEN an agent needs to resolve instruction precedence or choose which local
  rulebook or skill to load
- THEN it uses `AGENTS.md` as the primary routing entrypoint
- AND it preserves the Next.js-managed block and exactly one compressed docs
  index
- AND it follows nested `AGENTS.md` files for package- or app-unique rules

#### Scenario: Tool-specific helper files are present

- WHEN `cursor.md`, `.cursor/rules/*`, `.cursor/commands/*`,
  `.github/copilot-instructions.md`, or `.github/instructions/*.instructions.md`
  exist
- THEN they stay aligned with `AGENTS.md`
- AND they do not replace the root routing layer
- AND they do not become the only carrier of the `base-maia` invariant

### Requirement: Framework and Runtime Truth Beat Memory

The repository SHALL require agents to prefer version-matched framework docs and
runtime facts over model memory for fast-moving or runtime-sensitive work.
Broad framework knowledge belongs in installed or committed docs. Action-specific
workflows belong in skills. Live diagnostics belong in MCP or runtime logs.

#### Scenario: Next.js work is requested

- WHEN an agent works on Next.js behavior, APIs, routing, caching, or runtime
  debugging
- THEN it reads the relevant docs in `node_modules/next/dist/docs/`
- OR it uses `.next-docs/` if local docs are unavailable
- AND it does not treat remembered Next.js APIs as authoritative

#### Scenario: Runtime state is needed

- WHEN a dev server or MCP runtime can answer a question about routes, errors,
  metadata, or logs
- THEN the agent checks MCP tools, lock files, or runtime logs before guessing
- AND it does not duplicate general framework documentation into MCP guidance

### Requirement: Instruction-System Changes Are Verified Safely

Instruction-system changes SHALL validate paths, commands, generated marker
regions, skill-mirror equality, and the portable `base-maia` invariant, while
avoiding unrelated product or database changes. Focused instruction-system
tests and agent-system maintenance scripts MAY change as part of the same
verification.

#### Scenario: Instruction files change

- WHEN an instruction-system pull request changes AGENTS, Cursor, Copilot,
  OpenSpec files, canonical skills, sync/verify scripts, or instruction-system
  tests
- THEN verification confirms path accuracy, command accuracy, marker integrity,
  skill-mirror equality without mutation, and that product application code and
  database files are unmodified
- AND instruction-system tests and maintenance scripts may be added or updated
  to enforce the contract
