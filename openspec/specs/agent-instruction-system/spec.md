# Agent Instruction System Specification

## Purpose

Define the durable workflow contract for AI agents working in this repository,
including how they gather project intent, choose authoritative context, use
conditional tool layers, and verify instruction-system changes safely.

## Requirements

### Requirement: OpenSpec Owns Durable Project Intent

The repository SHALL use OpenSpec as the durable source of truth for project
context and intended long-lived behavior.

#### Scenario: Non-trivial project work starts

- WHEN an agent begins non-trivial feature work, behavior changes, or multi-step
  planning
- THEN it reads `openspec/project.md`
- AND it reads the relevant specs in `openspec/specs/**`
- AND it reads any active change in `openspec/changes/**` before implementation

#### Scenario: Behavior is changing without an active change

- WHEN an agent needs to change durable behavior or workflow expectations
- THEN it creates or updates an OpenSpec change before major implementation

### Requirement: AGENTS Remains the Always-On Router

The repository SHALL keep `AGENTS.md` as the always-on routing layer for
project work, while preserving generated Next.js-managed content.

#### Scenario: Repo-wide routing is needed

- WHEN an agent needs to resolve instruction precedence or choose which local
  rulebook or skill to load
- THEN it uses `AGENTS.md` as the primary routing entrypoint
- AND it preserves the Next.js-managed block and compressed docs index

#### Scenario: Tool-specific helper files are present

- WHEN `cursor.md`, `.cursor/rules/*`, `.cursor/commands/*`,
  `.github/copilot-instructions.md`, or `.github/instructions/*.instructions.md`
  exist
- THEN they stay aligned with `AGENTS.md`
- AND they do not replace the root routing layer

### Requirement: Framework and Runtime Truth Beat Memory

The repository SHALL require agents to prefer version-matched framework docs and
runtime facts over model memory for fast-moving or runtime-sensitive work.

#### Scenario: Next.js work is requested

- WHEN an agent works on Next.js behavior, APIs, routing, caching, or runtime
  debugging
- THEN it reads the relevant docs in `node_modules/next/dist/docs/`
- OR it uses `.next-docs/` if local docs are unavailable

#### Scenario: Runtime state is needed

- WHEN a dev server or MCP runtime can answer a question about routes, errors,
  metadata, or logs
- THEN the agent checks MCP tools, lock files, or runtime logs before guessing

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
and local framework docs. They MAY improve workflow when available.

#### Scenario: Provider-specific workflow is needed

- WHEN a provider plugin or Codex capability is installed and directly relevant
- THEN the agent may use it for the provider-specific portion of the task
- BUT it still follows OpenSpec and repo-local guidance first

#### Scenario: A capability is unverified

- WHEN the agent cannot verify that a plugin, automation, skill, or MCP helper
  is available in the current workspace
- THEN it uses conditional wording
- AND it does not hard-wire the missing capability into repo instructions

### Requirement: Instruction-System Changes Are Verified Safely

Instruction-system changes SHALL validate paths, commands, and generated marker
regions, while avoiding unrelated code changes.

#### Scenario: Instruction files change

- WHEN an instruction-system pull request changes AGENTS, Cursor, Copilot, or
  OpenSpec files
- THEN verification confirms path accuracy, command accuracy, marker integrity,
  and the changed-files-only boundary
- AND no product code, tests, or database files are modified

### Requirement: OpenSpec Is First-Class for Project Work

The repository MUST make OpenSpec visible and actionable for non-trivial
project work, behavior changes, and multi-step planning.

#### Scenario: A project-scoped task begins

- WHEN an agent starts non-trivial project work
- THEN the routing layer points it to `openspec/project.md`
- AND it reads the relevant specs and active changes before implementation

#### Scenario: A behavior change has no active change

- WHEN durable behavior is being updated without an existing OpenSpec change
- THEN the workflow directs the agent to create or update a change before major
  implementation

### Requirement: Workspace Capability Layers Are Conditional

The repository MUST acknowledge provider plugins, Codex surfaces, and optional
MCP helpers without treating them as guaranteed repo-owned infrastructure.

#### Scenario: Conditional capability wording is needed

- WHEN repo instructions mention provider plugins, Codex surfaces, or optional
  MCP helpers
- THEN they use conditional wording unless the capability is repo-owned
- AND they keep repo-local instructions and OpenSpec above those layers in
  precedence

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
runtime Inngest integration.

#### Scenario: Agents prepare Inngest-related work

- WHEN an agent is asked to audit, design, or implement Inngest-related work
- THEN the routing layer points to the relevant official Inngest skill
- AND the agent uses `inngest-brownfield-audit` before changing existing app
  workflows
- AND `inngest-setup` is reserved for explicit product runtime adoption

#### Scenario: No app runtime integration exists

- WHEN the repo has no current product Inngest usage
- THEN adding official agent tooling MUST NOT add Inngest runtime packages,
  Inngest product app code, database migrations, or Inngest environment
  requirements
- AND any non-Inngest app, package, CI, or test hygiene bundled into the same PR
  MUST be documented separately from Inngest runtime adoption
