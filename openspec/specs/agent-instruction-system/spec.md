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
planning. `openspec/config.yaml` SHALL supply injected planning context.
`openspec/project.md` SHALL remain the detailed human-oriented index. Agents
MUST use the repository-pinned local CLI and MUST NOT run `openspec update`
against the live customized repository.

#### Scenario: Non-trivial project work starts

- WHEN an agent begins non-trivial feature work, behavior changes, or multi-step
  planning
- THEN the routing layer points it to `openspec/config.yaml` and
  `openspec/project.md`
- AND it reads the relevant specs in `openspec/specs/**`
- AND it reads any active change in `openspec/changes/**` before implementation

#### Scenario: Behavior is changing without an active change

- WHEN an agent needs to change durable behavior or workflow expectations
- THEN it creates or updates an OpenSpec change before major implementation
- AND it uses an explicit change ID for mutating OpenSpec operations

### Requirement: AGENTS Remains the Always-On Router

The repository SHALL keep root `AGENTS.md` as the always-on routing layer for Codex project work.

Every clause in `openspec/contracts/agent-instruction-system.md#contract-707cbf60f3e33fc2c10e` MUST apply without exception.

#### Scenario: Repo-wide routing is needed

- WHEN Codex needs to resolve source authority or choose scoped guidance
- THEN it uses root `AGENTS.md` as the primary entrypoint
- AND it reads the nearest nested `AGENTS.md` before changing a scoped area
- AND it searches installed Next.js docs or `.next-docs/` directly instead of
  relying on a compressed index embedded in root

#### Scenario: Tool-specific helper files are present

- WHEN another client or tool-specific adapter points to root `AGENTS.md`
- THEN that adapter remains thin
- AND client-specific or cloud-specific instructions stay outside the root

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

Root `AGENTS.md` SHALL fit comfortably within Codex's default project document
budget without a client-specific limit increase. The file MUST be no larger
than 16,384 UTF-8 bytes and 200 authored lines, SHOULD target no more than
12,288 bytes, and MUST NOT contain a compressed Next.js documentation index.

#### Scenario: Root instructions are loaded

- WHEN instruction-system tests run
- THEN root contains exactly one Next.js-managed opening marker pair
- AND it contains no `NEXT-AGENTS-MD` marker
- AND every direct local path reference resolves
- AND high-frequency Core invariants remain present before any scoped loading

### Requirement: Task-Specific Guidance MUST Use Progressive Disclosure

Root `AGENTS.md` MUST NOT enumerate the repository skill catalog, embed tool
manuals, or carry cloud and client-specific runbooks. It SHALL point to scoped
instructions, rulebooks, skills, configuration, and runtime evidence that load
only when the task requires them.

#### Scenario: Codex starts ordinary repository work

- WHEN Codex loads root project instructions
- THEN it receives repository identity, authority, critical invariants, routing,
  and verification guidance
- AND individual skill procedures, MCP manuals, framework catalogs, and cloud
  setup are absent from the always-on file

#### Scenario: A specialized task is requested

- WHEN a task matches a discovered skill, nested instruction file, or rulebook
- THEN Codex loads that scoped source
- AND root does not duplicate its full procedure

### Requirement: Curated Skills MUST Match Core's Actual Stack and Existing Catalog

New durable agent skills MUST be selected against Core's installed versions,
repository conventions, existing skills, and runtime boundaries rather than
copied wholesale from a public catalog.

#### Scenario: A requested topic overlaps existing guidance

- WHEN an upstream skill substantially duplicates a routed Core skill or rulebook
- THEN Core reuses or precisely extends the existing source of truth
- AND it does not add a second broad skill with conflicting defaults
- AND the curation decision is documented in the change or pull request

#### Scenario: An upstream tool conflicts with Core's stack

- WHEN upstream guidance assumes a package manager, framework, or runtime that
  Core does not use
- THEN that guidance is excluded or reduced to genuinely portable advice
- AND it does not add commands, configuration, lockfiles, or dependencies that
  conflict with Core's standard stack

#### Scenario: A curated skill is promoted

- WHEN a reviewed topic fills a real catalog gap
- THEN the canonical skill has narrow task triggers, Core precedence, workflow
  steps, a checklist, and progressive disclosure
- AND provenance records its upstream repository, path, reviewed commit SHA,
  license, Core adaptations, and refresh workflow
- AND generated runtime mirrors are refreshed through the canonical sync

#### Scenario: An agent searches for animation opportunities

- WHEN an agent is asked where a Core interface would benefit from new motion
- THEN it applies frequency, purpose, user-value, existing-ownership,
  performance, accessibility, and reduced-motion gates
- AND it recommends only a bounded set of evidence-backed opportunities using
  Core's existing tokens, primitives, and route-transition ownership
- AND it reports concrete candidates that should remain static
- AND a no-motion verdict is treated as a successful outcome

#### Scenario: A skill may later be used by Eve

- WHEN a canonical filesystem skill is suitable for future Eve subagents
- THEN it remains runtime-neutral and usable by interactive agents
- AND catalog promotion alone does not add Eve wiring, orchestration, prompts,
  dependencies, or behavior changes

### Requirement: Canonical Skill Packs MUST Converge Across Agent Runtimes

Third-party skill packs promoted into durable Core guidance MUST have one
canonical repo-owned tree and deterministic runtime mirrors.

#### Scenario: A third-party skill pack is promoted

- WHEN skills from an external repository become durable Core guidance
- THEN every routed skill lives under `docs/ai/skills/<skill-name>/`
- AND its source repository, source path, reviewed commit SHA, license, and
  refresh workflow are documented
- AND repo-specific precedence or compatibility changes are explicit overlays
  rather than undocumented installer mutations

#### Scenario: Runtime mirrors are refreshed

- WHEN canonical skills are synchronized for Codex, Cursor, and Claude Code
- THEN `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` contain the
  same canonical files and required companion assets
- AND files deleted or renamed in the canonical source do not remain stale in
  a runtime mirror
- AND runtime-only auxiliary assets not owned by the canonical tree are not
  deleted accidentally
- AND `CLAUDE.md` continues to import the shared `AGENTS.md` router rather than
  duplicating it

### Requirement: High-Rigor Interrogation Skills MUST Be Narrowly Scoped

Agent skills that pause implementation for deep user interrogation MUST remain
explicitly scoped and subordinate to Core's source-of-truth and mutation rules.

#### Scenario: A deep unknown-discovery workflow is invoked

- WHEN the user explicitly invokes `grill-for-unknowns` or requests its
  map-vs-territory, blindspot, unknown-known prototype, or launch-packet
  workflow
- THEN the agent inspects current docs/source/tests before asking factual
  questions
- AND it asks material decisions one at a time with recommended defaults
- AND it keeps durable artifacts within OpenSpec, canonical domain-modeling
  formats, and the user's authorized write scope

#### Scenario: Ordinary implementation is requested

- WHEN a task is complex but the user has not selected the deep
  unknown-discovery workflow and material hidden-assumption risk is not the
  requested focus
- THEN `grill-for-unknowns` does not interrupt authorized implementation
- AND lighter grilling, research, planning, or execution routes remain
  available according to `AGENTS.md`

#### Scenario: The skill is refreshed across clients

- WHEN the external skill is promoted or refreshed
- THEN its complete canonical tree, source commit, license, lineage, and Core
  overlay are preserved
- AND Codex, Cursor, and Claude Code receive the same canonical files and
  explicit-only routing intent

### Requirement: Authorized Work Continues to the Requested Boundary

Repository coding agents SHALL complete the requested outcome, including
relevant verification and fixes for failures caused by the change, within
the authorized scope. They SHALL continue routine, reversible local work
without requesting approval again when that work is already authorized.
This requirement MUST NOT expand task scope or execution permissions.

#### Scenario: Authorized implementation requires follow-through

- WHEN the user authorizes implementation of a change
- THEN the agent completes the requested outcome and relevant verification
- AND it fixes failures caused by that change within the authorized scope
- AND it preserves required repository gates, including required repeat checks
- AND it does not stop for approval at each routine, reversible local step

#### Scenario: A requested or authorization boundary is reached

- WHEN the user requested a planning or review boundary, or further action
  requires new authorization
- THEN the agent stops at that boundary
- AND completing the task does not authorize work beyond that boundary

#### Scenario: A blocker requires user input

- WHEN a genuine blocker cannot be resolved without user input
- THEN the agent reports the blocker and the input needed
- AND it stops the dependent action without claiming the task is complete

### Requirement: OpenSpec CLI Is Locally Pinned

The repository SHALL depend on an exact `@fission-ai/openspec` version and MUST
invoke OpenSpec only through the repository-pinned local CLI. Live instructions,
scripts, CI, and active workflow commands MUST NOT use a moving latest npm
dist-tag for that package.

#### Scenario: An agent needs the OpenSpec version

- WHEN an agent or CI needs to know which OpenSpec release Core uses
- THEN it runs `bun run openspec:version`
- AND the printed version matches the exact `package.json` pin

#### Scenario: A live instruction would fetch latest

- WHEN a current instruction, numbered command, or CI job would invoke OpenSpec
- THEN it uses `bun run openspec --`
- AND it does not use a moving latest npm dist-tag for that package

### Requirement: OpenSpec Workflows Are The Seven Selected Skills

Core SHALL support Explore, Propose, Update, Apply, Verify, Sync, and Archive
as canonical skills under `docs/ai/skills/`. Core MUST NOT enable or promote
New, Continue, Fast-forward, Bulk archive, Onboard, Stores, or a custom
OpenSpec schema in this instruction system.

#### Scenario: An agent starts non-trivial OpenSpec work

- WHEN requirements are unclear
- THEN it uses Explore
- AND when intent is clear it uses Propose with an explicit change ID

#### Scenario: A rejected workflow is requested

- WHEN an agent is tempted to use Stores, a custom schema, or generated native
  OpenSpec Cursor/Claude commands
- THEN it does not add them
- AND it keeps Core numbered commands as the wrappers around the seven skills

### Requirement: Intended Behavior And Current Reality Stay Distinct

Agents SHALL distinguish intended behavior from current reality. An approved
active OpenSpec change governs intended modifications on its branch. It MUST
NOT be treated as proof that the behavior has shipped. Material contradictions
among high-authority sources MUST be surfaced rather than silently resolved.

#### Scenario: An active change disagrees with production code

- GIVEN an approved active change describes a delta
- WHEN an agent inspects current tests, migrations, or runtime evidence
- THEN it treats the change as intended work on that branch
- AND it does not claim the behavior has shipped

#### Scenario: High-authority sources conflict

- WHEN an explicit human decision, an accepted ADR, and current code disagree
  on a material safety, data, or authorization fact
- THEN the agent stops that unsafe action
- AND it reports the contradiction for reconciliation

### Requirement: OpenSpec Validation Is Strict For Current Specs And Active Changes

Current specs and active changes SHALL pass `openspec validate --all --strict`.
CI SHALL run that check after skill-mirror verification and before expensive
lint, build, and test stages. Historical archives SHALL be audited honestly
without a blanket allow-failure.

#### Scenario: CI preflight runs

- WHEN `ci-preflight` executes
- THEN `openspec-validate` runs after `skills-verify` and the Phase 25 and
  Phase 27 projection gates, before lint, build, and test stages
- AND it uses the locally pinned package after `bun install --frozen-lockfile`

### Requirement: Archive Follows Accepted Repository Reality

Agents SHALL archive an OpenSpec change only after implementation has become
accepted repository reality. Local green tests on a feature branch MUST NOT
archive the change. Incomplete or merely planned work MUST NOT be archived.

#### Scenario: Implementation is ready but unmerged

- WHEN focused tests pass on a feature branch
- THEN the agent may open or update a pull request
- AND it leaves the change active

#### Scenario: The implementation has merged

- WHEN the change's implementation is accepted on the integration branch
- THEN the agent re-validates, verifies, syncs if needed, and archives
- AND archive validation of that archive passes

### Requirement: Numbered Commands Wrap OpenSpec Workflows

`/1-start-project`, `/2-implement-project`, `/3-commit-project`, and
`/4-close-project` SHALL remain available as lightweight wrappers around
current OpenSpec behavior. `/2-implement-project` SHALL remain planning
despite its name. `/4-close-project` SHALL apply through TDD and MUST NOT
auto-archive unmerged work.

#### Scenario: Start-project finds unclear requirements

- WHEN `/1-start-project` runs and requirements are unclear
- THEN it uses Explore rather than inventing a partial artifact set

#### Scenario: Close-project finishes an unmerged implementation

- WHEN `/4-close-project` has applied, tested, and prepared a pull request
- THEN it leaves the change active until merge

### Requirement: Product Eve Remains Read-Only For OpenSpec

Product-runtime Eve MUST remain separate from coding-agent OpenSpec skills.
The OpenSpec Guardian SHALL stay permanently read-only: no file writes, no
shell mutation, no sync, and no archive. This modernization MUST NOT upgrade
Eve or grant live autonomy.

#### Scenario: Guardian reviews a change

- WHEN the Guardian is invoked for a material product or data change
- THEN it reads OpenSpec and repository evidence
- AND it does not write files or run mutating shell commands

### Requirement: ReUI Agent Workflows MUST Preserve Pro Access And Shared UI Ownership

The repository SHALL maintain the complete official ReUI agent skill as a
canonical Core-adapted tree and publish it through the established skill mirror
workflow. ReUI MCP configurations SHALL authenticate through runtime credentials
using supported client syntax and SHALL select exact `base-maia` context. No
credential value SHALL be committed or printed by repository maintenance tools.

#### Scenario: An agent uses ReUI Pro

- WHEN an agent discovers or composes ReUI UI using the configured Pro license
- THEN its MCP requests authenticate and receive the plan's available blocks
- AND its component APIs and registry output use Base UI with exact `base-maia`
- AND additions belong in `packages/ui` with apps consuming `@asym/ui`
- AND existing shared primitives, tokens, data boundaries, and table ownership
  remain controlling

#### Scenario: An agent needs current ReUI documentation

- WHEN an agent implements or adapts ReUI components
- THEN it uses current MCP component APIs and documentation indexed by ReUI's
  `llms.txt`, preferring the matching Base UI Markdown pages
- AND it reconciles the documentation against installed source and manifests
- AND it honors locked results, weak matches, and plan-specific unlock fields

#### Scenario: A maintainer verifies readiness

- WHEN a maintainer runs the focused ReUI readiness command
- THEN the command checks repository skill and configuration readiness without
  writing product source or modifying client configuration
- AND explicit live verification requires a runtime credential and verifies
  authenticated MCP, Base UI APIs, Pro discovery, and premium registry access
- AND missing credentials, malformed responses, or configuration drift produce
  a failing result without exposing secrets

#### Scenario: A maintainer refreshes the ReUI skill

- WHEN a maintainer requests the focused ReUI skill refresh
- THEN the official shared skill bundle is staged for review without executing
  an upstream installer or changing canonical files, MCP settings, or mirrors
- AND unsafe file paths or filesystem entries are rejected
- AND Core overlays and provenance are retained for reconciliation
- AND reviewed canonical updates use the existing sync and verify workflow

### Requirement: Architecture Skill Remaps Preserve Callable And Ownership Boundaries

Core architecture skill guidance MUST distinguish server reads from browser
hooks and callable client mutation boundaries. It MUST retain business reads,
mutations and server cache identities in the owning package, use published
contracts in Core examples, and label conflicting upstream placement as vendor
illustration. A local remap MUST be independently guarded rather than inheriting
proof from an unrelated later annotation.

#### Scenario: A client feature performs a privileged mutation

- WHEN an agent follows the Core architecture workflow
- THEN the client uses an approved hook or API route, or an authenticated Server
  Action adapter that validates input and delegates to the server owner
- AND an ordinary server export is not presented as directly client-callable

#### Scenario: A server owner renders a browser table

- WHEN a feature combines a server read and an approved browser hook
- THEN the read uses the published server contract and the hook runs in a client
  leaf without converting the server owner into a client module

#### Scenario: Server and browser caches describe related data

- WHEN the skill explains cache coordination
- THEN server tags and invalidation retain API ownership while browser keys stay
  with their client owner
- AND the API package does not import an app feature or duplicate tag strings

#### Scenario: A Core API example drifts from package exports

- WHEN an example imports a root or subpath absent from the actual export map
- THEN focused contract verification fails before the skill is accepted

#### Scenario: One local remap is removed during refresh

- WHEN a workflow, invariant or checklist annotation is removed while later
  annotations remain intact
- THEN its own bounded assertion fails
- AND upstream pins and provenance remain separate from the Core adaptation

### Requirement: Architecture References Preserve Versioned Behavior And Reviewed Refresh

Core reference recipes MUST use installed-version API contracts, distinguish router refresh from server-cache invalidation, and state cache/metadata prerequisites.

Every clause in `openspec/contracts/agent-instruction-system.md#contract-0f4e67ea7892845b5587` MUST apply without exception.

#### Scenario: Optimistic work succeeds or fails

- WHEN the reference mutation transition completes
- THEN success retains the canonical returned value and failure returns to the
  unchanged authoritative base with accessible error feedback
- AND a successful payload-bearing action cannot omit its declared data

#### Scenario: Navigation pending feedback is rendered

- WHEN a Link descendant consumes the pending hook result
- THEN the application explicitly adds or removes its pending attribute
- AND the hook is not described as mutating the DOM automatically

#### Scenario: Reviewed upstream content is refreshed

- WHEN a maintainer prepares a refreshed skill source
- THEN its exact commit and raw tree are verified before canonical replacement
- AND Core adaptations, source provenance and required Codex/Cursor/Claude
  mirrors survive validation without a floating installer or source reference

#### Scenario: A documented route mutation fails or remains pending

- WHEN the Core route example receives an HTTP failure or a rejected request
- THEN it preserves the confirmed state and shows accessible error feedback
- AND success is confirmed only after the response accepts the write

#### Scenario: A server page composes a recoverable error boundary

- WHEN the architecture reference uses the installed catchError API
- THEN the fallback and boundary are defined in a client module
- AND the Server Component page imports that boundary around its section
