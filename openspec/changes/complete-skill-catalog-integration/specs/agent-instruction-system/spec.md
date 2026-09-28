## ADDED Requirements

### Requirement: Skill refresh failures preserve recovery data

Skill refresh tooling SHALL retain complete recovery data until all canonical,
companion and lockfile changes in a source group have committed. It MUST NOT
discard an original tree while its backup is incomplete or overwrite an
unexpected staging destination.

#### Scenario: Original removal fails during a cross-device refresh

- **WHEN** removal of the canonical original fails after removing some files
- **THEN** the complete recovery copy restores the original content
- **AND** the invocation fails rather than claiming the new refresh succeeded

#### Scenario: A lockfile or companion write fails

- **WHEN** a source-group side-file write fails after canonical swaps
- **THEN** the previous lockfile bytes remain intact
- **AND** earlier companion writes and canonical swaps are rolled back

#### Scenario: A restore fails

- **WHEN** one restore cannot complete
- **THEN** every other applicable restore is still attempted
- **AND** exact recovery data for the failed restore remains available
- **AND** focused and broad invocations both fail without emitting success

### Requirement: Catalog refresh preserves operative Core instructions

Refresh and sync SHALL preserve explicit-only discovery, platform routing,
Core-owned adapters and existing shared UI ownership. An upstream greeting
MUST NOT stall an already concrete user request. Supersession SHALL require
proof of valid unique work in an actually integrated tree.

#### Scenario: A concrete task loads an applicable skill

- **WHEN** the user has already supplied a concrete task
- **THEN** the skill proceeds with that task instead of waiting after a greeting
- **AND** explicit-only or native-platform skills are not selected by unrelated generic triggers

#### Scenario: Ecosystem tooling is restored before sync

- **WHEN** a refreshed ecosystem source replaces its previous installed copy
- **THEN** sync restores the Git guardrail and wizard invocation boundary
- **AND** generated UI guidance uses the existing Core components and utilities

### Requirement: Eval output remains data in generated review pages

The eval viewer SHALL escape embedded JSON for an HTML script context without
changing the parsed data.

#### Scenario: An eval output contains a closing script tag

- **WHEN** a prompt or output contains a closing script tag followed by markup
- **THEN** it remains inside the embedded data value
- **AND** parsing that value returns the original prompt or output bytes

### Requirement: Skill assets preserve binary content

Generated skill mirrors MUST retain binary asset bytes through synchronization
and Git staging, including when mirror-wide text normalization is configured.

#### Scenario: Stage a binary skill asset

- **WHEN** a PNG, archive or font asset is synchronized into a skill mirror and
  staged through the repository's Git attributes
- **THEN** the staged bytes remain identical to the reviewed binary source
- **AND** text line-ending rules do not alter binary signatures or content

#### Scenario: An ecosystem refresh restores an obsolete menu example

- **WHEN** the shadcn-ui data-table example is reinstalled before sync
- **THEN** its label remains inside an explicit menu Group and triggers use
  Base UI render composition in every runtime mirror
- **AND** sync rejects unknown replacement drift before partially rewriting
  the ecosystem source
