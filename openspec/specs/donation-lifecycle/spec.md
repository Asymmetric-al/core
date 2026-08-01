# Donation Lifecycle

## Purpose

Define the durable contract for the donor-side money path: how gifts are
created, how payment states stay honest across rails, how recurring giving,
receipts, refunds, and recovery behave, and how the donor portal reflects
canonical gift truth. Staff-side corrections live in
`contribution-operations`; durable background execution lives in
`workflow-orchestration`.

## Requirements

### Requirement: Donation Creation Is Server-Authoritative And Idempotent

Every donation MUST be created through the server-side donation path, which
validates the gross amount, currency, tenant, Legal Entity, Settlement Account
Binding, and complete allocation-line set before any payment intent exists.
Every allocation line MUST name one valid designation, use a positive amount,
and the lines for a payment group MUST sum exactly to that group's gross amount
in one currency. Donation creation MUST require an idempotency key, and
retrying with the same key MUST NOT create a second donation, allocation,
payment group, or Stripe payment intent.

The client MUST NOT decide payment success. Donation state transitions MUST be
driven by server-confirmed Stripe outcomes, and Stripe remains the payment
authority as defined in `workflow-orchestration`.

#### Scenario: A donor submits the same gift twice

- GIVEN a donor's checkout request fails after the payment intent was created
- WHEN the request retries with the same idempotency key
- THEN the platform returns the existing donation and payment intent
- AND no duplicate donation, allocation, customer, or charge is created

#### Scenario: A client claims success the server cannot confirm

- WHEN a donor-facing flow could display a completed gift before the
  operational record supports it
- THEN the displayed state derives from the server-side lifecycle projection
- AND payment success is shown only after Stripe-confirmed finality reaches the
  record

### Requirement: Payment And Gift Lifecycle Folds Stay Separate And Honest

The platform MUST preserve payment authorization and finality, canonical
contribution/ledger posting, refund or adjustment state, receipt eligibility
and issuance, and communication delivery as separately authoritative lifecycle
folds. A role-appropriate summary MAY derive a simple display state, but no
single mutable status MAY overwrite or imply the other folds.

For delayed rails such as ACH Direct Debit, the payment-finality fold MUST
distinguish a started bank transfer from collected funds. Donor-facing copy
MUST NOT present authorization as settlement, provider success as canonical
posting, receipt eligibility as receipt issuance, or message acceptance as
delivery.

#### Scenario: An ACH gift is authorized but not settled

- GIVEN a donor completes checkout with ACH Direct Debit
- WHEN the payment enters processing
- THEN the donor sees that the bank transfer has started and may take days
- AND giving history shows the gift as processing, not completed, until the
  Stripe payment-finality evidence confirms collection
- AND the contribution-posting and receipt folds remain independently
  evidenced

#### Scenario: A payment fails after checkout

- WHEN Stripe reports a failed payment for a recorded donation
- THEN the payment-finality fold records failure with the provider error
  captured
- AND donor-facing history reflects the failure rather than hiding the gift

#### Scenario: Provider success arrives before canonical posting

- GIVEN Stripe confirms that a payment succeeded
- WHEN the canonical contribution has not yet posted
- THEN the payment-finality fold records success
- AND the platform does not claim that ledger posting, receipt issuance, or
  delivery is complete

### Requirement: A Gift Uses One Or More Exact Allocation Lines

Checkout SHALL represent a gift with one or more immutable allocation lines.
Each line MUST name exactly one valid missionary or fund designation, and the
server MUST reject a line that names neither or both. The allocation set MUST
conserve the payment group's gross amount exactly. Post-donation reallocation
is an append-only staff correction governed by `contribution-operations`, not a
donor-side edit or an in-place rewrite.

#### Scenario: A donation has no valid allocation

- WHEN a donation request arrives with no allocation lines or with an invalid
  line
- THEN the server rejects it before any payment intent is created

#### Scenario: A donor splits one gift between two designations

- WHEN a donor submits two valid allocation lines whose amounts equal the
  payment group's gross amount
- THEN the server records both lines under the same gift and payment group
- AND each line retains stable identity for posting, correction, receipt facts,
  and reporting

#### Scenario: A gift needs to move after settlement

- GIVEN a posted allocation named the wrong fund or missionary
- WHEN its designation or amount must change
- THEN the change happens as an append-only recorded staff correction under
  `contribution-operations`
- AND donor-visible history derives from the corrected truth

### Requirement: Financial Execution Is Pinned To One Exact Legal Entity

A Legal Entity is the organization-owned legal issuer and financial reporting
boundary for a gift. A Settlement Account Binding is the effective-dated,
capability-qualified link from one Legal Entity to one exact processor account,
mode, currency, and collection context.

Every accepted payment group and independently authoritative financial root
MUST store its exact `legal_entity_id`. Each processor-bound payment group MUST
also store the exact Settlement Account Binding selected before provider
creation. Processing, webhook routing, reconciliation, refunds, documents, and
accounting handoffs MUST use those frozen identifiers rather than a mutable
tenant, site, or current-default lookup. The Legal Entity boundary MAY only
narrow the containing tenant's scope; it MUST NOT widen access across tenants.

A one-entity tenant MAY receive a quiet preselected default in the UI, but the
stored financial records MUST remain explicit. A checkout containing work for
different Legal Entities, currencies, or incompatible Settlement Account
Bindings MUST form separate, fully disclosed payment groups rather than one
ambiguous charge.

#### Scenario: A tenant changes its default settlement account

- GIVEN an accepted gift is pinned to one Legal Entity and Settlement Account
  Binding
- WHEN the tenant later changes its default processor account
- THEN retries, events, refunds, and reconciliation for the accepted gift
  continue to use the frozen binding
- AND the new default applies only prospectively

#### Scenario: A cart crosses Legal Entities

- WHEN valid allocation lines belong to different Legal Entities
- THEN the server forms separate payment groups for those entities
- AND checkout discloses the charge count, amount, currency, and entity-facing
  meaning before authorization

### Requirement: Legacy Recurring Reflection Does Not Define The Target Topology

The currently shipped compatibility projection MAY reflect existing
Stripe-subscription events into legacy `donor_pledges` state, including
monotonic cancellation protection against out-of-order updates. That
one-subscription-to-one-pledge shape is implementation evidence only: the
platform MUST NOT extend it as the target recurring creation, occurrence,
agreement, or fulfillment model, and MUST NOT rebuild recurring billing as
manual loops of one-time donation attempts.

The active `add-recurring-giving` change supersedes this legacy topology for
forward implementation. Donor-initiated recurring creation is not yet part of
the shipped donor money path.

#### Scenario: A recurring invoice is paid

- WHEN Stripe reports a paid invoice for a linked subscription
- THEN the pledge records the completed payment and resets its failed-charge
  count
- AND the pledge stays active unless it was already cancelled

#### Scenario: A subscription is cancelled at the provider

- WHEN Stripe reports the subscription as cancelled
- THEN the pledge becomes cancelled with its end date recorded
- AND later out-of-order updates do not resurrect it

### Requirement: Receipts Follow The Governed Facts-To-Artifact-To-Delivery Pipeline

The receipt/statement source domain MUST derive one immutable, versioned facts
record from canonical posted gift truth and its frozen legal-donor, Legal
Entity, allocation, currency, correction, and eligibility evidence. Payment
success alone MUST NOT make a receipt eligible or issued.

The document-production subsystem MUST render an official receipt only from
that approved facts version through an immutable published template version
and MUST preserve the resulting canonical artifact and correction lineage.
Outbound delivery MUST then use the platform communication spine and governed
send seam, pinning the exact artifact, template, and facts versions and
recording a communication event. Rendering MUST NOT send, and delivery MUST
NOT recompute gift or receipt truth.

#### Scenario: A gift becomes eligible and a receipt is sent

- GIVEN canonical posted gift truth is eligible under the source-domain policy
- WHEN the source domain issues an immutable receipt-facts version
- THEN document production creates or reuses the one canonical artifact for
  that facts and template version
- AND the communication spine delivers that exact artifact idempotently and
  records the outcome

#### Scenario: A receipt send fails

- WHEN the governed delivery path rejects or fails the receipt send
- THEN the communication event records the truthful failure
- AND the canonical gift facts, receipt-facts version, and document artifact
  remain independently correct and retryable under their owning contracts

#### Scenario: A corrected gift changes an issued receipt

- WHEN an approved source-domain correction changes official receipt facts
- THEN the source domain issues a new facts version and determines the
  supersede, void, or replacement effect
- AND document production and communication preserve lineage without mutating
  or silently redelivering the prior artifact

### Requirement: Refunds Are Donor-Visible Truthfully

Refunds MUST flow from provider-confirmed events into the donation record,
distinguishing full refunds from partial refunds, and donor-facing history
MUST reflect refunded state and amounts without overstating or hiding them.

#### Scenario: A gift is fully refunded

- WHEN Stripe confirms a full refund for a donation
- THEN the refund fold records the full refunded amount and time without
  rewriting the payment-finality or contribution-posting evidence
- AND the donor sees the gift as refunded in their giving history

#### Scenario: A gift is partially refunded

- WHEN Stripe confirms a partial refund
- THEN the refund fold records the partial refunded amount while preserving the
  settled payment-finality and canonical contribution history
- AND donor-facing history shows the partial refund truthfully

### Requirement: Donation Recovery Never Duplicates Money Effects

Donation processing MUST use the product-owned saga and dispatch model from
`workflow-orchestration`: durable outbox records, claim-based processing,
bounded retries with dead-lettering, and product idempotency keys guarding
each business effect. Recovery paths MUST repair handoffs without repeating a
charge, receipt, or state change that already happened.

#### Scenario: Processing dies mid-donation

- GIVEN a donation saga fails partway through
- WHEN recovery re-attempts the work
- THEN completed steps are not repeated because product idempotency keys guard
  each effect
- AND after bounded retries the item dead-letters for staff attention instead
  of looping

### Requirement: The Donor Portal Reflects Canonical Gift Truth

The donor portal MUST derive giving history, recurring gift detail, receipts,
and summary totals from the same canonical donation and correction records
used by Mission Control, with no donor-portal-local money state.

#### Scenario: A staff correction changes a donor's gift

- WHEN a staff correction alters donor-visible gift state
- THEN the donor portal reflects the corrected truth from the shared records
- AND no separate portal-side sync or shadow copy is involved
