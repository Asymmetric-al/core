# Delta for Contribution Operations

## ADDED Requirements

### Requirement: Staff Can Initiate Contribution Refunds

Staff who hold the `contributions.run_refunds` capability MUST be able to
initiate a full or partial refund of a Stripe-backed contribution from Mission
Control, executed server-side through Stripe. That capability is held by finance
approver, admin, and super_admin. The action MUST require
`contributions.run_refunds`, a reason, and server-side confirmation, and MUST
record the provider outcome truthfully without implying final refund completion
before provider or webhook-confirmed truth supports it. Capability resolution
follows `identity-and-access`.

Bulk refunds MUST run per-record through the single-action contribution action
contract with preview and confirmation, as a background batch, and each
per-record refund MUST enforce the same high-risk policy and capability gate as
a single refund. Trust-sensitive Stripe identifiers and credentials MUST stay
behind server-side boundaries.

#### Scenario: Authorized staff refunds a gift

- GIVEN a staff user with `contributions.run_refunds` requests a partial refund
  with a reason and confirmation
- WHEN the server executes the refund through Stripe
- THEN the platform records the provider outcome and pending/final state
  truthfully and reflects it across donor and staff surfaces
- AND donor-visible history does not overstate finality before the operational
  record supports it

#### Scenario: Staff without the refund capability attempts a refund

- GIVEN a staff user whose resolved capabilities do not include
  `contributions.run_refunds`
- WHEN they attempt to initiate a refund
- THEN the server rejects the action and no refund is executed
- AND UI hiding is not treated as sufficient protection
