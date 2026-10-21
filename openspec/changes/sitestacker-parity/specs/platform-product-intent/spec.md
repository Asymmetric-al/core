# Delta for Platform Product Intent

## ADDED Requirements

### Requirement: Phase 4 Preserves Permanent Unclaimed Donors And Optional Exact Claiming

The platform MUST preserve a permanent, first-class unclaimed donor record without a login and MUST permit guest giving without forcing a claim.

Every clause in `openspec/contracts/platform-product-intent.md#contract-3be33f8ab38e52534606` MUST apply without exception.

#### Scenario: A donor gives while remaining permanently unclaimed

- WHEN a donor captured offline gives online as a guest under eligible source rules
- THEN the platform accepts the gift without requiring login or claim
- AND attribution reveals no existing identity or private data and grants no access
- AND the donor record may remain unclaimed indefinitely

#### Scenario: Contact changes after an accepted claim

- WHEN the claimed person's current contact address changes or its verification clears
- THEN accepted historical claim proof remains separate and is not erased
- AND the changed address inherits no old verification or protected access
- AND a new email match cannot select or overwrite another established claim

### Requirement: Phase 4 Path 2 Keeps Every Tenant Claim And Access Isolated

The platform MUST maintain separate donor records, memberships and claims per Tenant even when native authentication uses a shared credential.

Every clause in `openspec/contracts/platform-product-intent.md#contract-30b63ab3f908d435f3e8` MUST apply without exception.

#### Scenario: A credential from one Tenant attempts another Tenant's record

- WHEN an authenticated person requests another Tenant's donor record without
  exact current source admission in that Tenant
- THEN the platform denies the request without revealing cross-Tenant existence
- AND no donor, membership or claim is linked or merged across Tenants
- AND a record-only grant cannot expose broader history, wallet or lists

### Requirement: Phase 4 Identity Experiences Use The Verified Tenant Host And Account Brand

Auth email, login, claim, verification, recovery and portal experiences MUST use the current verified Tenant Donor Portal Host and Tenant Donor Account Brand.

Every clause in `openspec/contracts/platform-product-intent.md#contract-1903dbb11d79aa80df76` MUST apply without exception.

#### Scenario: Entry supplies the wrong brand or missing trusted context

- WHEN an identity action or message has missing or wrong trusted Tenant/host
  context, or an entry/default Site attempts to select the account brand
- THEN the action or message fails closed on invalid context without fallback
- AND valid entry uses the current verified Tenant host and account brand
- AND no untrusted Site context selects authority or exposes another Tenant

### Requirement: Phase 4 Claim Safety Is Independent Of Entry Method

Every qualified claim method MUST enforce the same exact fresh, single-use, purpose-bound proof of control of the intended contact email/mailbox and current claim/link policy.

Every clause in `openspec/contracts/platform-product-intent.md#contract-082ed91c632be9444cb9` MUST apply without exception.

#### Scenario: A match or provider flag arrives without qualified proof

- WHEN an entry has only attribution, a matching contact, a provider email flag
  or unproved staff action
- THEN no claim binding or private disclosure occurs
- AND public responses reveal neither donor nor cross-Tenant credential existence
- AND native/provider qualification is not inferred from that match or flag

#### Scenario: A claim proof is reused or has the wrong purpose

- WHEN a consumed link/code issuance or wrong-purpose proof attempts a claim
- THEN the platform rejects it without binding, membership or disclosure effects
- AND consuming either qualified link or code leaves no reusable sibling proof

### Requirement: SiteStacker Parity Is An Outcome-Parity Program

The platform MUST pursue SiteStacker parity as an outcome-parity program: it MUST match what SiteStacker/WMTek lets a Christian missions organization accomplish, built on the platform's own model, rather than cloning SiteStacker's screens.

Every clause in `openspec/contracts/platform-product-intent.md#contract-510717beddda641927df` MUST apply without exception.

#### Scenario: A parity capability is proposed

- WHEN a SiteStacker-style capability is proposed for the platform
- THEN it is scoped as the real outcome an organization must accomplish, fitted
  to an existing surface through the shared `packages/api` layer, and
  benchmarked against a cited SiteStacker doc (or marked not-yet-sourced)
- AND it does not become a bolted-on module or move admin depth into a
  role-scoped surface

#### Scenario: A parity area moves into active build

- WHEN a parity area moves from tracked to actually being built
- THEN its detailed behavior is already specified in its accepted OpenSpec change and PRD
  before dispatch
- AND the parity matrix records its built, live, and confirmed status separately

### Requirement: The Parity Program's Phase Architecture Is Governed By One Roadmap

The SiteStacker parity program MUST govern its phase set, numbering, ordering, and dependencies through a single roadmap source of truth (`docs/prds/sitestacker-parity/roadmap.md`, Roadmap v3 adopted 2026-09-22, 45 phases numbered 0–44; `phase-map.md` is its compact mirror and loses on conflict).

Every clause in `openspec/contracts/platform-product-intent.md#contract-ebaa546428adaf9ed3f4` MUST apply without exception.

#### Scenario: A new phase PRD is groomed

- WHEN a phase moves into grooming
- THEN the PRD starts from that phase's roadmap scope section, cites phases as
  "Phase N (Name)", extends the Phase 1 ownership matrix if it introduces a new
  record type, and reserves the seams the roadmap names for later phases

#### Scenario: The program is re-sequenced

- WHEN phase numbering or ordering changes
- THEN the change lands as a roadmap revision with an old→new mapping table and
  a same-commit congruence sweep of live PRDs, program docs, and open issues
- AND no document or issue is left citing a moved number without the mapping

#### Scenario: The Studio program is scheduled

- WHEN the accepted later-phase scope is divided into delivery checkpoints
- THEN Phase 34 CORE is independently qualified before Phase 41 mobilization
- AND the GIVING, EVENTS, CARE and FULL checkpoints do not become CORE prerequisites
- AND Phase 42 runs after its exact CMS/permission/source gates without waiting
  for Phases 34, 40 or 41; WEB-VISUAL does not wait for Git
- AND Phase 31 connection foundations and Phase 32 native email remain complete
  without Phase 43 SMS or Phase 44 enterprise consumers

### Requirement: Donor-Credit Recognition Stays Structurally Separate From Money Truth

Donor-credit operations SHALL keep recognition structurally separate from money truth — across soft credits, DAF advisor recognition, tribute notifications, matching-gift expectancies, and church-member attribution.

Every clause in `openspec/contracts/platform-product-intent.md#contract-a8b17c054af815333a4e` MUST apply without exception.

#### Scenario: A recognition row is recorded against a contribution

- WHEN a soft-credit, DAF-advisor, tribute, matching-gift, or church-member
  attribution row is recorded against a contribution
- THEN no receipt is minted from it, no receipt/deductible/cash/ledger total
  includes it, and every surface that shows it reads through the governed
  recognition read models
- AND no column, export, or API field sums Legal giving and Recognition
  giving together

### Requirement: Offline Money Enters Only Through the Governed Batch-Commit Path

Initial staff entry of offline gifts MUST flow through the single gift-entry-batch commit service, the Phase 15 D1 front door.

Every clause in `openspec/contracts/platform-product-intent.md#contract-124061655f11836c2178` MUST apply without exception.

#### Scenario: Staff-entered offline money is committed

- WHEN a staff member commits a validated batch of eligible offline gifts
- THEN the guarded batch-commit path accepts only the current approved revision
  and writes money once through the canonical Phase 13 posting substrate
- AND frozen control totals and any authorized override remain auditable
- AND source posting does not itself claim an issued receipt or sent message

#### Scenario: Validation is not a money-writing operation

- GIVEN a batch whose current revision passes validation
- WHEN validation completes without an accepted guarded commit
- THEN it creates no contribution/posting, receipt authorization, generated
  document request or delivery occurrence
- AND a later material edit invalidates that validation for commit

#### Scenario: A staff-assisted provider payment posts through its owner

- GIVEN a staff-assisted Stripe card or ACH payment linked to a batch row
- WHEN its exact source-confirmed success satisfies Phase 13 posting admission
- THEN that owner records the contribution exactly once and Phase 15 links it
- AND no processing response, UI confirmation or batch action creates another
  offline contribution for the same payment

#### Scenario: Receipt-affecting correction preserves source admission

- GIVEN an accepted append-only correction that affects receipt facts
- WHEN the correction source occurrence reaches Phase 7
- THEN Phase 7 evaluates exact eligibility, coverage and correction authority
- AND only its admitted transition proceeds through Phase 18 and Phase 17/6
- AND missing authorization, issuer holds or an absent predecessor artifact
  cannot be replaced by a fabricated corrected receipt or success status

#### Scenario: Annual-cumulative correction does not fabricate per-gift output

- GIVEN a corrected gift with a frozen annual-cumulative cash plan
- WHEN the gift is not yet covered by an issued cumulative document
- THEN its corrected source facts and year-end readiness remain authoritative
- AND no per-gift receipt authorization, artifact or delivery is created

#### Scenario: An issued cumulative document retains its correction authority

- GIVEN exact issued cumulative coverage that includes a corrected gift
- WHEN the correction affects that coverage's source-owned facts
- THEN the owning source evaluates its exact correction and artifact contract
- AND the caller neither ignores that issued coverage nor substitutes a per-gift
  receipt or rewrites the original coverage/artifact history

### Requirement: Recurring Support And Fixed-Total Pledges Preserve Separate Truth

Phase 16 (Pledges & Recurring Commitments) MUST treat a recurring commitment and a fixed-total pledge as separate operational aggregates.

Every clause in `openspec/contracts/platform-product-intent.md#contract-a80e1fa8ecf7b5303d94` MUST apply without exception.

#### Scenario: Compatible lines share one exact executor mapping

- GIVEN a donor explicitly creates one recurring-giving group with two
  compatible destination lines
- WHEN the current provider adapter creates their recurring executor
- THEN the compatible lines share one billing cohort and the minimum explicit
  execution legs required by their cadence
- AND each line binds to its exact provider item in every applicable leg and remains independently
  identifiable and manageable
- AND the platform never infers the group from donor, email, payment method,
  cadence, date, or provider metadata

#### Scenario: Tenant cadence choices stay truthful and grandfathered

- WHEN a tenant configures the supported cadences for a giving experience
- THEN exactly one enabled cadence is featured; it is monthly whenever monthly
  is enabled, otherwise the tenant must atomically select one other enabled
  cadence
- AND alternate enabled cadences remain progressively discoverable with exact
  amount-per-occurrence wording
- AND the only recurring cadence values are weekly, every two weeks, twice
  monthly on the 1st and 15th, every four weeks, monthly, quarterly, semiannual,
  and annual; one-time is separate and daily is excluded
- AND every schedule is calculated by the same versioned calendar engine
- AND later availability changes affect new arrangements only and never mutate
  an existing donor schedule
- AND checkout applies no end date without asking an extra question; a donor
  sees the optional inclusive final-date control only after choosing to use it

#### Scenario: A future continuing date does not suppress or duplicate the initial contribution

- GIVEN a donor selects a future date for the continuing recurring schedule
- WHEN the donor submits the recurring arrangement
- THEN one actual initial contribution per disclosed compatible billing cohort
  is attempted immediately, never one per line or twice-monthly leg
- AND each cohort freezes exactly one executor-invoice or product-triggered
  owner for that attempt, never both or neither
- AND the review distinguishes that contribution from the first continuing
  occurrence on the donor-selected date
- AND a schedule that begins today never produces a second same-day charge

#### Scenario: Donor-controlled schedule boundaries are validated twice

- GIVEN checkout defaults the continuing anchor to the current civil date in
  the arrangement's frozen giving timezone
- WHEN a donor keeps that date or selects a valid future continuing date and an
  optional inclusive final eligible date
- THEN the server-owned preview rejects a past continuing date and rejects a
  final eligible date before the first continuing occurrence
- AND the apply command repeats those checks under lock; equality with the first
  continuing occurrence permits that one occurrence
- AND for twice-monthly giving, an off-slot default advances to the next 1st or
  15th and a donor-selected continuing date must itself be a 1st or 15th

#### Scenario: Calendar schedules preserve their intended grid

- WHEN a schedule crosses a short month, leap year, daylight-saving transition,
  timezone-data change, or fixed twice-monthly boundary
- THEN the frozen giving-timezone and preferred-anchor rules generate the same
  intended calendar grid using clamp-and-recover behavior where needed
- AND a late attempt, retry, processing delay, settlement, or return never
  re-anchors later occurrences

#### Scenario: Lifecycle changes preserve history and create no debt

- WHEN an authorized donor skips an occurrence, pauses, resumes, cancels, or
  changes the next recurring date
- THEN the command applies prospectively through one revision-fenced command
  and the correct append-only fact: a new line-term version for changed terms, a
  new schedule epoch only for calendar changes, or immutable skip, pause,
  resume, or cancellation facts for lifecycle changes
- AND it never overwrites history, recalls an already submitted payment,
  prorates, catches up, back-charges, silently charges, or moves the unchanged
  normal grid
- AND a donor-requested next date of today may attempt one occurrence only
  after a separate explicit confirmation of its exact amount and date
- AND a line-specific change splits the line from a shared cohort atomically
  when compatibility requires it
- AND paused-grid occurrences remain as suppressed facts; a bounded resume date
  is an eligibility boundary rather than a promised charge date, an indefinite
  pause resumes only by command, and neither pause nor resume proves an external
  executor stopped or creates an immediate charge

#### Scenario: Card recovery remains bounded and schedule-first

- GIVEN a later card occurrence soft-fails with retry-permitted evidence
- WHEN the Phase 16 recovery policy evaluates it
- THEN weekly occurrences receive at most the frozen +2 and +4 local-date slots
  and other cadences receive at most +2, +4, and +6, subject to every live
  provider, authorization, lifecycle, time-window, and rolling-safety guard
- AND only actual provider attempts consume the occurrence budget
- AND the triggering occurrence plus at most three later normally scheduled
  soft-failed occurrences may receive those bursts before later occurrences
  become schedule-only until recovery
- AND every missed occurrence closes independently without debt, catch-up, or
  anchor drift
- AND the configured provider subscription owns ordinary renewals only;
  provider-native automatic retries are disabled or proved unable to overlap
  Phase 16 recovery commands, and the provider never chooses product retry
  eligibility or timing

#### Scenario: ACH recovery requires exact donor-confirmed authority

- GIVEN one ordinary recurring ACH entry returns unsuccessful
- WHEN the donor has not completed a proof-valid one-use recovery grant for the
  exact billing-cohort occurrence
- THEN the platform performs no silent same-occurrence re-presentment
- AND the normal future schedule remains intact with a separate one-time gift
  available as the safe fallback
- AND an R01 or R09 recovery may run only when the actual provider and ODFI path
  proves lawful same-entry treatment, exclusive execution ownership, current
  authorization, and semantic idempotency

#### Scenario: Communications follow meaningful state and current proof

- WHEN recurring-payment state reaches a new donor-relevant meaning or an
  explicitly enrolled fixed-pledge reminder stage becomes due
- THEN the product creates one semantically idempotent candidate through the
  governed Phase 6 communication spine
- AND the candidate re-proves current truth, purpose, recipient authority,
  consent, suppression, template, and duplicate state before submission
- AND fixed-total pledge reminders remain Off until explicit current-plan
  enrollment and a tenant may only narrow the single two-touch maximum

#### Scenario: Provider-control loss quarantines unsafe work

- WHEN current evidence cannot prove the expected tenant, account, mode,
  ownership, capability, executor, or in-flight outcome
- THEN the affected binding enters control quarantine and unsafe new attempts,
  widening commands, stale replays, and replacement executors are suppressed
- AND the platform does not claim that the external executor stopped
- AND reconnection enters read-only reconciliation; a different executor can
  activate only after old-stop proof, in-flight resolution, and current
  authorization

#### Scenario: A fixed-total pledge is total-first and creates no money

- WHEN authorized staff records a fixed-total pledge
- THEN the pledge requires its promised total and may optionally add one-date,
  even-installment, or custom expectation lines with an explicit undated
  remainder
- AND the record creates no automatic charge, receipt, contribution, revenue,
  receivable, accounting entry, fulfillment, or reminder enrollment

#### Scenario: Fulfillment applications conserve and reverse exactly

- GIVEN an authoritative contribution designation line is eligible to fulfill a
  named expectation line
- WHEN a permitted application is recorded
- THEN one immutable operation conserves the applied amount across its signed
  source-to-target entries without changing legal donor, recognition, or money
  finality
- AND an exact reversal appends exact inverse entries
- AND ambiguous matching or partial reversal retracts uncertain coverage for
  review instead of guessing

#### Scenario: Independent automatic fulfillment proofs fail closed

- GIVEN exact provider lineage, an authenticated donor instruction, or an
  approved authenticated structured-remittance mapping independently names one
  contribution line and its target allocations
- WHEN the fulfillment command re-proves current tenant, Commitment Party,
  currency, designation, source/target capacity, revision, and authority
- THEN each proof type may independently authorize one conserved automatic
  application under its closed authority type
- AND missing, stale, revoked, superseded, ambiguous, or conflicting proof
  creates a suggestion or review case only
- AND revoking a structured source or mapping prevents unstarted automatic work
  without rewriting a completed application
- AND a later canonical source reversal exact-inverts the original entries even
  when that application authority is expired or revoked, while an ambiguous
  partial reversal names every affected prior operation and retracts the complete
  uncertain entry vector for review

#### Scenario: Fulfillment authority concurrency and replay are deterministic

- GIVEN two approval or supersession commands race for the same structured-source
  or authenticated source-line mapping grain
- WHEN both commands execute with the same expected authority-head revision
- THEN one current approved winner is committed atomically and the stale command
  conflicts without creating a second winner
- AND replaying either semantic operation key returns its first outcome
- AND concurrent or repeated submission of one authenticated donor instruction
  returns one original application rather than consuming the instruction twice

#### Scenario: Application and invalidation serialize on one authority fence

- GIVEN a fulfillment application races revocation or supersession of its
  structured source/mapping authority or invalidation of its donor instruction
- WHEN both commands execute
- THEN both use the same deterministic authority-grain lock before source and
  sorted-target locks
- AND the application either commits first as valid history or observes the
  invalidation and fails without writing fulfillment
- AND an ambiguous partial reversal can create only a complete vector retraction,
  while an exact full reversal can create only an exact inverse

#### Scenario: Linked recurring support fulfills a fixed pledge exactly once

- GIVEN one recurring fulfillment application has one effective, compatible
  recurring-to-fixed link for its recurring line and civil date
- WHEN the application contributes coverage to the linked fixed pledge
- THEN the recurring application consumes source capacity once and the fixed-
  pledge coverage allocation records the exact plan version and target without
  consuming money or capacity again
- AND an overlapping link is rejected, a later plan uses only remaining
  capacity, and reversal appends the exact inverse without rewriting history

#### Scenario: Execution, payment, and received money do not collapse

- WHEN a named recurring occurrence's execution is submitted and its linked
  payment later processes, succeeds, fails, returns, or is reversed
- THEN occurrence execution state, provider payment-finality state, and
  canonical contribution/ledger posting each advance from their own authority
- AND provider success does not itself claim ledger posting or receipt
  eligibility, and no late payment or posting event moves the scheduled grid

#### Scenario: Each surface receives one role-safe view of the same facts

- WHEN donor, authorized staff, missionary, reporting, or communication
  surfaces read recurring support or a fixed-total pledge
- THEN they consume the same cursor-backed derived fold after tenant, role,
  designation, anonymity, restricted-worker, and freshness rules apply
- AND they show schedule, payment, provider-control, fulfillment, and health as
  separate permitted facts
- AND missionaries remain cash-first, automatic-recurring-first, view-only, and
  free of payment credentials, provider identifiers, decline details,
  authorization evidence, and pledge-reminder noise

### Requirement: Generated Documents Preserve Source Truth And Exact Artifact Authority

Phase 18 (Receipt & PDF Template System) MUST provide one canonical Document Production capability and one product-level Generated Document service.

Every clause in `openspec/contracts/platform-product-intent.md#contract-4a4ea75f8ff021d3d689` MUST apply without exception.

#### Scenario: An official document is generated and its email later bounces

- GIVEN the source domain has authorized one immutable purpose-scoped Facts
  Package and any required issuance intent
- WHEN the Generated Document service produces a validated private artifact and
  its later Phase 17 delivery bounces
- THEN the publication, facts, request, issuance, artifact, and delivery remain
  separately identifiable
- AND the bounce does not rerender, renumber, replace, cancel, or invalidate the
  exact artifact

#### Scenario: Source truth is corrected after issuance

- WHEN the source authority approves a correction or replacement
- THEN it creates the source-owned successor meaning and Phase 18 creates a new
  frozen request and exact artifact under that authority
- AND the prior bytes remain immutable evidence while the logical document has
  at most one authorized current head
- AND a template edit, renderer upgrade, resend, or redownload cannot alter the
  historical artifact

#### Scenario: A recipient opens generated documents

- WHEN an authorized donor or missionary opens a generated-document surface
- THEN each permitted logical document appears once with one current canonical
  PDF action
- AND access is reauthorized against current tenant, role, Party/recipient,
  purpose, logical head, artifact health, and records state
- AND storage objects, superseded versions, render attempts, and delivery events
  do not appear as peer files

#### Scenario: The clean pre-production cutover gate is uncertain

- WHEN the server-authoritative gate cannot prove the environment is disposable
  and free of production tenants, irreplaceable artifacts, and relied-upon
  external dependencies
- THEN no destructive reset or prototype removal runs
- AND the migration question is re-groomed rather than guessed, backfilled,
  fabricated, or hidden behind a compatibility fallback

### Requirement: Year-End Statements Run Through One Governed Operations Contract

Phase 19 (Year-End Statement Operations) MUST provide one canonical, purpose-pinned Statement Run and one immutable Run Preflight over source-authoritative Statement Subjects, exact source closure, participation, document and communication resolution, recipient delivery, fulfillment, and policy.

Every clause in `openspec/contracts/platform-product-intent.md#contract-f4cc1773f664f468e971` MUST apply without exception.

#### Scenario: Staff release and operate one annual statement run

- GIVEN Phase 7 supplied exact eligible Statement Subjects and Phase 18/17
  supplied side-effect-free compatible resolution pins
- WHEN authorized staff start the exact reviewed Run Preflight
- THEN one purpose-pinned run becomes durably queued through an atomic release
  barrier
- AND each document, portal, communication, and paper operation advances
  through its own authority and truthful outcome
- AND staff may contain, recover, and operationally complete the run without
  rewriting source facts, artifacts, provider evidence, or frozen release
  history

#### Scenario: A household has recognition but separate legal donors

- WHEN the tenant enables the purpose-separated Support overview
- THEN official documents remain separate by exact legal-donor Statement
  Subject
- AND any permitted household or disclosed-DAF recognition appears only in a
  separately authorized artifact labeled Not a tax document
- AND a shared destination or Year Presentation Group does not merge legal
  ownership, totals, documents, or access

### Requirement: The Public Tenant Website Runs On One Governed Runtime Contract

The public tenant website MUST run on one governed runtime contract, per Phase 5 (Public Website Runtime Contract) and `docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`.

Every clause in `openspec/contracts/platform-product-intent.md#contract-d1bf1b6e68a94702c9b8` MUST apply without exception.

#### Scenario: A visitor requests a public page

- WHEN a public request arrives for a tenant page
- THEN the tenant resolves only from the platform-trusted host, the page reads
  published content solely through the choke-point with the resolved tenant as
  a required argument, and an unknown host or unresolved tenant yields a
  neutral "site not found" rather than any other tenant's content
- AND no draft, cross-tenant document, or unserialized Payload internals reach
  the response

#### Scenario: A giving CTA hands off into checkout

- WHEN a visitor follows a "Give" CTA from a public page
- THEN checkout re-resolves and validates every operational reference
  server-side against the resolved tenant and public-eligibility before
  rendering or charging, the form stays enumeration-safe and constant-time,
  and the handoff carries the reserved attribution fields
- AND an invalid, stale, or cross-tenant giving link fails to a friendly
  "give another way" instead of a mis-designated gift

#### Scenario: Public reads stay published-only for signed-in visitors

- GIVEN a visitor is authenticated or carries a Draft Mode cookie
- WHEN the visitor requests content through the public reader or public API
- THEN the public-read policy still enforces the resolved tenant and published
  constraint for draftable collections, and no draft is returned
- AND versionless navigation remains tenant/policy constrained without an
  invalid `_status` clause; capability drift must be detected if it gains drafts

#### Scenario: Staff preview and publish a draft

- WHEN a staff member previews a draft or publishes a change
- THEN a separately authorized preview read renders the real page through the
  shared reader/serializer contract with drafts on and `overrideAccess: false`,
  authenticates the staff user and checks the tenant, and remains private,
  `no-store`, noindex, and outside the published cache
- AND for Phase 22 Public Ministry Pages, every HTML/data/media/refresh request
  reauthenticates and reauthorizes the exact saved revision or immutable
  candidate under the current owner scope; copied URLs, signed entry links,
  and Draft Mode cookies grant no authority, and failed authorization returns
  non-enumerating unavailable without fallback to another version or public read
- AND publishing emits the secured admin→public invalidation signal so the
  right cache tags revalidate promptly, with the bounded-staleness backstop
  self-healing a missed signal

Phase 22 exact-version preview and Phase 24 host/Site/locale/Domain/generation
amendments remain governing owner requirements with their own qualification
gates; this governance correction does not claim those runtime behaviors ship.
