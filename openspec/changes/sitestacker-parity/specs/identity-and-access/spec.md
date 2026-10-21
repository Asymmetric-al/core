## ADDED Requirements

### Requirement: Capability Aggregation Uses One Validated Context

The current Phase 3/12 authorization target MUST resolve capabilities within one server-validated Tenant Authorization Context for the request or deferred operation.

Every clause in `openspec/contracts/identity-and-access.md#contract-af71db6fdfc6ab3f2f22` MUST apply without exception.

#### Scenario: Another active hat cannot widen this request

- **GIVEN** one human holds staff and donor assignments, including assignments in different Tenants
- **WHEN** a request resolves under one exact validated Active Tenant Assignment
- **THEN** only grant sources applicable to that selected context are aggregated before the floors
- **AND** adding or changing another membership cannot expose its resources through the current request

#### Scenario: A public context cannot become a private participant

- **GIVEN** a public context is bound to one Site and public resource
- **WHEN** a caller presents an internal grant or a private task identifier
- **THEN** the public context remains public-projection-only and the private operation is denied
- **AND** a participant capability requires its own accepted owner admission contract rather than widening the public context

#### Scenario: Deferred work re-proves the appropriate principal context

- **GIVEN** deferred member, NHI and operator operations were accepted under their respective source contexts
- **WHEN** the selected assignment, NHI owner capability or operator grant is no longer valid before execution
- **THEN** the affected operation is denied under current authority
- **AND** the guard validates the appropriate source context rather than accepting a stale union or requiring a fabricated member assignment for a service or operator

#### Scenario: The foundation remains independently scoped

- **GIVEN** the early Phase 3 registry and projection work is being qualified before the complete Phase 12 grant product
- **WHEN** its implementation and test scope are selected
- **THEN** it preserves the single-context contract and the early table deferral without depending on completion of the later whole phase
- **AND** passing those foundation tests does not claim the NHI, operator or participant integration is implemented or qualified

### Requirement: Phase 3 Role-scoped Access Uses One Projection Boundary

Phase 3 narrow-surface reads, writes and governed export MUST use one server-side, subtract-only projection decision under the validated context above.

Every clause in `openspec/contracts/identity-and-access.md#contract-1b5c3c717cb6ed5ee0a6` MUST apply without exception.

#### Scenario: An authorized donor reads and edits their own admitted profile

- **GIVEN** the current validated context permits the donor's own profile
- **WHEN** the donor reads or updates explicitly visible and editable fields
- **THEN** the server returns or accepts only those admitted fields
- **AND** a capability does not bypass field or record restrictions

#### Scenario: A missionary reads only their own split-gift support

- **GIVEN** a gift has three designation lines and the missionary is authorized for one
- **WHEN** the missionary reads support records
- **THEN** only the authorized line and relationship-scoped supporters are projected
- **AND** sibling designations and unrelated donors leave no row or count shadow

#### Scenario: Wrong scope and tampered fields are denied

- **GIVEN** an actor is authorized in Tenant A and Legal Entity A
- **WHEN** they request another Tenant's record, Entity B's financial record, or a non-editable field
- **THEN** the server denies the operation before read, mutation or egress
- **AND** an absent or invalid financial entity never falls back to a Tenant default

#### Scenario: Capability inspection cannot change grants

- **GIVEN** staff can inspect the Phase 3 registry and role bundles
- **WHEN** they view the foundation capability page or attempt to alter a bundle
- **THEN** the page shows the code registry read-only and rejects grant changes
- **AND** no capability table or Tenant override becomes an active authority source

### Requirement: Phase 3 Sensitive Fields Fail Closed On Every Surface

Unclassified fields, unknown or dotted field keys and unregistered surfaces MUST be omitted from donor, missionary, public and export projections.

Every clause in `openspec/contracts/identity-and-access.md#contract-ee56b32263df54a7d4e3` MUST apply without exception.

#### Scenario: The canonical receipt source is absent

- **GIVEN** the exact reviewed live inventory has no canonical receipt source
- **WHEN** any surface requests a reserved receipt field, including Mission Control
- **THEN** visibility, editability and exportability remain denied
- **AND** prototype aliases, permissive stored rows and donation fallbacks cannot enable access

#### Scenario: A new field remains blind outside Mission Control

- **GIVEN** a new column has no reviewed field policy
- **WHEN** authorized staff inspect it and narrow consumers request it
- **THEN** Mission Control can retain permitted operational inspection
- **AND** donor, missionary, public and export outputs omit the column

#### Scenario: An anonymous gift preserves totals without exposing identity

- **GIVEN** the source records donor-elected anonymity for a known donor
- **WHEN** a missionary or public consumer receives the admitted gift projection
- **THEN** the authorized support amount may remain visible while donor identity is masked
- **AND** authorized finance and official-facts consumers retain the legal donor

#### Scenario: Sensitive values cannot bypass classification

- **GIVEN** a caller requests processor identifiers or internal notes through a narrow surface or derived output
- **WHEN** projection runs even with an attempted policy widening
- **THEN** hard-locked identifiers and forbidden sensitive fields remain absent
- **AND** a serializer, cache or template cannot restore them

### Requirement: Phase 3 Projection Widening Requires A Distinct Human

Projection changes MUST be classified server-side as narrow, neutral or widen.

Every clause in `openspec/contracts/identity-and-access.md#contract-029692d18ea3835deea8` MUST apply without exception.

#### Scenario: A narrowing takes effect immediately

- **GIVEN** an authorized policy editor removes field visibility or exportability
- **WHEN** the server classifies and applies the change
- **THEN** subsequent projections enforce the restriction immediately
- **AND** an identifiers-only audit records the change

#### Scenario: A widening waits for independent approval

- **GIVEN** an authorized editor proposes new external visibility
- **WHEN** the request is saved and the requester tries to approve under another hat
- **THEN** it remains pending and self-approval is denied
- **AND** projections keep serving the old policy until a distinct authorized human approves

#### Scenario: An approved request has a stale base

- **GIVEN** a pending widening was reviewed against an earlier policy fingerprint
- **WHEN** the live policy changes before apply or another decision wins concurrently
- **THEN** the stale or conflicting apply is rejected without publishing
- **AND** ambiguity or an incomparable surface move cannot auto-publish as narrowing
