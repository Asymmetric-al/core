# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Self-Manage Recurring Gifts

The donor portal MUST let a donor manage their own recurring-giving groups and
independently manageable destination lines. Supported commands MUST include
changing amount, cadence, next recurring date, optional end boundary, eligible
future designation, and payment method; skipping one named occurrence; pausing
until a date or indefinitely; resuming; stopping recovery for one missed
occurrence; canceling; and restarting as a linked successor through fresh
authorization. The portal MUST preview the exact affected lines/cohorts,
Today/Next/Then effects, charge count, amount, cadence, next projected dates,
and whether a payment is already in flight before a financial or destructive
command is confirmed.

Each action MUST execute through one tenant-scoped, donor-owned, append-only,
idempotent, revision-fenced server command. Line-specific changes MUST split a
line prospectively from a shared billing cohort when required rather than
silently mutate sibling lines. Historical schedule epochs and already submitted
payments MUST remain immutable. The destination-line identity MUST remain
stable: changed amount, designation, cadence, or other business terms append a
line-term version; a calendar-bearing change such as cadence, anchor, giving
timezone, preferred calendar day, or final boundary also appends its matching
separate schedule epoch, while a non-calendar term change does not;
skip, pause, resume, and cancellation append their own lifecycle facts. Restart
MUST NOT reopen the canceled line; it MUST create a linked successor with fresh
authorization, terms, schedule epoch, and any required executor binding. A term
change MUST NOT manufacture a schedule epoch, and the current term version and
schedule epoch MUST agree at their effective boundary. Saving a schedule or
payment method MUST NOT silently charge, prorate, catch up, back-charge, or move
the original calendar grid. If a donor intentionally changes
the next recurring date to today and that creates an immediately eligible
occurrence, the portal MUST show the exact amount/date and require a separate
explicit charge confirmation before any attempt. A past next date MUST be
rejected. An inclusive final eligible date MUST be on or after the first
continuing occurrence under the proposed terms, validated in preview and again
under the apply lock.

The portal MUST keep donor intent, schedule, occurrence execution, provider
payment finality, canonical ledger posting/receipt eligibility, provider command
progress, provider control, and collection health separate. It MUST show an
honest in-flight or reconciliation state until required evidence arrives. When
provider control is unknown, it MUST record and apply the safe donor instruction
locally, suppress unsafe Asym work, and quarantine provider mutation or
replacement until proof succeeds; it MUST NOT claim that an external executor
stopped. Self-service MUST NOT bypass ordinary provider renewal through manual
charge loops or expose provider retry controls. A provider subscription MAY own
ordinary renewal execution only; provider-native automatic retries MUST be
disabled or proved unable to overlap product-owned recovery commands.

A bounded pause MUST store a resume boundary, while an indefinite pause MUST
have none. Due occurrences inside either pause MUST remain as suppressed,
explainable facts. The resume boundary is the first date collection may become
eligible, not necessarily a charge date; resume MUST preserve the unchanged
calendar grid and MUST NOT charge immediately without a separately named and
confirmed gift. A bounded pause MAY resume automatically only after current
provider-control, authorization, payment-method, and occurrence proof succeeds;
an indefinite pause requires an authorized resume command. Stopping recovery
MUST affect only the named missed occurrence and MUST NOT pause or cancel future
scheduled support.

**Supersession (2026-07-13):** the original one-subscription/one-mutable-pledge
self-service topology is replaced by this Phase 16 line/cohort command contract.
`donor_pledges` is migration evidence only.

#### Scenario: A donor cancels a recurring gift

- WHEN a donor cancels one recurring line in the portal
- THEN the server records terminal donor intent at the effective boundary and
  suppresses every not-yet-in-flight Asym attempt for that line
- AND the line splits prospectively when a shared cohort is required to keep
  sibling lines running
- AND the portal distinguishes cancellation recorded from provider-confirmed
  stopped until current control evidence converges
- AND staff views reflect the same command and provider truth without manual
  re-entry or late-event resurrection

#### Scenario: A donor changes their recurring amount

- WHEN a donor submits a new recurring amount
- THEN the portal shows the exact current and proposed line, cohort, charge, and
  projected-date effects before confirmation
- AND the server appends a prospective line-term version without manufacturing
  a schedule epoch, creates or updates the exact provider item binding, and
  shows the applicable pending or reconciling state until provider evidence
  arrives
- AND the portal never displays the new execution terms as provider-confirmed
  before confirmation

#### Scenario: A donor changes the next recurring date

- WHEN a donor selects a new next recurring date
- THEN the portal shows at least the next three projected dates and any
  in-flight payment that cannot be recalled
- AND confirmation appends a new effective schedule epoch without rewriting the
  historical start date, charging through the ordinary save, or creating a
  retroactive occurrence

#### Scenario: A donor sets a final eligible date

- GIVEN a proposed final eligible date precedes the first continuing occurrence
  under the proposed current terms
- WHEN the donor previews or submits the change
- THEN the server rejects it in preview and repeats the validation under the
  apply lock
- AND equality permits that one continuing occurrence, while no new occurrence
  or retry may start after the inclusive boundary

#### Scenario: A donor pauses and resumes without moving the grid

- GIVEN a donor pauses until a date or pauses indefinitely
- WHEN scheduled occurrences fall inside the pause
- THEN those occurrences remain as suppressed, explainable facts and no debt or
  catch-up amount is created
- AND a bounded resume revalidates current safety before using the first
  unchanged-grid occurrence on or after the resume boundary; an indefinite
  pause resumes only by authorized command
- AND resume creates no immediate charge without a separate named confirmation

#### Scenario: Provider control is unknown during a donor stop

- GIVEN a donor submits a valid pause, stop-recovery, or cancellation command
- WHEN the server cannot prove current provider control or mutation outcome
- THEN the donor instruction is retained and future Asym work is suppressed
- AND the provider action remains visibly pending reconciliation
- AND no replacement executor or stale command runs until the proof gate passes

#### Scenario: Occurrence, payment, and ledger truth remain distinct

- WHEN a managed occurrence has submitted execution and provider evidence later
  reports a final payment outcome
- THEN the portal derives occurrence execution, payment finality, and canonical
  contribution/ledger posting from their separate authorities
- AND provider success alone does not claim received money or receipt
  eligibility, and a later posting does not move the schedule

### Requirement: Donors Manage Payment Methods Through Stripe

The donor portal MUST let a donor add, remove, and set a default payment
method through Stripe-managed flows. Raw card or bank credentials MUST never
reach Asym servers, and removing a method in use by an active recurring billing
cohort MUST require choosing a compatible replacement for every affected line
first.

#### Scenario: A donor replaces the card behind an active recurring gift

- WHEN a donor removes a payment method attached to an active recurring cohort
- THEN the portal requires selecting or adding a replacement method first
- AND the portal shows every affected line and required authorization effect
- AND the provider executor continues without a silent payment failure or
  sibling-line mutation

### Requirement: Donors Receive Annual Giving Statements

The platform MUST expose annual documents only through the canonical Phase 19
Statement Run and Phase 18 Generated Document authorities. Phase 7 MUST own the
exact legal-donor Statement Subject, eligibility, official facts and lines,
coverage, exclusions, corrections, and frozen display truth. Phase 19 MUST own
the reviewed frozen run population, source cutoff, participation, recipient
operation, and release. Household relationship, soft credit, DAF advisory
status, shared destination, or staff preference MUST NOT create or merge a
Statement Subject.

An official annual document MUST contain only the purpose- and
jurisdiction-authorized facts for its exact Statement Subject. Recognition-only
facts MUST NOT appear in an official artifact or official/deductible total. When
the tenant enables Phase 19's optional purpose-separated support overview, only
the closed Phase 14 household-support and disclosed-DAF projection MAY appear
in a separate `giving.summary.informational@1` artifact persistently labeled
**Support overview — Not a tax document**.

Phase 18 MUST resolve the immutable publication, admit the Generation Request,
produce the private canonical PDF, and preserve one current logical-document
head plus restricted immutable predecessors. The donor BFF MUST reauthorize the
exact Statement Subject, Delivery Recipient or representative, purpose, current
head, artifact, and records state for every list, view, range, and download
request. Repeated authorized view, download, and local print MUST return the
same exact current bytes without creating a document, delivery, or receipt
claim. Phase 17/6 alone owns outbound communication and delivery evidence.
Phase 19 MAY admit a deliberate bounded **Send another copy** occurrence but
MUST prevent equivalent unresolved duplicates and MUST reconcile indeterminate
provider handoff before another release.

A later correction, refund, donor relink, or newly eligible source fact MUST
first create source-owned correction or supplemental authority. Phase 19 and
Phase 18 MUST then create the linked supplemental or successor operation while
preserving the frozen primary run and predecessor evidence.

#### Scenario: A donor downloads last year's statement

- WHEN a donor requests a statement for a completed year
- THEN the portal reauthorizes and returns the exact current canonical PDF for
  the exact legal-donor Statement Subject
- AND its official facts and totals contain only the source-authorized facts for
  that subject and purpose
- AND recognition-only household or DAF facts do not appear in that official
  artifact
- AND the portal does not present a superseded or void statement as current
- AND access does not create an outbound delivery or claim donor receipt

#### Scenario: A donor has an enabled support overview

- GIVEN the tenant enabled support overviews and Phase 14 authorized meaningful
  household or disclosed-DAF recognition for the recipient
- WHEN the donor opens the year group
- THEN official documents appear first and remain unchanged
- AND the overview appears separately and persistently says Not a tax document
- AND no recognition amount enters an official or deductible total

#### Scenario: A donor requests another copy twice

- WHEN duplicate gestures submit the same reviewed exact-current copy request
- THEN Phase 19 returns one durable outbound occurrence
- AND Phase 17/6 may submit at most one equivalent message or Phase 19 physical
  fulfillment may release at most one equivalent paper attempt
