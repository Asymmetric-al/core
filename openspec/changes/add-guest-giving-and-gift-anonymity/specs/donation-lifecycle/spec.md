# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Guest Checkout Does Not Require An Account

A donor MUST be able to complete an online gift without first creating or
signing into an account. The public client MUST collect only the identity,
contact, allocation, and payment inputs required for the gift and MUST NOT
accept or select a canonical Party identifier.

At the accepted-contribution boundary, the server MUST use the tenant-scoped
Phase 4 identity resolution service to find or create the canonical Party. It
MUST then use the Phase 13 acceptance service to persist the contribution
header, exact allocation lines and postings, `legal_donor_party_id`, and frozen
source identity/contact evidence. Rejected or abandoned checkout attempts MUST
NOT create a Party, claim, membership, contribution, or official-document fact.

The response MUST have the same shape whether Phase 4 found or created the
Party. It MUST NOT expose a Party identifier, match result, account existence,
or any other signal that reveals whether the email was already known.

#### Scenario: A first-time donor gives without signing in

- WHEN a visitor submits valid identity, contact, allocation, and
  Stripe-hosted payment inputs with an idempotency key
- THEN the server resolves the tenant-scoped Party at the accepted-contribution
  boundary
- AND Phase 13 records the contribution with exact legal-donor source evidence
- AND the donor can finish without creating a password or account

#### Scenario: A guest email belongs to an existing Party

- GIVEN an existing same-tenant Party is eligible for deterministic resolution
- WHEN a guest submits that Party's email
- THEN the server resolves the Party without accepting a client-selected Party
  identifier
- AND the response is indistinguishable from the first-time-donor response

#### Scenario: Checkout is abandoned

- WHEN a visitor leaves before an accepted contribution exists
- THEN no Party, account claim, membership, contribution, receipt fact,
  document, or communication is created from the abandoned attempt

### Requirement: Account Claiming Is Optional And Possession-Gated

After an accepted guest gift, the platform MAY offer a quiet, tenant-branded
invitation to claim portal access. Claiming MUST use the Phase 4
verified-possession boundary. Supplying an email during checkout MUST NOT bind
a login, reveal giving history, or authorize access.

Claim initiation and completion MUST be enumeration-safe, expiring,
single-use, rate-limited, audited, and independently retryable from gift
acceptance. Failure to prepare or deliver a claim invitation MUST NOT change
the accepted contribution.

#### Scenario: A guest chooses to claim access

- GIVEN the donor completed a guest gift
- WHEN the donor follows the optional claim action and proves possession of the
  same email under the Phase 4 contract
- THEN the tenant-scoped account binding is created atomically and audited
- AND the donor can access only the giving history authorized to that Party

#### Scenario: Claim invitation delivery fails

- GIVEN an accepted contribution already exists
- WHEN claim-invitation preparation or delivery fails
- THEN the contribution remains accepted and correct
- AND the claim invitation can be retried without creating another Party or
  contribution

### Requirement: Payment Collection Uses Stripe-Hosted UI

Checkout MUST collect card and bank credentials exclusively through a
supported Stripe-hosted surface so that PAN, CVC, and bank credentials never
reach Asym servers, logs, databases, analytics, or application state.

The client MUST NOT decide payment or contribution success. Donor-facing state
MUST derive from server-confirmed provider finality and the independently
authoritative Phase 13 contribution lifecycle. A delayed rail MUST be described
as processing until provider evidence proves the applicable finality.

#### Scenario: A donor enters card details

- WHEN checkout renders payment collection
- THEN credentials tokenize directly with Stripe
- AND no raw card or bank credential field is submitted to an Asym endpoint

#### Scenario: The client reaches a return URL before finality

- WHEN the browser returns from the hosted payment surface before the server
  has confirmed provider finality
- THEN the UI shows the truthful pending state
- AND it does not claim that the gift posted, a receipt was issued, or a message
  was delivered

### Requirement: Gift Anonymity Is A Per-Gift Visibility Preference

A donor or authorized staff member MUST be able to mark an accepted
contribution anonymous to missionary and public audiences. The accepted Phase
13 contribution header MUST freeze the per-gift choice. A current Party-level
preference MAY seed the initial choice but MUST NOT replace the accepted
per-gift fact or rewrite prior gifts.

Anonymity MUST NOT conceal the legal donor from authorized finance and
administrative roles, the donor viewing their own gift, official receipt facts,
reconciliation, or audit. Missionary/public projections, notifications,
exports, search indexes, analytics payloads, caches, logs, and hydration data
MUST enforce redaction server-side and MUST NOT emit a stable hidden Party or
contact identifier.

Changing the choice after acceptance MUST use the shared contribution
correction boundary, require the applicable capability and reason, and append
an audit event with actor, before/after value, source surface, reason, and
timestamp.

#### Scenario: A donor gives anonymously to a missionary

- WHEN a donor selects the anonymous-to-missionary choice at checkout
- THEN the accepted contribution stores that per-gift visibility fact
- AND missionary-facing output shows "Anonymous donor" without a hidden Party
  or contact identifier
- AND authorized finance output and the donor's own history retain the
  appropriate legal-donor identity

#### Scenario: Staff changes anonymity after acceptance

- WHEN authorized staff confirms a visibility correction with a reason
- THEN role-scoped projections use the corrected visibility fact
- AND the append-only audit trail preserves the prior and replacement values

## MODIFIED Requirements

### Requirement: Receipts Follow The Governed Facts-To-Artifact-To-Delivery Pipeline

Phase 7 MUST derive one immutable, versioned official-facts record from
canonical posted Phase 13 gift truth and its frozen legal-donor, Legal Entity,
allocation, currency, correction, eligibility, and source identity evidence.
Phase 7 owns the Statement Subject, official receipt identity, eligibility,
numbering, correction semantics, and facts version. Payment success, checkout,
the Party profile, and the contribution header MUST NOT independently claim
that a receipt is eligible, issued, rendered, or delivered.

Phase 18 MUST create or reuse the canonical artifact from the exact approved
facts version and immutable published document-template version. Phase 17 MUST
prepare governed message content from its typed contract without recomputing
official facts. Phase 6 MUST resolve the current purpose-eligible recipient and
contact point, re-prove consent and suppression, dispatch the pinned content
and artifact, and record the communication and delivery outcome.

Portal access and delivery MUST use the stored exact Phase 18 artifact bytes.
They MUST NOT rerender a live contribution, Party profile, or receipt snapshot.

Each handoff MUST be idempotent, version-pinned, and independently recoverable.
A failure downstream MUST NOT mutate accepted money, legal-donor source
evidence, official facts, or an existing artifact.

#### Scenario: An eligible gift produces an official receipt

- GIVEN Phase 13 has canonical posted gift truth and Phase 7 has issued an
  approved official-facts version
- WHEN the receipt workflow proceeds
- THEN Phase 18 creates or reuses the exact canonical artifact
- AND Phase 17 prepares governed content for that version
- AND Phase 6 dispatches through the consent-aware seam and records the outcome

#### Scenario: Rendering fails

- WHEN Phase 18 cannot create the artifact
- THEN the failure is visible and retryable under the document-production
  contract
- AND no communication falsely claims that a receipt was sent
- AND Phase 13 and Phase 7 truth remain unchanged

#### Scenario: Delivery fails

- GIVEN the canonical artifact and governed content exist
- WHEN Phase 6 cannot deliver the message
- THEN the communication event records the truthful failure
- AND retry reuses the pinned versions without duplicating the artifact or
  recomputing receipt facts

#### Scenario: The Party profile changes after issuance

- GIVEN Phase 7 issued official facts from the contribution's frozen source
  identity evidence
- WHEN the current Party name, email, or address later changes
- THEN the issued facts and canonical artifact remain historically exact
- AND current contact resolution for a new delivery remains separately owned by
  Phase 6

#### Scenario: A source correction changes official facts

- WHEN a governed Phase 13 correction changes facts relevant to an issued
  receipt
- THEN Phase 7 appends a successor facts version and determines the required
  supersede, void, or replacement effect
- AND Phase 18, Phase 17, and Phase 6 preserve exact lineage without mutating
  or silently redelivering the prior artifact

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
