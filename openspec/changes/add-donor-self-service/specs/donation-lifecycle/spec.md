# Delta for Donation Lifecycle

## ADDED Requirements

### Requirement: Donors Self-Manage Recurring Gifts

The donor portal MUST let a donor manage their own recurring-giving groups and independently manageable destination lines.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-4040d2093a4baae62e2b` MUST apply without exception.

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

The donor portal MUST support independent Add, selected-use Replace, explicit Remove and optional new-gift payment-preference commands through their current Phase 13/16 owner boundaries.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-fe173a148458d248a737` MUST apply without exception.

#### Scenario: A donor replaces the card behind an active recurring gift

- **WHEN** a donor deliberately replaces the method for selected permitted
  recurring groups or lines
- **THEN** the portal reviews the exact selected uses and required
  authorizations before their individual source commands are accepted
- **AND** unselected uses remain unchanged and the old method is retained
- **AND** the result distinguishes accepted changes, provider-confirmed
  outcomes and independently failed or indeterminate children

#### Scenario: A donor adds a preferred method for new gifts

- **WHEN** a donor adds a method and chooses the optional new-gift preference
- **THEN** provider-qualified setup and preference outcomes remain independent
- **AND** no recurring agreement, Stripe Customer billing default or charge is
  changed by that choice

#### Scenario: A donor separately removes a method

- **GIVEN** the donor deliberately requests Remove for an admitted method
- **WHEN** the owner checks all live dependencies under the shared use/removal
  fence
- **THEN** any live or unresolved dependency blocks removal without changing
  existing financial instructions
- **AND** absence of live dependencies permits the qualified removal command
  without demanding an unnecessary replacement
- **AND** historical evidence is retained and an obsolete preference pointer
  does not make removal permanently impossible
- **AND** a lost provider response remains indeterminate until same-operation
  reconciliation establishes the outcome, without another detach

### Requirement: Donors Receive Annual Giving Statements

The platform MUST expose annual documents only through the canonical Phase 19 Statement Run and Phase 18 Generated Document authorities.

Every clause in `openspec/contracts/donation-lifecycle.md#contract-bfda0ee0804cf82a8cc4` MUST apply without exception.

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
