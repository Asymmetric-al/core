# Field Account Operations Capability

## ADDED Requirements

### Requirement: D1 Finance-closed Support Cycles Preserve Independent Financial Truth

The product MUST expose one tenant-, actor-, environment-, and Legal-Entity- scoped `FieldAccountOperationsService` as the public business boundary for Phase 21 commands and queries.

Every clause in `openspec/contracts/field-account-operations.md#contract-c318a4ce4b8f374486ce` MUST apply without exception.

#### Scenario: Finance closes an ordinary Support Cycle

- **GIVEN** one Field Account has a proved opening position, exact open-cycle
  occurrences, complete source coverage, and a fresh Support Cycle Integrity
  Manifest
- **WHEN** an authorized finance principal closes the cycle through
  `FieldAccountOperationsService`
- **THEN** the service persists one immutable Support Cycle Close and advances
  the Finance-confirmed Field Account Balance through that exact boundary
- **AND** provisional activity after the captured boundary remains outside the
  confirmed balance.

#### Scenario: Close evidence becomes stale during review

- **GIVEN** finance is reviewing a close and a new committed source occurrence
  advances the captured ingestion boundary
- **WHEN** finance submits the stale reviewed close
- **THEN** the service returns a typed stale or blocked result with zero close
  effect
- **AND** the prior confirmed balance remains visible with its through date and
  the new activity remains provisional.

#### Scenario: An approved reimbursement lacks payment evidence

- **GIVEN** an Expense Policy Decision created an Approved Expense Snapshot and
  the core D16 settlement created the exact remaining Reimbursement Obligation
- **AND** Field Account Funding Coverage or a handoff exists without an exact
  External Payment Occurrence
- **WHEN** a claimant or staff member views its progress
- **THEN** the system MAY show the truthful approval, obligation, funding, and
  handoff states separately
- **BUT** it MUST NOT label the reimbursement `Paid` or infer payment from
  approval, coverage, handoff, payroll/AP status, accounting, or reconciliation.

#### Scenario: A caller bypasses the public service

- **GIVEN** a route, job, callback, or adapter attempts to write Phase 21
  financial state without `FieldAccountOperationsService`
- **WHEN** architecture and database authorization controls evaluate the write
- **THEN** the write is denied with zero financial effect.

### Requirement: D2 Rail-qualified Admission Alone Advances Positive Support

The system MUST derive a provisional Support Allocation Candidate only from an exact eligible Phase 13 posted money-designation occurrence or one exact source-final D21 Realized Support Basis.

Every clause in `openspec/contracts/field-account-operations.md#contract-e588b4dbe57850c261d5` MUST apply without exception.

#### Scenario: Provider-qualified positive support is admitted

- **GIVEN** an eligible posted contribution allocation and the exact evidence
  required by its active Support Allocation Readiness Policy
- **WHEN** finance closes the covering Support Cycle
- **THEN** the close records unique Support Cycle Admission Coverage for the
  exact source, policy, evidence, and Field Account occurrence
- **AND** the positive amount advances the confirmed balance exactly once.

#### Scenario: A positive source is still processing

- **GIVEN** a source occurrence is unposted, still processing, missing required
  evidence, or belongs to the wrong Tenant, Legal Entity, currency, or source
  family
- **WHEN** readiness is evaluated or a close is attempted
- **THEN** the candidate is held with the exact waiting or review reason
- **AND** no admission coverage or confirmed-balance effect is created.

#### Scenario: One side of a redesignation is incomplete

- **GIVEN** a Phase 13 redesignation consists of a sum-preserving negative and
  positive pair
- **AND** only one member is complete at the close fence
- **WHEN** finance attempts to close the affected scope
- **THEN** the complete pair is blocked from admission
- **AND** the service MUST NOT publish a half-redesignation or invent an offset.

#### Scenario: Adverse evidence arrives while positives are quarantined

- **GIVEN** a source capability outage quarantines new affected positive work
- **AND** an exact refund or return is subsequently observed
- **WHEN** Phase 21 evaluates the mandatory adverse occurrence
- **THEN** the adverse occurrence continues through its append-only correction
  path
- **AND** unrelated Field Accounts and source families remain available for
  ordinary close work.

#### Scenario: A missionary opens optional source-status detail

- **GIVEN** one authorized activity row is source-proved as received and a
  second exact attempt is source-proved as declined
- **WHEN** the missionary opens the optional detail disclosure
- **THEN** the first row says `Received` with no availability or finality claim
- **AND** the second may say `Not received` with `Declined` detail only when
  privacy filtering permits it, without exposing the provider reason, hidden
  supporter identity, exact-time fingerprint, or staff readiness state.

### Requirement: D3 Administrative Assessments Use One Prospective Non-stacking Profile

Every Tenant and Legal Entity MUST begin with an explicit immutable `No administrative assessment` profile.

Every clause in `openspec/contracts/field-account-operations.md#contract-e109239d309d243dc25f` MUST apply without exception.

#### Scenario: A tenant uses no assessments

- **GIVEN** the Legal Entity retains its explicit No administrative assessment
  profile
- **WHEN** support is admitted and the missionary views activity
- **THEN** gross support is credited without an assessment entry
- **AND** no assessment setup noise, zero-value activity, empty column, or
  missionary prompt is shown.

#### Scenario: Two equal-rank assignments conflict

- **GIVEN** an explicit classification assignment and an explicit lifecycle
  assignment apply at the same specificity rank
- **AND** they select different profile versions
- **WHEN** the service resolves the assessment for an exact source occurrence
- **THEN** D3 returns `assessment_profile_resolution_conflict` and D2 maps that
  cause to `blocked_by_integrity` in the Support Close Readiness Projection
- **AND** no profile is guessed, stacked, or applied until an explicit
  combination resolves the conflict.

#### Scenario: A biweekly tenant reaches month end

- **GIVEN** source-linked percentage entries were admitted across two biweekly
  closes in one Assessment Period
- **WHEN** the first successfully committed close in contiguous close order
  whose through boundary reaches or passes the period end calculates the
  monthly minimum or cap
- **THEN** one immutable Assessment Period Determination reuses the exact
  covered percentage total
- **AND** publishes at most one minimum top-up or cap credit plus any separately
  configured fixed/service component.

#### Scenario: A delayed close cannot absorb next-period allocations

- **GIVEN** one Gross Support Allocation is source-effective exactly at
  `period_start`, another exactly at `period_end`, and another after
  `period_end`
- **AND** all three have been D2-admitted through unique Support Cycle Admission
  Coverage
- **AND** a delayed owner close's captured ingestion boundary includes all
  three allocations
- **WHEN** that close creates the Assessment Period Determination
- **THEN** the allocation at `period_start` is included
- **AND** the allocations at and after `period_end` are excluded even though
  the close captured them
- **AND** retrying the owner close returns the exact same Determination.

#### Scenario: A captured but unqualified in-period allocation is excluded

- **GIVEN** an allocation source-effective inside `[period_start, period_end)`
  is captured but remains provisional or unqualified and lacks unique Support
  Cycle Admission Coverage
- **WHEN** the initial Assessment Period Determination commits
- **THEN** it excludes that allocation and creates no assessment effect for it.

#### Scenario: An excluded in-period allocation later qualifies

- **GIVEN** the initial Determination excluded a captured in-period allocation
  because it lacked unique Support Cycle Admission Coverage
- **WHEN** a later valid close admits the source fact through unique Support
  Cycle Admission Coverage
- **THEN** the system appends a source-covered successor remeasurement
- **AND** it does not rewrite the original Determination, move period ownership,
  or include any next-period allocation.

#### Scenario: Two candidate closes race or the owner close retries

- **GIVEN** two close preparations can observe the same completed Assessment
  Period or the owning close response is lost
- **WHEN** both attempt the same initial period determination
- **THEN** predecessor-boundary and same-scope period CAS commit exactly one
  determination in contiguous close order
- **AND** an identical owner-close retry returns exact replay
- **AND** any losing concurrent or later-boundary attempt returns exact replay
  or a typed stale/conflict result with zero new Determination, adjustment, or
  successor effect.

#### Scenario: An open predecessor or coverage gap blocks a later owner

- **GIVEN** a close candidate's through boundary reaches or passes the
  Assessment Period end
- **AND** an earlier Support Cycle boundary remains open or the candidate's
  intervening coverage manifest contains a gap
- **WHEN** the later candidate attempts the initial Determination
- **THEN** it returns a typed blocked or stale result with zero financial effect
- **AND** no initial Determination, period adjustment, or successor effect is
  created until strict contiguous coverage is proved.

#### Scenario: Competing profile versions target one period

- **GIVEN** stale or concurrent preparation resolves two different Profile
  Versions for the same Tenant, Legal Entity, Field Account/assignment scope,
  currency, and Assessment Period
- **WHEN** either candidate attempts the initial Determination
- **THEN** the period business key permits at most one initial Determination
- **AND** the conflicting candidate fails closed rather than using Profile
  Version to create a second initial Determination.

#### Scenario: A gift is partially refunded after close

- **GIVEN** a closed gift-linked variable assessment and an exact partial refund
- **WHEN** the refund correction is processed
- **THEN** the system appends a bounded correction using the original profile,
  basis, precision, rounding, and remaining source coverage
- **AND** independently remeasures any monthly minimum, cap, fixed, or service
  component without rewriting the gift, determination, close, or statement.

### Requirement: D4 Compensation Funding Reserves Capacity While External Payroll Retains Authority

The system MUST keep Engagement Authority, Compensation Funding Plan, cycle-specific Proposal, immutable Funding Decision, Field Account Funding Coverage, handoff, external result, payment evidence, Field Account effect, and accounting truth separate.

Every clause in `openspec/contracts/field-account-operations.md#contract-118404abe5a859f46f6b` MUST apply without exception.

#### Scenario: Finance authorizes a fully covered compensation period

- **GIVEN** one active Plan, current Engagement Authority, a Finance-confirmed
  balance, exact unused capacity, and no conflicting period Decision
- **WHEN** finance authorizes the Proposal
- **THEN** the service atomically creates one immutable Decision and exact
  non-reusable Field Account Funding Coverage
- **AND** creates the Handoff Package without debiting the Field Account or
  claiming payroll approval or payment.

#### Scenario: The proposed amount is underfunded

- **GIVEN** the Plan target exceeds confirmed unused Field Account capacity and
  separately authorized organization funding
- **WHEN** finance evaluates the Proposal
- **THEN** one cause-owned Compensation Exception Case records the Field
  Account-funded, organization-funded, and unresolved amounts
- **AND** the system MUST NOT silently clamp the amount, create negative
  capacity, reduce wages, establish debt/backpay, or expire the shortfall.

#### Scenario: A provider draft call has an unknown outcome

- **GIVEN** a released Compensation Handoff Package times out after the provider
  may have recorded its certified draft/input
- **WHEN** the operation result cannot be proved
- **THEN** the exact operation and covered units become `outcome_unknown`
- **AND** their Funding Coverage remains reserved until provider inspection or
  exact permitted confirmation proves the outcome.

#### Scenario: External payment evidence arrives after a finalized result

- **GIVEN** the recognition policy selected finalized External Compensation
  Result and the result already created a covered Field Account effect
- **WHEN** later payment evidence disagrees or is absent
- **THEN** the payment track remains separately truthful and MAY open an
  exception
- **BUT** it MUST NOT reverse or recreate the Field Account effect unless the
  selected result authority itself changes or reverses.

### Requirement: D5 Support Reallocation Is Organization-authorized Purpose-compatible And Conserving

One Support Reallocation Case MUST coordinate either `active reallocation` or `exit disposition` without becoming balance, lifecycle, payment, accounting, or source-purpose truth.

Every clause in `openspec/contracts/field-account-operations.md#contract-80f38a4c247e67796db0` MUST apply without exception.

#### Scenario: Finance authorizes an internal reallocation

- **GIVEN** exact compatible source-purpose authority, sufficient unreserved
  capacity, current destinations, and a conflict-free organization Decision
- **WHEN** finance uses the exact approval action
- **THEN** one source debit and the conserving destination credit set commit as
  one atomic same-currency occurrence group
- **AND** no Finance-confirmed balance changes until one later close admits the
  complete group.

#### Scenario: Purpose authority is missing or ambiguous

- **GIVEN** one proposed line lacks an exact accepted-source purpose authority
  snapshot or has disputed authority
- **WHEN** the case is reviewed
- **THEN** only that line is blocked for the authorized specialist
- **AND** no current Designation label, worker page, aggregate balance, or
  organization-discretion assumption substitutes for the missing proof.

#### Scenario: An external charitable payment is observed without a qualified result

- **GIVEN** an approved external disposition and a payment observation
- **AND** the required recipient, purpose, handoff, current authority, or Result
  proof is incomplete or ambiguous
- **WHEN** Phase 21 evaluates fulfillment
- **THEN** coverage remains open or quarantined and no Field Account debit is
  admitted
- **AND** the payment observation alone is not treated as success.

#### Scenario: A late refund arrives after Field Account closure

- **GIVEN** a read-only closed Field Account whose exit dispositions previously
  completed
- **WHEN** a source-owned mandatory adverse fact arrives
- **THEN** the system opens cause-linked recovery and appends the correction to
  the original Field Account
- **AND** it MUST NOT rewrite the exit manifest or silently claw back a prior
  destination.

### Requirement: D6 Every Field Account Has One Immutable Currency And Cross-currency Admission Is Proved

Each Field Account MUST belong to one Tenant, Legal Entity, Support Assignment, and immutable ISO currency.

Every clause in `openspec/contracts/field-account-operations.md#contract-3f6d7e1395a15ace7520` MUST apply without exception.

#### Scenario: A tenant uses one ordinary currency

- **GIVEN** one active Field Account in the Legal Entity's explicit default
  currency
- **WHEN** a missionary views Support balances
- **THEN** the product shows one exact ISO-labelled Finance-confirmed support
  balance with its own through date
- **AND** shows no multicurrency, exchange-rate, or inactive-currency noise.

#### Scenario: A converted source is allocated to target-currency support

- **GIVEN** complete source lines and exact provider/bank conversion evidence
  produce a different organization-controlled target currency
- **WHEN** the candidate is prepared for admission
- **THEN** one Support Currency Allocation Manifest conserves the complete
  source and target line sets in their respective minor units
- **AND** only eligible target designation portions create Gross Support
  Allocations.

#### Scenario: Conversion evidence is missing or contradictory

- **GIVEN** a cross-currency positive candidate lacks an exact target basis,
  conversion provenance, rounding rule, or complete line coverage
- **WHEN** readiness is evaluated
- **THEN** only that affected positive candidate is quarantined
- **AND** no staff-authored/current-market/inferred rate is used.

#### Scenario: A retained-currency capability expires

- **GIVEN** an active retained-currency Field Account whose source capability
  later expires or drifts
- **WHEN** new activity and a known adverse correction arrive
- **THEN** new dependent positive work is held while prior balances remain
  readable and the adverse correction continues
- **AND** healthy currencies remain operable.

### Requirement: D7 Compensation Adapters Are Provider-specific Capability-honest And Ambiguity-safe

Every Compensation Handoff Adapter and Delivery Profile MUST pin exact Tenant, Legal Entity, provider organization, provider product, country, environment, external provider participant/payee reference, currency, pay cycle, component mapping, operation, and current production certification.

Every clause in `openspec/contracts/field-account-operations.md#contract-2ba93a5019d50e0c345f` MUST apply without exception.

#### Scenario: A certified provider draft succeeds

- **GIVEN** a current Delivery Profile, production certificate, reviewed native
  preview, and one explicitly released Package
- **WHEN** its provider-specific adapter records the certified draft/input
- **THEN** the service persists one Provider Draft Operation with exact readback
  or permitted confirmation
- **AND** the covered units resolve `confirmed_updated` without claiming payroll
  submission, completion, or payment.

#### Scenario: A write times out after possible acceptance

- **GIVEN** the provider may have committed an operation but no conclusive
  response is available
- **WHEN** recovery runs
- **THEN** the operation is inspected by its provider-specific recovery contract
  before any retry
- **AND** inconclusive units remain `outcome_unknown` and quarantined.

#### Scenario: A partial operation proves some units were not updated

- **GIVEN** exact readback proves some units updated and others did not
- **WHEN** finance starts residual recovery
- **THEN** a successor contains only `proven_not_updated` units
- **AND** it cannot change provider organization, product, country,
  environment, participant/payee, currency, pay cycle, or operation implicitly.

#### Scenario: A configured capability is not production-certified

- **GIVEN** an adapter exists in code or passed sandbox testing but lacks current
  production authorization for the exact tenant operation
- **WHEN** staff review delivery
- **THEN** direct write is unavailable and the artifact/readback continuity lane
  remains truthful
- **AND** the UI MUST NOT advertise the provider as direct-write ready.

### Requirement: D8 Missionary Support Feed Projection Is Scoped No-gap And Read-only

Phase 21 MUST expose one versioned source-projection contract containing only the privacy-safe Missionary Support Activity Projection and separately through-dated per-currency Support Balances Projection.

Every clause in `openspec/contracts/field-account-operations.md#contract-297804c79ec94d32a0a5` MUST apply without exception.

#### Scenario: Snapshot generation races a new correction

- **GIVEN** an authorized subscription is producing a paginated snapshot
- **WHEN** a source correction commits at the snapshot boundary
- **THEN** the correction appears exactly once in either the complete snapshot
  or the first change round after `snapshot_through`
- **AND** the terminal page alone yields the change cursor.

#### Scenario: An authorization becomes narrower

- **GIVEN** a prior subscription or cursor exists
- **WHEN** current recipient, subject, purpose, history, field, or privacy
  authorization narrows
- **THEN** future reads and queued egress apply the narrower scope before any
  enumeration
- **AND** possession of the old grant or cursor grants no continuing access.

#### Scenario: A cursor expires or becomes scope-incompatible

- **GIVEN** the change cursor is beyond finite retention or bound to an obsolete
  authorization/query/schema scope
- **WHEN** the destination requests changes
- **THEN** Phase 31 returns an explicit `cursor_reset_required` reset outcome
- **AND** recovery uses a new bounded snapshot rather than date-only polling or
  destructive merging.

#### Scenario: One atomic financial group crosses a page boundary

- **GIVEN** a D5 pair or other group has a declared member count and digest
- **WHEN** projection pagination is assembled
- **THEN** the consumer cannot advance its checkpoint until the complete group
  is available
- **AND** no incomplete group is applied as financial chronology.

#### Scenario: A tenant has not enabled a support feed

- **GIVEN** Core Field Accounts are active but no exact feed capability binding
  has been prospectively activated
- **WHEN** staff, missionaries, integrations, queues, or provider callbacks
  inspect the tenant
- **THEN** no feed surface, subscription, grant, projection delivery, cursor,
  badge, count, or existence signal is produced
- **AND** ordinary Field Account activity and publication continue unchanged.

### Requirement: D9 Support Planning And Workspace Publication Are Optional And Purpose-separated

Every exact Tenant, Legal Entity, Support Assignment, purpose, and currency scope MUST default to `Support planning not managed in Asym`.

Every clause in `openspec/contracts/field-account-operations.md#contract-840312f4e8465497b804` MUST apply without exception.

#### Scenario: A tenant does not manage support planning in Asym

- **GIVEN** the exact scope retains its default planning posture
- **WHEN** staff and missionaries use Field Accounts
- **THEN** no Plan record, warning, empty planning card, commitment prerequisite,
  or setup task is created
- **AND** D1-D8 behavior remains unchanged.

#### Scenario: A compatible Plan and close produce coverage

- **GIVEN** one active Plan Version and one compatible through-dated
  Finance-confirmed Planning Coverage Base in the same currency
- **WHEN** the support workspace is projected
- **THEN** Balance Coverage and any Reserve Position are derived with the exact
  pinned Plan, close, profile, and source versions
- **AND** the result is labelled as planning information rather than available
  money or compensation authority.

#### Scenario: Balance publication is hidden

- **GIVEN** an audience's Publication Profile does not authorize a balance
  module
- **WHEN** that audience loads activity, planning, statements, search, exports,
  counts, alerts, or cached workspace data
- **THEN** no balance value or balance-existence signal is fetched, calculated,
  counted, cached, exported, searched, announced, or inferred.

#### Scenario: Several currency balances exist

- **GIVEN** one Support Assignment has independently authorized Field Accounts
  and Plans in several currencies
- **WHEN** planning projections are shown
- **THEN** each currency receives independent Balance Coverage, Reserve
  Position, freshness, and alerts
- **AND** the system MUST NOT convert or sum them into an authoritative total.

### Requirement: D10 Expense Truth Is Claim-level And AI Remains Suggestion-only

The system MUST model one logical Expense Claim with immutable material Claim Versions whose exact signed item/split coverage conserves the claim amount in each ISO currency.

Every clause in `openspec/contracts/field-account-operations.md#contract-450caf5be578bdcae2e6` MUST apply without exception.

#### Scenario: A mixed report contains several dispositions

- **GIVEN** one Expense Report Submission contains complete Claim Versions with
  approved, needs-information, rejected, and excluded item coverage
- **WHEN** authorized reviewers finish the clean portions
- **THEN** the service creates Approved Expense Snapshots only for exact
  terminal approved coverage
- **AND** returned coverage follows a linked successor without reopening or
  re-reviewing prior approved coverage.

#### Scenario: OCR is unavailable or unsafe

- **GIVEN** no AI binding, an expired credential, exhausted budget, malformed
  output, prompt-injection content, prohibited classification, or provider
  outage
- **WHEN** a claimant captures receipt evidence
- **THEN** the original private evidence and manual claim path remain usable
- **AND** no model output becomes a source fact or silently falls back to a
  different model/provider.

#### Scenario: Approval targets a stale Claim Version

- **GIVEN** a reviewer inspected one Claim Version and a material successor was
  committed before approval
- **WHEN** the stale approval command executes
- **THEN** the service returns a typed stale result with zero Approved Expense
  Snapshot, obligation, funding, outbox, or accounting effect.

#### Scenario: Approval and funding exist without payment

- **GIVEN** an Approved Expense Snapshot, Reimbursement Obligation, and Field
  Account Funding Coverage exist
- **WHEN** no exact External Payment Occurrence covers the obligation
- **THEN** the claimant may see approved or owed and the truthful handoff stage
- **BUT** the product MUST NOT expose `Paid` from the report, approval, funding,
  provider draft, Phase 20 release, or QBO/Xero record.

### Requirement: D11 Field Account Integrity Is Layered Scope-bounded And Cause-repaired

Every Field Account Occurrence MUST be an immutable source-addressed semantic unit whose same-currency Field-Account-side and independently persisted organization-control-side entries form one atomic balanced effect.

Every clause in `openspec/contracts/field-account-operations.md#contract-c4cd2cf9eea0a718eea5` MUST apply without exception.

#### Scenario: A complete Support Cycle closes

- **GIVEN** exact account/control equality, unique source coverage, complete
  occurrence groups, current authorization, and a fresh captured cursor
- **WHEN** finance invokes `Close support cycle`
- **THEN** the service atomically publishes one immutable Integrity Manifest
  and Support Cycle Close
- **AND** advances only the exact proved Field Account/currency balances.

#### Scenario: Equal and opposite coverage defects conceal a zero net variance

- **GIVEN** one source occurrence is duplicated and another equal amount is
  omitted
- **WHEN** close integrity is verified
- **THEN** unique source coverage fails despite the unchanged net amount
- **AND** the affected scope is blocked without a tolerance, plug, or force
  close.

#### Scenario: A mandatory refund exposes a deficit

- **GIVEN** a Field Account has insufficient remaining capacity after prior
  legitimate closes
- **AND** a source-owned refund or return must be recognized
- **WHEN** the adverse correction is admitted
- **THEN** the system appends the exact balanced correction and shows the
  resulting deficit with a cause-owned Integrity Case
- **AND** it MUST NOT reject the source truth merely to preserve a nonnegative
  displayed balance.

#### Scenario: A projection is corrupt but immutable sources are sound

- **GIVEN** verification proves a disposable projection differs from intact
  immutable occurrences, coverage, and control entries
- **WHEN** the authorized repair runs
- **THEN** the projection is deterministically rebuilt and fresh complete proof
  clears the Integrity Case
- **AND** no source occurrence, close, balance history, or statement is edited.

### Requirement: D12 Support Statements Derive Only From Immutable Close Facts

One D11 Support Cycle Close and its Support Cycle Integrity Manifest MUST be the sole Field Account statement-facts authority.

Every clause in `openspec/contracts/field-account-operations.md#contract-7966c78ed5fed6f9a529` MUST apply without exception.

#### Scenario: A close automatically produces statement facts

- **GIVEN** an immutable closed Support Cycle and current Publication Profile
  authorizing statements for the audience
- **WHEN** post-close processing consumes the durable source occurrence
- **THEN** one deterministic Phase 18 Facts Package is produced idempotently
- **AND** the missionary sees one authorized HTML-first history entry with one
  `View or download PDF` action and the required organization-controlled
  support qualifier in every rendered format.

#### Scenario: Statement publication is disabled

- **GIVEN** finance retains complete close and balance truth but the audience's
  Publication Profile does not authorize statements or compatible balance
  publication
- **WHEN** the audience loads history, search, counts, notifications, or direct
  artifact routes
- **THEN** the statement and its existence remain undisclosed
- **AND** the financial close remains unchanged.

#### Scenario: A late financial correction arrives

- **GIVEN** an immutable statement for a prior closed cycle
- **WHEN** a source-owned correction is admitted after publication
- **THEN** the prior close, facts, and artifact remain immutable
- **AND** the correction appears through the next permitted close and its new
  statement rather than live historical recomputation.

#### Scenario: Rendering fails after the close commits

- **GIVEN** the close and post-close source occurrence are durable
- **WHEN** Phase 18 rendering, storage, or optional notification fails
- **THEN** the close and confirmed balance remain valid
- **AND** bounded idempotent recovery retries only the failed downstream owner
  without closing again or creating duplicate visible statements.

### Requirement: D13 Expense Governance Uses One Incurred-date Policy And Human Review Route

The Expense Program MUST be prospectively off by default.

Every clause in `openspec/contracts/field-account-operations.md#contract-a215e2fcc02c59664e29` MUST apply without exception.

#### Scenario: One exact governance profile wins

- **GIVEN** a source-backed relationship, jurisdiction, cohort, expense family,
  purpose, claimant, incurred date, and currency match one unambiguous maximal
  profile
- **WHEN** the claim item is resolved
- **THEN** the service persists one immutable Expense Governance Resolution
  pinning the exact profile and source versions
- **AND** later profile changes do not reinterpret the claim.

#### Scenario: Two incomparable profiles conflict

- **GIVEN** two applicable maximal assignments select different profiles and
  neither is a strict specificity superset of the other
- **WHEN** governance resolution runs
- **THEN** only the exact affected item/split receives a governance conflict
- **AND** clean separable claim coverage MAY continue without guessing or
  stacking policies.

#### Scenario: A conflicted reviewer attempts self-approval

- **GIVEN** the current reviewer is the claimant, preparer where prohibited,
  beneficiary, or otherwise conflicts under the resolved route
- **WHEN** the reviewer submits an approval action
- **THEN** the service returns not permitted with zero Policy Decision or
  Approved Expense Snapshot
- **AND** routes the coverage to the exact independent reviewer or exception
  path.

#### Scenario: Finance bulk-approves clean claims

- **GIVEN** exact homogeneous clean coverage with current identical governance,
  route, currency, and consequence
- **WHEN** an authorized reviewer uses `Approve clean claims`
- **THEN** each item receives an independent immutable human Review Action and
  D10 disposition
- **AND** mixed, stale, conflicting, exception-bearing, or cross-currency work
  is excluded visibly rather than silently bulked.

### Requirement: D14 Organization Card Evidence Is File-first Source-final And Non-authoritative For Approval

The organization-card lane MUST be optional and structurally absent when not enabled.

Every clause in `openspec/contracts/field-account-operations.md#contract-fedbb7e1a9ac309c7ba5` MUST apply without exception.

#### Scenario: Finance imports a valid posted card file

- **GIVEN** a recognized CSV, exact Card Source/Profile/currency, source-final
  posted rows, safe card identities, and a reviewed mapping
- **WHEN** finance confirms `Import`
- **THEN** one immutable Import Manifest and the structurally safe Transaction
  Evidence Versions commit atomically
- **AND** claimant work is created only for exact eligible posted evidence.

#### Scenario: The same file is submitted again

- **GIVEN** an already accepted file with the same scoped digest and profile
- **WHEN** the import command is replayed
- **THEN** the service returns exact replay/no-op
- **AND** creates no duplicate manifest, transaction evidence, claim, or
  downstream effect.

#### Scenario: Two rows only look similar

- **GIVEN** two source rows lack a shared stable issuer occurrence identity but
  have similar merchant, date, and amount
- **WHEN** overlap analysis runs
- **THEN** the preview labels them `Possible overlap` and requires an exact
  `Same source occurrence` or `Separate purchases` decision where permitted
- **AND** the system MUST NOT heuristically merge or discard either row.

#### Scenario: A posted purchase is later refunded

- **GIVEN** immutable accepted Transaction Evidence with exact business,
  personal, and unresolved coverage
- **WHEN** the issuer source supplies a refund, reversal, dispute, fee, or
  correction
- **THEN** Phase 21 appends typed Organization Card Source Adjustment Evidence
  and routes exact downstream correction coverage to its owning domain
- **AND** it MUST NOT edit the original row, undo approval automatically, infer
  issuer settlement, or claim the books are reconciled.

### Requirement: D15 Reimbursement Handoffs Are Artifact-Always And Use One Qualified Execution Lane

`FieldAccountOperationsService` MUST create one immutable, content-addressed, schema-versioned, PII-minimized **Reimbursement Handoff Package** from exact Reimbursement Obligations.

Every clause in `openspec/contracts/field-account-operations.md#contract-98652d95644f621563b3` MUST apply without exception.

#### Scenario: Staff release the complete manual lane

- GIVEN exact Reimbursement Obligations have produced an immutable package
- WHEN authorized finance staff use `FieldAccountOperationsService` to release
  the `Handle outside Asym` lane
- THEN one Execution Claim and exact Handoff Coverage are committed
- AND the package remains immutable and the UI says that handoff does not prove
  processing or payment

#### Scenario: A provider draft may have been accepted

- GIVEN a certified payroll or AP draft operation reaches its irreversible
  provider boundary
- WHEN the response is lost or ambiguous
- THEN the operation becomes outcome-unknown and blind retry is blocked
- AND exact readback or provider inspection is required before residual recovery

#### Scenario: Payment evidence covers part of a grouped handoff

- GIVEN one package covers several obligations and the external owner reports a
  partial payment and a returned unit
- WHEN finance records the exact source-labelled outcomes
- THEN Payment Coverage applies only to the proved paid units and amounts
- AND the returned and uncovered units remain independently actionable without
  changing the package, obligation, or already covered siblings

### Requirement: D16 Advances And Claimant Repayments Preserve Purpose-Separated Truth

`FieldAccountOperationsService` MUST support independently optional, Tenant- and Legal-Entity-scoped **Expense Advance Policy Versions** and **Claimant Repayment Policy Versions**.

Every clause in `openspec/contracts/field-account-operations.md#contract-50cc34fc30e8bda7b98f` MUST apply without exception.

#### Scenario: An issued advance is applied to approved expenses

- GIVEN an advance has exact issuance and claimant-use-readiness evidence
- AND an Approved Expense Snapshot has compatible same-currency coverage
- WHEN the settlement command commits
- THEN it atomically records exact Advance Applications and the remaining
  obligation or residual
- AND no unit is reused by reimbursement or Field Account funding

#### Scenario: Optional advance and repayment policies are off

- GIVEN neither optional policy family has an active prospective version
- WHEN a claimant or staff principal loads expense, review, search, report, or
  API surfaces or attempts an advance- or repayment-specific command
- THEN no advance or repayment feature signal is enumerated
- AND that optional command is rejected without creating an Advance Application,
  Repayment Subject Determination, Repayment Decision, Requirement, Repayment
  Occurrence, or audit claim that the optional feature ran
- BUT the core settlement command may still create the exact remaining
  Reimbursement Obligation, typed residuals, and separately authorized Field
  Account Funding Coverage without creating any optional-family fact.

#### Scenario: Finance requests an external return

- GIVEN source evidence and current responsibility proof support one repayment
  decision
- WHEN finance selects `request_external_return`
- THEN the product records an exact operational Repayment Requirement and safe
  claimant instructions
- AND it does not call the amount debt, paid, settled, reconciled, or deductible
  from payroll

#### Scenario: A cash claimant return preserves exact repayment lineage

- GIVEN externally handled return evidence qualifies one Claimant Repayment
  Occurrence as `cash_claimant_return`
- WHEN Phase 21 publishes its typed D16 source fact
- THEN the occurrence carries that one immutable source-owned family
- AND preserves the exact Claimant Repayment Occurrence root, complete Claimant
  Repayment Coverage, and typed residual
- AND missing, conflicting, or inferred family evidence fails closed rather
  than publishing a generic claimant-repayment source

#### Scenario: An expense advance return preserves both lineages

- GIVEN externally handled return evidence qualifies one Claimant Repayment
  Occurrence as `expense_advance_return`
- WHEN Phase 21 publishes its typed D16 source fact
- THEN the occurrence preserves the exact Claimant Repayment Occurrence root,
  complete Claimant Repayment Coverage, and typed residual
- AND additionally preserves the exact Expense Advance Issuance Occurrence root
  and exact unused-advance coverage being returned
- AND missing, conflicting, or inferred family evidence fails closed rather
  than publishing a generic claimant-repayment source

#### Scenario: A return-family correction is append-only

- GIVEN a published cash claimant return or expense advance return was assigned
  the wrong source family
- WHEN the source owner corrects it
- THEN Phase 21 appends a cause-linked correction naming the original family,
  source identity/version, and corrected coverage
- AND publishes any correctly reclassified economic return as a new,
  non-overlapping occurrence instead of retagging the predecessor

#### Scenario: A mandatory adverse correction exceeds remaining capacity

- GIVEN a later source fact requires a full adverse correction
- WHEN `FieldAccountOperationsService` admits that correction through D11
- THEN the complete append-only correction is preserved and a visible deficit
  is reported at the exact affected scope
- AND unrelated scopes continue while new affected positive or discretionary
  use is contained

### Requirement: D17 Field Accounts Start From One Reconciled Opening Position And One Operational Cutover

`FieldAccountOperationsService` MUST establish initial Field Account authority through one finance-authorized, per-Field-Account and per-ISO-currency immutable **Opening Position** over a complete Tenant x Legal Entity x currency cohort.

Every clause in `openspec/contracts/field-account-operations.md#contract-66808207b63cfa6a8a8d` MUST apply without exception.

#### Scenario: A complete cohort starts Field Accounts

- GIVEN staging, mapping, shadow reconciliation, coverage, and control totals
  agree for the complete cohort
- WHEN authorized finance staff use the literal Start Field Accounts action
- THEN one CAS-guarded Operational Cutover establishes the exact opening
  positions and authority boundary
- AND no historical notification, receipt, workflow, payroll, payment,
  statement, or accounting side effect is replayed

#### Scenario: Final reproof finds an in-flight predecessor fact

- GIVEN a reviewed Opening Coverage Manifest was complete at preview time
- WHEN final cutover reproof finds an unowned in-flight source fact
- THEN cutover has zero financial effect and identifies the exact blocking scope
- AND saved preparation remains resumable after the source boundary is repaired

#### Scenario: One opening fact is unresolved or an inadmissible negative

- GIVEN every other account reconciles but one source fact has disposition
  `unresolved` or one legacy position would require a negative Opening Position,
  clamp, or plug
- WHEN finance reviews or invokes the cohort cutover
- THEN the entire Tenant x Legal Entity x currency cohort remains
  non-authoritative with zero cutover effect
- AND the product identifies the exact cause without carving out the row,
  inventing an obligation, or weakening the control total.

#### Scenario: An atomic predecessor group crosses opening dispositions

- GIVEN one redesignation, cross-currency manifest, Assessment Period
  Determination, or other source-conserving group cannot be admitted wholly as
  compatible `exact_history`
- WHEN opening coverage is classified
- THEN the incomplete detail remains structurally inert `reference_only` and
  the reconciled amount is represented only by nonoverlapping
  `opening_residual` coverage
- AND no group member is replayed, double-covered, or admitted across cohorts
  without the required linked atomic barrier.

#### Scenario: A predecessor fact arrives after activation

- GIVEN the original Opening Position and cutover are immutable
- WHEN a late pre-cutover source fact is proved
- THEN an idempotent Opening Position Correction and manifest successor append
- AND the economic effect reaches the balance only through its governed later
  correction and Support Cycle close

### Requirement: D18 Travel Allowance Calculations Are Certified Policy-Pinned And Explainable

`FieldAccountOperationsService` MUST treat Travel Allowance Calculation as one optional module inside the single winning D13 Expense Governance Profile.

Every clause in `openspec/contracts/field-account-operations.md#contract-9d20de11bddfb5bff29b` MUST apply without exception.

#### Scenario: A supported mileage claim is calculated

- GIVEN the winning incurred-date profile, certified source package, vehicle,
  distance, currency, and cumulative pool are complete
- WHEN the claimant reviews the calculation
- THEN the result shows exact component math, source version, unit, rounding,
  and effective period
- AND it makes no claim of approval, tax treatment, availability,
  reimbursement, payment, posting, or reconciliation

#### Scenario: A source or applicability case is unsupported

- GIVEN the tenant cannot prove a safe native calculation for the exact claim
- WHEN the claimant records an evidence-backed external calculation
- THEN the ordinary D10 claim flow remains usable and retains source provenance
- AND Phase 21 does not silently choose a formula, policy, FX rate, or fallback
  amount

#### Scenario: A source revision changes a prior calculation

- GIVEN an approved calculation is pinned to an immutable source package
- WHEN a late authoritative fact or retroactive source revision applies
- THEN the original calculation remains unchanged and an append-only correction
  or exact exception is produced
- AND downstream owners independently determine any obligation, Field Account,
  payment, payroll, tax, or accounting consequence

### Requirement: D19 Support Assignments Separate Participation Access Responsibility And Notifications

One immutable, organization-controlled **Support Assignment** MUST be the canonical Tenant- and Legal-Entity-scoped Field Account subject, with at most one Field Account per Support Assignment and ISO currency.

Every clause in `openspec/contracts/field-account-operations.md#contract-6bce1a3eb735d87452cc` MUST apply without exception.

#### Scenario: Spouses share one Support Assignment

- GIVEN two spouses each have a distinct Party and verified login
- WHEN staff explicitly add both memberships and grant each scoped workspace
  access
- THEN both may view the same authorized Support Assignment projection
- AND neither gains the other's login, claims, responsibilities, preferences,
  or unrelated assignments

#### Scenario: A participant has no workspace access

- GIVEN a Party is associated with a project Support Assignment
- WHEN no Phase 12 workspace grant exists
- THEN the participant remains listed only for the authorized association
- AND list, detail, count, cache, export, and deep-link access reveal no
  financial projection

#### Scenario: Access is revoked while work is queued

- GIVEN a participant previously had access and a notification is queued
- WHEN access or the notification preference is revoked
- THEN future reads and delivery fail closed after current reproof
- AND immutable prior financial and actor evidence remains unchanged without
  claiming already delivered bytes were recalled

### Requirement: D20 Organization Support Cost Applications Are Source-Authoritative And Absent Unless Enabled

`FieldAccountOperationsService` MUST expose the D20 lane only for prospectively enabled, capability-certified source families whose canonical semantic owner is D20.

Every clause in `openspec/contracts/field-account-operations.md#contract-c788b22e593138681dbf` MUST apply without exception.

#### Scenario: A certified cost is applied at close

- GIVEN D20 is active for the exact source family and a source-final residual
  service cost has complete purpose-compatible allocation
- WHEN the manifest is CAS-published and admitted to a Support Cycle close
- THEN one balanced same-currency Field Account occurrence is created
- AND the missionary sees only an authorized grouped post-close effect with ISO
  currency and through date

#### Scenario: Another owner is disabled

- GIVEN an occurrence semantically belongs to D3, D4, D10/D13, or D21
- WHEN that owning feature is off or temporarily unavailable
- THEN D20 rejects the occurrence instead of applying it as a residual cost
- AND no duplicate economic root or fallback debit is created

#### Scenario: A late credit or adverse correction changes the source fact

- GIVEN a prior D20 application is immutable
- WHEN a source-version-pinned credit or adverse correction arrives
- THEN exact append-only correction coverage is created
- AND a mandatory adverse correction is not dropped to hide a deficit, while
  unrelated accounts and currencies remain usable

### Requirement: D21 Noncash Support Realization Bridges Exact Source-Final Proceeds Without Creating A Second Gift

`FieldAccountOperationsService` MUST preserve Phase 13 authority over the original noncash Contribution, donor, accepted purpose, gift date, valuation, receipt, supporter, and fundraising truth, and Phase 15 authority over asset lots, disposition, proceeds, finality, and correction.

Every clause in `openspec/contracts/field-account-operations.md#contract-c689389cbfdf39441e18` MUST apply without exception.

#### Scenario: Exact proceeds become support activity

- GIVEN Phase 15 proves a source-final disposition with exact lot, quantity,
  purpose, currency, proceeds, cost treatment, and coverage
- WHEN D2 admits the Realized Support Basis through a Support Cycle close
- THEN exactly one balanced Field Account effect is created
- AND donor history and receipts continue to show only the original noncash
  Contribution

#### Scenario: Only valuation evidence exists

- GIVEN a noncash Contribution has an appraisal or estimated value but no
  source-final proceeds
- WHEN Phase 21 evaluates support admission
- THEN no monetary support candidate or Field Account effect is created
- AND staff cannot force conversion, choose a convenient valuation, or label it
  available, payable, payroll-ready, paid, or accounting-posted

#### Scenario: A realized tranche is later corrected

- GIVEN one partial disposition tranche was previously admitted
- WHEN Phase 15 appends a source-final correction
- THEN D21 appends exact non-overlapping realization correction coverage
- AND D11 admits the full mandatory effect even if it exposes a visible deficit,
  without rewriting the gift, disposition, prior close, or statement

### Requirement: D22 Prospective Expense Authorization Is Optional Exact And Separate From Actual Expense Truth

For each Tenant and Legal Entity, **Prospective Expense Authorization** MUST be independently `not_managed_in_asym` by default.

Every clause in `openspec/contracts/field-account-operations.md#contract-cd700279e3ed90013ec8` MUST apply without exception.

#### Scenario: Authorization is off

- GIVEN the posture is `not_managed_in_asym`
- WHEN a claimant opens Expenses
- THEN Add expense remains complete and no Plan an expense affordance, empty
  state, count, warning, or API member is present

#### Scenario: An approved plan covers later claims

- GIVEN an immutable authorization decision with exact same-currency ceiling
  and incurrence window
- WHEN one or several later actual claims are linked
- THEN exact non-overlapping coverage is applied up to the ceiling and residual
  remains explicit
- AND actual amount, date, merchant, evidence, policy decision, reimbursement,
  payment, Field Account effect, and accounting remain separately authoritative

#### Scenario: Required authorization is missing

- GIVEN D13 requires prior authorization for the exact expense scope
- WHEN the claimant records an actual expense without it
- THEN claim and evidence capture remain available and D13 opens its typed
  prior-authorization exception
- AND Phase 21 does not fabricate retroactive prospective authority

### Requirement: D23 Expense Field Account Effects Use One Source-Family-Specific Prospective Recognition Profile

`FieldAccountOperationsService` MUST resolve exactly one immutable, prospective **Expense Field Account Effect Recognition Profile** for each exact Tenant, Legal Entity, purpose, Field Account, ISO currency, and certified source family.

Every clause in `openspec/contracts/field-account-operations.md#contract-8273919f42cc28ecc1f4` MUST apply without exception.

#### Scenario: A claimant-paid obligation qualifies

- GIVEN an Approved Expense Snapshot, independently established Reimbursement
  Obligation, compatible Funding Coverage, and one winning profile
- WHEN the exact slice is admitted
- THEN one Effect Basis and non-reusable Effect Coverage are committed
- AND later handoff, payment, or accounting cannot subtract the slice again

#### Scenario: An organization-card expense qualifies

- GIVEN a source-final posted organization-card charge and exact D13 approval
- WHEN the D23 source contract qualifies the slice
- THEN its support-balance effect is eligible for a later D1/D11 close
- AND later card-liability payment does not create a second Field Account effect

#### Scenario: An approved source is not yet qualified

- GIVEN approval exists but the source-family obligation, finality, payment, or
  executed-payer evidence required by the winning profile is missing
- WHEN recognition is evaluated
- THEN no effect is created and the exact source-labelled wait or exception is
  shown
- AND finance cannot manually Include, Post, Sync, or Mark paid

### Requirement: D24 Expense Collaboration Uses Each Helper's Own Identity And Exact Claim Scope

Phase 21 MUST support an optional, Tenant-controlled **Expense Collaboration Assignment Version** bound to one exact claimant, helper Party and verified principal, stable claim, item/split/purpose/evidence scope, interval, and Evidence Access Projection.

Every clause in `openspec/contracts/field-account-operations.md#contract-0791bd1163be6d9102b6` MUST apply without exception.

#### Scenario: A helper prepares a claim

- GIVEN an accepted `prepare_only` assignment for one exact claim
- WHEN the helper adds facts and private evidence
- THEN the claimant receives one task identifying who prepared it and the first
  changed material fact
- AND the helper cannot submit, approve, retrieve unrelated evidence, or switch
  the account identity

#### Scenario: A confirmed claim changes before helper submission

- GIVEN the claimant confirmed one immutable Claim Version
- WHEN a material fact or evidence link changes before submission
- THEN the confirmation no longer covers the current version and submission is
  blocked
- AND the claimant must confirm the exact successor version

#### Scenario: Collaboration access is revoked

- GIVEN a helper has an active Expense Collaboration Assignment Version and
  staged work
- WHEN current access, principal binding, or evidence permission is revoked
- THEN future reads, writes, finalization, and submission fail closed
- AND immutable prior actor provenance remains while undelivered private work is
  quarantined for authorized recovery

### Requirement: D25 Expense Claim Resolution Is Exceptional Cause-Owned And Exact-Scope

FieldAccountOperationsService MUST open an immutable Expense Claim Resolution Case only for an actual issue in the closed cause catalog.

Every clause in `openspec/contracts/field-account-operations.md#contract-dd4248352dcd8a04a5a9` MUST apply without exception.

#### Scenario: Finance asks for exact missing information

- GIVEN one claim item has an `information_required` cause and other items are
  separable
- WHEN the case opens
- THEN the claimant receives one contextual update with the exact amount,
  reason, action, and next consequence
- AND clean items continue without exposing case or provider jargon

#### Scenario: The same source event opens twice

- GIVEN the same stable claim, source root, cause contract, and exact coverage
- WHEN duplicate commands or jobs attempt to open a case
- THEN semantic idempotency returns one case and one current projection
- AND no duplicate task, notification, or financial action is created

#### Scenario: Root correction succeeds but downstream work remains

- GIVEN the authoritative source has appended its correction
- WHEN one manifested downstream family has no explicit disposition
- THEN the case remains incomplete and identifies the remaining owner and safe
  next action
- AND staff cannot use generic Resolve, Close, Reopen, Unapprove, Override,
  Mark paid, or rollback

### Requirement: D26 Records Schedules And Tenant Custody Exports Are Purpose-Owned Exact And Portable

Phase 21 MUST use immutable, source-purpose-, record-family-, jurisdiction-, Legal-Entity-, and relationship-where-material-scoped **Records Schedule Contracts** with one safe default and bounded prospective tenant bindings.

Every clause in `openspec/contracts/field-account-operations.md#contract-77cd5cfeb49f60f5f709` MUST apply without exception.

#### Scenario: An archive is complete

- GIVEN every selected record has one closed manifest disposition and all
  included parts validate
- WHEN asynchronous preparation finishes
- THEN the package is labelled Ready to download and can resume or redownload
  during its governed staging window
- AND the UI does not claim the records are transferred, safely archived, or
  legally sufficient

#### Scenario: Some authorized content is unavailable

- GIVEN one restricted or quarantined family cannot be included in the main
  package
- WHEN all records receive truthful manifest dispositions
- THEN the package is labelled Ready with issues and remains downloadable
- AND later proved content arrives only through an append-only residual package

#### Scenario: Staff record an external copy

- GIVEN staff downloaded or printed a package
- WHEN they assert that the tenant stored a copy elsewhere
- THEN the assertion is recorded as custody evidence only
- AND it does not release a hold, trigger Asym disposal, prove destination
  transfer, or change source retention obligations

### Requirement: D27 Production Activation Composes Existing Authorities Through D17's Sole Cutover

Production activation MUST compose the exact-scope immutable Release Generation, Adoption Plan Version, and Go-Live Readiness Manifest through D17's sole cutover.

Every clause in `openspec/contracts/field-account-operations.md#contract-eb01d45518c6a587761a` MUST apply without exception.

#### Scenario: Finance starts a complete production cohort

- GIVEN production-authorized shadow comparison and every applicable readiness
  proof are complete for one exact generation
- WHEN finance confirms the literal dated Start action
- THEN D17 performs the sole idempotent CAS-guarded Operational Cutover
- AND the product reports recording authority and first-close verification as
  distinct through-dated facts

#### Scenario: The reviewed generation becomes stale

- GIVEN a Go-Live Readiness Manifest was reviewed
- WHEN code, schema, source, cohort, permission, revocation, policy, or mapping
  proof changes before commit
- THEN activation has zero effect and the exact stale proof is identified
- AND finance may resume after a new content-addressed manifest is prepared,
  while the stale readiness projection has no authority or side effect

#### Scenario: A live optional capability becomes unsafe

- GIVEN Core Field Accounts are already active and one optional capability
  loses current proof
- WHEN cause-owned containment is applied
- THEN only affected new positive or discretionary behavior stops
- AND history, safe reads, records export, established obligations, manual
  continuity, and mandatory adverse corrections continue

#### Scenario: A keyboard and zoom user completes a consequential review

- GIVEN an authorized user operates Mission Control with a keyboard, screen
  reader, forced colors, and 400 percent text zoom at a 320 CSS pixel viewport
- WHEN the user reviews validation errors and confirms one exact homogeneous
  action
- THEN every field, error, consequence, and control remains named, ordered,
  reflowed, focus-visible, and operable without hover, color-only meaning, or a
  critical wide table
- AND the committed result is announced without stealing focus or overstating
  another authority's state.

#### Scenario: Connectivity fails during a localized mobile expense draft

- GIVEN a long-label RTL locale, exact non-two-decimal ISO currency, and a
  claimant editing a device-local draft with an interrupted evidence upload
- WHEN connectivity is lost before submission
- THEN entered facts and resumable upload state are preserved with truthful
  device-only or upload-failed status
- AND no submission, approval, financial effect, provider action, or success
  state exists until an online server commit succeeds.

### Requirement: D28 Cumulative Travel Admission Requires Exact Opening And Continuing Source Coverage

Before first native use of an exact D18 cumulative pool or indivisible source-defined group, `FieldAccountOperationsService` MUST admit one stable **Travel Allowance Capacity Key Contract**, one immutable **Travel Allowance Cumulative Admission**, and one content-addressed **Travel Allowance Cumulative Admission Manifest**.

Every clause in `openspec/contracts/field-account-operations.md#contract-471aa029b8eb6b804c1d` MUST apply without exception.

#### Scenario: A cumulative method starts at a clean boundary

- GIVEN the next source-defined period proves zero opening state and complete
  continuing coverage for the entire source-defined group
- WHEN native admission and first allocation commit
- THEN one manifest and Capacity Key head establish native cumulative use
- AND no missionary migration UI, fabricated history, or downstream financial
  effect is created

#### Scenario: Mid-period adoption has exact prior usage

- GIVEN authoritative evidence proves the exact prior cumulative quantity,
  unit, pool, period, timezone, group membership, and continuing source
  completeness
- WHEN finance chooses This period using earlier activity
- THEN the immutable opening state is admitted and the first native calculation
  continues the same pool
- AND a source-valid value above a rate threshold is not rejected as though the
  threshold were a cap

#### Scenario: Opening or continuing evidence is uncertain

- GIVEN one person, vehicle, capacity key, or indivisible group lacks complete
  opening or continuing proof
- WHEN setup is evaluated
- THEN that exact group remains Calculated outside Asym and safe Core Field
  Accounts continue
- AND missing data is not treated as zero, averaged, maximized, split across
  groups, or overridden by a force-complete action

#### Scenario: D27 evaluates an optional cumulative capability

- GIVEN Core Field Accounts satisfy D17 and one selected D18 cumulative pool
  lacks either an exact D28 native opening proof or continuing-source
  disposition
- WHEN D27 prepares or refreshes the Go-Live Readiness Manifest
- THEN it references that optional pool as not ready for native calculation
- AND Core activation remains governed only by D17 while the pool remains
  in `external_calculation_lane`; D27 creates, waives, repairs, and reinterprets
  no D28 fact.

#### Scenario: External-at-boundary evidence cannot authorize native first use

- GIVEN a pool or indivisible source group whose complete manifest disposition
  is `external_at_boundary`
- WHEN a caller presents `asym_source_complete` or
  `authoritative_feed_complete` for that same boundary
- THEN `FieldAccountOperationsService` MUST NOT create a Travel Allowance
  Cumulative Admission or allocate native cumulative capacity
- AND the group remains in `external_calculation_lane` until a later boundary
  proves `clean_boundary_zero` or `opening_cumulative_state` together with a
  continuing-source proof.
