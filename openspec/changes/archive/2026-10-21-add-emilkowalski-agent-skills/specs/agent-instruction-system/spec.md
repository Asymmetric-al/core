# Delta for Agent Instruction System

## ADDED Requirements

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

## MODIFIED Requirements

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
