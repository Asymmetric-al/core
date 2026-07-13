# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Can Start Recurring Giving

The platform MUST let a donor initiate a recurring gift through checkout. The
donate contract MUST accept a recurring frequency, and the server MUST create a
Stripe subscription linked one-to-one with a new donor pledge, server-side and
idempotent, so retrying with the same idempotency key does not create a second
subscription or pledge. The client MUST NOT choose the pledge or subscription
identifier.

A newly created recurring gift MUST enter the existing subscription-reflection
path so invoice and subscription webhooks update its pledge state and progress.

#### Scenario: A donor starts a monthly gift

- WHEN a donor completes checkout with a recurring frequency
- THEN the server creates one Stripe subscription and one linked donor pledge
- AND retrying the same request with the same idempotency key creates no
  duplicate subscription or pledge

#### Scenario: A created recurring gift bills over time

- GIVEN a donor-created recurring gift exists as a subscription and pledge
- WHEN Stripe reports paid invoices over time
- THEN the pledge progress updates through the existing reflection path
- AND no manual one-time-donation loop is used to bill it
