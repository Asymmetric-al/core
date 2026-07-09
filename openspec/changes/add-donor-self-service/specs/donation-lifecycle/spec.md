# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Self-Manage Recurring Gifts

The donor portal MUST let a donor pause, resume, cancel, and change the amount
of their own recurring gifts. Each action MUST execute server-side against the
Stripe subscription, with the pledge record updated from provider-confirmed
state, and the portal MUST show an honest in-flight state until confirmation
arrives.

Self-service actions MUST be tenant-scoped and donor-owned only, and MUST NOT
bypass the subscription lifecycle with manual charge loops.

#### Scenario: A donor cancels a recurring gift

- WHEN a donor cancels their recurring gift in the portal
- THEN the server cancels the Stripe subscription
- AND the pledge becomes cancelled from provider-confirmed state
- AND staff views reflect the same truth without manual re-entry

#### Scenario: A donor changes their recurring amount

- WHEN a donor submits a new recurring amount
- THEN the server updates the subscription and shows a pending state until
  Stripe confirms
- AND the portal never displays the new amount as active before confirmation

### Requirement: Donors Manage Payment Methods Through Stripe

The donor portal MUST let a donor add, remove, and set a default payment
method through Stripe-managed flows. Raw card or bank credentials MUST never
reach Asym servers, and removing a method in use by an active recurring gift
MUST require choosing a replacement first.

#### Scenario: A donor replaces the card behind an active recurring gift

- WHEN a donor removes a payment method attached to an active pledge
- THEN the portal requires selecting or adding a replacement method first
- AND the subscription continues without a silent payment failure

### Requirement: Donors Receive Annual Giving Statements

The platform MUST generate annual giving statements covering a donor's settled,
receiptable gifts tied to their donor record, available from the donor portal
and delivered per tenant policy. Pending or in-flight gifts (for example
unsettled ACH or not-yet-collected recurring installments) MUST NOT appear
until settled. Unknown-donor gifts MUST NOT appear on any donor's statement
unless later matched, and statement language MUST be finance/legal reviewed
before production use.

Giving MUST produce the frozen, versioned statement context from canonical
donation/correction truth, including raw structured values and frozen official
display strings with locale/formatting version metadata. The document-production
capability MUST resolve the assigned immutable template and private artifact,
bind those frozen strings, and avoid recalculating or reformatting official
facts. The donor BFF MUST authorize the recipient, expose only the current
eligible artifact, and record delivery/download. A later correction, refund, or
donor relink MUST supersede or void stale output per policy while preserving
correction and artifact lineage.

#### Scenario: A donor downloads last year's statement

- WHEN a donor requests a statement for a completed year
- THEN the statement includes exactly their settled, receiptable gifts for that
  year from canonical records
- AND the portal does not present a superseded or void statement as current
- AND the delivery or download is recorded
