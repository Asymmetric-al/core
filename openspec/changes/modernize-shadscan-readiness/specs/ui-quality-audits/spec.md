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

#### Scenario: A task deletion is requested

- WHEN a user chooses to delete a missionary donor task
- THEN a named confirmation identifies the task and starts focus on Cancel
- AND cancellation preserves the task and restores a usable focus target
- AND confirmation prevents duplicate requests and announces pending or failure
- AND existing API permission and tenant ownership checks remain authoritative

#### Scenario: A visible action lacks implemented behavior

- WHEN an action or destination has no implemented product contract
- THEN it is hidden until its actual permitted behavior or destination exists
- AND functioning reactions, comments, bookmarks and navigation remain available
- AND available feed filters expose their active state and match owned data types

#### Scenario: Suggestions are shown inside a multiline editor

- WHEN keyboard navigation changes the active suggestion
- THEN the actual named editor owns focus and its active-descendant relationship
- AND the active option remains visible without moving document focus
- AND cleanup preserves attributes now owned by another feature

#### Scenario: A contribution calendar date is displayed

- WHEN the API supplies a calendar gift date to the detail sheet, mobile card or desktop column
- THEN that calendar day is preserved across visitor timezones
- AND an absent-gift-date timestamp fallback retains its timezone projection
- AND server rendering and hydration use the existing stable locale contract
- AND financial source facts and authorization behavior remain unchanged

### Requirement: Upstream Component Review Uses Complete Modern CLI Evidence

Core SHALL inspect installed shared components with a tested pinned shadcn CLI
and its supported read-only preview commands. It SHALL retain explicitly
reviewed local customizations and fail on missing inventory, incomplete previews,
unreviewed differences or changed review proof. Deprecated CLI output SHALL NOT
establish upstream component parity.

#### Scenario: A component drift review is executed

- WHEN CI compares the installed shared UI with its reviewed upstream baseline
- THEN every installed component and every affected preview file is accounted for
- AND local and upstream differences match their reviewed evidence
- AND the result describes reviewed differences rather than claiming byte parity
- AND no component, theme, preset or primitive base is overwritten

### Requirement: Browser Run Evidence Identifies Each Execution Stage

Core SHALL keep authentication preflight, production and CMS browser evidence in
separate stage paths. It SHALL expose incremental progress and distinguish
completed results from interrupted runs. A prior successful stage SHALL NOT be
reported as the result of a later incomplete stage.

#### Scenario: A production browser run is interrupted

- WHEN execution stops before final reports are written
- THEN the available progress artifact identifies an incomplete production run
- AND authentication preflight results remain separate
- AND evidence does not contain test input secrets or private error details
