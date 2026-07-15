# Delta for Agent Instruction System

## ADDED Requirements

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

#### Scenario: A skill may later be used by Eve

- WHEN a canonical filesystem skill is suitable for future Eve subagents
- THEN it remains runtime-neutral and usable by interactive agents
- AND catalog promotion alone does not add Eve wiring, orchestration, prompts,
  dependencies, or behavior changes
