# Delta for Identity And Access

## ADDED Requirements

### Requirement: The Database Enforces The Tenant Boundary For Every Caller With A User Identity

The database MUST enforce the tenant boundary, independently of application checks, for every caller that carries a user identity.

Every clause in `openspec/contracts/identity-and-access.md#contract-d184265e6097d92d003d` MUST apply without exception.

#### Scenario: A server handler reads on the caller's token

- **GIVEN** a person holds a live staff membership in tenant A and none in tenant B
- **WHEN** a server handler reads a tenant table on that person's token with tenant B named as the active tenant
- **THEN** the database returns no row of tenant B
- **AND** the handler used the caller-token client, not the service key

#### Scenario: A person in two tenants names no tenant

- **GIVEN** a person holds live memberships in tenants A and B
- **WHEN** a read on that person's token names no active tenant
- **THEN** the database returns no row of either tenant

#### Scenario: A staff member calls a governed command directly

- **GIVEN** a staff member whose selected assignment lacks `contributions.run_refunds`
- **WHEN** they call the refund command through the Data API with a valid gift ID
- **THEN** the command refuses inside the database
- **AND** no refund, reservation, outbox or audit row is written

#### Scenario: A signed-in user calls a worker command

- **WHEN** a signed-in or anonymous caller invokes a worker command or publish fulfilment
- **THEN** the call is refused because only the service key may execute it
- **AND** no row changes

#### Scenario: An operator under a support grant tries to write

- **GIVEN** an operator holds a live support grant in tenant A and selects it
- **WHEN** they read a staff-wide table and then attempt an insert or a governed command in tenant A
- **THEN** the read is admitted and the write and the command are refused

#### Scenario: Payload's runtime reaches outside `cms`

- **GIVEN** the Payload runtime connects as its confined runtime role
- **WHEN** it attempts to read `public.donors` or to create a table
- **THEN** the database refuses both
- **AND** row isolation between tenants inside `cms` remains the responsibility of Payload's access functions, tested with two tenants
