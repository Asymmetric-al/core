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

The platform MUST generate annual giving statements whose deductible lines and
totals cover only settled, receiptable hard-credit gifts tied to the authorized
donor or household subject. When the canonical source context contains approved
indirect soft-credit, DAF, or matched-gift lines supplied by the owning domain,
the statement MUST render those lines only in a clearly labeled indirect
section, and those lines MUST NOT enter the deductible total. Pending or
in-flight gifts (for example unsettled ACH or not-yet-collected recurring
installments) MUST NOT appear in deductible or indirect lines or totals in the
donor artifact until settled; the owning domain MUST retain their excluded/audit
record with its approved reason code. Still-unknown-donor gifts MUST NOT appear
in a donor artifact unless the owning domain later matches them. When such a
candidate is evaluated for a statement run, the owning domain MUST retain its
exclusion/audit record with a #579/source-domain-approved reason code. Statement
language MUST be finance/legal reviewed before production use.

Giving MUST produce the frozen, versioned statement context from canonical
donation/correction truth, including the deductible hard-credit partition, the
approved indirect partition, audit-only exclusion references and their
source-domain-approved reason codes, raw structured values, and frozen official
display strings with locale/formatting version metadata. The document-production
capability MUST resolve the assigned immutable template and private artifact,
bind those frozen strings and supplied classifications, never render audit-only
exclusions, and avoid recalculating, reclassifying, or reformatting official
facts. The donor BFF MUST ask Phase 18 to authorize the recipient, expose only
the current eligible artifact, and record the authorized access/download.
Phase 17 alone records any outbound delivery. A later correction, refund, or
donor relink MUST supersede or void stale output per policy while preserving
correction and artifact lineage.

#### Scenario: A donor downloads last year's statement

- WHEN a donor requests a statement for a completed year
- THEN its deductible lines and totals include exactly the settled, receiptable
  hard-credit gifts for the authorized donor/household subject and year
- AND any approved indirect lines supplied by the owning domain appear only in
  a labeled indirect section and remain excluded from the deductible total
- AND the portal does not present a superseded or void statement as current
- AND Phase 18 records the authorized download; any outbound delivery remains
  a separate Phase 17 communication event
