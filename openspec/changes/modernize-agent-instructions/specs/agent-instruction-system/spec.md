# Delta for Agent Instruction System

## ADDED Requirements

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
