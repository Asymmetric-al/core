# Delta for Agent Instruction System

## ADDED Requirements

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
- THEN adding official agent tooling MUST NOT add runtime packages, app code,
  database migrations, or Inngest environment requirements
