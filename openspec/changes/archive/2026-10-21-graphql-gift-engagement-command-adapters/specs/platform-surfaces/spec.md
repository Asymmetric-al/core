# Delta for Platform Surfaces

## ADDED Requirements

### Requirement: GraphQL Is A Shared-Record Surface Adapter

GraphQL MUST be a shared-record surface adapter for records that already have a conceptual home on donor, missionary, or staff surfaces.

Every clause in `openspec/contracts/platform-surfaces.md#contract-e1ca9b06ec79371872aa` MUST apply without exception.

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
