# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Give Without An Account Wall

A donor MUST be able to complete an online gift without first creating or
signing into an account. During checkout the server MUST collect the donor
information the payment method and organization policy require, create or
match the donor record by tenant and normalized email, and provision claimable
donor portal access (email verification or magic link) without forcing a
password step.

The platform MUST NOT reveal whether an email already belongs to an existing
donor, and the client MUST NOT choose the donor record: `donor_id` resolution
happens server-side before the donation saga runs.

#### Scenario: A first-time donor gives without signing in

- WHEN a visitor completes checkout with name, email, and payment details
- THEN the gift is recorded against a server-created or server-matched donor
  record
- AND the donor can later reach their giving history through verified email
  access without having created a password

#### Scenario: A guest email matches an existing donor

- WHEN a guest checkout email matches an existing donor in the tenant
- THEN the gift attaches to that donor record server-side
- AND the response does not disclose that the email already existed

### Requirement: Payment Collection Uses Stripe-Hosted UI

Checkout MUST collect card and bank details exclusively through Stripe-hosted
payment UI so that PAN, CVC, and bank credentials never reach Asym servers,
logs, databases, or app state. The donor-facing success view MUST render only
from server-confirmed donation state, never from client-side assumption.

#### Scenario: A donor enters card details

- WHEN checkout renders payment collection
- THEN card data tokenizes directly with Stripe through hosted elements
- AND no raw card or bank credential fields exist in the production checkout

### Requirement: Gift Anonymity Is A Per-Gift Visibility Preference

A donor or authorized staff member MUST be able to mark a gift anonymous to
missionary and public views. Anonymity flags MUST be stored on the
contribution itself (donor-level defaults only seed the per-gift choice), and
they MUST NOT hide the donor from finance, admins, receipts, reconciliation,
or audit records.

Redaction MUST be enforced server-side: missionary and public projections,
exports, notifications, and hydration payloads for an anonymous gift MUST
show "Anonymous donor" and MUST NOT carry donor identifiers. Changing
anonymity after a gift exists MUST require finance/admin permission and write
an audit entry.

#### Scenario: A donor gives anonymously to a missionary

- WHEN a donor checks the anonymity option at checkout
- THEN the missionary sees "Anonymous donor" with the gift amount and
  designation policy allows
- AND finance and admin views still show the full donor record
- AND the donor's own history shows the gift with its anonymity status

#### Scenario: Anonymity is changed after the gift

- WHEN staff changes a gift's anonymity flags
- THEN the change requires finance/admin permission
- AND the audit trail records actor, previous value, new value, and reason
