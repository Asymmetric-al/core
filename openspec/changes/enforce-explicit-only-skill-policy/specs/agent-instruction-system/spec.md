## ADDED Requirements

### Requirement: Explicit-Only Skills Carry Each Client's Native Policy

A skill that Core marks explicit-only SHALL be explicit-only in every
supported client. Each skill whose entrypoint sets
`disable-model-invocation: true` MUST also carry `agents/openai.yaml` with
`policy.allow_implicit_invocation: false`.

#### Scenario: A skill is marked explicit-only

- **WHEN** a skill's frontmatter sets `disable-model-invocation: true`
- **THEN** the canonical skill and the Codex runtime tree contain the native
  false policy
- **AND** repository verification fails while the native policy is missing

#### Scenario: An explicit-only skill is refreshed from upstream

- **WHEN** a managed skill is refreshed from an upstream that ships no Codex
  metadata
- **THEN** the refresh restores the native false policy
- **AND** it keeps any interface metadata that upstream does ship

#### Scenario: Upstream ships a linked metadata path

- **WHEN** a refreshed skill's `agents` directory or `agents/openai.yaml` is a
  symbolic link
- **THEN** the refresh fails before any policy write
- **AND** no file outside the staged skill is read or changed

#### Scenario: Upstream ships a linked skill directory

- **WHEN** the upstream skill directory itself is a symbolic link
- **THEN** the refresh fails before it copies that skill
- **AND** the canonical skill is left unchanged

#### Scenario: Upstream metadata has an ambiguous policy key

- **WHEN** upstream `agents/openai.yaml` has an inline, quoted or repeated
  top-level `policy` key, or repeats the `allow_implicit_invocation` key
- **THEN** the refresh fails and leaves the metadata for manual review
- **AND** it does not append a second policy mapping

#### Scenario: The explicit-only flag has an unrecognized spelling

- **WHEN** a refreshed skill's frontmatter sets `disable-model-invocation` to
  a value other than `true` or `false`, or sets the key more than once
- **THEN** the refresh fails and leaves the skill for manual review
- **AND** it does not treat the skill as model-invocable

#### Scenario: A model-invocable skill is refreshed

- **WHEN** a managed skill that Core leaves model-invocable is refreshed
- **THEN** the refresh adds no native explicit-only policy
