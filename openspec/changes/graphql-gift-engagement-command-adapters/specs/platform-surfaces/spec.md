# Delta for Platform Surfaces

## ADDED Requirements

### Requirement: GraphQL Is A Shared-Record Surface Adapter

GraphQL MUST be a shared-record surface adapter for records that already have a
conceptual home on donor, missionary, or staff surfaces. It MUST NOT become a
second product surface and MUST NOT own a second Gift or Ministry Update
Engagement write path.

Gift begin and Ministry Update like, prayer, and comment mutations MUST go
through Core command modules in `@asym/api`. GraphQL MUST keep existing
mutation names and payload shapes. GraphQL MUST NOT add fire mutations. GraphQL
MUST NOT fold comments onto the HTTP comments POST read-only demo no-op.

The GraphQL gateway MAY continue to select and map records for queries. That
gateway exception MUST NOT authorize Gift or engagement mutations to call
Postgres RPCs directly.

#### Scenario: A GraphQL Gift uses the same begin command as HTTP

- WHEN GraphQL `createDonation` starts a Gift
- THEN it calls the Gift Intake Begin Command
- AND it does not name `begin_donation_saga` in the Yoga handler
- AND HTTP donate and donations use the same command

#### Scenario: A GraphQL Ministry Update reaction uses the shared command

- WHEN GraphQL like, unlike, pray, or unpray runs
- THEN it calls the Ministry Update Reaction Command
- AND HTTP like, prayer, and fire adapters use the same command
- AND GraphQL does not expose fire

#### Scenario: GraphQL comments stay a real write

- WHEN GraphQL `addComment` runs
- THEN it calls the Ministry Update Comment Command
- AND it selects and maps the comment after the command returns
- AND HTTP comments POST remains a read-only demo no-op
