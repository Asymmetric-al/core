# Accounting Operations Capability

## ADDED Requirements

### Requirement: D1 One Accounting Doorway Coordinates Bounded Contexts Without Merging Truth

The product MUST expose one tenant-, actor-, environment-, and Legal-Entity-
scoped Accounting Operations boundary and one derived **Ready for Accounting**
workspace for settlement evidence, Bank Match, Accounting Releases, QBO/Xero
delivery, packages, and accounting exceptions.

Source domains MUST remain authoritative for canonical gifts, allocations,
offline batches, corrections, expenses, reimbursements, and Field Account
facts. Stripe MUST remain authoritative for processor evidence; the bank for
posted bank evidence; and QBO or Xero for provider-native accounting objects,
period locks, final books reconciliation, and the tenant's books. Phase 20 MUST
label and retain each authority rather than collapsing them into one financial
status.

Each source-purpose family MUST remain structurally dark until its exact
predecessor-owned occurrence and version contract exists: Phase 13 for posted
contribution and ledger facts, Phase 14 for admitted credit-owned adjustments,
Phase 15 for frozen offline Deposit Groups, and Phase 21 for approved expense
and payment handoffs. One unavailable predecessor MUST keep only its dependent
family dark; it MUST NOT block unrelated certified families or be bypassed
through a compatibility shim or direct table coupling.

Routes, jobs, UI, notifications, and provider adapters MUST call the same
Accounting Operations service. They MUST NOT reproduce accounting rules,
derive Legal Entity from a mutable default, or turn a UI projection into
lifecycle truth. The ordinary workspace MUST remain quiet and exception-first
while allowing staff to inspect every source and handoff independently.

Every job, callback, scheduled cadence, synchronization, and recovery command
MUST execute as a registered, auditable, purpose-scoped non-human principal
with one Tenant, permitted Legal Entities and destinations, least-privilege
capabilities, and a current human owner whose live capability ceiling is
reauthorized at execution time. A shared service-role credential MUST NOT be
treated as an actor, synthesize a human identity, or bypass the shared policy
resolver.

Critical finance journeys MUST conform to WCAG 2.2 AA. Setup, review, release,
package, reconnect, and exception workflows MUST support complete keyboard
operation; meaningful screen-reader names, relationships, and state; visible
and unobscured focus; programmatically associated errors; text-and-icon status
rather than color alone; 200% zoom and reflow without two-dimensional
scrolling; forced-colors and reduced-motion preferences; and long-locale and
right-to-left layouts.

For a clean tenant with one Legal Entity and ordinary local-currency
accounting, the recommended setup and release path MUST omit redundant
selectors, keep advanced controls behind progressive disclosure, present the
one exception-owned next action when intervention is required, and avoid
needless confirmation steps for reversible or non-destructive actions.

#### Scenario: Staff inspect one ordinary accounting handoff

- GIVEN an authorized finance user has one active Legal Entity and eligible
  source work
- WHEN the user opens Ready for Accounting
- THEN the product shows one derived view of readiness, release, delivery, and
  exception truth
- AND every displayed fact retains its owning authority and source identity

#### Scenario: External authorities disagree

- GIVEN Stripe records an expected transfer and posted bank evidence records a
  different amount
- WHEN the workspace derives the current state
- THEN it shows the disagreement without rewriting either source
- AND it does not mark the bank, Accounting Release, or QBO/Xero reconciled

#### Scenario: One predecessor source contract is unavailable

- GIVEN Phase 21 has not yet published the approved expense and payment
  occurrence contract
- WHEN other certified Phase 13 or Phase 15 source work becomes ready
- THEN expense and reimbursement families remain structurally dark
- AND unrelated posted contribution or frozen Deposit Group work may continue
  through its own proved contract

#### Scenario: An adapter attempts to bypass the service

- WHEN a route, worker, or provider adapter attempts to release or deliver
  accounting without the Accounting Operations service
- THEN the operation is rejected with zero external effect
- AND no alternate accounting lifecycle authority is created

#### Scenario: A background command has no currently authorized owner

- GIVEN a registered non-human principal's human owner is inactive or no
  longer holds the required tenant, Legal Entity, destination, or capability
  scope
- WHEN a job, callback, schedule, synchronization, or recovery command runs
- THEN shared policy authorization rejects the command with zero external
  effect
- AND a service credential or stored actor identifier cannot restore authority

#### Scenario: An assistive-technology user completes a critical finance journey

- GIVEN an authorized finance user operates with a keyboard and screen reader
  at 200% zoom
- WHEN the user reviews, releases, and verifies one eligible accounting handoff
- THEN every control, status, error, consequence, and completion state is
  programmatically named and operable without pointer input or color alone
- AND the journey reflows without two-dimensional scrolling, obscured focus, or
  loss of information

#### Scenario: A clean one-person team uses the recommended path

- GIVEN a tenant has one Legal Entity, one local currency, one proved
  destination, and no accounting exceptions
- WHEN its authorized staff member completes recommended setup and releases
  eligible work
- THEN the product defaults the known scope and keeps advanced controls hidden
- AND the staff member completes the clean path without redundant selection or
  needless confirmation

### Requirement: D2 Accounting Releases Are Immutable And Use One Exclusive Delivery Lane With Evidence Always

Every Accounting Release MUST freeze exact source coverage, one Accounting
Posting Intent, one balanced Canonical Accounting Effect, governing version
pins, one Accounting Destination Connection, one Provider Delivery Plan, and
one exclusive delivery lane. A release MUST never change after creation.

Every release MUST create one logical, immutable, human-inspectable and
machine-verifiable **Accounting Evidence Artifact**, regardless of delivery
lane. Its identity, manifest, schema and version, digests, lineage, control
totals, outcomes, hold state, disposal evidence, and tombstone MUST remain
append-only. Protected payload bytes MUST follow purpose-owned retention,
legal/privacy holds, and audited staged disposal; byte disposal MUST NOT
rewrite the release or surviving evidence record. The artifact proves release
meaning, balance, lineage, and control totals; it does not claim provider
import or reconciliation.

The release fence MUST be one short database transaction that reauthorizes and
revalidates the frozen graph, writes the immutable release and transactional
outbox admissions, and then commits. It MUST NOT perform source or provider
network I/O, generate artifact bytes, or call a queue. Those effects begin only
after commit.

Direct QBO/Xero delivery and staff-mediated provider import MUST be mutually
exclusive for one release. Delivery, provider acceptance, exact readback,
staff-reported import, verification, drift, Bank Match, and final
reconciliation MUST remain separate evidence axes. Unknown provider outcomes
MUST block blind replay.

The original release and its selected lane MUST remain immutable. A separately
identified, lineage-linked recovery successor MAY select another currently
certified lane only for the exact units positively proved neither delivered nor
imported and only when duplicate-prevention proof is complete. An unknown,
partial, or merely staff-assumed outcome MUST NOT authorize a cross-lane
successor.

#### Scenario: Direct delivery succeeds with exact readback

- GIVEN a release is pinned to the direct QBO or Xero lane
- WHEN every provider operation is accepted and read back exactly
- THEN the product records operation-granular provider identities and matching
  readback evidence
- AND the immutable release and Accounting Evidence Artifact do not change

#### Scenario: A direct operation times out after possible acceptance

- GIVEN a provider write may have crossed its irreversible handoff
- WHEN the response is lost or ambiguous
- THEN the operation enters an ambiguous state and blind retry is blocked
- AND exact provider lookup, readback, or bounded reconciliation is required

#### Scenario: Staff use the artifact lane

- GIVEN a release is pinned to a certified staff-mediated delivery lane
- AND its protected payload bytes remain retained and authorized
- WHEN staff download it more than once
- THEN every download returns the original immutable bytes and control totals
- AND no direct provider operation is created

#### Scenario: Artifact payload bytes reach lawful disposal

- GIVEN retention has expired, no legal or privacy hold applies, and audited
  disposal is authorized
- WHEN protected artifact bytes are disposed
- THEN authorized users see that the bytes are unavailable and the product
  does not regenerate them from mutable inputs
- AND the immutable release, manifest, digests, lineage, outcomes, and disposal
  tombstone remain verifiable

#### Scenario: Release creation reaches an external-I/O boundary

- GIVEN every release gate passes
- WHEN the database fence freezes the release and outbox admissions
- THEN no source/provider request, artifact-byte generation, or queue call
  occurs inside the transaction
- AND post-commit workers perform external work from the immutable identities

#### Scenario: Staff try to mutate the lane after release

- GIVEN an Accounting Release already exists in one delivery lane
- WHEN staff or automation attempt to change it to the other lane
- THEN the change is rejected
- AND the original release and lane remain immutable

#### Scenario: Proven-undelivered units use a recovery successor

- GIVEN exact units in an immutable release are positively proved neither
  delivered nor imported
- AND duplicate-prevention proof and a currently certified alternate lane are
  complete
- WHEN authorized recovery creates a separately identified successor
- THEN only those exact units may use the successor's selected lane
- AND complete lineage preserves the original release, attempted outcome, proof,
  and successor without relabelling or mutation

#### Scenario: Cross-lane recovery lacks positive outcome proof

- GIVEN delivery or import outcome is unknown, partial, or supported only by
  staff assumption
- WHEN a cross-lane recovery successor is requested
- THEN the successor is rejected
- AND outcome reconciliation remains required before any alternate-lane action

### Requirement: D3 Every Financial Handoff Pins One Canonical Legal Entity

One canonical **Legal Entity** MUST be the enduring legal and financial
identity beneath a Tenant. Legal Issuer, merchant, settlement owner, receipt
issuer, and accounting owner MUST be roles or profiles of that identity rather
than parallel identities.

Every independently authoritative financial root, policy, mapping, evidence
record, Bank Match, Accounting Release, package, provider operation, and
cutover MUST store an explicit tenant and Legal Entity. Legal Entity scope MUST
only narrow its Tenant; it MUST never widen access. A mutable tenant, Site,
Designation, processor account, or provider name MUST NOT supply historical
ownership.

A Settlement Account Binding, bank-evidence connection, and Accounting
Destination Connection MUST be separate purpose-owned records. Multi-entity
activation MUST be prospective and proof-gated. The sole Legal Entity MAY be
visually quiet for a one-entity tenant, but persisted scope and authorization
MUST remain explicit.

An active production Accounting Destination MUST be globally unique by
provider, environment, and stable provider organization identifier. A
conflict MUST fail closed without revealing another Tenant. One production
destination MUST NOT be active for more than one Legal Entity in direct-
delivery mode.

Multi-entity activation MUST remain unavailable until every enabled upstream
financial writer, callback router, document or statement authority, expense
handoff, release path, artifact path, and provider operation proves exact Legal
Entity attribution. The proof MUST be capability-specific and prospective; it
MUST NOT retrofit or repartition earlier work.

#### Scenario: A one-entity tenant releases routine work

- GIVEN the tenant has exactly one active Legal Entity
- WHEN authorized staff release eligible work
- THEN the UI may omit a redundant entity selector
- AND every release and operation stores and authorizes the exact Legal Entity

#### Scenario: A proposed release crosses Legal Entities

- WHEN a candidate includes source occurrences from two Legal Entities
- THEN the release is rejected or split into independently reviewed releases
- AND no default or provider connection silently combines the work

#### Scenario: Multi-entity capability is activated

- GIVEN a tenant has proved a second Legal Entity, its purpose-owned bindings,
  and exact entity attribution across every enabled financial capability
- WHEN the tenant activates multi-entity processing prospectively
- THEN later eligible work can use the newly proved entity
- AND historical work is not repartitioned or rerouted

#### Scenario: A production destination is already active elsewhere

- GIVEN the same provider, environment, and stable provider organization
  identifier is already active for another Tenant or direct-delivery Legal
  Entity
- WHEN staff attempt to activate another production Accounting Destination
- THEN activation fails without disclosing the conflicting Tenant or entity
- AND no destination, connection, release, or provider operation is created

#### Scenario: A second entity lacks complete attribution proof

- GIVEN one enabled writer, callback, artifact, handoff, or provider operation
  cannot prove exact Legal Entity attribution
- WHEN staff attempt to activate multi-entity accounting
- THEN the second-entity capability remains dark
- AND the existing one-entity path continues without repartitioning prior work

#### Scenario: An accounting destination is replaced

- GIVEN prior releases are pinned to one external organization
- WHEN the tenant proves and activates another organization prospectively
- THEN prior release, retry, package, and readback evidence remain pinned to
  the original destination
- AND only later eligible work may use the replacement

### Requirement: D4 Each Release Couples Typed Posting Intent To One Balanced Canonical Effect

Every Accounting Release MUST combine one typed **Accounting Posting Intent**
with one exact provider-neutral **Canonical Accounting Effect**. They MUST be
inseparable views of one release authority.

The Posting Intent MUST freeze exact source identity and version, tenant, Legal
Entity, source family, economic purpose, currency and amount scale, civil and
accounting date basis, economic-event date, resolved accounting date and
period, source eligibility and exclusion evidence, semantic accounting-policy
identity, version, and digest, posting-owner interval, source-set digest,
deterministic input ordering, and correction lineage. The release MUST also pin
the exact builder, mapping, Posting Profile, compiler, adapter, and allocation-
algorithm versions used at their respective boundaries.

The Canonical Accounting Effect MUST contain integer-minor-unit or declared-
scale lines in exactly one currency. Every line MUST have a stable identifier
and ordinal, one closed account role, bounded semantic dimensions, and either
one positive debit or one positive credit but never both. Debits MUST equal
credits exactly. The effect MUST have deterministic canonical serialization
and a digest that is byte-equivalent for identical frozen inputs and governing
versions.

Contribution versus exchange activity, conditional versus unconditional
support, donor restriction versus internal Designation, and natural versus
functional expense MUST remain separate semantic concepts. No policy, profile,
mapping, carrier, compiler, or provider adapter may silently collapse one into
another.

An authorized accountant or finance authority MUST confirm prospective
semantic accounting-policy versions. Phase 20 MAY enforce mechanics and
source coverage but MUST NOT claim GAAP certification, determine materiality,
or replace accountant judgment. Provider compilers MUST prove effect
equivalence and MUST NOT invent accounting treatment.

Staff review MUST use one progressive surface in this order: **What
happened**, **How it will be recorded**, and an explicitly unsent
**QuickBooks/Xero preview**. Clean proved rows MAY remain collapsed; grouped
exceptions MUST retain their exact cause and owning authority.

#### Scenario: A complete balanced intent is released

- GIVEN source coverage and the accountant-confirmed policy resolve one
  eligible balanced effect
- WHEN the atomic release fence succeeds
- THEN one immutable release stores the Posting Intent and Canonical Accounting
  Effect together
- AND its debits, credits, currencies, sources, and control totals are exact

#### Scenario: Identical frozen inputs are compiled again

- GIVEN source facts, deterministic input order, policy, builder, mapping,
  Posting Profile, compiler, adapter, and allocation-algorithm versions are
  identical
- WHEN the Canonical Accounting Effect is rebuilt
- THEN stable line identifiers, ordinals, canonical bytes, and digest are
  identical
- AND provider state or mutable display names cannot change the effect

#### Scenario: A canonical line is structurally invalid

- WHEN an effect line has no stable identifier or ordinal, has non-positive
  value, carries both debit and credit, or introduces a second currency
- THEN release fails atomically
- AND no provider plan, package, or outbox operation is created

#### Scenario: The proposed effect is not balanced

- WHEN a candidate's canonical debit and credit totals differ
- THEN release fails atomically with zero release, outbox, package, or provider
  operation effects
- AND the blocking accounting exception identifies the smallest exact scope

#### Scenario: A provider plan changes accounting meaning

- GIVEN a QBO or Xero compiler produces a native plan
- WHEN the plan cannot prove effect equivalence to the Canonical Accounting
  Effect
- THEN that plan and delivery lane are not ready
- AND the adapter cannot substitute a different accounting treatment

#### Scenario: Staff review a release before sending

- WHEN authorized staff open an eligible release review
- THEN the product presents What happened, How it will be recorded, and the
  QuickBooks/Xero preview in that order
- AND the provider preview remains labelled unsent until delivery evidence
  exists

#### Scenario: Accounting policy changes after a release

- GIVEN a release pins an active semantic policy version
- WHEN an authorized accountant activates a later policy version
- THEN the change applies only to prospectively eligible work
- AND the original release and any correction lineage retain the prior version

### Requirement: D5 Posting Profiles Are Bounded Goal-led Provider-native And Prospective

Each configured Legal Entity and Accounting Destination MUST have exactly one
active, prospective, versioned **Posting Profile bundle** before source-purpose
work can be admitted. An unconfigured pair MAY have no active bundle, but it
MUST admit no work. The bundle MUST contain exactly one certified
provider-native recipe and permitted grain for each supported source-purpose
family:

- online processor settlement;
- offline Deposit Group;
- cleared paid expense;
- genuine unpaid obligation;
- correction or reversal derived from the original recipe; and
- exceptional accountant adjustment.

The guided defaults MUST be fund summary for online processor settlement, gift
detail for offline Deposit Groups, and approved-line detail for approved
expenses. Staff MAY select another certified grain only when the exact
destination capability and current Certified Execution Envelope prove it safe.
An exceptional accountant adjustment MAY use QBO `JournalEntry` or Xero
`ManualJournal`; those resources MUST NOT be a fallback for another unsupported
or failed source-purpose recipe.

Posting Profiles MUST control provider representation and detail only. They
MUST NOT change source facts, accounting recognition, Canonical Accounting
Effects, mapping truth, dates, currencies, restrictions, or delivery evidence.
Asym MUST own and certify the bounded provider-native recipes; tenants MUST NOT
author executable accounting code or arbitrary field rules.

Activation MUST validate destination capabilities, mappings, Carrier Plans,
volume shape, report visibility, and posting ownership. Profile versions MUST
be immutable and prospective, and released work MUST remain pinned to its
effective version.

#### Scenario: Staff choose a goal-led posting grain

- GIVEN the destination supports more than one certified grain
- WHEN authorized staff select the outcome and inspect its native preview
- THEN the product explains the detail, reporting, and volume consequences
- AND activation creates one prospective immutable Posting Profile bundle
  version for the Legal Entity and Accounting Destination
- AND that bundle contains one certified recipe and permitted grain for every
  supported source-purpose family

#### Scenario: Staff accept the guided source-family defaults

- GIVEN a destination supports online settlement, offline Deposit Group, and
  approved-expense posting
- WHEN authorized staff review a new Posting Profile bundle
- THEN online settlement defaults to fund summary
- AND offline Deposit Group defaults to gift detail
- AND approved expense defaults to approved-line detail
- AND another grain is available only when current destination capability and
  the Certified Execution Envelope prove it safe

#### Scenario: A second active bundle is proposed

- GIVEN one Posting Profile bundle is active for a Legal Entity and Accounting
  Destination
- WHEN staff activate a successor bundle
- THEN activation atomically supersedes the prior bundle at the prospective
  boundary
- AND the pair never has two active bundles or purpose-specific parallel
  bundles

#### Scenario: A correction or reversal enters the profile

- GIVEN a source occurrence was compiled through one certified recipe
- WHEN a correction or reversal is admitted
- THEN its Posting Profile recipe is derived from the original source-purpose
  recipe
- AND it does not switch to an exceptional accountant-adjustment recipe

#### Scenario: A requested grain exceeds proved capability

- GIVEN a detail profile would exceed a certified provider or reporting shape
- WHEN staff attempt activation
- THEN activation is blocked with the exact unsupported capability
- AND the product offers only permitted pre-release profile or lane choices

#### Scenario: A profile changes while work is already released

- GIVEN an Accounting Release pins a prior Posting Profile
- WHEN a later profile becomes active
- THEN all operations and readback for the existing release keep the prior
  profile
- AND new work uses the later profile only after its effective boundary

#### Scenario: Staff attempt to author a custom recipe

- WHEN staff provide arbitrary debit, credit, provider-field, or executable
  rule logic
- THEN the product rejects it as outside the bounded profile model
- AND no uncertified posting path is created

#### Scenario: A normal source-purpose recipe cannot compile

- GIVEN an online settlement, offline Deposit Group, expense, payable,
  correction, or reversal cannot compile through its certified recipe
- WHEN delivery planning evaluates the unsupported or failed recipe
- THEN the affected work is blocked with a typed cause
- AND QBO `JournalEntry` or Xero `ManualJournal` is not selected as a fallback

#### Scenario: An accountant creates an exceptional adjustment

- GIVEN an authorized accountant selects the exceptional accountant-adjustment
  source-purpose family under a certified provider plan
- WHEN the bundle compiles that adjustment
- THEN QBO `JournalEntry` or Xero `ManualJournal` may be used as the explicit
  exceptional recipe
- AND the adjustment remains distinguishable from every ordinary source-
  purpose recipe

### Requirement: D6 Every Source Allocation Resolves Exactly Once Through Exact Or Proved Grouped Mapping

Every included source-owned Designation allocation MUST resolve exactly once
under one immutable, effective-dated **Designation Mapping Version** to one
provider-neutral **Accounting Reporting Target** or to one explicitly permitted
evidence-only disposition.

Source Designations, Accounting Reporting Targets, semantic roles, and
provider carrier objects MUST remain distinct meanings. Exact mapping MUST be
available. Grouped mapping MAY be used only when a non-recursive, complete,
unambiguous rule and **Mapping Coverage Manifest** prove every included source
allocation's result. Blank fallthrough, recursive groups, provider-name
matching, and silent `Other` targets MUST be forbidden.

Provider bindings MUST be typed and prospective. Archived, merged, duplicated,
or materially changed provider objects MUST cause drift review rather than
silent remapping. Provider-object provisioning, when later supported, MUST be
explicit, idempotent, and separately authorized.

#### Scenario: An exact Designation mapping resolves

- GIVEN one allocation has one active exact mapping
- WHEN a release candidate resolves its accounting target
- THEN it records the source Designation, mapping version, Reporting Target,
  and typed provider binding exactly once
- AND source-level lineage remains available under summary posting

#### Scenario: A grouped mapping has complete coverage

- GIVEN an authorized grouping rule is non-recursive and every included
  Designation resolves unambiguously
- WHEN the Mapping Coverage Manifest is compiled
- THEN activation may proceed with exact member counts, totals, and resolution
  evidence
- AND later group edits do not change a frozen release

#### Scenario: A mapping is missing or ambiguous

- WHEN an included allocation resolves to zero or more than one target
- THEN the affected work is blocked before release
- AND no blank, guessed, provider-name, or catch-all fallback is applied

#### Scenario: A bound provider object drifts

- GIVEN a mapping references an exact QBO or Xero carrier object
- WHEN capability inspection finds that object archived, merged, duplicated,
  or materially changed
- THEN the binding becomes not ready and affected work routes to one exception
- AND previously released evidence keeps the historical provider identity

### Requirement: D7 QBO Carrier Plans Are Tenant-owned Capability-certified And Effect-preserving

Each QBO Accounting Destination MUST use one immutable, prospective, tenant-
owned **QBO Carrier Plan**. It MUST bind only supported semantic roles to
certified QBO carrier kinds and exact positions in the active provider-native
recipe.

The plan MAY support guided combinations of Accounts and subaccounts,
Products/Services, Classes, Locations, Customers, and Projects when their
actual QBO meanings, subscription, preferences, capacity, transaction
positions, and report visibility are proved. It MUST NOT declare these carrier
kinds interchangeable or require one universal nonprofit setup.

Carrier collisions, duplicate semantic meaning, unsupported transaction
positions, inactive objects, and effect-changing gaps MUST be hard blockers.
Bounded reporting limitations that preserve the accounting effect MAY be
tenant-confirmable warnings with exact disclosure. Activation MUST create a
Capability Certificate and reporting-coverage record, and direct delivery
MUST use operation-granular idempotency, exact readback, and drift detection.

#### Scenario: A tenant preserves its existing QBO books

- GIVEN the tenant's existing QBO setup uses a supported carrier combination
- WHEN staff map semantic roles and pass capability proof
- THEN the product activates that bounded Carrier Plan without forcing a
  Class-only or chart-redesign model
- AND the exact native preview explains where each meaning will appear

#### Scenario: Two QBO carriers duplicate one meaning

- WHEN a proposed plan places the same semantic reporting role into conflicting
  carrier positions
- THEN activation is blocked with the collision explained in bookkeeper terms
- AND no balanced-but-misclassified output is certified

#### Scenario: QBO capability changes after activation

- GIVEN an active plan depends on an enabled QBO preference or subscription
  capability
- WHEN live inspection shows that capability is no longer available
- THEN new affected releases are blocked or use an independently certified
  artifact lane
- AND existing release and provider evidence remain unchanged

#### Scenario: QBO readback differs from the frozen plan

- GIVEN QBO accepted an operation
- WHEN exact readback does not match the frozen effect or carriers
- THEN the operation is marked mismatched and opens one cause-owned exception
- AND the system neither rewrites the release nor claims success

### Requirement: D8 Xero Carrier Plans Are Tenant-owned Capability-certified And Effect-preserving

Each Xero Accounting Destination MUST use one immutable, prospective, tenant-
owned **Xero Carrier Plan**. It MUST model Xero independently from QBO and bind
only certified carrier meanings to exact provider-native recipe positions.

The plan MAY use supported Accounts, Tracking Categories and Options, Items,
Contacts, references, and separately qualified Projects behavior. It MUST
respect the two-active-Tracking-Category boundary, reserved bank-account
restrictions, report-shape limits, object state, subscription and organization
capabilities, and the absence of public API authority for bank-statement
reconciliation.

Hard semantic or effect gaps MUST block activation. Bounded report visibility
that preserves accounting effect MAY be accepted only with exact disclosure.
The Capability Certificate MUST pin the organization, base currency,
capabilities, carrier plan, compatible mapping digest, and observation time.
Delivery MUST retain provider identities, exact readback, and later drift.

#### Scenario: A tenant uses one Xero Tracking dimension selectively

- GIVEN the tenant has one available Tracking Category and a supported plan
- WHEN staff bind one semantic reporting role and accept the exact visibility
  disclosure
- THEN the plan may activate without consuming a second dimension
- AND unrelated tenant-owned Tracking usage remains untouched

#### Scenario: A plan requires an unsupported Xero carrier position

- GIVEN the recipe would use a reserved bank account or unsupported tracking
  position
- WHEN capability proof runs
- THEN activation is blocked
- AND the compiler cannot substitute a Manual Journal or unrelated carrier

#### Scenario: Xero report visibility is bounded

- GIVEN the effect is correct but a requested many-fund report shape exceeds
  Xero's certified visibility envelope
- WHEN staff review the plan
- THEN the product discloses the exact reporting limitation and retained Asym
  lineage
- AND activation requires an authorized, prospective confirmation

#### Scenario: Xero readback does not imply reconciliation

- GIVEN Xero accepted and exactly read back the provider-native accounting
  objects
- WHEN the product shows delivery status
- THEN it may show accepted and verified accounting delivery
- AND it does not claim the bank statement or books are reconciled

### Requirement: D9 Processor Settlement Evidence Is Source-authoritative And Mode-honest

Phase 20 MUST persist source-labelled Stripe Balance Transactions, fees,
refunds, disputes, transfers, currencies, and payout evidence through
idempotent webhook ingestion plus scheduled pagination and repair.

One normalized **Settlement Evidence Snapshot** MUST use exactly one truthful
mode. **Payout-attributed evidence** MAY be used only when Stripe supports
exact membership, marks composition complete, and every page has been
retrieved and verified. **Balance-window evidence** MUST preserve one bounded,
contiguous account, mode, balance type, currency, and interval when exact
membership is unavailable; it MUST NOT claim which transactions composed a
transfer.

Every immutable Settlement Component MUST preserve its provider `amount`,
`fee`, `net`, currency, classification, source reference, account, environment,
balance type, source times, and raw-evidence digest. The payout balance debit
MUST be retrieved and tracked separately as the provider-owned **Processor
Payout Transfer** movement; it MUST NOT be treated as another contribution,
fee, or fund expense. Composition MUST prove the provider amount/fee/net
equation and MUST NOT subtract an embedded or separately represented fee
twice.

Unknown, newly introduced, repeated, or double-represented provider types and
reporting categories MUST remain immutable source-labelled classification
exceptions. They MUST NOT be dropped, guessed, mapped to `Other` or suspense,
allocated to a Designation, or admitted into dependent Accounting Releases
until the exact classification contract resolves them.

Processor payout transfer state, Bank Match, source coverage, Accounting
Release delivery, and provider reconciliation MUST remain independently
authoritative lifecycle axes. Missing or changed provider evidence MUST use
append-only repair and supersession.

#### Scenario: A supported automatic payout is complete

- GIVEN Stripe exposes exact payout membership and composition is complete
- WHEN every page and Balance Transaction is retrieved and verified
- THEN the snapshot records payout-attributed evidence with exact members and
  control totals
- AND every member retains its provider identity and source linkage

#### Scenario: Exact payout membership is unavailable

- GIVEN a manual, instant, split, or otherwise unsupported transfer mode
- WHEN Phase 20 builds settlement evidence
- THEN it records a bounded balance-window snapshot with an explicit
  non-attributed capability label
- AND it does not manufacture transaction-to-payout membership

#### Scenario: A contributing transaction already includes its fee

- GIVEN a Stripe Balance Transaction preserves exact amount, fee, and net
- WHEN settlement composition also retrieves the separate payout balance debit
- THEN arithmetic counts the fee exactly once and the payout debit only as
  transfer movement
- AND the product does not post either value again as a fund expense

#### Scenario: Stripe introduces an unknown reporting category

- WHEN an ingested balance movement has an unknown, repeated, or double-
  represented provider classification
- THEN the immutable source fact creates a bounded classification exception
- AND no `Other`, suspense, Designation allocation, or release readiness is
  inferred

#### Scenario: Webhook and nightly repair deliver the same provider fact

- WHEN the same Stripe evidence arrives through more than one ingestion path
- THEN semantic idempotency produces one current provider fact with append-only
  observation evidence
- AND no duplicate settlement member, cost, or release eligibility is created

#### Scenario: Pagination is incomplete

- GIVEN one or more expected Stripe pages are missing or change during
  retrieval
- WHEN automatic composition is evaluated
- THEN payout-attributed completeness remains false and dependent release work
  is blocked or uses only the truthful bounded mode
- AND an actionable ingestion exception is visible

### Requirement: D10 Bank Match Is Bounded And Source-labelled While QBO Or Xero Retains Final Reconciliation

Phase 20 MUST derive immutable **Expected Bank Arrivals** from supported
processor transfers and posted offline Deposit Groups without promoting them to
bank truth. It MUST record posted **Bank Evidence Observations** with exact
source lane and provenance from reviewed statement import, optional certified
read-only connection, or explicit staff-confirmed evidence.

A **Bank Match** MAY allocate one-to-one, many-to-one, one-to-many, or partially
between expectations and observations only within one tenant, Legal Entity,
bank-account binding, currency, direction, and posted-state scope. Integer-
minor-unit conservation, no over-allocation, and no double consumption MUST be
enforced.

Deterministic automation MAY confirm only an exact unambiguous match under a
versioned policy. Similar amount, date, description, or reference MAY rank
candidates but MUST NOT silently prove a match. Pending, ambiguous, stale,
changed, removed, or residual evidence MUST remain visible. Bank Match MUST
never claim QBO/Xero bank reconciliation or period close.

#### Scenario: Statement import produces one exact match

- GIVEN a posted statement row and one Expected Bank Arrival agree exactly
  under the active policy with no competing candidate
- WHEN matching runs
- THEN the product may create an automatic Bank Match with exact provenance
- AND it still labels final QBO/Xero reconciliation as externally owned

#### Scenario: Several expectations compose one bank deposit

- GIVEN multiple same-scope Expected Bank Arrivals exactly compose one posted
  bank observation
- WHEN authorized staff review the allocation
- THEN the Bank Match conserves every expectation and observation in integer
  minor units
- AND no amount is allocated twice or across Legal Entities

#### Scenario: Several plausible candidates exist

- WHEN amount, date, or description similarity yields more than one candidate
- THEN the product ranks them for review but creates no automatic Bank Match
- AND staff see the residuals and evidence needed to decide

#### Scenario: A bank observation changes after matching

- GIVEN imported or connected bank evidence is later corrected, removed, or
  superseded
- WHEN the mutation is observed
- THEN the original evidence and match remain append-only history while current
  status becomes exception or re-review
- AND no gift, payout, Accounting Release, or provider object is rewritten

### Requirement: D11 Released Accounting Is Corrected Only With Policy-permitted Compensating Releases

An Accounting Release that has crossed its release fence MUST never reopen or
mutate. A later source-owned correction MUST create a new signed source effect
and, when accounting action is required, one source- and cause-linked
**Compensating Accounting Release**.

One immutable, prospective, accountant-confirmed **Correction Posting Policy
Version** MUST define permitted treatments and posting periods. Source-
effective, discovery, accounting-effective, and provider-posting dates MUST be
preserved independently. Staff MAY choose only a currently permitted
treatment; Asym MUST NOT silently backdate, choose a period, change provider
locks, store a close password, determine materiality, or prepare a restatement.

The closed **Correction Cause** catalog MUST contain exactly: subsequent
economic event; source fact correction; accounting policy or mapping
correction; delivery duplicate or omission; provider record drift; and
potential prior-period error. Potential prior-period error MUST always remain
accountant-owned. When policy permits exactly one treatment and period, the
product MUST recommend it quietly. When several are permitted, authorized
staff MUST choose only among them and MUST record a concise reason when
departing from the recommendation. When none is permitted, delivery MUST
remain blocked.

QBO and Xero delivery MUST use the active provider-native recipe, operation-
granular idempotency, read-before-retry after ambiguity, exact readback, and
drift detection. A locked or provider-rejected period MUST remain accountant-
owned exception work.

#### Scenario: A current-period correction is permitted

- GIVEN a source correction and pinned policy permit a current-period
  compensating treatment
- WHEN authorized staff release it
- THEN a new balanced release links the original source, original release,
  cause, and all four dates
- AND the original release remains immutable

#### Scenario: Exactly one correction treatment is permitted

- GIVEN one closed Correction Cause resolves to exactly one permitted
  treatment and posting period
- WHEN authorized staff review the correction
- THEN the product recommends that option quietly
- AND staff can proceed without selecting among nonexistent alternatives

#### Scenario: Several correction treatments are permitted

- GIVEN one closed Correction Cause resolves to several permitted treatments
  or periods
- WHEN authorized staff review the correction
- THEN they may choose only among those policy-permitted options
- AND departing from the recommendation requires a concise reason

#### Scenario: No posting period is permitted

- GIVEN the provider period is locked or the tenant policy offers no accepted
  treatment
- WHEN the correction reaches readiness
- THEN delivery is blocked for accountant-owned resolution
- AND Asym does not backdate, reopen, or choose another period

#### Scenario: A potential prior-period error is reported

- WHEN a correction is classified as potential prior-period error
- THEN it remains blocked for accountant-owned resolution regardless of other
  automatic policy options
- AND Asym makes no materiality or restatement decision

#### Scenario: A correction write has an unknown outcome

- WHEN QBO or Xero may have accepted the compensating operation but no exact
  response exists
- THEN the operation is quarantined and looked up before any retry
- AND a second compensating effect is not created

#### Scenario: The correction may require restatement judgment

- GIVEN the cause is marked potentially material or outside the approved
  correction policy
- WHEN finance staff review it
- THEN Phase 20 shows the exact original and proposed effects and escalates to
  the tenant's accountant
- AND it makes no GAAP, materiality, or restatement decision

### Requirement: D12 Tenants Control Release Cadence Through One Atomic Readiness Fence

Each tenant, Legal Entity, Accounting Destination, delivery lane, and Posting
Intent family MAY have one prospective, immutable **Accounting Release Cadence
Policy Version** with one explicit IANA timezone. It MUST support three goal-
based modes: automatically release eligible routine work, prepare on a bounded
schedule for staff review, or wait for staff release.

Supported timing presets MUST be limited to when-ready, weekday, weekly, or
monthly on day 1 through 28 or the last calendar day. Arbitrary cron and tenant-
authored readiness rules MUST NOT be supported. A repeated daylight-saving
local time MUST execute once; a nonexistent local time MUST execute at the
first valid instant after the gap; and missed occurrences MUST coalesce into
one current readiness evaluation.

New direct Accounting Destination Connections MUST begin review-first. Cadence-
configuration and release authority MUST be separate capabilities, even when
one staff member holds both. Destination replacement MUST prospectively retire
the old destination's cadence without changing frozen releases.

Timing and review are tenant choices. Readiness, source coverage, accounting
treatment, period policy, mapping, destination, capability, cutover ownership,
exceptions, balance, and immutable-release rules MUST NOT be configurable
bypasses.

A Release Candidate MUST remain derived and recomputable. Every mode MUST enter
the same atomic release fence. Revalidation MAY remove changed units but MUST
NOT silently add new units to a reviewed set. **Pause upcoming releases** MUST
affect only later fences; **Release now** MUST not bypass a gate. Bulk release
MAY return exact mixed results without treating the bulk request as one
provider transaction.

The rebuildable, permission-filtered **Release Horizon** MUST group work as
**Needs attention**, **Ready for review**, **Scheduled or automatic**, and
**Recently released**. Cadence Execution Evidence MUST preserve occurrence
identity, policy version, reviewed selection when present, source digests,
exclusions, pause/resume evidence, created releases, and provider correlations
without copying donor PII.

#### Scenario: Routine work releases automatically

- GIVEN automatic cadence is active and every current gate passes
- WHEN eligible source work reaches its release boundary
- THEN the common release fence creates one immutable release
- AND provider delivery remains a separate later lifecycle

#### Scenario: A new direct connection is configured

- GIVEN staff prove a new direct QBO or Xero destination
- WHEN its first Cadence Policy is activated
- THEN the destination begins in prepare-for-review mode
- AND automatic release requires a separately authorized prospective policy
  change

#### Scenario: A scheduled occurrence crosses daylight-saving time

- GIVEN a bounded schedule uses an explicit IANA timezone
- WHEN its local time repeats, does not exist, or was missed during downtime
- THEN a repeated time runs once, a gap runs at the first valid instant, and
  missed occurrences coalesce into one current readiness evaluation
- AND Cadence Execution Evidence records the resolved occurrence identity

#### Scenario: A reviewed candidate becomes stale

- GIVEN staff reviewed a candidate and one source or policy version changes
- WHEN release is attempted
- THEN revalidation removes or blocks the changed units and discloses the delta
- AND it never silently adds newly eligible work to the reviewed release

#### Scenario: Staff pause upcoming releases

- WHEN authorized staff pause one cadence scope
- THEN future release fences in that scope are held with a clear reason
- AND already frozen releases and safely in-flight provider operations continue
  under their own truth

#### Scenario: Staff inspect the Release Horizon

- WHEN an authorized user opens the permission-filtered accounting doorway
- THEN current work appears in exactly Needs attention, Ready for review,
  Scheduled or automatic, or Recently released
- AND the view is rebuilt from source and lifecycle truth rather than becoming
  a release authority

#### Scenario: A bulk release contains mixed readiness

- GIVEN some selected units remain eligible and others changed or became
  blocked
- WHEN staff use Release now
- THEN independently valid units may release and every blocked unit returns an
  exact result
- AND no gate, provider limit, or exception is bypassed

### Requirement: D13 Accounting Exception Cases Own Causes And Share Follow-up Without Sharing Truth

Phase 20 MUST own one **Accounting Exception Case** for each versioned,
contract-defined root-cause occurrence. The case MUST store exact tenant and
Legal Entity scope, cause, blocked radius, evidence, lifecycle, and proof needed
to clear. Unrelated clean work MUST continue.

Detection MUST be idempotent. A case MUST clear only when its cause-specific
contract proves the condition no longer exists. Recurrence after resolution
MUST create a linked successor rather than rewrite history. Staff suppression,
dismissal, or generic task state MUST NOT change the accounting cause.

Human assignment and collaboration MUST reuse the shared Mission Control task
model through an idempotent, outbox-reconcilable link. Mission Control owns
assignees, comments, due dates, reminders, and follow-up status only. Bulk
actions MUST be limited to homogeneous, revalidated cases and return exact
item results.

Where a versioned Exception Contract permits it, an authorized **Handled
outside Asym** outcome MUST capture typed external evidence. **Record handled
in QuickBooks/Xero** MUST capture the exact provider reference or explicit
staff attestation and attempt exact readback when capability permits. External
handling MUST NOT be relabelled as Asym delivery or clear the case without the
cause contract's required proof.

#### Scenario: One root cause blocks a bounded scope

- GIVEN several release units share one missing mapping version
- WHEN the cause is detected
- THEN one Accounting Exception Case blocks only the affected scope
- AND unrelated eligible work remains releasable

#### Scenario: Staff close the follow-up task

- GIVEN a Mission Control task links to an unresolved accounting case
- WHEN staff complete or dismiss the task
- THEN the accounting case remains unresolved until cause-specific proof passes
- AND task state does not become financial evidence

#### Scenario: Staff record work handled in QBO or Xero

- GIVEN the case's Exception Contract permits external handling
- WHEN authorized staff provide the exact provider reference or labelled
  attestation
- THEN the product retains typed external evidence and attempts exact readback
  when available
- AND it neither claims Asym delivered the work nor resolves the case without
  its required proof

#### Scenario: The cause is proved resolved

- GIVEN the exact missing capability, mapping, evidence, or provider state is
  now valid
- WHEN the case contract revalidates it
- THEN the case resolves with append-only proof and blocked work returns to
  ordinary readiness evaluation
- AND no source or release history is rewritten

#### Scenario: A resolved cause recurs

- WHEN the same cause occurs again after resolution
- THEN a linked successor case is created with current evidence
- AND the prior case remains immutable resolved history

### Requirement: D14 Provider Authorization Is Destination-pinned Encrypted And Prospectively Replaceable

Phase 20 MUST separate encrypted **Provider Authorization Grants** from stable,
tenant- and Legal-Entity-scoped **Accounting Destination Connections**. Every
provider operation MUST pin the exact QBO `realmId` or Xero `tenantId`,
environment, destination connection, and applicable grant generation.

OAuth attempts MUST be short-lived, single-use, server-correlated, and use
provider-required security controls. Callbacks MUST NOT infer tenant, Legal
Entity, or destination from untrusted provider names or browser fields.
Credential rotation MUST be serialized and fence stale workers.

Reconnect MAY repair only the same proved external organization. A different
organization MUST require explicit prospective destination replacement.
Disconnect MUST quarantine new direct work locally before remote revocation and
use the least provider-supported blast radius. Because a Xero grant can cover
several organizations, shared-grant impact MUST be disclosed and contained.
Certified artifact delivery MUST remain available during direct-connection
outages when safe.

#### Scenario: Staff connect one exact organization

- GIVEN an authorized staff member begins provider-native OAuth
- WHEN the callback proves the state, grant, external organization, tenant,
  Legal Entity, and environment
- THEN one destination connection pins the exact provider organization
- AND tokens are encrypted and absent from browser, logs, and generic events

#### Scenario: Credential rotation races a worker

- GIVEN a provider grant refresh or rotation begins
- WHEN an older worker attempts a provider call
- THEN grant-generation fencing prevents stale credential use
- AND successful serialized rotation preserves the same destination identity

#### Scenario: Reconnect selects another organization

- GIVEN staff started reconnect for an existing destination
- WHEN provider authorization returns a different realm or tenant
- THEN reconnect is rejected as a repair
- AND staff must review a prospective destination replacement

#### Scenario: A connection is disconnected during an outage

- WHEN authorized staff disconnect or security quarantine a destination
- THEN new direct work is stopped locally before remote revocation and affected
  grants/connections are disclosed
- AND immutable releases, artifacts, prior readback, and any certified staff-
  mediated lane remain available under their own permissions

### Requirement: D15 Direct-delivery Capacity Is Workload-shaped Certified Fair And Recovery-safe

Direct delivery MUST be admitted from the exact immutable Provider Delivery
Plan. A destination Capability Certificate MUST prove current organization-
specific capabilities, while one versioned **Certified Execution Envelope**
MUST prove the operation, line, byte, batch, latency, readback, and recovery
shapes Asym has actually tested for the provider contract, adapter, recipe, and
environment.

Live provider quota, health, commercial headroom, and tenant-fair queue
position MUST remain observations rather than certificate truth. Work outside
the certified structural envelope MUST NOT enter direct delivery. Before
release, staff MAY choose only a permitted profile, grouping, or certified
artifact lane. A frozen release MUST NOT change grain, destination, or lane to
fit capacity.

Scheduling MUST be provider-native, tenant-fair, and preserve protected
capacity for exact readback and ambiguous-outcome recovery. Staff MUST receive
calibrated range-based timing and truthful progress without tenant-configured
rate, concurrency, priority, or retry knobs.

#### Scenario: A plan is inside the certified envelope

- GIVEN the exact operation, line, byte, and recovery shape is certified
- WHEN direct delivery is admitted
- THEN provider-native fair scheduling may queue the immutable operations
- AND staff receive an evidence-based timing range rather than a guarantee

#### Scenario: A plan is outside the certified envelope

- WHEN the frozen Provider Delivery Plan exceeds a proved structural limit
- THEN direct delivery is blocked before provider handoff
- AND the product does not silently regroup, summarize, split meaning, or
  change lanes

#### Scenario: One tenant has a large backlog

- GIVEN several tenants share provider capacity
- WHEN the large tenant and smaller tenants have eligible operations
- THEN tenant-fair scheduling prevents indefinite starvation
- AND provider safety and semantic ordering remain intact

#### Scenario: New writes compete with recovery

- GIVEN ambiguous operations require exact provider lookup and readback
- WHEN queue pressure is high
- THEN protected recovery capacity remains available
- AND new writes cannot consume the entire safety budget

### Requirement: D16 Staff-mediated Delivery Uses Capability-certified Immutable Packages

The staff-mediated lane MUST produce one immutable **Accounting Delivery
Package** from the exact frozen Provider Delivery Plan. It MUST pin tenant,
Legal Entity, destination, lane, currency, accounting date, source coverage,
governing versions, compiler, provider contract, and exact control totals.

A package MAY become **Ready to import** only while its exact destination is
not quarantined and both its destination Capability Certificate and narrow
**Import Surface Conformance Record** are current and unquarantined for the
exact provider, region, subscription capability, importer, template,
serializer, limits, and recovery behavior. Unsupported plans MUST fail closed;
the product MUST NOT emit a generic CSV, fabricated bank statement, manual-
journal substitution, or lossy fallback.

The UI MUST separate review, download, provider staging or draft, finalization,
exact readback, mismatch, drift, and final reconciliation. While retained,
re-download MUST return identical bytes. Historical byte availability MUST
remain distinct from current import readiness. Package bytes MUST follow the
artifact retention, hold, and disposal contract; disposed bytes MUST be
reported unavailable and MUST NOT be regenerated. Re-import MUST never be
described as retry. Partial or unknown outcomes MUST use a cause-owned
exception, and a recovery package MUST contain only exact work proved not
imported.

#### Scenario: A certified package is prepared

- GIVEN the exact provider plan and import surface are currently certified
- WHEN staff prepare the staff-mediated lane
- THEN the product produces one file or ordered parts with manifest, digests,
  control totals, and clear destination instructions
- AND the Accounting Evidence Artifact remains independently available

#### Scenario: The import surface cannot preserve the effect

- WHEN conformance proof cannot preserve the exact plan, carriers, amounts, or
  required references
- THEN package readiness is blocked
- AND no generic or lossy fallback is generated

#### Scenario: Staff redownload a package

- GIVEN a package was already generated and its exact bytes remain retained
- WHEN authorized staff download it again
- THEN the exact original bytes and manifest are returned
- AND no new package identity, release, or provider operation is created

#### Scenario: Package certification expires after generation

- GIVEN exact package bytes remain retained but its destination capability,
  conformance, or quarantine state is no longer current
- WHEN authorized staff inspect or download the historical package
- THEN the product may provide the identical retained bytes as audit evidence
- AND it does not label the package Ready to import

#### Scenario: Package bytes were lawfully disposed

- GIVEN package retention expired and audited disposal completed without a hold
- WHEN authorized staff request the historical package
- THEN metadata, manifest, digests, outcomes, and disposal tombstone remain
  inspectable while the bytes are reported unavailable
- AND the product does not rebuild a lookalike package from current data

#### Scenario: Staff report a partial or uncertain import

- WHEN some package operations may have been finalized but exact coverage is
  unknown
- THEN the product opens one bounded exception and requires provider evidence
  or item-level staff reconciliation
- AND any recovery package contains only units positively proved unimported

### Requirement: D17 Posting Ownership Transfers At One Proved Source-family Boundary

Exactly one system MUST own provider posting for one canonical source
occurrence, tenant, Legal Entity, accounting destination, source account or
instrument, Accounting Posting Intent family, and source-authoritative
ownership interval.

One immutable **Posting Ownership Cutover** MUST transfer authority
prospectively at a complete source-family boundary. It MUST record exact half-
open ownership intervals and MUST NOT split an atomic payout, Deposit Group,
expense, obligation, payment, or other source occurrence merely because a date
crosses the selected boundary.

One **Cutover Coverage Manifest** MUST distinguish previous-owner coverage,
exact previous-owner provider evidence, proved-unposted gaps, prospective Asym
ownership, intentional exclusions, and ambiguity. Clean forward-only
activation at the next drained boundary MUST be the default. Optional history
MUST be off by default and limited to exact positively proved gaps. Overlap or
ambiguity MUST quarantine only affected unreleased work. Previous-owner
evidence MUST retain its provenance.

A final bounded pre-activation inspection and bounded post-activation overlap
monitor MUST detect and quarantine every conflict visible through the
capability-labelled certified inspection surface. The product MAY state only
**No known overlap found in the inspected scope**; it MUST disclose that
unobservable manual or independent-connector writes remain possible because
Asym cannot lock another writer. A detected conflict MUST quarantine only
affected unreleased or corrective work without rewriting provider evidence or
the cutover interval.

#### Scenario: Staff activate at the next drained boundary

- GIVEN prior-owner work is complete through one source-family boundary
- WHEN the cutover manifest proves coverage and staff activate it
- THEN the prior owner and Asym receive non-overlapping half-open intervals
- AND only later complete source occurrences become Asym-owned

#### Scenario: An atomic source occurrence crosses a calendar time

- GIVEN one payout or Deposit Group begins before and completes after the
  proposed time
- WHEN the cutover resolves ownership
- THEN the whole atomic occurrence stays with one posting owner
- AND date-only splitting is forbidden

#### Scenario: Historical inspection proves one gap

- GIVEN capability-labelled provider inspection positively identifies one
  exact unposted occurrence
- WHEN authorized staff opt into bounded backfill
- THEN only that frozen gap may become Asym-owned
- AND no whole-backlog replay or universal-history claim is made

#### Scenario: Provider inspection has bounded visibility

- GIVEN the provider exposes only a certified bounded read-only inspection
  surface
- WHEN pre-activation review finds no overlap in that surface
- THEN the product may report no known overlap in the inspected scope
- AND it discloses that unobservable manual or independent-connector activity
  is not proved absent

#### Scenario: An overlap is discovered after activation

- WHEN provider evidence shows both Asym and a previous owner may have posted
  the same source occurrence
- THEN the post-activation monitor quarantines affected unreleased or
  corrective work in one exception
- AND neither provider evidence nor the cutover interval is rewritten

### Requirement: D18 Expense Accounting Consumes One PII-minimized Source-owned Approved Handoff

Phase 21 MUST own expense reports, receipt evidence, substantiation, approval,
reimbursement obligations, payment execution and evidence, Field Account
effects, immutable **Approved Expense Snapshots**, and separately immutable
reimbursement payment-source occurrences. Phase 20 MUST accept expense
accounting only through one tenant-, Legal-Entity-, source-version-, and
posting-owner-pinned **Accounting-Ready Expense Handoff** with an explicit
snapshot-rooted or payment-rooted source discriminator.

The handoff MUST minimize personal data and MUST exclude raw receipt images.
Its launch catalog MUST be closed to Cleared Organization-Paid Expense,
Approved Reimbursement Obligation, evidence-qualified Reimbursement Payment,
and cause-linked Expense Accounting Correction.

A snapshot-rooted expense, obligation, or correction handoff MUST reference
exactly one Approved Expense Snapshot identity, version, digest, and approved
line-disposition coverage. A payment-rooted handoff MUST instead reference one
immutable payment-source identity, version, and digest plus the complete
covered-obligation and originating-snapshot reference set; it MUST NOT invent a
primary snapshot.

One reimbursement payment MUST carry exact **Reimbursement Payment Coverage**.
Coverage MUST be homogeneous for tenant, Legal Entity, payee, disbursement
currency, and posting owner and conserve the payment through exact applications
plus signed payment-side residual dispositions. Cross-payee batches MUST remain
grouping envelopes around separate atomic payment occurrences. Later returns or
corrections MUST be new signed occurrences.

Phase 20 MUST NOT own approval, AP balances, payment execution, payroll, tax
adjudication, receipts, card-liability reconciliation, Field Account entries,
outbound reimbursement Bank Matches, or final reconciliation.

#### Scenario: An approved organization-paid expense is handed off

- GIVEN Phase 21 freezes one eligible Approved Expense Snapshot
- WHEN it publishes the PII-minimized accounting-ready occurrence
- THEN Phase 20 validates the exact source, Legal Entity, posting owner, and
  policy before release
- AND it does not copy the raw receipt or reopen approval

#### Scenario: A reimbursement obligation is approved

- GIVEN an obligation is approved but not yet paid
- WHEN its accounting-ready handoff is admitted
- THEN the Posting Intent may represent the approved obligation under tenant
  policy
- AND it does not claim reimbursement payment occurred

#### Scenario: One payment covers several obligations

- GIVEN Phase 21 proves a homogeneous reimbursement payment and exact
  applications
- WHEN Phase 20 validates Payment Coverage
- THEN applications and signed residuals conserve the source payment exactly
- AND no application exceeds an obligation's remaining approved amount

#### Scenario: A payment-rooted handoff covers snapshots from several reports

- GIVEN one immutable payment-source occurrence covers complete homogeneous
  obligations whose approved lines came from several snapshot versions
- WHEN Phase 21 publishes the payment-rooted handoff
- THEN Phase 20 requires the payment identity and complete obligation/snapshot
  reference set without selecting a primary snapshot
- AND the outbound disbursement creates no D10 Bank Match

#### Scenario: A cross-payee payment batch is handed off

- GIVEN an operational batch contains payments for more than one payee
- WHEN accounting-ready occurrences are published
- THEN each payee receives a separate atomic payment-rooted handoff and coverage
  graph
- AND the cross-payee batch remains only a grouping envelope

#### Scenario: Phase 21 has not supplied the required handoff

- WHEN an expense draft, receipt, approval UI row, or unproved payment is
  presented directly to Phase 20
- THEN accounting admission fails closed
- AND no alternate expense, AP, or reimbursement authority is created

### Requirement: D19 Processor Costs Default Organization-borne With One Fee-cover-first Fund Mode

Processor costs MUST be organization-borne by default. A tenant MAY
prospectively activate one **fee-cover-first designation-borne uncovered-cost
mode** for an exact tenant, Legal Entity, Settlement Account Binding, source
family, and complete settlement-boundary interval.

Gross supported gift, separate donor fee-cover contribution, exact provider
cost, provider settlement, and any later Field Account effect MUST remain
independent authoritative amounts. Fee-cover MUST apply first to eligible
ordinary processor cost. Only the remaining uncovered eligible cost MAY be
allocated across the original supported Designations when the exact provider
cost and every frozen source Designation allocation share one proved currency
basis. Allocation MUST use integer minor units, deterministic largest
remainder with stable tie-breaking, and one immutable **Processor Cost
Attribution Manifest**. A local-settlement fee MUST NOT be prorated across
foreign-currency source lines.

A prospective Designation exception MAY keep that Designation's calculated
share organization-borne; it MUST NOT redistribute the share to other
Designations. Dispute, FX, payout, reserve, platform, tax, standalone, unknown,
and source-unlinked costs MUST not enter this allocator. Refunds and fee returns
MUST create source-linked compensating occurrences. Ineligible or currency-
incompatible costs MUST remain organization-borne through the configured
central processor-expense target; when that role or mapping is missing, the
affected work MUST remain not ready. QBO/Xero output MUST preserve gross
revenue, complete expense, and required reporting dimensions.

#### Scenario: The organization absorbs processing cost

- GIVEN the default mode is active
- WHEN Stripe supplies an exact eligible processor cost
- THEN the complete expense is attributed to the organization under the pinned
  policy
- AND gross gift and fee-cover truth remain unchanged

#### Scenario: Donor fee-cover fully covers eligible cost

- GIVEN fee-cover-first mode is active and associated fee-cover equals or
  exceeds the eligible ordinary processor cost
- WHEN attribution runs
- THEN no processor cost is allocated to supported Designations
- AND any amount not consumed by the cost remains governed by its source gift
  policy rather than becoming a negative expense

#### Scenario: Uncovered cost is allocated across Designations

- GIVEN eligible cost remains after fee-cover and the provider cost and frozen
  Designation lines share one proved currency basis
- WHEN the original gift supported several Designations
- THEN largest-remainder allocation conserves the uncovered cost exactly in
  integer minor units
- AND an exempt Designation's share stays organization-borne without shifting
  to another Designation

#### Scenario: Local-settlement cost lacks a matching source currency basis

- GIVEN the provider cost is in local settlement currency and one or more
  original Designation lines are in another source currency
- WHEN optional Designation-borne attribution is evaluated
- THEN the incompatible cost is not prorated across those Designations
- AND it remains organization-borne through the central processor-expense
  target

#### Scenario: The central processor-expense mapping is missing

- GIVEN a cost is ineligible or currency-incompatible for Designation
  allocation
- WHEN no configured central processor-expense role and mapping resolves
- THEN the affected accounting work remains not ready
- AND the product does not use `Other`, suspense, or a copied fund target

#### Scenario: A provider later returns part of a fee

- GIVEN an immutable prior cost attribution exists
- WHEN source-labelled provider evidence records a fee return or correction
- THEN a linked signed occurrence and compensating accounting effect use the
  original attribution lineage
- AND the original gift, cost, and manifest are not recomputed or mutated

### Requirement: D20 Settlement Is Local-currency-first With Proof-gated Retained-currency Lanes

Phase 20 MUST preserve donor presentment currency, source transaction currency,
Stripe balance or settlement currency, payout currency, QBO home or Xero base
currency, and reporting currency as independent roles.

The ordinary lane MUST be quiet local/home-currency settlement from exact
account-scoped Stripe Balance Transaction facts only when the pinned Stripe
settlement currency, payout bank-account currency, and destination's certified
QBO HomeCurrency or Xero BaseCurrency are identical. It MUST preserve source
presentment and exact provider conversion evidence, including gross, fee, net,
provider rate or converted amounts when supplied, source identifiers, and
observation time. It MUST NOT infer a rate from mutable balances or use a net
payout as posting truth.

Every Canonical Accounting Effect, Accounting Release, Provider Delivery Plan,
Accounting Delivery Package, Expected Bank Arrival, Bank Match, and Processor
Cost Attribution Manifest MUST have exactly one currency. Cross-currency
translation, revaluation, realized or unrealized FX, and provider-ledger FX
treatment MUST remain QBO/Xero authority.

A retained foreign-settlement-currency lane MUST be opt-in, prospective, and
proof-gated across Stripe account, currency, matching bank destination, QBO or
Xero multicurrency capability, Carrier Plan, package/direct lane, and current
execution evidence. QBO or Xero MUST own translation, revaluation, realized or
unrealized FX, and final books treatment. Capability loss MUST block new
affected releases without rewriting history.

#### Scenario: Stripe converts a foreign gift into home currency

- GIVEN a donor gives in another presentment currency and Stripe settles into
  the identical pinned payout-bank and destination home or base currency
- WHEN settlement evidence becomes complete
- THEN the ordinary lane uses exact local-currency gross, fee, and net evidence
- AND it retains the original presentment and provider conversion lineage

#### Scenario: The payout bank currency differs from destination home currency

- GIVEN Stripe settlement currency, payout bank-account currency, and QBO home
  or Xero base currency are not all identical
- WHEN ordinary local-currency readiness is evaluated
- THEN the ordinary lane remains blocked or uses a separately proved retained-
  currency lane
- AND no cross-currency release graph or inferred conversion is created

#### Scenario: A mutable balance is the only currency evidence

- WHEN exact source-linked Balance Transaction or conversion evidence is
  missing
- THEN affected accounting readiness is blocked or explicitly incomplete
- AND Phase 20 does not invent a conversion rate or derive posting truth from
  the current balance

#### Scenario: Staff activate a retained-currency lane

- GIVEN every Stripe, bank, provider, plan, and execution capability is proved
  for one exact foreign settlement currency
- WHEN authorized staff activate the lane prospectively
- THEN later eligible work may retain and report that settlement currency
- AND QBO or Xero remains authoritative for translation and revaluation

#### Scenario: A retained-currency capability later disappears

- GIVEN releases and evidence already exist under a proved retained-currency
  lane
- WHEN a provider, subscription, bank, or account capability is lost
- THEN new affected releases are blocked and staff receive one actionable
  exception
- AND prior releases, conversion evidence, provider objects, and currency roles
  remain immutable history
