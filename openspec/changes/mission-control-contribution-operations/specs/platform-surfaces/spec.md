# Delta for Platform Surfaces And User Experience Intent

## ADDED Requirements

### Requirement: Mission Control Contribution Operations Has Gift-First And Donor-First Entry Points

Mission Control MUST support contribution operations from both a gift-first
Contribution Hub entry point and a donor-first CRM record entry point.

The Contribution Hub is the primary gift-first search and operations surface.
The donor CRM record is the primary donor-first contribution context. The two
surfaces MAY use different layouts, but they MUST show the same canonical gift
truth and use the same server-side contribution action layer.

#### Scenario: Staff investigates by gift context

- GIVEN a finance staff user searches by gift date, donor, provider id,
  payment method, receipt state, refund state, fund, missionary, or related
  contribution field
- WHEN the user opens a contribution from the Contribution Hub
- THEN Mission Control shows a complete contribution detail
- AND actions from that detail use the shared Contribution Operations Core

#### Scenario: Staff investigates by donor context

- GIVEN a staff user is already viewing a donor CRM record
- WHEN the user opens that donor's gift history
- THEN staff can perform contribution operations without leaving the donor
  context
- AND those actions use the same Contribution Operations Core as the
  Contribution Hub

### Requirement: Contribution Detail Shows Operational And Donor-Visible Consequences

Mission Control contribution detail MUST show staff the operational context of
a gift and the donor-visible consequence of meaningful corrections before the
user confirms a high-risk action.

The detail SHOULD include donor, gift, designation, payment, receipt, refund,
recurring, staged gift, CRM, audit, task, batch, provider, and donor-visible
state when available.

#### Scenario: Staff confirms a donor-visible correction

- GIVEN a staff user is about to confirm a correction that affects donor-facing
  history or official records
- WHEN the confirmation prompt is shown
- THEN the prompt summarizes the exact consequence in donor-visible terms
- AND the user can see which entry point initiated the action

### Requirement: Staff Contribution Search Supports Gift Operations

The Contribution Hub MUST support gift-first contribution search and filtering
for operational investigation. Search and filters SHOULD include donor name,
donor address/location, phone, gift date range, payment method, payment type,
safe last-four, status, receipt state, refund state, designation, fund,
missionary, project, batch, and other contribution fields when available.

Provider identifier search and filtering, including Stripe PaymentIntent,
charge, refund, webhook, and replay identifiers, MUST require
`contributions.use_provider_actions`. Staff without that permission MUST stay on
safe payment summaries, including safe last-four, brand, bank, status, and
contact-based search inputs.

#### Scenario: Staff has incomplete donor information

- GIVEN a donor contacts support with only phone, address, last four, or a
  Stripe identifier
- WHEN staff searches in the Contribution Hub
- THEN the product gives staff a gift-first path using safe contact and payment
  summary inputs without needing to leave Mission Control
- AND Stripe identifier lookup is available only when the staff user has
  `contributions.use_provider_actions`
