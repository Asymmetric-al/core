## Purpose

Maintain reproducible OpenSpec tooling and verifiable contract preservation
through updates, projection generation, synchronization, and lifecycle review.

## ADDED Requirements

### Requirement: Tooling updates preserve the selected repository workflow

The repository MUST use a reviewed exact CLI release and matching imported
workflows. Refreshing them MUST preserve Core-owned overlays, the required
local wrapper permissions, provenance, and selected workflow boundaries.

#### Scenario: Upstream skills are refreshed

- **WHEN** the reviewed upstream skills are refreshed through the repository CLI
- **THEN** the canonical skills and generated mirrors retain the Core overlay
- **AND** their declared permissions permit the required local wrapper
- **AND** unrelated skills and repository instructions remain unchanged

### Requirement: Validation preserves complete contract meaning

Maintenance MUST retain every existing binding clause, requirement identity,
scenario, acceptance identifier, and declared authoring source. Current strict
validation MUST remain enabled. A presentation change MUST provide a verifiable
trace to the complete preserved contract without claiming new product behavior.

#### Scenario: A requirement is adapted to current validation

- **WHEN** its representation changes for tooling compatibility
- **THEN** its complete normative meaning and every existing scenario remain
- **AND** source-owned projections are regenerated from their declared owners
- **AND** unresolved owner and qualification gates remain explicit

### Requirement: Delta verification detects contract or ownership loss

Delta verification MUST remain non-mutating and reject incompatible operations
or material merger warnings. Source-owned projections MUST retain readable
Purpose and binding source-routing guidance in the resulting durable view.

#### Scenario: A generated delta loses ownership text during merging

- **WHEN** its merge result would discard binding source-routing guidance
- **THEN** the verification reports the affected change and capability
- **AND** it does not write either input or authorize archive

### Requirement: Lifecycle reconciliation follows accepted evidence

Each completed-change candidate MUST be reconciled individually against current
implementation, merge ancestry, later amendments and applicable acceptance.
Only eligible accepted work MAY be synchronized and archived; pending work MUST
retain its actual outstanding gates and recorded delivery facts.

#### Scenario: A fully checked change has merged implementation

- **WHEN** its lifecycle disposition is reviewed
- **THEN** the record identifies the implementation and merge evidence
- **AND** later amendments are preserved before its effective contract is synced
- **AND** archive occurs only after its remaining applicable gates are satisfied

#### Scenario: A documentation package has merged without runtime qualification

- **WHEN** the package contains unchecked implementation or qualification work
- **THEN** that work remains active with its owner boundaries and gates
- **AND** publication is not reported as feature activation
