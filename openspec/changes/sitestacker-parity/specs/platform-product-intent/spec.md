# Delta for Platform Product Intent

## ADDED Requirements

### Requirement: SiteStacker Parity Is An Outcome-Parity Program

The platform MUST pursue SiteStacker parity as an outcome-parity program: it
MUST match what SiteStacker/WMTek lets a Christian missions organization
accomplish, built on the platform's own model, rather than cloning SiteStacker's
screens. Parity work MUST stay governed by the existing platform boundaries and
surface ownership — it MUST NOT bolt on disconnected modules and MUST NOT push
admin depth into donor or missionary surfaces. Each parity area MUST be
benchmarked against cited official SiteStacker documentation (or explicitly
marked not-yet-sourced) and MUST be tracked in the parity matrix with its built,
live, and confirmed status recorded separately. Per-area behavior MUST be
specified in its own change when that area is built, not defined up front. Child
sponsorship is out of scope.

#### Scenario: A parity capability is proposed

- WHEN a SiteStacker-style capability is proposed for the platform
- THEN it is scoped as the real outcome an organization must accomplish, fitted
  to an existing surface through the shared `packages/api` layer, and
  benchmarked against a cited SiteStacker doc (or marked not-yet-sourced)
- AND it does not become a bolted-on module or move admin depth into a
  role-scoped surface

#### Scenario: A parity area moves into active build

- WHEN a parity area moves from tracked to actually being built
- THEN its detailed behavior is specified in its own OpenSpec change and PRD at
  that time
- AND the parity matrix records its built, live, and confirmed status separately

### Requirement: The Parity Program's Phase Architecture Is Governed By One Roadmap

The SiteStacker parity program MUST govern its phase set, numbering,
ordering, and dependencies through a single roadmap source of truth
(`docs/prds/sitestacker-parity/roadmap.md`, Roadmap v2 adopted 2026-07-07;
`phase-map.md` is its compact mirror and loses on conflict). New PRDs, issues,
and tickets MUST cite phases as "Phase N (Name)" — never a bare number — and
MUST start from the roadmap's per-phase scope section. Dependencies gate phase
starts, not numbers. Any re-sequencing of the roadmap MUST land as a new
roadmap revision carrying an old→new renumbering map together with a
same-commit congruence sweep of every live document and open issue that cites
a moved number; partial renumbering MUST NOT occur. Documents dated before a
renumbering are read through the roadmap's mapping table rather than edited
retroactively where they are historical records.

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

### Requirement: Donor-Credit Recognition Stays Structurally Separate From Money Truth

Donor-credit operations SHALL keep recognition structurally separate from
money truth — across soft credits, DAF advisor recognition, tribute
notifications, matching-gift expectancies, and church-member attribution.
Recognition
rows SHALL never mint receipts, SHALL never enter money totals (receipt,
deductible, cash, or ledger), and SHALL render only through the governed
recognition read models. Reporting SHALL keep two vocabularies — Legal giving
(hard credit only) and Recognition giving — and SHALL never blend them into
one mixed column. Detailed behavior is specified in
`docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`
(Phase 14 (Donor Credit Operations)).

#### Scenario: A recognition row is recorded against a contribution

- WHEN a soft-credit, DAF-advisor, tribute, matching-gift, or church-member
  attribution row is recorded against a contribution
- THEN no receipt is minted from it, no receipt/deductible/cash/ledger total
  includes it, and every surface that shows it reads through the governed
  recognition read models
- AND no column, export, or API field sums Legal giving and Recognition
  giving together

### Requirement: Offline Money Enters Only Through the Governed Batch-Commit Path

All staff-entered offline money MUST enter through the single gift-entry-batch
commit service — the one front door (Phase 15 D1) — and nothing else in the
platform MUST write offline money (Phase 39 no-offline-money-writes). A batch's
declared control totals MUST never be silently erased on a mismatch: the
declared originals stay frozen and any override is an audited, reason-carrying
event (Phase 15 D2). A clean validation IS the commit (validate = post,
Phase 15 D5) and every commit MUST be audited; a high-risk batch MUST route to a
second reviewer. Detailed behavior is specified in
`docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`
(Phase 15 (Offline Gift & Batch Entry)).

#### Scenario: Staff-entered offline money is committed

- WHEN a staff member commits a batch of offline gifts (check, cash, church
  remittance, phone card/ACH)
- THEN the money is written only through the gift-entry-batch commit service,
  the batch's declared control totals are reconciled with any mismatch surfaced
  as an audited override rather than silently overwritten, and the commit is
  recorded as an audited validate = post event
- AND no offline gift reaches the ledger through any path other than that
  commit service

### Requirement: Recurring Support And Fixed-Total Pledges Preserve Separate Truth

Phase 16 (Pledges & Recurring Commitments) MUST treat a recurring commitment
and a fixed-total pledge as separate operational aggregates. A recurring
commitment records repeated support without an explicitly promised cumulative
balance; a fixed-total pledge records an explicit cumulative promise. A
collection arrangement, provider subscription, mandate, invoice, payment
attempt, expected occurrence, fulfillment application, recognition record, or
posted contribution MUST NOT redefine one aggregate as the other. Only an
authoritative posted contribution records received money, and neither aggregate
MUST mint cash, a receipt, or an accounting entry merely because intent or an
expectation exists.

An online recurring arrangement MUST use one explicit recurring-giving group
with stable, independently manageable destination-line identities. A line-term
change MUST append a new effective line-term version; a calendar change MUST
append a separate schedule epoch. The schedule epoch is authoritative for the
calendar grid, while the matching line-term version is the frozen donor-
disclosure snapshot. They MUST agree at every effective boundary or fail closed.
Only compatible current line terms and schedule epochs MAY share a billing
cohort and its explicit provider execution legs; every line MUST retain an exact
provider-item binding in every applicable leg so one line cannot be mutated
through another. Ordinary cadences use one execution leg; twice-monthly uses two
monthly legs for the 1st and 15th without becoming two donor commitments.

The product-owned, effective-dated calendar schedule and named occurrence
ledger MUST remain authoritative for donor intent and scheduled execution.
Occurrence execution, provider-confirmed payment finality, canonical
contribution/ledger posting, and receipt eligibility MUST remain separate
folds. Provider success MUST NOT itself claim ledger posting, and ledger posting
MUST NOT move the schedule. Current tenant/account/mode binding, application
ownership, capability, provider-object, in-flight-work, and reconciliation
evidence MUST govern what Asym can prove about executor control. Donor-intent
lifecycle, schedule, occurrence execution, payment finality, ledger posting,
collection health, provider control/reconciliation, fulfillment,
communication eligibility, and projection freshness MUST remain separate axes
rather than one mutable pledge status.

Every commitment or pledge MUST have one immutable Commitment Party. Current
representative authority, service contact by purpose, expected remitter,
collection authorizer, posted legal donor, and recognition Party MUST remain
separate, effective-dated roles. Household membership, organization contact,
payment identity, DAF advice, remittance, recognition, and merge similarity
MUST NOT transfer or infer the Commitment Party or collection authority. A real
owner change MUST supersede the old aggregate and create a newly authorized
successor.

A fixed-total pledge MUST be total-first. Its optional plan MAY use one date,
even installments, or custom dates and MUST preserve any undated remainder.
Management MUST classify changes as donor-requested change, donor-requested
ending, internal expectation release, or entry correction; each classification
MUST use its own append-only fold and exact inverse/restore rules. No plan,
pledge, release, or correction may manufacture money, debt, recognition,
collection authority, or automatic reminders.

A separately authorized recurring line MAY fulfill a fixed-total pledge only
through an explicit, effective-dated, same-tenant link to one compatible fixed-
pledge line on a civil date. In v1, overlapping effective links for the same
recurring line and civil date MUST be rejected. The recurring fulfillment
application consumes source capacity exactly once; any fixed-pledge coverage is
an append-only temporal allocation to the exact then-current pledge plan and
target and MUST NOT consume source money or target capacity a second time.
Later pledge-plan versions MAY allocate only remaining capacity, and a reversal
MUST append the exact inverse rather than recomputing history.

Staff recurring service MUST independently prove operator capability, the
Commitment Party's instruction, and collection authorization. The server MUST
derive one of four truthful outcomes—Apply now, Complete with donor now,
Awaiting authorization, or Collection blocked—without making staff re-enter
raw card or bank credentials into Asym-owned fields. Broad staff access MUST
not become ambient authority, bulk widening, or a checkbox that manufactures a
card/ACH mandate.

Every material command or fulfillment operation MUST be tenant-scoped,
authority-bound, append-only, idempotent, revision-fenced, reconcilable, and
role-projected. Unknown provider control, identity, tenant, authorization,
payment outcome, matching evidence, or source freshness MUST fail closed rather
than guess. Detailed behavior is governed by
`docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
(Phase 16 (Pledges & Recurring Commitments)) and its dated 2026-07-13
cross-PRD congruence package.

Automatic fulfillment MUST use one of three independent closed application-proof types:
exact frozen provider lineage; an authenticated donor instruction with exact
source-to-target allocations; or an approved authenticated structured-remittance
source and immutable versioned exact-line mapping. Every path MUST re-prove
tenant, Commitment Party, currency, designation, source/target capacity, current
revision, and non-revoked authority. A structured source or mapping approval MAY
be narrowed, revoked, expired, or superseded prospectively, but MUST NOT rewrite
a completed application. One authenticated donor instruction MUST authorize at
most one original application. Source and mapping version/supersession identities
MUST be tenant-scoped and unique, their supersession chains MUST be acyclic, and
locked atomic approval/supersession MUST leave at most one current approved source
per source key and one current approved mapping per authenticated source-line
identity. Lifecycle commands MUST be permanently semantically idempotent.

An inverse or uncertain-vector retraction MUST use immutable, same-tenant
canonical correction evidence tied to the complete typed set of affected original
operations and exact entries, including a vector spanning several operations;
it MUST NOT require or reuse the original application authority. A later reapply
MUST use new current application authority. Names,
amount/date proximity, memo/OCR text, relationships, generic source IDs, and
incomplete or conflicting evidence MAY create a suggestion only.

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

Phase 18 (Receipt & PDF Template System) MUST provide one canonical Document
Production capability and one product-level Generated Document service. It MUST
keep immutable Document Definition Publication, source-owned Facts Package,
idempotent Generation Request, optional source-authorized Issuance, and exact
private Artifact as separate durable authorities. Source domains MUST own
eligibility, whether and why issuance/document identity is required, exact
issuer/recipient/coverage facts, issuance validity, and correction/void/cancel/
replace authorization and effect. Phase 18's code-owned jurisdiction/identity
contract MUST own `ACK-*` and exact-issuer `ca_r_v1` allocation, reuse/nonreuse,
disposition, and artifact linkage. Render Attempts MUST remain subordinate
technical evidence, and Phase 17 Delivery MUST remain an external linked
authority. No send, bounce, preview, download, print, or retry may create or
alter source facts, issuance validity, logical-document identity, or exact
artifact truth.

Templates and renderers MUST consume only a typed immutable purpose-scoped Facts
Package. They MUST NOT query mutable source records, select the donor or
statement population, decide eligibility or jurisdiction, calculate official
money, allocate a legal identifier, or alter correction/cancellation meaning.
Only the Generated Document service MAY allocate a Phase 18 reference or serial,
after admitted request freeze and before identifier-bearing render.
One pre-registered production-shaped evidence contest MUST yield at most one
qualified production renderer. Each human-facing publication MUST produce one
current canonical accessible PDF; purpose-required archival conformance MUST be
a property of those same exact bytes rather than a peer recipient file.

Tenant authoring freedom MUST remain inside versioned Document Purpose Contracts,
Approved Data Views, protected truth, immutable publication, code-owned U.S. and
opt-in Canadian jurisdiction packs, current-object authorization, purpose-owned
records schedules, and proof-gated release. Staff MUST use one Templates/
Documents/Batches product, and an authorized recipient MUST see one logical
document with one current PDF action. Historical or corrected artifacts MUST
remain exact immutable evidence without appearing as competing current files.

Because Conrad confirmed no production users or irreplaceable generated
artifacts exist, the initial cutover MUST use a server-authoritative
environment/data/dependency gate and then remove every prototype receipt,
statement, template-render, snapshot, scaffold, live-text, hard-coded-send,
provider-URL, and alternate reader/writer path. If the gate is positive or
indeterminate, destructive work MUST stop for re-grooming. The platform MUST NOT
ship a legacy importer, compatibility view, archive, dual path, shadow
migration, or fabricated history.

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

### Requirement: The Public Tenant Website Runs On One Governed Runtime Contract

The public tenant website MUST run on one governed runtime contract, per
Phase 5 (Public Website Runtime Contract) and
`docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`.
Public content MUST be readable only through one server-only published-content
choke-point that takes the resolved tenant (and reserved site) as a required
argument, always applies the tenant-and-published constraint, runs with
Payload access control enforced (`overrideAccess: false`) under an explicit
public-read policy, and returns empty — never unfiltered — when no tenant
resolves. A public request MUST resolve its tenant only from the
platform-trusted host in production and MUST fail closed to a neutral "site
not found" on an unknown or disabled host. No draft or unpublished document
may be reachable through any public route; staff preview goes through Draft
Mode behind a signed, tenant-checked route and is never cached and never
indexed. A giving CTA MUST hand off through the server-validated,
enumeration-safe checkout resolver — every operational reference re-validated
server-side against the resolved tenant, a preset amount treated as a
re-validated suggestion — and the handoff carries the reserved
`site_id` / `source_code` / `currency` / `locale` /
`entry_method = 'public_checkout'` attribution fields ("channel" stays
retired). Cached public reads MUST key on the tenant passed as an argument
(tags are invalidation-only) with a secured admin→public revalidation signal
and a bounded-staleness backstop, and no route-segment cache config may exist
in the public app. CMS pages reference operational records
(reference-not-copy); operational truth wins for identity, money, and
existence, and a dangling or cross-tenant reference fails safe.

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

#### Scenario: Staff preview and publish a draft

- WHEN a staff member previews a draft or publishes a change
- THEN preview renders the real page through the same reader with drafts on,
  behind a signed-secret route that authenticates the staff user and checks
  the tenant, marked noindex and never cached
- AND publishing emits the secured admin→public invalidation signal so the
  right cache tags revalidate promptly, with the bounded-staleness backstop
  self-healing a missed signal
