# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Gift Begin Goes Through The Gift Intake Begin Command

Every Gift begin MUST go through the Gift Intake Begin Command in `@asym/api`.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-9df606f6d099db7fa0c2` MUST apply without exception.

#### Scenario: GraphQL and HTTP start the same Gift

- GIVEN an authenticated donor supplies a valid missionary, amount, currency,
  and idempotency key
- WHEN GraphQL `createDonation` or HTTP donate/donations begins the Gift
- THEN the Gift Intake Begin Command calls `begin_donation_saga` once for that
  key
- AND retrying with the same key returns the existing donation and outbox ids
- AND GraphQL does not process the outbox or create a PaymentIntent in that
  request
- AND HTTP donate/donations may process the outbox immediately after begin

#### Scenario: GraphQL amount units stay adapter-owned

- GIVEN GraphQL `createDonation` receives `input.amount` as stored cents
- WHEN the adapter calls the Gift Intake Begin Command
- THEN it passes that integer as `amountCents` without multiplying by 100
- AND HTTP donate still converts dollar amounts to cents in its own adapter
