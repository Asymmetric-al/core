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
regions, and runtime-mirror behavior while avoiding unrelated product changes.

#### Scenario: Instruction files change

- WHEN an instruction-system pull request changes AGENTS, Cursor, Copilot,
  OpenSpec, canonical skill, or generated agent-runtime files
- THEN verification confirms path accuracy, command accuracy, marker integrity,
  runtime parity, and the changed-files-only boundary
- AND no product code, product tests, or database files are modified
- AND focused instruction-system verifier tests MAY be added or updated to lock
  down sync, refresh, routing, or discovery behavior
