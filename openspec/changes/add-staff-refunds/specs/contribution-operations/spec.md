# Delta for Contribution Operations

## ADDED Requirements

### Requirement: Staff Can Initiate Contribution Refunds

Authorized finance staff MUST be able to initiate a full or partial refund of a
Stripe-backed contribution from Mission Control, executed server-side through
Stripe. The action MUST require `finance:manage_contributions`, a reason, and
server-side confirmation, and MUST record the provider outcome truthfully
without implying final refund completion before provider or webhook-confirmed
truth supports it.

Bulk refunds MUST run per-record through the single-action contribution action
contract with preview and confirmation, as a background batch, and each
per-record refund MUST enforce the same high-risk policy as a single refund.
Trust-sensitive Stripe identifiers and credentials MUST stay behind server-side
boundaries.

#### Scenario: Authorized staff refunds a gift

- GIVEN a finance staff user with `finance:manage_contributions` requests a
  partial refund with a reason and confirmation
- WHEN the server executes the refund through Stripe
- THEN the platform records the provider outcome and pending/final state
  truthfully and reflects it across donor and staff surfaces
- AND donor-visible history does not overstate finality before the operational
  record supports it

#### Scenario: Unauthorized staff attempts a refund

- GIVEN a staff user without `finance:manage_contributions`
- WHEN they attempt to initiate a refund
- THEN the server rejects the action and no refund is executed
- AND UI hiding is not treated as sufficient protection
