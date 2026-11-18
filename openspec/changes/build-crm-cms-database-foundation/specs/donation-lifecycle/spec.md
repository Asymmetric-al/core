# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Gift Begin Goes Through The Gift Intake Begin Command From Its HTTP Adapters

Every Gift begin MUST go through the Gift Intake Begin Command in `@asym/api`, and HTTP donate and HTTP donations MUST be its only adapters.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-02282d9af70f7f0379a8` MUST apply without exception.

#### Scenario: HTTP adapters start the same Gift

- GIVEN an authenticated donor supplies a valid missionary, amount, currency,
  and idempotency key
- WHEN HTTP donate or HTTP donations begins the Gift
- THEN the Gift Intake Begin Command calls `begin_donation_saga` once for that
  key
- AND retrying with the same key returns the existing donation and outbox ids
- AND HTTP donate and donations may process the outbox immediately after begin

#### Scenario: HTTP amount units stay adapter-owned

- GIVEN HTTP donate receives a dollar amount and HTTP donations receives stored
  cents
- WHEN each adapter calls the Gift Intake Begin Command
- THEN HTTP donate converts dollars to cents once in its own adapter
- AND HTTP donations passes the integer cents without multiplying by 100

#### Scenario: No GraphQL adapter begins a Gift

- WHEN a client calls the retired donor GraphQL endpoint
- THEN no Gift begins and no `begin_donation_saga` call is made

## MODIFIED Requirements

### Requirement: Financial Execution Is Pinned To One Exact Legal Entity

A Legal Entity is the organization-owned legal issuer and financial reporting boundary for a gift.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-7839e3bf25aadc3dd152` MUST apply without exception.

#### Scenario: A tenant changes its default settlement account

- GIVEN an accepted gift is pinned to one Legal Entity and Settlement Account
  Binding
- WHEN the tenant later changes its default processor account
- THEN retries, events, refunds, and reconciliation for the accepted gift
  continue to use the frozen binding
- AND the new default applies only prospectively

#### Scenario: A cart crosses Legal Entities

- GIVEN separate payment groups have been built
- WHEN valid allocation lines belong to different Legal Entities
- THEN the server forms separate payment groups for those entities
- AND checkout discloses the charge count, amount, currency, and entity-facing
  meaning before authorization

#### Scenario: A cart crosses Legal Entities before payment groups exist

- GIVEN separate payment groups have not been built
- WHEN valid allocation lines name giving targets of two Legal Entities
- THEN gift intake refuses the checkout before any provider object is created
- AND checkout tells the donor that one gift covers one Legal Entity
- AND no intake row, provider object, or charge results

#### Scenario: A Legal Entity has no active binding

- GIVEN a giving target's Legal Entity has no active Settlement Account Binding
- WHEN a donor starts a gift to it
- THEN intake refuses before any provider object is created

### Requirement: Legacy Recurring Reflection Does Not Define The Target Topology

The legacy one-subscription-to-one-pledge reflection into `donor_pledges` is implementation evidence only and MUST NOT be extended as the target recurring creation, occurrence, agreement, or fulfillment model.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-26ae241de566fc7aabd3` MUST apply without exception.

#### Scenario: Recurring events arrive before the first recurring slice

- GIVEN the money kernel has replaced the legacy reflection and the first
  recurring slice has not shipped
- WHEN the provider reports a paid invoice or a subscription change
- THEN the event is stored and parked with no gift, pledge, or counter written
- AND no legacy failed-charge or payment counter is incremented

#### Scenario: A recurring invoice is paid

- GIVEN a monthly commitment created by the first recurring slice
- WHEN the provider confirms a paid invoice for one occurrence
- THEN exactly one gift is recorded under the lines of the term revision in
  force for that occurrence, with the invoice's payment reference
- AND counters shown to staff and donors are derived, and no new
  `donor_pledges` row is created

#### Scenario: A subscription is cancelled at the provider

- WHEN the provider reports the subscription as cancelled
- THEN the commitment records the end with its reason
- AND later out-of-order provider updates do not revive it

## REMOVED Requirements

### Requirement: Gift Begin Goes Through The Gift Intake Begin Command

**Reason**: Its GraphQL adapter clauses and scenarios describe the donor GraphQL
endpoint, which WP4b of the CRM, CMS and database plan retires. The retirement
rests on the plan section 15.1 default, taken under the implementation record
(D-07). OpenSpec cannot drop scenarios from a MODIFIED requirement, so the
requirement is replaced rather than modified.
**Migration**: "Gift Begin Goes Through The Gift Intake Begin Command From Its
HTTP Adapters", added by this change, keeps every clause of this requirement
except those about the GraphQL adapter, and its HTTP scenarios.
