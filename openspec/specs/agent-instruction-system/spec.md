# Agent Instruction System Specification

## Purpose

Define the durable workflow contract for AI agents working in this repository,
including how they gather project intent, choose authoritative context, use
conditional tool layers, and verify instruction-system changes safely.

## Requirements

### Requirement: OpenSpec Owns Durable Project Intent

The repository SHALL use OpenSpec as the durable source of truth for project
context and intended long-lived behavior, and MUST make OpenSpec visible and
actionable for non-trivial project work, behavior changes, and multi-step
planning.

#### Scenario: Non-trivial project work starts

- WHEN an agent begins non-trivial feature work, behavior changes, or multi-step
  planning
- THEN the routing layer points it to `openspec/project.md`
- AND it reads the relevant specs in `openspec/specs/**`
- AND it reads any active change in `openspec/changes/**` before implementation

#### Scenario: Behavior is changing without an active change

- WHEN an agent needs to change durable behavior or workflow expectations
- THEN it creates or updates an OpenSpec change before major implementation

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

### Requirement: Repo and Dependency Research Is Grounded

The repository SHALL ground repo and dependency research in current evidence.

#### Scenario: Nia is available

- WHEN Nia is exposed in the current client
- THEN the agent uses repo-scoped, preambled Nia queries for repo research and
  fresh dependency context

#### Scenario: Nia is unavailable in-session

- WHEN the workspace is known to use Nia but the active client does not expose
  it
- THEN the agent falls back to direct repo reads plus official docs
- AND it states that fallback explicitly

### Requirement: Conditional Capability Layers Stay Subordinate

Installed provider plugins, Codex surfaces, and MCP helpers SHALL remain
subordinate to OpenSpec, repo-local instructions, canonical repo-local skills,
and local framework docs. They MAY improve workflow when available, and repo
instructions MUST NOT treat them as guaranteed repo-owned infrastructure.

#### Scenario: Provider-specific workflow is needed

- WHEN a provider plugin or Codex capability is installed and directly relevant
- THEN the agent may use it for the provider-specific portion of the task
- BUT it still follows OpenSpec and repo-local guidance first

#### Scenario: A capability is unverified

- WHEN the agent cannot verify that a plugin, automation, skill, or MCP helper
  is available in the current workspace
- THEN it uses conditional wording
- AND it does not hard-wire the missing capability into repo instructions

#### Scenario: Repo instructions mention optional capability layers

- WHEN repo instructions mention provider plugins, Codex surfaces, or optional
  MCP helpers
- THEN they use conditional wording unless the capability is repo-owned
- AND they keep repo-local instructions and OpenSpec above those layers in
  precedence

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

### Requirement: Cursor and Copilot Workflow Files Use Real Repo Paths

Checked-in workflow docs MUST reference paths and artifacts that exist in the
repository.

#### Scenario: Cursor command docs are executed

- WHEN a Cursor command file tells an agent where to store planning artifacts
- THEN it uses `openspec/changes/<change-id>/` or another real repo path
- AND it does not reference missing `docs/projects/**` or `.cursor/nia` files

#### Scenario: GitHub Copilot path instructions are loaded

- WHEN GitHub Copilot consumes path-specific instructions
- THEN the repo provides at least one `*.instructions.md` file in
  `.github/instructions/`

### Requirement: Official Agent Tooling MUST Be Canonicalized Before Routing

The repository MUST promote third-party agent tooling into canonical repo-owned
skill docs or explicitly document it as an optional external plugin before
routing agents to it as durable repo guidance.

#### Scenario: Official skills are vendored

- WHEN official third-party skills are copied into the repository
- THEN the canonical copy lives under `docs/ai/skills/<skill-name>/SKILL.md`
- AND the upstream source repository, source path, commit SHA, license, and
  refresh workflow are documented
- AND `.agents/skills/` and `.cursor/skills/` are refreshed through the repo
  skill sync workflow rather than hand-edited as the source of truth

#### Scenario: Optional plugins provide extra capabilities

- WHEN Codex, Claude Code, Cursor, or another agent can install a provider
  plugin for the same tooling
- THEN repo instructions document the plugin as optional and subordinate to
  OpenSpec, `AGENTS.md`, canonical skills, repo rulebooks, framework docs, and
  runtime evidence

### Requirement: Inngest Agent Tools MUST Not Imply Product Runtime Adoption

The repository MUST distinguish official Inngest agent tooling from product
runtime Inngest integration. Product runtime behavior is governed by the
`workflow-orchestration` spec; vendored agent tooling MUST NOT silently expand
product runtime scope.

#### Scenario: Agents prepare Inngest-related work

- WHEN an agent is asked to audit, design, or implement Inngest-related work
- THEN the routing layer points to the relevant official Inngest skill
- AND the agent uses `inngest-brownfield-audit` before changing existing app
  workflows
- AND `inngest-setup` is reserved for explicit product runtime expansion

#### Scenario: Vendored Inngest tooling is refreshed

- WHEN vendored Inngest skills or optional plugins are refreshed or expanded
- THEN the refresh does not change product runtime packages, app code, database
  migrations, or environment requirements as a side effect
- AND any runtime change goes through an OpenSpec change governed by
  `workflow-orchestration`

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
