## ADDED Requirements

### Requirement: Reviewed security audits preserve operating boundaries

Core SHALL publish the complete reviewed Cloudflare security-audit package
through its canonical source and all runtime mirrors. Guidance SHALL remain the
default. Full audit mode SHALL require an explicit audit or report request;
loading or refreshing MUST NOT initiate it. All upstream sandbox, read-only
source, artifact-isolation and independent-verification controls SHALL remain
intact.

#### Scenario: An agent answers a focused security question

- **WHEN** a request asks for focused security guidance
- **THEN** the skill uses relevant guidance without automatically running all phases
- **AND** installation or loading alone creates no audit output directory

#### Scenario: Required execution controls are unavailable

- **WHEN** an audit cannot enforce every upstream sandbox or artifact-promotion control
- **THEN** target-controlled code is not executed
- **AND** source-grounded blocked leads retain needs_validation with exact blockers

### Requirement: Reviewed audit refresh is immutable and transactional

The focused audit refresh SHALL fetch and verify the reviewed immutable commit,
complete companion inventory and ordinary-file source entries before canonical
publication. Canonical files and lock metadata SHALL share the existing
source-group rollback boundary. Imported lifecycle hooks, executables and tests
MUST NOT run as a side effect of refresh. Core overlays and notices SHALL survive
repeated refresh and stale companion files SHALL be removed from fully managed
runtime copies.

#### Scenario: A source pin or companion is incompatible

- **WHEN** the reviewed commit cannot be verified or a required companion is missing or symlinked
- **THEN** refresh fails before publication
- **AND** canonical content and existing lock metadata remain intact

#### Scenario: Publication fails after a canonical swap

- **WHEN** a side-file write fails during the audit refresh transaction
- **THEN** the previous canonical content and lock metadata are restored
- **AND** the invocation fails without claiming success

#### Scenario: The reviewed package contains executable files

- **WHEN** refresh stages vendor lifecycle hooks, validator scripts or tests
- **THEN** it copies or formats the reviewed files without executing them
- **AND** validator tests run only through an explicit verification step

### Requirement: Installed skill audits account for sources and exclusions

Maintenance SHALL account for every discoverable installed skill using a
canonical owner, verified ecosystem source or explicit retained/excluded status.
Source revisions, content hashes, adaptations and outcomes SHALL distinguish
updated/current content from snapshots and unresolved evidence. Refresh SHALL
preserve Core policies, stable aliases, compatible installed-version guidance
and opaque credentials without expanding product dependencies or the installed
upstream catalog.

#### Scenario: A source moves or disappears

- **WHEN** a reviewed source moves or removes an installed skill
- **THEN** a verified successor retains the installed compatibility identity
- **AND** removed-source snapshots remain explicitly recorded rather than silently substituted

#### Scenario: The owner excludes PDF pending license review

- **WHEN** the catalog refresh runs with the PDF exclusion
- **THEN** every PDF payload byte in all three runtime trees remains unchanged
- **AND** its status is excluded rather than claimed current or refreshed

#### Scenario: Ecosystem source content is restored before sync

- **WHEN** a targeted restore replaces a reviewed ecosystem source
- **THEN** persistent Core overlays, invocation boundaries and code-example repairs are reapplied
- **AND** final mirrors retain the verified complete source inventory
