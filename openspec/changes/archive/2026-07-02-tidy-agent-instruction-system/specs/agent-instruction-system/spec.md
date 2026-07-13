# Delta for Agent Instruction System

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: OpenSpec Is First-Class for Project Work

**Reason**: Near-duplicate of `OpenSpec Owns Durable Project Intent` created
when two changes were archived into the same spec.
**Migration**: Its routing-layer scenario detail is merged into
`OpenSpec Owns Durable Project Intent`.

### Requirement: Workspace Capability Layers Are Conditional

**Reason**: Near-duplicate of `Conditional Capability Layers Stay Subordinate`
created when two changes were archived into the same spec.
**Migration**: Its instruction-wording scenario is merged into
`Conditional Capability Layers Stay Subordinate`.
