## Purpose

Keep Core reproducible, supported and secure through complete dependency
ownership, verified compatibility, preserved data contracts and qualified releases.

## ADDED Requirements

### Requirement: Every modernization finding has an evidenced disposition

The repository MUST inventory direct and nested software, imported artifacts,
executable pins, protocols and skills. Each finding SHALL identify its owner,
upstream source, tested target and migration evidence, and close only as upgraded,
replaced, removed or a maintained compatibility dependency. A historical hold
MUST NOT count as qualification.

#### Scenario: A current parent requires an older maintained dependency

- **WHEN** an upgrade retains an older nested major required by its current parent
- **THEN** its supported upstream justification, package boundary, owner and
  compatibility evidence are recorded
- **AND** it is not incorrectly forced to an incompatible latest major

### Requirement: Supported runtime and executable versions are reproducible

Clean installation and setup SHALL enforce the approved runtime family and
minimum tested patch. CI, operational CLIs, MCP launchers and imported artifacts
MUST use reviewed reproducible versions with checks that detect drift.

#### Scenario: A developer uses an unqualified Node major

- **WHEN** setup or preflight runs on an older or newer unqualified Node major
- **THEN** it fails before installation or verification work
- **AND** it identifies the approved runtime without exposing configuration secrets

### Requirement: Security qualification covers the full dependency graph

Qualification MUST reconcile fresh automated results with official upstream
advisories. No reachable vulnerability SHALL remain. Every exception MUST record
the advisory, exact version and dependency path, concrete unreachability evidence,
owner and recheck condition; a version or usage change SHALL invalidate it.

#### Scenario: A new advisory is missing from the automated database

- **WHEN** the upstream framework publishes a relevant security release
- **THEN** release qualification includes that advisory independently of audit output
- **AND** the affected entrypoints are patched and behavior is verified

### Requirement: Migration checkpoints preserve existing product contracts

Each family checkpoint MUST preserve public routes, tenant and Legal Entity
isolation, authorization, financial correctness, document formats, legal wording,
and the shared design system. Schema changes MUST use committed migrations and
prove preservation, restore and rollback in an isolated representative environment.
Provider execution MUST retain governance across retries and child workflows.

#### Scenario: A request serialization cutover has unresolved submitted payments

- **WHEN** new command admission is paused and old workers and webhooks drain
- **THEN** serialization switches only after zero unresolved submitted requests is proven
- **AND** cutover aborts if reconciliation cannot establish that condition

#### Scenario: Internal CMS media storage changes

- **WHEN** preserved media data migrates to the supported internal representation
- **THEN** public media responses and references retain their existing contract
- **AND** tenant-denial checks and restored records still pass

### Requirement: Delivery includes reviewed previews and production preparation

A checkpoint SHALL close only after current-base review reconciliation,
current-head required CI, functioning deployed previews and merge readback.
The combined release MUST pass a frozen clean installation and all applicable
repository, browser, data, payment, AI and document gates. Production execution
MUST remain outside modernization delivery. Active documentation SHALL describe
delivered behavior; accepted historical contracts require explicit supersession.

#### Scenario: All family changes are ready for release

- **WHEN** modernization is marked complete
- **THEN** every ledger item has evidence and the combined deployed previews pass
- **AND** an immutable release package records migration order, backups and restore
  proof, drain and write-pause checks, rollback boundaries, expected reauthentication
  and post-release monitoring
