## ADDED Requirements

### Requirement: Workspace UI Audits Are Reproducible And Complete

Core SHALL use the same exactly locked Shadscan engine and report contract for
local hooks and CI. It SHALL require complete coverage of admin, donor and
missionary applications and report shared-library findings separately.

#### Scenario: A workspace audit is executed

- WHEN the local hook or CI executes the audit
- THEN the engine, ruleset, schema and application inventory are verified
- AND missing, truncated, partial or unassessed coverage fails the gate
- AND raw application and library results remain available for inspection

### Requirement: Each Application Has An Independent Score Floor

Core SHALL independently enforce each application's verified raw score floor.
An aggregate improvement SHALL NOT hide an individual application's regression.
Floors SHALL be captured after verified remediation and SHALL NOT be lowered
without explicit owner acceptance of that regression.

#### Scenario: One application regresses

- WHEN an application's raw score falls below its recorded floor
- THEN the shared gate fails even if the pooled score passes
- AND the report identifies the application, observed score and required floor

### Requirement: Audit Classifications Preserve Evidence

Core SHALL retain unmodified scanner statuses and scores. Scanner limitations
and product-policy differences SHALL identify exact scope and current source or
behavior evidence. A classification SHALL NOT silently accept unrelated or stale
evidence or exempt an entire rule based on one example.

#### Scenario: Classification evidence becomes stale

- WHEN a classified finding or its executable proof no longer matches
- THEN the gate rejects that classification or reports it as unreviewed
- AND the original scanner finding remains visible

### Requirement: UI Repairs Preserve Accessible Interaction And Product Intent

Confirmed UI defects SHALL be repaired using Core's shared Base UI/base-maia
system. Interactive controls SHALL have meaningful names and keyboard access;
material async feedback and validation errors SHALL expose usable relationships
and announcements. Generic scanner feature preferences SHALL NOT override
accepted theme, authorization, navigation or publication policy.

#### Scenario: A confirmed interaction defect is repaired

- WHEN controls, forms, overlays or async states change
- THEN focused tests prove names, relationships, pending behavior or announcements
- AND browser checks prove relevant keyboard, focus and responsive behavior
- AND shared ownership, forced-light policy and tenant authorization remain intact
