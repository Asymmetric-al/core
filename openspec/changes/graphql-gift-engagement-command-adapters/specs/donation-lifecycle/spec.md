# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Gift Begin Goes Through The Gift Intake Begin Command

Every Gift begin MUST go through the Gift Intake Begin Command in `@asym/api`.
HTTP donate, HTTP donations, and GraphQL `createDonation` MUST call that
command. They MUST NOT call `begin_donation_saga` directly.

The command MUST start the Donation Saga transaction and return donation id,
outbox id, and whether the begin was replayed. It MUST NOT process the outbox
and MUST NOT create a Stripe PaymentIntent.

Amount units MUST stay adapter-owned. HTTP donate MAY convert dollars to cents
before the command. GraphQL and HTTP donations MUST pass the stored integer
amount as cents without a second conversion.

GraphQL `createDonation` MUST remain enqueue-only. HTTP donate and HTTP
donations MUST still attempt immediate outbox processing after a successful
begin. Guest Giving fee policy and cover-fees MUST NOT apply to GraphQL
`createDonation` unless a later accepted change says otherwise.

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
