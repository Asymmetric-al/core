# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donation Creation Is Server-Authoritative And Idempotent

Every donation MUST be created through the server-side donation path, which
validates amount, currency, tenant, and designation before any payment intent
exists. Donation creation MUST require an idempotency key, and retrying with
the same key MUST NOT create a second donation or a second Stripe payment
intent.

The client MUST NOT decide payment success. Donation state transitions MUST be
driven by server-confirmed Stripe outcomes, and Stripe remains the payment
authority as defined in `workflow-orchestration`.

#### Scenario: A donor submits the same gift twice

- GIVEN a donor's checkout request fails after the payment intent was created
- WHEN the request retries with the same idempotency key
- THEN the platform returns the existing donation and payment intent
- AND no duplicate donation, customer, or charge is created

#### Scenario: A client claims success the server cannot confirm

- WHEN a donor-facing flow could display a completed gift before the
  operational record supports it
- THEN the displayed state derives from the server-side donation status
- AND success is shown only after Stripe-confirmed state reaches the record

### Requirement: Payment States Stay Honest Across Rails

Donations MUST carry one canonical status — pending, processing, completed,
failed, or refunded — and donor-facing language MUST reflect that status
honestly for the payment rail in use.

For delayed rails such as ACH Direct Debit, the platform MUST distinguish a
started bank transfer from collected funds. Donor-facing copy MUST NOT present
authorization as settlement.

#### Scenario: An ACH gift is authorized but not settled

- GIVEN a donor completes checkout with ACH Direct Debit
- WHEN the payment enters processing
- THEN the donor sees that the bank transfer has started and may take days
- AND giving history shows the gift as processing, not completed, until the
  Stripe payment-status update confirms collection

#### Scenario: A payment fails after checkout

- WHEN Stripe reports a failed payment for a recorded donation
- THEN the donation status becomes failed with the provider error captured
- AND donor-facing history reflects the failure rather than hiding the gift

### Requirement: A Gift Designates One Missionary Or Fund

Checkout SHALL designate each gift to exactly one missionary or one fund, and
the server MUST reject a donation that names neither or both. Post-donation
reallocation is a staff correction governed by `contribution-operations`, not a
donor-side edit.

#### Scenario: A donation names no designation

- WHEN a donation request arrives without a missionary or fund
- THEN the server rejects it before any payment intent is created

#### Scenario: A gift needs to move after settlement

- GIVEN a completed gift was designated to the wrong fund or missionary
- WHEN the designation must change
- THEN the change happens as a recorded staff correction under
  `contribution-operations`
- AND donor-visible history derives from the corrected truth

### Requirement: Recurring Donations Follow The Subscription Lifecycle

Recurring donations MUST be represented as donor pledges linked one-to-one
with Stripe subscriptions, with pledge states of active, paused, and cancelled
mapped from subscription state. Cancellation MUST be terminal for the pledge
even when later provider updates arrive out of order.

Recurring billing MUST flow through the subscription lifecycle — invoice
events update pledge progress and failure counts — and MUST NOT be rebuilt as
manual loops of one-time donation attempts.

#### Scenario: A recurring invoice is paid

- WHEN Stripe reports a paid invoice for a linked subscription
- THEN the pledge records the completed payment and resets its failed-charge
  count
- AND the pledge stays active unless it was already cancelled

#### Scenario: A subscription is cancelled at the provider

- WHEN Stripe reports the subscription as cancelled
- THEN the pledge becomes cancelled with its end date recorded
- AND later out-of-order updates do not resurrect it

### Requirement: Receipts Derive From Payment Truth

Donation receipts MUST be issued from the server-side gift record only after
the donation reaches a completed state, delivered through the tenant-configured
email path with an idempotent send per gift, and the send outcome MUST be
recorded.

#### Scenario: A gift completes and a receipt is sent

- WHEN a donation transitions to completed and stages a gift
- THEN the receipt email renders from the gift record with amount, date,
  donor, and designation
- AND the receipt send is recorded and cannot duplicate for the same gift

#### Scenario: A receipt send fails

- WHEN the tenant email path rejects or fails the receipt send
- THEN the failure is recorded on the gift's receipt state
- AND the gift itself remains completed and correct

### Requirement: Refunds Are Donor-Visible Truthfully

Refunds MUST flow from provider-confirmed events into the donation record,
distinguishing full refunds from partial refunds, and donor-facing history
MUST reflect refunded state and amounts without overstating or hiding them.

#### Scenario: A gift is fully refunded

- WHEN Stripe confirms a full refund for a donation
- THEN the donation status becomes refunded with the refunded amount and time
  recorded
- AND the donor sees the gift as refunded in their giving history

#### Scenario: A gift is partially refunded

- WHEN Stripe confirms a partial refund
- THEN the donation records the refunded amount while retaining its settled
  status
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
