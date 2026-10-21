# Accounting Operations Capability

## ADDED Requirements

### Requirement: D1 One Accounting Doorway Coordinates Bounded Contexts Without Merging Truth

The product MUST expose one tenant-, actor-, environment-, and Legal-Entity- scoped Accounting Operations boundary and one derived **Ready for Accounting** workspace for settlement evidence, Bank Match, Accounting Releases, QBO/Xero delivery, packages, and accounting exceptions.

Every clause in `openspec/contracts/accounting-operations.md#contract-cf15666ac17a7aff5a87` MUST apply without exception.

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

#### Scenario: Phase 21 support reallocation reaches accounting before certification

- GIVEN Phase 21 exposes a request, policy, Coverage Manifest, Decision,
  open-cycle pair, Exit Disposition Manifest, Charitable Succession Handoff or
  Result, payment evidence, unknown result, or close-covered Support
  Reallocation Accounting Occurrence
- AND this Phase 20 generation has no separately certified support-reallocation
  source schema, accountant-confirmed semantics, Posting Profile recipe, and
  D17 owner
- WHEN any route, job, adapter, exceptional JournalEntry or ManualJournal, or
  staff-mediated artifact attempts to create accounting work from it
- THEN the family remains structurally dark before Posting Intent or Accounting
  Release creation
- AND unrelated certified source families remain operable

#### Scenario: A Phase 21 organization support cost reaches accounting before certification

- GIVEN Phase 21 exposes an organization-support-cost observation, economic
  root, bearing policy, application, determination, manifest, carryforward,
  Field Account Funding Coverage, closed effect, or Support Cost Accounting
  Candidate Handoff
- AND this Phase 20 generation has no separately certified exact source schema,
  accountant-confirmed semantics, close-covered occurrence contract,
  compatible Posting Profile recipe, positive unposted or differential proof,
  and D17 posting owner
- WHEN any route, job, adapter, exceptional JournalEntry or ManualJournal,
  expense lane, or staff-mediated artifact attempts to create accounting work
  from it
- THEN Phase 20 rejects it before Accounting Posting Intent or Accounting
  Release creation
- AND it creates no delivery artifact or QBO/Xero provider operation
- AND it does not duplicate or replace Phase 20 D19 processor-cost attribution
  or the Processor Cost Attribution Manifest
- AND unrelated certified source families remain operable

#### Scenario: Noncash realization reaches accounting before certification

- GIVEN Phase 15 exposes a canonical noncash asset-lot or disposition source
  fact
- AND Phase 21 D21 exposes a Noncash Support Realization Manifest, Realized
  Support Basis, cost-treatment selection, close-covered Field Account effect,
  or correction for the same economic lifecycle
- AND this Phase 20 generation has no separately certified exactly-one-source
  contract with non-overlapping coverage and exact D17 posting ownership
- WHEN any route, job, adapter, exceptional JournalEntry or ManualJournal,
  expense lane, or staff-mediated artifact attempts to create accounting work
  from either representation
- THEN Phase 20 rejects it before Accounting Posting Intent or Accounting
  Release creation
- AND it creates no delivery artifact, provider operation, Expected Bank
  Arrival, or Bank Match
- AND it does not route brokerage, liquidation, appraisal, valuation, custody,
  transfer, sale, or other noncash-disposition cost through D19 or Phase 21 D20
- AND it cannot post both the Phase 15 disposition and derivative D21 Field
  Account effect for the same coverage
- AND unrelated certified source families remain operable

#### Scenario: Prospective expense authorization reaches accounting

- GIVEN Phase 21 D22 exposes a posture, Prospective Expense Request Version,
  private evidence reference, Governance Resolution, Approval Assignment
  Snapshot, Review Action, Organization Authorization Decision, compatible
  capacity reservation, Authorization Coverage, unused-scope declaration,
  in-flight residual, successor, or correction
- WHEN any route, job, staff action, JournalEntry, ManualJournal, expense lane,
  artifact fallback, or provider adapter attempts to create accounting work
  from that prospective fact
- THEN Phase 20 rejects it before D18 source admission or Accounting Posting
  Intent creation
- AND it creates no Accounting Release, delivery artifact, provider operation,
  Expected Bank Arrival, Bank Match, or QBO/Xero object
- AND it does not claim the expense was incurred, substantiated, eligible,
  reimbursable, owed, payable, paid, posted, or reconciled
- AND a separately qualified later approved expense or payment occurrence may
  proceed through its own certified source lane

#### Scenario: Operational expense effect reaches accounting

- GIVEN Phase 21 D23 exposes an Expense Field Account Effect Recognition
  Profile, Effect Basis, Funding Coverage Disposition, Effect Coverage,
  operational Expense Field Account Effect, Support Cycle inclusion, or
  correction
- WHEN any route, job, staff action, JournalEntry, ManualJournal, artifact, or
  provider adapter attempts to create accounting work from it
- THEN Phase 20 rejects it before D18 source admission or Posting Intent
- AND it creates no Accounting Release, provider operation, Expected Bank
  Arrival, Bank Match, or QBO/Xero object
- AND unrelated independently certified source families remain operable

#### Scenario: A Phase 21 compensation provider operation reaches accounting

- GIVEN Phase 21 supplies a Compensation Handoff Package, Compensation Draft
  Delivery Profile Version, Provider Draft Operation, provider
  acceptance/readback or permitted staff confirmation, or delivery coverage
- AND no separately certified evidence-qualified compensation occurrence,
  accountant-confirmed semantics, and exact D17 posting owner exist
- WHEN any route, worker, provider adapter, or staff action attempts to create
  accounting work from that evidence
- THEN Phase 20 rejects it before Accounting Posting Intent or Accounting
  Release creation
- AND it creates no QBO or Xero Accounting object, including Xero `DRAFT
ACCPAY`
- AND regional Xero Payroll authorization is not treated as Xero Accounting
  authorization
- AND unrelated certified accounting source families remain operable

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

Every Accounting Release MUST freeze exact source coverage, one Accounting Posting Intent, one balanced Canonical Accounting Effect, governing version pins, one Accounting Destination Connection, one Provider Delivery Plan, and one exclusive delivery lane.

Every clause in `openspec/contracts/accounting-operations.md#contract-fd4cc1aa483445234021` MUST apply without exception.

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

One canonical **Legal Entity** MUST be the enduring legal and financial identity beneath a Tenant.

Every clause in `openspec/contracts/accounting-operations.md#contract-acf32ebb658891d09873` MUST apply without exception.

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

Every Accounting Release MUST combine one typed **Accounting Posting Intent** with one exact provider-neutral **Canonical Accounting Effect**.

Every clause in `openspec/contracts/accounting-operations.md#contract-d1d7d5cfc4ec137441db` MUST apply without exception.

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

Each configured Legal Entity and Accounting Destination MUST have exactly one active, prospective, versioned **Posting Profile bundle** before source-purpose work can be admitted.

Every clause in `openspec/contracts/accounting-operations.md#contract-60d2a74b38849ea795b1` MUST apply without exception.

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

Every included source-owned Designation allocation MUST resolve exactly once under one immutable, effective-dated **Designation Mapping Version** to one provider-neutral **Accounting Reporting Target** or to one explicitly permitted evidence-only disposition.

Every clause in `openspec/contracts/accounting-operations.md#contract-9e276a22f1c5b6af3536` MUST apply without exception.

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

Each QBO Accounting Destination MUST use one immutable, prospective, tenant- owned **QBO Carrier Plan**.

Every clause in `openspec/contracts/accounting-operations.md#contract-385c672e21a52516f732` MUST apply without exception.

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

Each Xero Accounting Destination MUST use one immutable, prospective, tenant- owned **Xero Carrier Plan**.

Every clause in `openspec/contracts/accounting-operations.md#contract-9f3414c2b9f0335b3f92` MUST apply without exception.

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

Phase 20 MUST persist source-labelled Stripe Balance Transactions, fees, refunds, disputes, transfers, currencies, and payout evidence through idempotent webhook ingestion plus scheduled pagination and repair.

Every clause in `openspec/contracts/accounting-operations.md#contract-a9214583177fd225518a` MUST apply without exception.

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

Phase 20 MUST derive immutable **Expected Bank Arrivals** from supported processor transfers and posted offline Deposit Groups without promoting them to bank truth.

Every clause in `openspec/contracts/accounting-operations.md#contract-e9a9f7d0712ff3e20eac` MUST apply without exception.

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

An Accounting Release that has crossed its release fence MUST never reopen or mutate.

Every clause in `openspec/contracts/accounting-operations.md#contract-216f9243a36d5f7f6546` MUST apply without exception.

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

Each tenant, Legal Entity, Accounting Destination, delivery lane, and Posting Intent family MAY have one prospective, immutable **Accounting Release Cadence Policy Version** with one explicit IANA timezone.

Every clause in `openspec/contracts/accounting-operations.md#contract-09e2ea65ce7a729a3faf` MUST apply without exception.

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

Phase 20 MUST own one **Accounting Exception Case** for each versioned, contract-defined root-cause occurrence.

Every clause in `openspec/contracts/accounting-operations.md#contract-227f6c1865040f9e67ec` MUST apply without exception.

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

Phase 20 MUST separate encrypted **Provider Authorization Grants** from stable, tenant- and Legal-Entity-scoped **Accounting Destination Connections**.

Every clause in `openspec/contracts/accounting-operations.md#contract-a821a83eeacd9c92813f` MUST apply without exception.

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

Direct delivery MUST be admitted from the exact immutable Provider Delivery Plan.

Every clause in `openspec/contracts/accounting-operations.md#contract-3a0f2b8fd724bebf55f2` MUST apply without exception.

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

The staff-mediated lane MUST produce one immutable **Accounting Delivery Package** from the exact frozen Provider Delivery Plan.

Every clause in `openspec/contracts/accounting-operations.md#contract-5b3d4b81c7001a2c75fd` MUST apply without exception.

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

Exactly one system MUST own provider posting for one canonical source occurrence, tenant, Legal Entity, accounting destination, source account or instrument, Accounting Posting Intent family, and source-authoritative ownership interval.

Every clause in `openspec/contracts/accounting-operations.md#contract-d491adab454c205c9e31` MUST apply without exception.

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

### Requirement: Phase 21 D17 Opening Authority Remains Accounting-dark

Phase 21 Opening Source Packages, Opening Coverage Manifests, Field Account Opening Positions, imported exact or reference history, staging generations, Field Account Operational Cutovers, and their import or activation statuses MUST remain outside Phase 20 accounting admission.

Every clause in `openspec/contracts/accounting-operations.md#contract-a49663017769c15224d1` MUST apply without exception.

#### Scenario: A Field Account opening cohort activates

- GIVEN Phase 21 activates a reconciled Opening Coverage Manifest and Field
  Account Opening Positions
- WHEN Phase 20 evaluates its event stream and accounting readiness
- THEN the opening artifacts and activation status fail accounting admission
- AND no Posting Intent, Accounting Release, provider operation, Expected Bank
  Arrival, or Bank Match is created

#### Scenario: Imported Field Account history resembles journal-ready activity

- GIVEN Phase 21 has admitted certified exact history or retained reference
  history for its opening reconciliation
- WHEN Phase 20 receives the import or current-projection transition
- THEN the history remains accounting-dark and no prior books are replayed
- AND import completeness, Phase 21 activation, or source balance agreement
  cannot infer an accounting gap

#### Scenario: A separate source occurrence is positively proved unposted

- GIVEN an accountant-certified Phase 20 source contract identifies one exact
  economic occurrence independently of the Phase 21 opening artifacts
- AND Phase 20 D17 inspection positively proves that occurrence unposted
- WHEN authorized staff approve bounded gap-only backfill
- THEN only that exact occurrence may enter Phase 20
- AND the Phase 21 Opening Position, manifest, and cutover remain unchanged and
  accounting-dark

### Requirement: D18 Expense Accounting Consumes One PII-minimized Source-owned Approved Handoff

Phase 21 MUST own expense reports, receipt evidence, substantiation, policy decisions, immutable **Approved Expense Snapshots**, Reimbursement Obligations, Field Account Funding Coverage, Field Account effects, and immutable source-owned evidence of External Payment Occurrences.

Every clause in `openspec/contracts/accounting-operations.md#contract-b4eafb6af0837281c2e4` MUST apply without exception.

#### Scenario: People and access change while an expense occurrence is ready

- GIVEN one qualified Phase 21 expense occurrence has exact Support Assignment
  and Field Account lineage
- AND staff prospectively add, end, or correct a Support Assignment Participant
  Membership, workspace grant, operational responsibility, or notification
  preference
- WHEN Phase 20 evaluates accounting readiness
- THEN the people/access change creates no accounting work and does not alter
  the occurrence's posting ownership, release, destination, or provider plan
- AND only an independently qualified source correction may change the
  economic occurrence

#### Scenario: A participant-free Support Assignment has qualified expense truth

- GIVEN an organization-controlled Support Assignment has no participant Party
- AND its exact Phase 21 source contract produces an otherwise eligible
  Accounting-Ready Expense Handoff
- WHEN Phase 20 validates the handoff
- THEN eligibility is decided from the exact source occurrence and posting-
  ownership contract rather than participant existence
- AND Phase 20 preserves the Support Assignment only as source lineage

#### Scenario: An approved organization-paid expense is handed off

- GIVEN Phase 21 freezes one eligible Approved Expense Snapshot
- WHEN it publishes the PII-minimized accounting-ready occurrence
- THEN Phase 20 validates the exact source, Legal Entity, posting owner, and
  policy before release
- AND it does not copy the raw receipt or reopen approval

#### Scenario: A source-final organization-card expense is approved

- GIVEN Phase 21 has source-final posted Organization Card Transaction Evidence
  whose exact business coverage is frozen in one eligible Approved Expense
  Snapshot
- WHEN Phase 21 publishes the PII-minimized accounting-ready occurrence
- THEN Phase 20 may admit the existing Cleared Organization-Paid Expense
  occurrence
- AND no raw file, import manifest, card assignment, nonbusiness/personal
  portion, or internal card-review workflow crosses the handoff

#### Scenario: Card activity is not an approved accounting source

- GIVEN Phase 21 has only a raw card file, import acceptance, pending or
  unresolved card evidence, assignment, claimant task, issuer settlement, or
  card-liability payment
- WHEN the source is presented to Phase 20
- THEN accounting admission fails closed
- AND no Posting Intent, Accounting Release, or new card occurrence family is
  created

#### Scenario: A reimbursement obligation is approved

- GIVEN an obligation is approved but not yet paid
- WHEN its accounting-ready handoff is admitted
- THEN the Posting Intent may represent the approved obligation under tenant
  policy
- AND it does not claim reimbursement payment occurred

#### Scenario: One externally executed payment covers several obligations

- GIVEN Phase 21 publishes source-owned evidence of a homogeneous External
  Payment Occurrence for reimbursement and exact applications
- WHEN Phase 20 validates Payment Coverage
- THEN applications and signed residuals conserve the source payment exactly
- AND no application exceeds an obligation's remaining approved amount

#### Scenario: One externally executed payment covers compensation and reimbursement

- GIVEN one atomic External Payment Occurrence covers both a compensation
  result and approved reimbursement obligations
- WHEN Phase 20 validates the payment evidence
- THEN one complete typed manifest uses the occurrence's one payment currency
  and conserves exact Compensation Payment Coverage, Reimbursement Payment
  Coverage, and one signed, typed, resolved residual disposition, including
  zero
- AND the reimbursement slice alone is not treated as the complete payment

#### Scenario: A mixed payment includes a source component in another currency

- GIVEN a mixed External Payment Occurrence has one payment currency and a
  covered compensation or reimbursement source component in another currency
- WHEN Phase 20 evaluates accounting readiness
- THEN the manifest preserves immutable source and payment amounts plus exact
  conversion evidence
- AND unresolved residual or FX ambiguity leaves the whole payment
  accounting-dark in one cause-owned exception

#### Scenario: External payroll owns a mixed payment

- GIVEN external payroll owns accounting for one mixed compensation and
  reimbursement payment under D17
- WHEN Phase 21 projects the exact reimbursement slice and evidence
- THEN Phase 20 may link and display that slice
- AND it creates no standalone reimbursement-payment Accounting Release

#### Scenario: An Asym-owned mixed payment lacks a certified compensation source contract

- GIVEN an atomic mixed payment is assigned to Asym's posting ownership
- AND no complete compensation source contract and accountant-confirmed
  posting semantics are certified
- WHEN accounting readiness is evaluated
- THEN the whole mixed payment remains accounting-dark in one cause-owned
  exception
- AND no reimbursement-only release is created

#### Scenario: A compensation package enters the expense lane

- GIVEN Phase 20 receives a Compensation Handoff Package, Compensation Draft
  Delivery Profile Version, Provider Draft Operation, provider
  acceptance/readback or permitted staff confirmation, Compensation Funding
  Decision, or Field Account Funding Coverage through the D18 expense lane
- WHEN the source discriminator is validated
- THEN the handoff fails closed
- AND no Posting Intent or Accounting Release is created

#### Scenario: Reimbursement handoff evidence enters the accounting lane

- GIVEN Phase 20 receives a Reimbursement Handoff Package, Delivery Profile
  Version, Execution Claim, Handoff Coverage, Handoff Attestation, Handoff
  Operation, provider draft/input acceptance, or provider draft/input readback
- WHEN the source discriminator is validated
- THEN the handoff evidence fails closed as payment and accounting authority
- AND no External Payment Occurrence, Posting Intent, or Accounting Release is
  created
- AND an independently eligible Approved Reimbursement Obligation or separately
  source-qualified External Payment Occurrence may still qualify through its
  own D18 source discriminator

#### Scenario: External handoff is recorded without payment evidence

- GIVEN staff record a Handoff Attestation for an exact immutable package and
  Reimbursement Execution Claim
- AND no separately source-qualified External Payment Occurrence exists
- WHEN Phase 20 evaluates reimbursement-payment readiness
- THEN the handoff remains non-payment evidence
- AND no Evidence-qualified Reimbursement Payment, Posting Intent, or Accounting
  Release is created

#### Scenario: Evidence qualifies an issued expense advance

- GIVEN Phase 21 publishes one evidence-qualified Expense Advance Issuance
  Occurrence under the exact certified source contract
- WHEN Phase 20 validates the source discriminator and independently applicable
  D17 posting owner
- THEN the occurrence may compile through its typed Accounting Posting Intent
- AND authorization, application readiness, or Field Account coverage alone
  cannot substitute for issuance evidence

#### Scenario: An advance application has no certified accounting effect

- GIVEN Phase 21 has an Expense Advance Application and operational Expense
  Settlement Determination
- AND no separately certified typed accounting-effect contract applies
- WHEN Phase 20 evaluates the application
- THEN the application remains accounting-dark
- AND no generic expense, journal, offset, or inferred expense-advance-return
  entry is created

#### Scenario: A claimant return is recorded under its exact source contract

- GIVEN Phase 21 publishes one source-qualified Claimant Repayment Occurrence
- AND its immutable return family is exactly `cash_claimant_return` or
  `expense_advance_return`
- WHEN Phase 20 validates its exact amount, currency, cause lineage, source
  evidence class, required source root and coverage, and independently
  applicable D17 posting owner
- THEN the occurrence may compile only through the corresponding
  `phase21_d16.cash_claimant_return@1` or
  `phase21_d16.expense_advance_return@1` intent family
- AND its exact typed cause and return family are preserved rather than
  collapsing it into a negative ordinary expense or another return family

#### Scenario: Return family is missing, ambiguous, or inferred

- GIVEN a source-qualified Claimant Repayment Occurrence lacks one explicit
  return family or presents conflicting family evidence
- WHEN a mapper could guess cash claimant return or expense advance return from
  amount sign, predecessor type, Requirement, memo, account, or posting recipe
- THEN Phase 20 fails closed before Posting Intent
- AND no generic claimant-repayment discriminator or inferred return entry is
  created

#### Scenario: A correction cannot retag a return family

- GIVEN an admitted cash claimant return or expense advance return needs
  correction
- WHEN Phase 20 admits a cause-linked correction
- THEN it requires the predecessor's exact discriminator, source
  identity/version, and corrected coverage
- AND a true family reclassification appends correction of the original plus a
  newly admitted non-overlapping occurrence under the correct return
  discriminator rather than mutating or retagging the predecessor

#### Scenario: A repayment requirement lacks receivable authority

- GIVEN finance has created a Claimant Repayment Requirement
- AND no separately accountant-certified policy and source contract recognizes
  the exact receivable
- WHEN Phase 20 evaluates accounting readiness
- THEN the Requirement remains accounting-dark
- AND task state, bank evidence, Field Account coverage, or QBO/Xero evidence
  cannot upgrade it into receivable or returned-money truth

#### Scenario: A payment-rooted handoff covers snapshots from several reports

- GIVEN one immutable externally executed payment-source occurrence covers
  complete homogeneous obligations whose approved lines came from several
  snapshot versions
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

#### Scenario: D23 support-balance inclusion is not an accounting source

- GIVEN Phase 21 closes an Expense Field Account Effect with exact Effect Basis,
  Effect Coverage, and Funding Coverage Disposition
- WHEN Phase 20 evaluates accounting readiness
- THEN the D23 profile, basis, coverage, effect, close, through date, exception,
  and correction create zero accounting work
- AND no generic journal, artifact, staff action, or adapter fallback upgrades
  them into a D18 source

#### Scenario: An independent expense source qualifies after D23 inclusion

- GIVEN a D23 operational effect already exists for an approved expense slice
- AND an independently eligible Reimbursement Obligation, source-final
  organization-paid occurrence, External Payment Occurrence, or correction has
  exact D17 posting ownership
- WHEN Phase 20 admits that independent source through its closed discriminator
- THEN it may create accounting work from that source only
- AND it does not inherit D23 mode, effect identity, qualification date,
  Support Cycle close, or through date

#### Scenario: Provider or reconciliation evidence cannot rewrite D23

- GIVEN QBO/Xero exposes a bill, payment, home amount, readback, or drift result,
  or Phase 20 records a Bank Match
- WHEN D23 qualification or correction is evaluated
- THEN that evidence cannot qualify, date, modify, release, or repair the
  Expense Field Account Effect
- AND the D23 source owner and append-only correction contract remain
  authoritative

#### Scenario: Phase 21 has not supplied the required handoff

- WHEN an expense draft, receipt, approval UI row, funding decision, payment
  request, or unproved payment is presented directly to Phase 20
- THEN accounting admission fails closed
- AND no alternate expense, AP, or reimbursement authority is created

#### Scenario: D24 expense collaboration is not an accounting source

- GIVEN a helper has accepted an exact-claim-bounded collaboration assignment,
  accessed authorized evidence, prepared claim content, or mechanically
  submitted a claimant-confirmed unchanged Claim Version
- WHEN Phase 20 evaluates accounting readiness
- THEN the assignment, invitation, access projection, confirmation or
  attestation, helper action, and provenance create zero accounting work
- AND no generic journal, artifact, staff action, or adapter fallback upgrades
  collaboration into approval, obligation, payment, Field Account effect, or
  accounting authority

#### Scenario: An independent expense source retains minimum D24 provenance

- GIVEN an independently qualified Approved Expense Snapshot, Reimbursement
  Obligation, source-final organization-paid occurrence, External Payment
  Occurrence, or correction enters its certified Phase 20 lane
- AND D24 provenance identifies who prepared or submitted its exact source
  coverage
- WHEN Phase 20 freezes the Accounting-Ready Expense Handoff
- THEN it may retain only the minimum provenance required for lineage
- AND it neither inherits nor changes D24 assignment, consent, evidence-access,
  or helper authority

#### Scenario: D25 expense resolution creates zero accounting work

- GIVEN one exact Expense Claim Resolution Case has a claimant response,
  source-owner request, Downstream Impact Manifest, Mission Control follow-up,
  or derived **Complete** projection
- WHEN Phase 20 evaluates accounting readiness
- THEN every D25 object and coordination outcome is rejected before D18
  admission
- AND no generic journal, artifact, provider operation, Bank Match, task state,
  message result, silence, timer, or fallback upgrades it into accounting truth

#### Scenario: An authoritative correction enters without inheriting D25 authority

- GIVEN an independently authoritative source owner appends an eligible
  expense, obligation, payment, organization-paid, or other certified
  correction linked to one D25 case
- WHEN that source enters its existing D18 lane under the exact D17 posting
  owner
- THEN Phase 20 may retain only opaque D25 correlation
- AND Phase 20 alone owns any Compensating Accounting Release, permitted
  period/treatment, delivery, readback, drift, and Accounting Exception Case
- AND neither system treats the other's case or task completion as its own
  completion proof

### Requirement: D19 Processor Costs Default Organization-borne With One Fee-cover-first Fund Mode

Processor costs MUST be organization-borne by default.

Every clause in `openspec/contracts/accounting-operations.md#contract-cabd77096a1d14ae3989` MUST apply without exception.

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

Phase 20 MUST preserve donor presentment currency, source transaction currency, Stripe balance or settlement currency, payout currency, QBO home or Xero base currency, and reporting currency as independent roles.

Every clause in `openspec/contracts/accounting-operations.md#contract-4e7ae345f72be2380cc3` MUST apply without exception.

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

### Requirement: Phase 21 records exports remain accounting-dark

The system SHALL reject every Phase 21 D26 Records Schedule Contract or
Binding, Record Retention Resolution, successor-impact record, Records Export
Package, Coverage Manifest, package part, download/print event, Tenant External
Copy Assertion, Verified Destination Custody Transfer, hold, offboarding window,
and copy-disposition event before D18 accounting admission.

#### Scenario: Staff create or transfer a Phase 21 records archive

- GIVEN an authorized Phase 21 Records Export Package is prepared, downloaded,
  printed, recorded as externally copied, or transferred through a certified
  destination
- WHEN Phase 20 evaluates new accounting work
- THEN the package and its lifecycle events create zero eligible source
  coverage, Posting Intent, Accounting Effect, Accounting Release, provider
  operation, Bank Match, exception clearance, or reconciliation work
- AND Phase 20 retains no new source discriminator, posting recipe, adapter, or
  delivery lane for them

#### Scenario: A records archive carries authorized Phase 20 evidence

- GIVEN D26 includes a currently authorized Phase 20 owner reference or exact
  evidence copy in a records package
- WHEN the package is downloaded, imported elsewhere, expires, is held, or is
  disposed
- THEN Phase 20 retention, posting ownership, provider delivery, readback,
  drift, exception, and reconciliation truth remain unchanged
- AND the records package is never represented as an Accounting Delivery
  Package or QBO/Xero company-file backup
