# Delta for Agent Instruction System

## ADDED Requirements

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
