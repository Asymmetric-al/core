# Statement Operations Specification

## ADDED Requirements

### Requirement: D1 Statement Runs Are Purpose-pinned Authorities With One Derived Workspace

Phase 19 MUST own one canonical Statement Run and run-item system.

Every clause in `openspec/contracts/statement-operations.md#contract-647e4133e36b63ad9c6a` MUST apply without exception.

#### Scenario: Two purposes cover the same period

- GIVEN one issuer needs official tax documents and optional support overviews
  for the same year
- WHEN staff prepare year-end operations
- THEN the product creates purpose-pinned runs and items with independent
  population, artifact, delivery, control, and completion truth
- AND the Year-End Operations workspace may present them together without
  creating a mixed-purpose run or global completion percentage

### Requirement: D2 One Exact Preflight Starts Through One Atomic Release Barrier

The system MUST build one immutable, inert, server-owned Run Preflight that pins the complete run and release-barrier inputs.

Every clause in `openspec/contracts/statement-operations.md#contract-3d9fc7ed281ec4dab990` MUST apply without exception.

#### Scenario: A material fact changes during final confirmation

- GIVEN staff reviewed a Run Preflight
- WHEN the Statement Subject, source closure, purpose, issuer, document
  resolution, communication resolution, policy, direct-mail count/connection/
  quote/guard, or review floor changes before Start commits
- THEN Start fails atomically with zero run, item, outbox, or provider effects
- AND the UI shows a permission-safe typed delta and offers to rebuild and
  review the current candidate

#### Scenario: Protected review becomes stale or two reviewers start concurrently

- GIVEN a protected review is bound to one exact Run Preflight digest
- WHEN participation changes after review or two eligible reviewers concurrently
  call `approveAndStartLiveRun`
- THEN a participation change supersedes that review and requires a new review
  bound to the rebuilt digest
- AND exactly one concurrent command may create and release one run
- AND every losing or stale command returns a typed replay or conflict with zero
  additional run, item, outbox, audit-decision, or provider effects

### Requirement: D3 Statement Recognition Delivery And Presentation Subjects Stay Separate

Phase 19 MUST preserve separate Statement Subject, Recognition Subject, Delivery Recipient, and Year Presentation Group concepts and authorities.

Every clause in `openspec/contracts/statement-operations.md#contract-36dd95df58d002816a49` MUST apply without exception.

#### Scenario: Spouses share one mailbox but are separate legal donors

- GIVEN two legal-donor Statement Subjects share an email or postal address
- WHEN Phase 19 builds their recipient operations
- THEN each subject retains a separate official document and authorization
- AND the UI may say that the destination is shared without combining legal
  totals, documents, failures, or access rights

### Requirement: D4 Canadian Receipt Plans Are Exact-issuer Prospective And Structurally Absent Otherwise

Phase 19 MUST consume Phase 18's exact legal-issuer Canadian pack authority and MUST NOT create a second country test, activation flag, enrollment flow, or legal-rules layer.

Every clause in `openspec/contracts/statement-operations.md#contract-d1f2b01c6adeb2b5bed2` MUST apply without exception.

#### Scenario: Canadian-looking data exists under an unactivated issuer

- GIVEN a U.S. issuer has a Canadian-addressed donor, CAD gifts, and a French
  locale
- WHEN staff use year-end operations
- THEN no Canadian plan, terminology, control, queue item, or warning appears
- AND the ordinary acknowledgment or statement flow is unchanged

#### Scenario: An activated issuer uses annual cumulative cash receipts

- GIVEN the exact issuer's Canadian pack and annual cumulative plan are active
- WHEN Phase 19 builds a preflight
- THEN it consumes Phase 7's nonoverlapping eligible coverage set and the exact
  immutable receipt-plan fact identity, digest, plan code, activation epoch, and
  policy revision
- AND Phase 18 remains the sole authority for official receipt identity,
  currentness, cancellation, and replacement

#### Scenario: Batch commit respects annual cumulative coverage

- GIVEN an eligible settled check or cash gift is frozen under
  `annual_cumulative_cash`
- WHEN Phase 15 commits the batch or quick-entry gift
- THEN the money posts through the ordinary append-only ledger path
- AND the year-end-readiness evidence references the exact immutable Phase 7
  receipt-plan fact
- AND no per-gift receipt authorization, generated-document request, official
  coverage, or delivery occurrence is created
- AND staff see the occurrence as ready for year-end receipt rather than failed
  or omitted

#### Scenario: Canadian authority changes preserve truth by reason

- GIVEN a previously active issuer has a repairable issuance pause
- WHEN an eligible cash occurrence is committed
- THEN its source plan fact remains frozen in the active epoch
- AND official generation/issuance remains held until proof-gated recovery
- GIVEN instead a confirmed legal lock or ended pack
- WHEN a later occurrence is committed
- THEN it receives no issuable Canadian plan fact and is not queued
  retroactively
- AND prior plan facts, coverage, serials, documents, corrections, holds, and
  retention evidence remain available under their original epoch
- AND reactivation requires fresh proof and a new epoch

### Requirement: D5 Primary Releases Stay Immutable While Late Facts Use A Contract-owned Lane

Every run MUST keep the source-owned Document Period, tenant Readiness Target (shown as **Target ready for review by**), versioned **Compliance-Risk Rule**, and immutable Source-Fact Cutoff separate.

Every clause in `openspec/contracts/statement-operations.md#contract-2da76d472abf8817e9c2` MUST apply without exception.

#### Scenario: A December 31 check is received after year-end

- GIVEN authorized staff records that a check received January 3 was actually
  mailed December 31 using the governed Phase 15 attestation
- WHEN Phase 7 stores December 31 as the gift date and the fact posts after the
  primary run started
- THEN the primary run remains immutable
- AND Phase 19 creates one linked late-fact obligation for the prior year
- AND the governing source and purpose contracts derive the required
  supplemental or successor action without an inline year override

#### Scenario: A year-boundary check later returns unpaid

- GIVEN the check was included through a truthful source attestation
- WHEN the payment later returns or is reversed
- THEN the source domain appends its reversal and correction authority
- AND Phase 19 coordinates the required successor operation without rewriting
  the intake evidence, source cutoff, or original run

#### Scenario: The same late source fact is delivered twice

- GIVEN one post-Start source fact already created a Late Fact Obligation
- WHEN an import retry or concurrent source delivery repeats the same
  source-fact identity
- THEN exact replay returns the same obligation
- AND a later source revision appends through compare-and-swap in that logical
  slot rather than creating a second open obligation

### Requirement: D6 Delivery Profiles Compile Into Frozen Fulfillment Plans

Tenants MUST be able to publish one organization-default **Statement Delivery Profile** per compatible purpose and additional named profiles without an arbitrary cap.

Every clause in `openspec/contracts/statement-operations.md#contract-0300717279360a507ec4` MUST apply without exception.

#### Scenario: A hard bounce activates an approved paper fallback

- GIVEN a frozen Fulfillment Plan allows email first and paper after definitive
  failure
- WHEN Phase 17/6 proves the email route reached a final hard bounce
- THEN Phase 19 activates the frozen paper fallback exactly once over the same
  current Phase 18 artifact
- AND a transient or indeterminate email outcome does not activate paper

### Requirement: D7 Recipient-delivery Snapshots Use Governed Destination Succession

Each recipient-document operation MUST freeze one reviewed delivery snapshot binding the exact authorized subjects, destination, source, policies, and integrity evidence.

Every clause in `openspec/contracts/statement-operations.md#contract-b7c5957270beb7d9abbc` MUST apply without exception.

#### Scenario: An address changes after preflight but before start

- GIVEN a material address revision changes after staff reviewed the preflight
- WHEN staff attempt to start the run
- THEN only the affected recipient operation is marked stale
- AND the old immutable preflight digest cannot start
- AND staff see masked before/after consequences, rebuild the exact candidate,
  and refresh the protected review when applicable
- AND unchanged operations may reuse only evidence re-proved current

#### Scenario: A destination changes after possible provider acceptance

- GIVEN provider submission may already have begun
- WHEN staff select a new authorized destination
- THEN the original occurrence remains indeterminate and must reconcile
- AND the product does not claim recall, mutate prepared bytes, or blindly
  release a successor delivery

### Requirement: D8 Run Containment Is Cooperative And Truthful

Phase 19 MUST provide **Pause new work**, **Resume remaining work**, and **Stop remaining work** over one monotonic run-control posture, version, epoch, and append-only command history.

Every clause in `openspec/contracts/statement-operations.md#contract-d9a8c1ac35101eaaea0f` MUST apply without exception.

#### Scenario: Pause races email submission

- WHEN Pause and a recipient email handoff race
- THEN if containment commits first, the stale worker cannot submit
- AND if the handoff fence commits first, the occurrence remains in flight and
  reconciles without a recall or cancellation claim

#### Scenario: Resume follows a privacy containment

- GIVEN a privacy reason triggered the strongest containment posture
- WHEN an ordinary run operator attempts Resume
- THEN Resume remains blocked until current incident-owner clearance and safety
  proof exist
- AND already issued documents and external outcomes remain unchanged

#### Scenario: Stop follows run release while work remains unclaimed

- GIVEN the run-level Start barrier is open and one operation is unclaimed while
  another is claimed but has not crossed its irreversible-handoff fence
- WHEN authorized staff Stop remaining work and the control command wins the
  serialized race
- THEN both operations become permanently stopped without an external handoff
- AND an operation whose handoff fence won first remains in flight and
  reconciles without being relabeled as stopped

### Requirement: D9 Physical Fulfillment Is Self-print-first And Evidence-based

Every tenant MUST control paper fulfillment through one Asym-owned contract.

Every clause in `openspec/contracts/statement-operations.md#contract-e5450ef75364acf88294` MUST apply without exception.

#### Scenario: Staff download a self-print package

- WHEN authorized staff prepare and download an exact-artifact package
- THEN the status becomes Downloaded — mailing not recorded
- AND no piece is marked printed, handed to a carrier, delivered, or received
- AND staff can later record all-success or exact partial print and postal
  handoff evidence without regenerating the official documents

#### Scenario: A direct-mail creation times out after possible acceptance

- WHEN a provider request times out after it may have accepted a mailpiece
- THEN the attempt becomes Outcome unknown under its original semantic identity
- AND the adapter reconciles by provider evidence before any new attempt
- AND the system does not silently fall back to self-print

#### Scenario: A paid lane exceeds the tenant guard before start

- GIVEN a reviewed candidate uses connected direct mail
- WHEN its current provider quote or certified upper bound exceeds the tenant's
  per-run spending guard
- THEN Start blocks atomically with exact count, amount, currency, freshness,
  and a permission-safe next action
- AND no run, outbox release, provider submission, or charge occurs

#### Scenario: A current quote rises after start

- GIVEN a released paid lane has exact unsubmitted pieces and a frozen
  authorization ceiling
- WHEN the fresh execution-time bound is higher than that ceiling
- THEN provider submission remains blocked with zero external effect
- AND authorized staff may review the exact delta and append one bounded
  authorization for only the remaining pieces
- AND an exact replay returns the same authorization while a stale or changed
  selection conflicts

#### Scenario: Credentials rotate without changing the logical connection

- GIVEN a released paid lane remains on the same provider account, billing
  agreement, currency, supported regions, and proven capabilities
- WHEN an authorized connection administrator rotates the write-only secret
- THEN execution re-proves the new credential revision and may continue within
  the existing ceiling and cumulative guard
- AND the rotation does not authorize paid mail or mutate the frozen plan

### Requirement: D10 Staff Decide Operational Completion While The System Derives Truth

An authorized tenant staff member MUST decide when to use **Mark run complete**.

Every clause in `openspec/contracts/statement-operations.md#contract-82ef4ed187b22d660f93` MUST apply without exception.

#### Scenario: Staff complete a run with unresolved work

- GIVEN the run has bounced email, downloaded-but-unmailed paper, and one late
  fact obligation but no integrity or uncontained privacy failure
- WHEN authorized staff select Mark run complete
- THEN one immutable completion snapshot records the exact causes and owners
- AND Asym derives Completed with exceptions rather than accepting a
  staff-selected outcome label
- AND the exceptions remain available in follow-up and contextual donor views
- AND completion sends, retries, cancels, rerenders, or purges nothing

#### Scenario: A tenant uses lightweight follow-up defaults

- GIVEN the tenant configured a default follow-up team and due-date preset
- WHEN authorized staff mark a run complete with exceptions
- THEN the current exceptions receive those organizational defaults
- AND staff are not required to enter a note, category, due date, or approval
- AND the defaults do not change the derived completion result or owner truth

### Requirement: D11 Seasonal Execution Is Certified Tenant-fair And Inspectable

Phase 19 MUST use product-owned tenant-fair admission, recipient-grained claims, workload-shaped service classes, bounded leases, fencing, provider-adaptive backpressure, poison isolation, and exact reconciliation.

Every clause in `openspec/contracts/statement-operations.md#contract-75aa6f48a2b47d2dd817` MUST apply without exception.

#### Scenario: One large tenant runs beside smaller tenants

- GIVEN one 50,000-subject run and at least 19 smaller tenant runs are eligible
- WHEN certified seasonal execution proceeds
- THEN the large run cannot monopolize admission, workers, renderer, provider,
  or finalization capacity
- AND each eligible tenant receives a claim within the certified
  `2 × active tenant count` decision bound
- AND protected critical messages remain within their source-owned budgets
- AND every recipient retains independent durable progress and outcome

#### Scenario: A tenant chooses an earlier target

- WHEN a tenant changes Target ready for review by
- THEN the UI recomputes an evidence-based risk and ETA range
- AND the tenant does not gain global priority, worker count, provider rate, or
  a delivery guarantee

### Requirement: D12 One Contextual Help Doorway Routes To Existing Owners

Phase 19 MUST provide one **Help with this statement** doorway from the exact Party Giving row and matching Year-End Operations item.

Every clause in `openspec/contracts/statement-operations.md#contract-e5fdaec376188417f026` MUST apply without exception.

#### Scenario: A donor says giving is missing

- WHEN staff choose Giving is missing for an already released annual statement
- THEN the doorway routes to the linked source-owned late-fact or supplemental
  preflight
- AND the frozen primary run and current artifact remain unchanged until the
  source and purpose authorities admit a successor

#### Scenario: Staff ask for another copy after an uncertain send

- GIVEN the prior provider outcome may already have been accepted
- WHEN staff choose Provide another copy
- THEN the page offers Review delivery rather than a generic resend
- AND a new delivery cannot be admitted until the original occurrence reaches
  a truthful reconciled outcome

### Requirement: D13 Statement Communication Is Finite Proportional And Contract-owned

Phase 19 MUST own a finite, versioned admission contract for statement communication.

Every clause in `openspec/contracts/statement-operations.md#contract-e5c404cace887a26e74e` MUST apply without exception.

#### Scenario: Email delivery definitively fails

- GIVEN the ordinary statement email reaches Phase 17/6 definitive failure
- WHEN the frozen Fulfillment Plan contains a compatible paper fallback
- THEN that fallback may activate once
- AND the product does not email the failed destination to announce its own
  failure or create a per-recipient staff notification storm

#### Scenario: A tenant chooses a daily grouped staff summary

- GIVEN the tenant assigned a responsible team and daily grouped summary to a
  non-urgent statement-delivery attention cause
- WHEN many recipients enter that cause during the same grouping window
- THEN one in-product group remains authoritative
- AND Phase 17 may emit at most one permitted daily companion summary for that
  team and grouping key
- AND no recipient-level staff email storm is created

#### Scenario: A corrected statement becomes current

- GIVEN Phase 18 atomically makes one valid successor current
- WHEN the purpose contract and predecessor exposure require an update notice
- THEN Phase 19 admits at most one truthful successor notice
- AND no notice is admitted for an unhealthy, unauthorized, or non-current
  successor

### Requirement: D14 Run Approval Is Proportional And Adds No Ordinary Bureaucracy

Phase 19 MUST derive exactly one of two release floors over the exact Run Preflight.

Every clause in `openspec/contracts/statement-operations.md#contract-3ca5079906165b2c63e0` MUST apply without exception.

#### Scenario: An ordinary ready run starts

- GIVEN no closed protected reason exists and the tenant has not enabled review
  for every live run
- WHEN the authorized preparer starts the run
- THEN no reviewer workflow or approval UI appears
- AND one D2 confirmation and atomic start are the entire release path

#### Scenario: A protected reviewer edits the candidate

- GIVEN a different human is reviewing a protected Run Preflight
- WHEN that reviewer makes a substantive participation or configuration edit
- THEN the person becomes a preparer for the new candidate
- AND the prior review is superseded and another independent reviewer is
  required

#### Scenario: A protected one-person tenant has no eligible reviewer

- GIVEN a governing contract permits candidate-scoped delegated review
- WHEN the sole tenant operator requests review
- THEN the product offers one verified expiring Phase 12 delegation path without
  granting standing membership or unrelated data
- AND if the contract requires a qualified internal officer, release remains
  blocked with a direct reviewer-management next action

### Requirement: D15 Support Overview Is Optional Purpose-separated And Non-tax

Phase 19 MAY create one optional **Support overview — Not a tax document** under Phase 18's `giving.summary.informational@1` purpose.

Every clause in `openspec/contracts/statement-operations.md#contract-17f6aae3b2eeb4a8159d` MUST apply without exception.

#### Scenario: The feature is off

- WHEN a tenant does not enable Create support overviews
- THEN no overview run item, queue, filter, card, portal placeholder,
  notification, or recognition computation appears in ordinary operations
- AND official statement work is unaffected

#### Scenario: A recipient has direct and DAF-recognized support

- GIVEN the source-authorized projection includes one direct gift and one
  disclosed DAF recommendation
- WHEN the overview is produced
- THEN each immutable contribution appears once in its correct labeled section
- AND no indirect amount enters an official or deductible total
- AND the artifact is persistently labeled Not a tax document

### Requirement: D16 Donor Access Is Unmetered While Outbound Copies Are Bounded

An authorized signed-in donor MUST be able to view, download, and locally print the exact current Phase 18 canonical PDF repeatedly while it is current, healthy, lawfully retained, and authorized.

Every clause in `openspec/contracts/statement-operations.md#contract-532dc56be48d2512c5bf` MUST apply without exception.

#### Scenario: A donor downloads the same statement repeatedly

- WHEN an authorized donor views, downloads, refreshes, ranges, or locally
  prints the current statement multiple times
- THEN the same exact current bytes remain available without a visible counter
- AND no outbound occurrence, new artifact, or claim of donor receipt is made

#### Scenario: A donor double-clicks Send another copy

- WHEN duplicate gestures or two devices submit the same reviewed copy request
- THEN both return the same durable outbound occurrence
- AND exactly one provider or physical-fulfillment attempt may be released

#### Scenario: A paid copy request reaches an exhausted guard

- GIVEN prior accepted or outcome-unknown attempts reserve the remaining
  connected-direct-mail guard
- WHEN a donor or staff member confirms Send another copy twice
- THEN both requests resolve to one typed blocked or exactly replayed occurrence
- AND no provider submission, new reservation, or charge occurs
- AND exact-current view, download, and local print remain available

#### Scenario: Staff review the cost of one mailed copy

- GIVEN a staff-requested paid copy is profile-permitted and inside the current
  guard
- WHEN authorized staff open its confirmation
- THEN they see the recipient, route, masked destination, currency, exact
  one-piece price or certified upper bound, and remaining guard
- AND the action states the maximum one-copy cost in plain language
- AND a revision change before submit returns to review with zero provider
  effect

### Requirement: D17 Each Run Has One Quiet PII-minimized Evidence Record

Each Statement Run MUST have one logical **Run Evidence Record** that deterministically projects minimum Phase 19-owned evidence.

Every clause in `openspec/contracts/statement-operations.md#contract-22a4513541abde1ba71e` MUST apply without exception.

#### Scenario: Current source truth changes after completion

- GIVEN a run has immutable release and completion evidence
- WHEN a source correction or delivery outcome changes later
- THEN the frozen evidence remains unchanged
- AND Follow-up now links to the current owner-authoritative state with an
  explicit as-of time

#### Scenario: An audit package expires

- WHEN the temporary package reaches its records-controlled expiry
- THEN future retrieval is blocked and Asym-owned bytes are verifiably disposed
- AND the permanent Run Evidence Record remains available
- AND the product does not claim to recall a copy previously downloaded

### Requirement: D18 Tenant Participation Is Flexible But Cannot Override Eligibility

Phase 7 MUST remain the sole authority for Statement Subject, eligibility, facts, legal donor, jurisdiction, period, currency, and official coverage.

Every clause in `openspec/contracts/statement-operations.md#contract-b67ed5980e1ea0e9f222` MUST apply without exception.

#### Scenario: Staff add an eligible omitted subject before start

- GIVEN server search resolves an existing Party to a compatible, eligible,
  uncovered Statement Subject
- WHEN authorized staff choose Include in this run
- THEN the whole source-authoritative subject is included through one
  idempotent append-only participation command
- AND the preflight revision advances and prior review is invalidated
- AND staff cannot edit its gifts, total, year, currency, or legal donor

#### Scenario: Staff try to omit a required subject

- GIVEN the governing purpose requires the valid Statement Subject to remain
  covered
- WHEN staff choose Handle separately
- THEN the only permitted result preserves a visible owned follow-up
- AND the system does not offer Do not include this time, a waiver, or a clean
  completion fiction

#### Scenario: A tenant requires a note for a sensitive omission

- GIVEN the purpose permits optional omission and the tenant requires a short
  internal note for Handle separately
- WHEN authorized staff choose Do not include this time without that note
- THEN the command returns a field-specific validation result and releases no
  work
- AND a valid bounded note permits the append-only participation command
- AND the note does not waive eligibility, facts, or future coverage
