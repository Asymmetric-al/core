# Delta for Platform Boundaries

## ADDED Requirements

### Requirement: The CMS Domain Owns Publishing State And Core Release Tables Store It

The CMS domain MUST own publishing state, and the public form of that state MUST be stored in Core's release and head tables, which only Core's publish and withdraw commands write.

Every clause in `openspec/contracts/platform-boundaries.md#contract-9d7d16b2c9c7f88c67e9` MUST apply without exception.

#### Scenario: One publish activates several documents together

- **GIVEN** an editor with the publishing capability publishes a page and its Site's navigation in one action
- **WHEN** fulfilment commits
- **THEN** one immutable release row exists for each document and both heads move in the same transaction
- **AND** a visitor never sees the new page with the old navigation from that publish

#### Scenario: Fulfilment fails after the Payload version is saved

- **GIVEN** the request-publish command recorded an intent and the Payload version exists
- **WHEN** fulfilment fails before it commits
- **THEN** nothing new is public and the previous heads keep serving
- **AND** a retry keyed on the same intent completes the publish once

#### Scenario: A Payload status write is not publication

- **WHEN** a REST write changes a Payload document's status to published without the publish commands
- **THEN** no release row and no head changes
- **AND** the public website serves exactly what it served before

#### Scenario: A withdrawn page leaves at the next request

- **GIVEN** a page has a live head and a cached release body
- **WHEN** a person with the publishing capability withdraws it with a reason
- **THEN** the next public request for its path is refused with a 404 before any cached body is read

#### Scenario: A suspended tenant's pages are refused without republishing

- **GIVEN** a tenant with live heads is suspended
- **WHEN** a visitor requests one of its pages
- **THEN** admission refuses the request and no head is flipped
- **AND** reactivating the tenant serves the same releases again with no republishing

### Requirement: CMS Row Isolation Is A Stated Application-Enforced Exception

Row isolation between tenants inside the `cms` schema MUST be enforced by Payload's access functions through one tenant-scoped collection factory, an actor port with access checks on and a narrower service port, as a stated exception to the rule that the database enforces the tenant boundary for every caller with a user identity.

Every clause in `openspec/contracts/platform-boundaries.md#contract-1bd49ad17d8f27c783dc` MUST apply without exception.

#### Scenario: Staff of one tenant query another tenant's CMS rows

- **GIVEN** two tenants each have CMS pages
- **WHEN** a staff member of tenant A requests tenant B's page through Web Studio or Payload's REST routes
- **THEN** Payload's access functions return nothing of tenant B

#### Scenario: An unlisted access override is added

- **WHEN** a change adds a Payload call that overrides access and is not in the inventory
- **THEN** the CI inventory check fails
